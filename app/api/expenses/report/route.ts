import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { query } from '@/lib/db';

interface ExpenseRow {
  id: number;
  company_id: number;
  expense_date: string;
  expense_type: string;
  amount: string;
  description: string;
  employee_iqama: string;
  employee_name: string;
  account_code: string;
  cost_center_code: string;
  month_reference: string;
  tax_value: string;
  net_amount: string;
  account_id: number;
  cost_center_id: number;
  attachment: string;
  attachment_path: string;
  driver_name: string;
  driver_iqama: string;
  plate_number: string;
  account_name?: string;
  center_code?: string;
  center_name?: string;
}

interface DeductionRow {
  id: number;
  company_id: number;
  month_reference: string;
  voucher_number: string;
  deduction_type: string;
  expense_date: string;
  employee_id: number;
  employee_name: string;
  employee_iqama: string;
  amount: string;
  account_id: number;
  cost_center_id: number;
  description: string;
  attachment: string;
  status: string;
  account_code?: string;
  account_name?: string;
  center_code?: string;
  center_name?: string;
}

interface PayrollRow {
  id: number;
  payroll_month: string;
  employee_count: number;
  total_amount: string;
  is_paid: number;
  created_at: string;
  package_id: number;
  saved_by: string;
  is_draft: number;
  company_id: number;
}

interface CompanyRow {
  id: number;
  name: string;
  logo_path: string;
  currency: string;
}

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }
    
    let companyId = session.company_id;
    
    if (!companyId) {
      return NextResponse.json({ error: 'No company ID' }, { status: 401 });
    }

    const userCompany = await query<{ company_id: number }>(
      'SELECT company_id FROM users WHERE id = ?',
      [session.user_id]
    );
    
    if (userCompany && userCompany[0] && userCompany[0].company_id) {
      companyId = userCompany[0].company_id;
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const reportType = searchParams.get('report_type') || 'all';

    const companies = await query<CompanyRow>(
      'SELECT id, name, logo_path, currency FROM companies WHERE id = ?',
      [companyId]
    );
    const companyInfo = companies[0] || null;

    let expensesGrouped: Record<string, ExpenseRow[]> = {};
    let deductionsGrouped: Record<string, DeductionRow[]> = {};
    let payrolls: any[] = [];
    let totalExpenses = 0;
    let totalDeductions = 0;
    let totalPayrolls = 0;

      if (reportType === 'expenses' || reportType === 'all') {
        // JOIN by code (account_code/cost_center_code) since that's what's stored
        const expenses = await query<ExpenseRow>(
          `SELECT 
            e.*,
            a.account_name,
            c.center_name
          FROM monthly_expenses e
          LEFT JOIN accounts a ON e.account_code = a.account_code AND a.company_id = ?
          LEFT JOIN cost_centers c ON e.cost_center_code = c.center_code AND c.company_id = ?
          WHERE e.company_id = ? AND e.month_reference = ?
          ORDER BY e.expense_type, e.expense_date ASC`,
          [companyId, companyId, companyId, month]
        );

        if (expenses && expenses.length > 0) {
          expenses.forEach((expense) => {
            const group = expense.expense_type || 'مصروفات أخرى';
            if (!expensesGrouped[group]) {
              expensesGrouped[group] = [];
            }
            expensesGrouped[group].push(expense);
            totalExpenses += parseFloat(expense.amount || '0');
          });
        }
      }

    if (reportType === 'deductions' || reportType === 'all') {
      const deductions = await query<DeductionRow>(
        `SELECT 
          d.*,
          a.account_code,
          a.account_name,
          c.center_code,
          c.center_name
        FROM monthly_deductions d
        LEFT JOIN accounts a ON d.account_id = a.id
        LEFT JOIN cost_centers c ON d.cost_center_id = c.id
        WHERE d.company_id = ? AND d.month_reference = ?
        ORDER BY d.deduction_type, d.expense_date ASC`,
        [companyId, month]
      );

      if (deductions && deductions.length > 0) {
        deductions.forEach((deduction) => {
          const group = deduction.deduction_type || 'استقطاعات أخرى';
          if (!deductionsGrouped[group]) {
            deductionsGrouped[group] = [];
          }
          deductionsGrouped[group].push(deduction);
          totalDeductions += parseFloat(deduction.amount || '0');
        });
      }
    }

    if (reportType === 'expenses' || reportType === 'all') {
      const payrollsData = await query<PayrollRow>(
        `SELECT * FROM salary_payrolls 
        WHERE company_id = ? AND payroll_month = ? AND (is_draft = 0 OR is_draft IS NULL)`,
        [companyId, month]
      );

      if (payrollsData && payrollsData.length > 0) {
        for (const payroll of payrollsData) {
          const items = await query<any>(
            'SELECT * FROM salary_payroll_items WHERE payroll_id = ? ORDER BY iqama_number',
            [payroll.id]
          );

          payrolls.push({
            ...payroll,
            items: items || [],
            employee_count: payroll.employee_count || items?.length || 0
          });
          totalPayrolls += parseFloat(payroll.total_amount || '0');
        }
      }
    }

    const totalAll = totalExpenses + totalDeductions + totalPayrolls;

    const expensesCount = Object.values(expensesGrouped).reduce((sum, arr) => sum + arr.length, 0);
    const deductionsCount = Object.values(deductionsGrouped).reduce((sum, arr) => sum + arr.length, 0);

    return NextResponse.json({
      success: true,
      data: {
        companyInfo,
        month,
        reportType,
        expensesGrouped,
        deductionsGrouped,
        payrolls,
        stats: {
          totalExpenses,
          totalDeductions,
          totalPayrolls,
          totalAll,
          expensesCount,
          deductionsCount,
          payrollsCount: payrolls.length,
        }
      }
    });

  } catch (error: any) {
    console.error('Report API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }
    
    let companyId = session.company_id;
    
    if (!companyId) {
      return NextResponse.json({ success: false, message: 'No company ID' }, { status: 401 });
    }

    const userCompany = await query<{ company_id: number }>(
      'SELECT company_id FROM users WHERE id = ?',
      [session.user_id]
    );
    
    if (userCompany && userCompany[0] && userCompany[0].company_id) {
      companyId = userCompany[0].company_id;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({ success: false, message: 'Missing id or type parameter' }, { status: 400 });
    }

    const table = type === 'expense' ? 'monthly_expenses' : 'monthly_deductions';

    const checkRecord = await query<{ id: number }>(
      `SELECT id FROM ${table} WHERE id = ? AND company_id = ?`,
      [parseInt(id), companyId]
    );

    if (!checkRecord || checkRecord.length === 0) {
      return NextResponse.json({ success: false, message: 'Record not found or unauthorized' }, { status: 404 });
    }

    await query(
      `DELETE FROM ${table} WHERE id = ? AND company_id = ?`,
      [parseInt(id), companyId]
    );

    return NextResponse.json({ success: true, message: 'Deleted successfully' });

  } catch (error: any) {
    console.error('Delete API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('auth_session');
    
    if (!sessionCookie) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ success: false, message: 'Invalid session' }, { status: 401 });
    }
    
    let companyId = session.company_id;
    
    if (!companyId) {
      return NextResponse.json({ success: false, message: 'No company ID' }, { status: 401 });
    }

    const userCompany = await query<{ company_id: number }>(
      'SELECT company_id FROM users WHERE id = ?',
      [session.user_id]
    );
    
    if (userCompany && userCompany[0] && userCompany[0].company_id) {
      companyId = userCompany[0].company_id;
    }

    const formData = await request.formData();
    const id = formData.get('id') as string;
    const type = formData.get('type') as string;

    if (!id || !type) {
      return NextResponse.json({ success: false, message: 'Missing id or type' }, { status: 400 });
    }

    const table = type === 'expense' ? 'monthly_expenses' : 'monthly_deductions';
    
    const checkRecord = await query<{ id: number; attachment: string }>(
      `SELECT id, attachment FROM ${table} WHERE id = ? AND company_id = ?`,
      [parseInt(id), companyId]
    );

    if (!checkRecord || checkRecord.length === 0) {
      return NextResponse.json({ success: false, message: 'Record not found' }, { status: 404 });
    }

    const currentAttachment = checkRecord[0].attachment;
    let attachmentToSave = currentAttachment;

    const attachmentFile = formData.get('attachment');
    if (attachmentFile && attachmentFile instanceof File && attachmentFile.size > 0) {
      const { supabase } = await import('@/lib/supabase');
      // Sanitize filename strictly to ASCII to avoid Supabase/S3 storage errors
      const ext = attachmentFile.name.split('.').pop() || 'file';
      const sanitizedBase = attachmentFile.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\x00-\x7F]/g, "")
        .replace(/\s+/g, "_")
        .replace(/[^a-zA-Z0-9._-]/g, "")
        .replace(/_{2,}/g, "_")
        .replace(/^_+|_+$/g, "");
      
      const safeName = sanitizedBase || `file_${Date.now()}`;
      const fileName = `${Date.now()}_${safeName}`;
      // Make sure extension is preserved if not already in safeName
      const finalFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;

      const { data, error } = await supabase.storage
        .from("expenses")
        .upload(`uploads/${finalFileName}`, attachmentFile);
      
      if (!error && data) {
        attachmentToSave = data.path;
      } else if (error) {
        console.error('Storage upload error:', error);
      }
    } else if (typeof attachmentFile === 'string') {
      attachmentToSave = attachmentFile;
    }

    const amount = parseFloat(formData.get('amount') as string || '0');
    const expenseDate = formData.get('expense_date') as string;
    const employeeName = formData.get('employee_name') as string;
    const employeeIqama = formData.get('employee_iqama') as string;
    const accountCode = formData.get('account_code') as string;
    const costCenterCode = formData.get('cost_center_code') as string;
    const expenseType = formData.get('expense_type') as string;
    const description = formData.get('description') as string;
    const monthReference = formData.get('month_reference') as string;

    if (type === 'expense') {
      const taxValue = parseFloat(formData.get('tax_value') as string || '0');
      const netAmount = parseFloat(formData.get('net_amount') as string || (amount - taxValue).toString());

      await query(
        `UPDATE monthly_expenses SET
          expense_date = ?,
          employee_name = ?,
          employee_iqama = ?,
          amount = ?,
          tax_value = ?,
          net_amount = ?,
          account_code = ?,
          cost_center_code = ?,
          expense_type = ?,
          description = ?,
          month_reference = ?,
          attachment = ?
        WHERE id = ? AND company_id = ?`,
        [
          expenseDate,
          employeeName || null,
          employeeIqama || null,
          amount,
          taxValue,
          netAmount,
          accountCode || null,
          costCenterCode || null,
          expenseType || null,
          description || null,
          monthReference || null,
          attachmentToSave,
          parseInt(id),
          companyId
        ]
      );
    } else {
      const status = formData.get('status') as string || 'pending';
      await query(
        `UPDATE monthly_deductions SET
          expense_date = ?,
          employee_name = ?,
          employee_iqama = ?,
          amount = ?,
          account_code = ?,
          cost_center_code = ?,
          deduction_type = ?,
          description = ?,
          month_reference = ?,
          attachment = ?,
          status = ?
        WHERE id = ? AND company_id = ?`,
        [
          expenseDate,
          employeeName || null,
          employeeIqama || null,
          amount,
          accountCode || null,
          costCenterCode || null,
          expenseType || null,
          description || null,
          monthReference || null,
          attachmentToSave,
          status,
          parseInt(id),
          companyId
        ]
      );
    }

    return NextResponse.json({ success: true, message: 'Updated successfully' });

  } catch (error: any) {
    console.error('Update API Error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
