import { NextRequest, NextResponse } from "next/server";
import { query, execute } from "@/lib/db";
import https from "https";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { batch_id, company_id } = body;

    if (!batch_id || !company_id) {
      return NextResponse.json({ error: "batch_id و company_id مطلوبة" }, { status: 400 });
    }

    // Get credentials
    const creds = await query<any>(
      `SELECT * FROM anb_credentials WHERE company_id = ? AND is_active = 1`,
      [company_id]
    );

    if (creds.length === 0) {
      return NextResponse.json({ error: "لم يتم العثور على بيانات اعتماد ANB. يرجى إعداد الاتصال أولاً." }, { status: 400 });
    }

    // Get batch
    const batches = await query<any>(
      `SELECT * FROM anb_payroll_batches WHERE id = ? AND company_id = ?`,
      [batch_id, company_id]
    );

    if (batches.length === 0) {
      return NextResponse.json({ error: "لم يتم العثور على الدفعة" }, { status: 404 });
    }

    const batch = batches[0];
    if (batch.status !== 'draft') {
      return NextResponse.json({ error: "هذه الدفعة تم إرسالها مسبقاً" }, { status: 400 });
    }

    // Get batch items
    const items = await query<any>(
      `SELECT * FROM anb_payroll_batch_items WHERE batch_id = ? ORDER BY id`,
      [batch_id]
    );

    if (items.length === 0) {
      return NextResponse.json({ error: "لا يوجد موظفين في هذه الدفعة" }, { status: 400 });
    }

    const cred = creds[0];

    // Step 1: Get OAuth2 token
    let accessToken: string;
    try {
      accessToken = await getAnbToken(cred);
    } catch (tokenError: any) {
      await execute(
        `UPDATE anb_payroll_batches SET status = 'failed', anb_response = ? WHERE id = ?`,
        [JSON.stringify({ error: 'Token error', details: tokenError.message }), batch_id]
      );
      return NextResponse.json({ error: `فشل في المصادقة مع ANB: ${tokenError.message}` }, { status: 502 });
    }

    // Step 2: Generate CSV files
    const headerCSV = generateHeaderCSV(batch, cred, items);
    const bodyCSV = generateBodyCSV(items);

    // Step 3: Submit to ANB
    try {
      const formData = new FormData();
      formData.append('headerFile', new Blob([headerCSV], { type: 'text/csv' }), 'header.csv');
      formData.append('bodyFile', new Blob([bodyCSV], { type: 'text/csv' }), 'body.csv');

      const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
      };

      if (batch.auto_wps && cred.mol_establishment_id && cred.national_unified_no) {
        headers['autowpsfileupload'] = 'YES';
        headers['molestablishmentid'] = cred.mol_establishment_id;
        headers['nationalunifiedno'] = cred.national_unified_no;
      }

      const response = await fetch('https://connect.anb.com.sa/apis/api/payroll-payment/v1/submit', {
        method: 'POST',
        headers,
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.uuid) {
        await execute(
          `UPDATE anb_payroll_batches SET status = 'submitted', anb_uuid = ?, anb_response = ?, submitted_at = NOW() WHERE id = ?`,
          [result.uuid, JSON.stringify(result), batch_id]
        );
        return NextResponse.json({
          success: true,
          message: "تم إرسال الدفعة بنجاح إلى ANB",
          uuid: result.uuid,
          anb_response: result
        });
      } else {
        await execute(
          `UPDATE anb_payroll_batches SET status = 'failed', anb_response = ? WHERE id = ?`,
          [JSON.stringify(result), batch_id]
        );
        return NextResponse.json({
          error: "فشل في إرسال الدفعة إلى ANB",
          anb_response: result
        }, { status: 502 });
      }
    } catch (submitError: any) {
      await execute(
        `UPDATE anb_payroll_batches SET status = 'failed', anb_response = ? WHERE id = ?`,
        [JSON.stringify({ error: submitError.message }), batch_id]
      );
      return NextResponse.json({ error: `خطأ في الاتصال بـ ANB: ${submitError.message}` }, { status: 502 });
    }

  } catch (error: any) {
    console.error("Error submitting ANB payroll:", error);
    return NextResponse.json({ error: "فشل في إرسال الدفعة" }, { status: 500 });
  }
}

async function getAnbToken(cred: any): Promise<string> {
  const tokenUrl = 'https://connect.anb.com.sa/apis/api/payroll-payment/oauth2/token';

  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('client_id', cred.client_id);
  params.append('client_secret', cred.client_secret);

  const fetchOptions: any = {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  };

  // If mTLS certificate is available, we'd use it via an https agent
  // Note: In production, mTLS is handled at the server/infra level
  const response = await fetch(tokenUrl, fetchOptions);
  const data = await response.json();

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to get token');
  }

  return data.access_token;
}

function generateHeaderCSV(batch: any, cred: any, items: any[]): string {
  const totalAmount = items.reduce((sum: number, item: any) => sum + parseFloat(item.net_salary || 0), 0);
  const paymentDate = new Date().toISOString().split('T')[0].replace(/-/g, '');
  
  // Header CSV format: batchReference,debitAccount,paymentDate,employeeCount,totalAmount
  const header = 'batchReference,debitAccount,paymentDate,employeeCount,totalAmount';
  const row = `${batch.batch_reference},${batch.debit_account},${paymentDate},${items.length},${totalAmount.toFixed(2)}`;

  return `${header}\n${row}`;
}

function generateBodyCSV(items: any[]): string {
  // Body CSV format: identityNumber,iban,basicSalary,housingAllowance,otherEarnings,deductions,bankCode
  const header = 'identityNumber,iban,basicSalary,housingAllowance,otherEarnings,deductions,bankCode';
  const rows = items.map(item =>
    `${item.identity_number},${item.iban},${parseFloat(item.basic_salary || 0).toFixed(2)},${parseFloat(item.housing_allowance || 0).toFixed(2)},${parseFloat(item.other_earnings || 0).toFixed(2)},${parseFloat(item.deductions || 0).toFixed(2)},${item.bank_code || '030'}`
  );

  return `${header}\n${rows.join('\n')}`;
}
