import { NextRequest, NextResponse } from "next/server";
import { execute, query } from "@/lib/db";
import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function uploadFileToSupabase(file: File, folder: string): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from('company-files')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('company-files')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get('name') as string;
    const commercial_number = formData.get('commercial_number') as string || null;
    const vat_number = formData.get('vat_number') as string || null;
    const phone = formData.get('phone') as string || null;
    const website = formData.get('website') as string || null;
    const currency = formData.get('currency') as string || 'SAR';
    const country = formData.get('country') as string || null;
    const region = formData.get('region') as string || null;
    const district = formData.get('district') as string || null;
    const street = formData.get('street') as string || null;
    const postal_code = formData.get('postal_code') as string || null;
    const short_address = formData.get('short_address') as string || null;
    const bank_beneficiary = formData.get('bank_beneficiary') as string || null;
    const bank_name = formData.get('bank_name') as string || null;
    const bank_account = formData.get('bank_account') as string || null;
    const bank_iban = formData.get('bank_iban') as string || null;
    const transport_license_number = formData.get('transport_license_number') as string || null;
    const transport_license_type = formData.get('transport_license_type') as string || null;
    const license_start = formData.get('license_start') as string || null;
    const license_end = formData.get('license_end') as string || null;
    const user_email = formData.get('user_email') as string;
    const password = formData.get('password') as string;

    if (!name || !user_email || !password) {
      return NextResponse.json({ error: "الاسم والبريد وكلمة المرور مطلوبة" }, { status: 400 });
    }

    const existingUsers = await query(
      "SELECT id FROM users WHERE email = ?",
      [user_email]
    );

    if (existingUsers && (existingUsers as any[]).length > 0) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 400 });
    }

    let logoUrl: string | null = null;
    let stampUrl: string | null = null;
    let digitalSealUrl: string | null = null;
    let licenseImageUrl: string | null = null;

    const logoFile = formData.get('logo') as File | null;
    const stampFile = formData.get('stamp') as File | null;
    const digitalSealFile = formData.get('digital_seal') as File | null;
    const licenseImageFile = formData.get('license_image') as File | null;

    if (logoFile && logoFile.size > 0) {
      logoUrl = await uploadFileToSupabase(logoFile, 'logos');
    }
    if (stampFile && stampFile.size > 0) {
      stampUrl = await uploadFileToSupabase(stampFile, 'stamps');
    }
    if (digitalSealFile && digitalSealFile.size > 0) {
      digitalSealUrl = await uploadFileToSupabase(digitalSealFile, 'seals');
    }
    if (licenseImageFile && licenseImageFile.size > 0) {
      licenseImageUrl = await uploadFileToSupabase(licenseImageFile, 'licenses');
    }

    const companyResult = await execute(
      `INSERT INTO companies (
        name, commercial_number, vat_number, phone, website, currency,
        country, region, district, street, postal_code, short_address,
        bank_beneficiary, bank_name, bank_account, bank_iban,
        transport_license_number, transport_license_type, license_start, license_end,
        logo_path, stamp_path, digital_seal_path, license_image,
        status, is_active, source, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1, 'admin', NOW())`,
      [
        name, commercial_number, vat_number, phone, website, currency,
        country, region, district, street, postal_code, short_address,
        bank_beneficiary, bank_name, bank_account, bank_iban,
        transport_license_number, transport_license_type,
        license_start || null, license_end || null,
        logoUrl, stampUrl, digitalSealUrl, licenseImageUrl
      ]
    );

    const companyId = (companyResult as any).insertId;

    const hashedPassword = await bcrypt.hash(password, 10);
    const activationCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    const fullAddress = [country, region, district, street, postal_code, short_address]
      .filter(Boolean)
      .join(' - ');

    await execute(
      `INSERT INTO users (
        company_id, name, commercial_number, vat_number, address, email, password,
        role, is_active, is_activated, activation_code, created_at, expiry_date,
        company_logo, company_stamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'establishment_owner', 1, 1, ?, NOW(), ?, ?, ?)`,
      [
        companyId,
        name,
        commercial_number,
        vat_number,
        fullAddress,
        user_email,
        hashedPassword,
        activationCode,
        expiryDate.toISOString().split('T')[0],
        logoUrl,
        stampUrl
      ]
    );

    return NextResponse.json({
      success: true,
      companyId,
      message: "تم إنشاء المنشأة بنجاح"
    });

  } catch (error: any) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء إنشاء المنشأة" }, { status: 500 });
  }
}
