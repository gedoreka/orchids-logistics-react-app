import { NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function POST() {
  try {
    await execute(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        description TEXT,
        description_en TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        duration_value INT NOT NULL DEFAULT 1,
        duration_unit ENUM('days', 'months', 'years') NOT NULL DEFAULT 'months',
        trial_days INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        features JSON,
        services JSON,
        include_all_services TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS admin_bank_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        account_number VARCHAR(100),
        iban VARCHAR(100) NOT NULL,
        logo_path VARCHAR(500),
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS company_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        plan_id INT NOT NULL,
        subscription_code VARCHAR(50) UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active',
        amount_paid DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(100),
        is_manual_assignment TINYINT(1) DEFAULT 0,
        assigned_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (company_id),
        INDEX idx_plan (plan_id),
        INDEX idx_status (status),
        INDEX idx_end_date (end_date)
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        plan_id INT NOT NULL,
        bank_account_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        receipt_image VARCHAR(500),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        processed_by INT,
        processed_at TIMESTAMP NULL,
        subscription_id INT,
        request_type ENUM('new', 'renewal', 'upgrade') DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (company_id),
        INDEX idx_status (status),
        INDEX idx_plan (plan_id)
      )
    `);

    await execute(`
      CREATE TABLE IF NOT EXISTS plan_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_plan_permission (plan_id, permission_key),
        INDEX idx_plan (plan_id)
      )
    `);

    const columns = await query<{ Field: string }>("SHOW COLUMNS FROM companies");
    const columnNames = columns.map(c => c.Field);

    if (!columnNames.includes('current_subscription_id')) {
      await execute("ALTER TABLE companies ADD COLUMN current_subscription_id INT DEFAULT NULL");
    }
    if (!columnNames.includes('subscription_end_date')) {
      await execute("ALTER TABLE companies ADD COLUMN subscription_end_date DATE DEFAULT NULL");
    }
    if (!columnNames.includes('is_subscription_active')) {
      await execute("ALTER TABLE companies ADD COLUMN is_subscription_active TINYINT(1) DEFAULT 0");
    }

    
const prColumns = await query<{ Field: string }>("SHOW COLUMNS FROM payment_requests");
const prColumnNames = prColumns.map(c => c.Field);

if (!prColumnNames.includes('processed_by')) {
await execute("ALTER TABLE payment_requests ADD COLUMN processed_by INT AFTER rejection_reason");
}
if (!prColumnNames.includes('processed_at')) {
await execute("ALTER TABLE payment_requests ADD COLUMN processed_at TIMESTAMP NULL AFTER processed_by");
}
if (!prColumnNames.includes('subscription_id')) {
await execute("ALTER TABLE payment_requests ADD COLUMN subscription_id INT AFTER processed_at");
}
if (!prColumnNames.includes('request_type')) {
await execute("ALTER TABLE payment_requests ADD COLUMN request_type ENUM('new', 'renewal', 'upgrade') DEFAULT 'new' AFTER subscription_id");
}
if (!prColumnNames.includes('notes')) {
await execute("ALTER TABLE payment_requests ADD COLUMN notes TEXT");
}

const csColumns = await query<{ Field: string }>("SHOW COLUMNS FROM company_subscriptions");
const csColumnNames = csColumns.map(c => c.Field);

if (!csColumnNames.includes('notes')) {
await execute("ALTER TABLE company_subscriptions ADD COLUMN notes TEXT");
}
if (!csColumnNames.includes('assigned_by')) {
await execute("ALTER TABLE company_subscriptions ADD COLUMN assigned_by INT");
}
if (!csColumnNames.includes('is_manual_assignment')) {
await execute("ALTER TABLE company_subscriptions ADD COLUMN is_manual_assignment TINYINT(1) DEFAULT 0");
}

const spColumns = await query<{ Field: string }>("SHOW COLUMNS FROM subscription_plans");
const spColumnNames = spColumns.map(c => c.Field);

if (!spColumnNames.includes('trial_days')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN trial_days INT DEFAULT 0");
}
if (!spColumnNames.includes('include_all_services')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN include_all_services TINYINT(1) DEFAULT 1");
}
if (!spColumnNames.includes('name_en')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN name_en VARCHAR(255)");
}
if (!spColumnNames.includes('description_en')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN description_en TEXT");
}
if (!spColumnNames.includes('features')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN features JSON");
}
if (!spColumnNames.includes('services')) {
await execute("ALTER TABLE subscription_plans ADD COLUMN services JSON");
}

const existingPlans = await query<{ id: number }>("SELECT id FROM subscription_plans LIMIT 1");
    if (existingPlans.length === 0) {
      await execute(`
        INSERT INTO subscription_plans (name, name_en, description, description_en, price, duration_value, duration_unit, trial_days, is_active, include_all_services, sort_order)
        VALUES 
          ('الباقة التجريبية', 'Trial Plan', 'جرب النظام مجاناً لمدة 7 أيام', 'Try the system free for 7 days', 0, 7, 'days', 0, 1, 1, 1),
          ('الباقة الأساسية', 'Basic Plan', 'باقة مناسبة للشركات الصغيرة', 'Suitable for small businesses', 299, 1, 'months', 0, 1, 1, 2),
          ('الباقة الاحترافية', 'Professional Plan', 'باقة متكاملة للشركات المتوسطة', 'Complete package for medium businesses', 599, 1, 'months', 0, 1, 1, 3),
          ('الباقة المؤسسية', 'Enterprise Plan', 'باقة شاملة للمؤسسات الكبيرة', 'Comprehensive package for large enterprises', 999, 1, 'months', 0, 1, 1, 4),
          ('الباقة السنوية', 'Annual Plan', 'وفر 20% مع الاشتراك السنوي', 'Save 20% with annual subscription', 5999, 1, 'years', 0, 1, 1, 5)
      `);
    }

    return NextResponse.json({ 
      success: true, 
      message: "تم إعداد جداول نظام الاشتراكات بنجاح" 
    });
  } catch (error: any) {
    console.error("Error setting up subscription tables:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || "فشل في إعداد الجداول" 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    const tables = ['subscription_plans', 'admin_bank_accounts', 'company_subscriptions', 'payment_requests', 'plan_permissions'];
    const status: Record<string, boolean> = {};

    for (const table of tables) {
      try {
        await query(`SELECT 1 FROM ${table} LIMIT 1`);
        status[table] = true;
      } catch {
        status[table] = false;
      }
    }

    return NextResponse.json({ success: true, tables: status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
