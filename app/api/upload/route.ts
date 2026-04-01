import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const dynamic = 'force-dynamic';

const ALLOWED_BUCKETS = new Set([
  "chat-attachments", "driver-photos", "driver-files", "company-files",
  "invoices", "receipts", "letters", "shipments", "employees",
  "quotations", "credit-notes", "payment-vouchers", "income-files",
  "fleet", "ecommerce", "letterheads",
]);

function getSupabase() {
  return createClient(
    process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key'
  );
}

export async function POST(request: NextRequest) {
  try {
    // Require authenticated session
    const cookieStore = await cookies();
    if (!cookieStore.get('auth_session')) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    // Validate bucket against allowlist to prevent unauthorized bucket access
    const rawBucket = (formData.get("bucket") as string) || "chat-attachments";
    const bucket = ALLOWED_BUCKETS.has(rawBucket) ? rawBucket : "chat-attachments";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const sanitizedOriginalName = file.name
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x00-\x7F]/g, "")
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9._-]/g, "")
      .replace(/_{2,}/g, "_")
      .replace(/^_+|_+$/g, "");

    const ext = file.name.split('.').pop() || 'file';
    const finalName = sanitizedOriginalName && sanitizedOriginalName.length > 0 
      ? sanitizedOriginalName 
      : `uploaded_file.${ext}`;
    const fileName = `${Date.now()}_${finalName}`;
    const { data, error } = await getSupabase().storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = getSupabase().storage
      .from(bucket)
      .getPublicUrl(fileName);

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      name: file.name,
      type: file.type,
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
