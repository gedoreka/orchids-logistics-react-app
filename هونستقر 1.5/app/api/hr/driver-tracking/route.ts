import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { query, execute } from "@/lib/db";

export const dynamic = "force-dynamic";

async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("auth_session");
  return JSON.parse(sessionCookie?.value || "{}");
}

// Show all employees regardless of package type

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const companyId = session.company_id;
    if (!companyId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action") || "drivers";
    const driverId = searchParams.get("driver_id");
    const month = searchParams.get("month") || new Date().toISOString().slice(0, 7);
    const today = new Date().toISOString().slice(0, 10);

    // ── Drivers list ─────────────────────────────────────────────────────────
    if (action === "drivers") {
      const drivers = await query<any>(
        `SELECT e.id, e.name, e.iqama_number, e.nationality, e.user_code,
                e.vehicle_plate, e.personal_photo, e.is_active, e.package_id,
                COALESCE(e.phone, '') as phone,
                e.iqama_file, e.license_file, e.vehicle_file, e.agir_permit_file,
                e.vehicle_operation_card, e.work_contract_file, e.created_at,
                p.group_name as package_name, p.monthly_target, p.bonus_after_target,
                p.work_type, NULL as per_order_value,
                (SELECT COUNT(*) FROM driver_daily_entries dde
                 WHERE dde.driver_id = e.id AND dde.date = ?) as today_entry_count,
                (SELECT COALESCE(SUM(dde2.completed_orders),0) FROM driver_daily_entries dde2
                 WHERE dde2.driver_id = e.id AND dde2.date = ?) as today_orders,
                (SELECT COALESCE(SUM(dde3.wallet_amount),0) FROM driver_daily_entries dde3
                 WHERE dde3.driver_id = e.id AND dde3.date = ?) as today_wallet,
                (SELECT COUNT(*) FROM driver_requests dr
                 WHERE dr.driver_id = e.id AND dr.status = 'pending') as pending_requests,
                (SELECT COUNT(*) FROM wallet_settlements ws
                 WHERE ws.driver_id = e.id AND ws.settlement_status = 'pending') as pending_settlements
         FROM employees e
         LEFT JOIN employee_packages p ON e.package_id = p.id
         WHERE e.company_id = ?
         ORDER BY e.is_active DESC, e.name ASC`,
        [today, today, today, companyId]
      );

      const totalDrivers = drivers.length;
      const activeDrivers = drivers.filter((d: any) => Number(d.is_active) === 1).length;
      const submittedToday = drivers.filter((d: any) => Number(d.today_entry_count) > 0).length;
      const pendingRequests = drivers.reduce((sum: number, d: any) => sum + Number(d.pending_requests || 0), 0);
      const pendingSettlements = drivers.reduce((sum: number, d: any) => sum + Number(d.pending_settlements || 0), 0);

      return NextResponse.json({
        drivers,
        stats: { totalDrivers, activeDrivers, submittedToday, pendingRequests, pendingSettlements },
      });
    }

    // ── Driver detail ─────────────────────────────────────────────────────────
    if (action === "driver_data" && driverId) {
      const [entries, issues, requests, settlements, monthlySummary] = await Promise.all([
        query<any>(
          `SELECT * FROM driver_daily_entries
           WHERE driver_id = ? AND date LIKE ?
           ORDER BY date DESC, created_at DESC`,
          [driverId, `${month}%`]
        ),
        query<any>(
          `SELECT * FROM driver_daily_issues
           WHERE driver_id = ? AND date LIKE ?
           ORDER BY date DESC, created_at DESC`,
          [driverId, `${month}%`]
        ),
        query<any>(
          `SELECT * FROM driver_requests
           WHERE driver_id = ?
           ORDER BY created_at DESC LIMIT 50`,
          [driverId]
        ),
        query<any>(
          `SELECT * FROM wallet_settlements
           WHERE driver_id = ?
           ORDER BY settlement_date DESC LIMIT 30`,
          [driverId]
        ),
        query<any>(
          `SELECT date,
                  SUM(completed_orders) as total_orders,
                  SUM(cancelled_orders) as total_cancelled,
                  SUM(wallet_amount) as total_wallet,
                  COUNT(*) as entry_count
           FROM driver_daily_entries
           WHERE driver_id = ? AND date LIKE ?
           GROUP BY date
           ORDER BY date DESC`,
          [driverId, `${month}%`]
        ),
      ]);
      // Real wallet balance: total earned - confirmed paid only
      const walletTotals = await query<any>(
        `SELECT
           COALESCE((SELECT SUM(wallet_amount) FROM driver_daily_entries WHERE driver_id = ?), 0) as total_earned,
           COALESCE((SELECT SUM(paid_amount) FROM wallet_settlements WHERE driver_id = ? AND settlement_status IN ('paid','partial')), 0) as total_paid`,
        [driverId, driverId]
      );
      const walletBalance = Math.max(0, parseFloat(walletTotals[0].total_earned) - parseFloat(walletTotals[0].total_paid));

      return NextResponse.json({ entries, issues, requests, settlements, monthlySummary, wallet_balance: walletBalance });
    }

    // ── Packages with their employees ────────────────────────────────────────
    if (action === "packages_with_employees") {
      // Get all packages for this company
      const pkgs = await query<any>(
        `SELECT id, group_name FROM employee_packages WHERE company_id = ? ORDER BY group_name ASC`,
        [companyId]
      );
      // Get all employees for this company with their package_id
      const emps = await query<any>(
        `SELECT id, name, vehicle_plate, is_active, package_id FROM employees WHERE company_id = ? ORDER BY name ASC`,
        [companyId]
      );
      // Group employees into their packages
      const result = pkgs.map((pkg: any) => ({
        id: pkg.id,
        name: pkg.group_name,
        employees: emps.filter((e: any) => Number(e.package_id) === Number(pkg.id)),
      }));
      // Employees with no package
      const noPackage = emps.filter((e: any) => !e.package_id);
      if (noPackage.length > 0) {
        result.push({ id: 0, name: "بدون باقة", employees: noPackage });
      }
      return NextResponse.json({ packages: result });
    }

    // ── Packages list ─────────────────────────────────────────────────────────
    if (action === "packages") {
      const pkgs = await query<any>(
        `SELECT DISTINCT p.id, p.group_name, p.work_type,
                COUNT(e.id) as total_drivers,
                SUM(CASE WHEN e.is_active = 1 THEN 1 ELSE 0 END) as active_drivers
         FROM employee_packages p
         LEFT JOIN employees e ON e.package_id = p.id AND e.company_id = ?
         WHERE p.company_id = ?
         GROUP BY p.id, p.group_name, p.work_type
         ORDER BY p.group_name ASC`,
        [companyId, companyId]
      );
      return NextResponse.json({ packages: pkgs });
    }

    // ── Notifications list ────────────────────────────────────────────────────
    if (action === "notifications") {
      try {
        const notifs = await query<any>(
          `SELECT * FROM driver_notifications
           WHERE company_id = ?
           ORDER BY created_at DESC LIMIT 100`,
          [companyId]
        );
        return NextResponse.json({ notifications: notifs });
      } catch {
        return NextResponse.json({ notifications: [] });
      }
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Driver tracking GET error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const companyId = session.company_id;
    if (!companyId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    // ── Send message / notification to drivers ─────────────────────────────
    if (action === "send_message") {
      const { driver_ids, title, message, image_url } = body;
      if (!Array.isArray(driver_ids) || driver_ids.length === 0) {
        return NextResponse.json({ error: "لم يتم تحديد سائقين" }, { status: 400 });
      }

      // Verify all driver_ids belong to this company
      const placeholders = driver_ids.map(() => "?").join(",");
      const validDrivers = await query<any>(
        `SELECT id FROM employees WHERE id IN (${placeholders}) AND company_id = ?`,
        [...driver_ids, companyId]
      );

      if (!validDrivers || validDrivers.length === 0) {
        return NextResponse.json({ error: "السائقون غير موجودون" }, { status: 404 });
      }

      // Insert notifications for each driver (for driver app to poll)
      try {
        for (const d of validDrivers as any[]) {
          await execute(
            `INSERT INTO driver_notifications
             (company_id, driver_id, title, message, image_url, is_read, created_at)
             VALUES (?, ?, ?, ?, ?, 0, NOW())`,
            [companyId, d.id, title || "رسالة جديدة", message, image_url || null]
          );
        }
      } catch (err: any) {
        // If table doesn't exist yet, try to create it
        if (err.message?.includes("doesn't exist")) {
          await execute(`
            CREATE TABLE IF NOT EXISTS driver_notifications (
              id INT AUTO_INCREMENT PRIMARY KEY,
              company_id INT NOT NULL,
              driver_id INT NOT NULL,
              title VARCHAR(255),
              message TEXT,
              image_url TEXT,
              is_read TINYINT(1) DEFAULT 0,
              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
              INDEX idx_driver (driver_id),
              INDEX idx_company (company_id)
            )
          `, []);
          // Retry inserts after table creation
          for (const d of validDrivers as any[]) {
            await execute(
              `INSERT INTO driver_notifications
               (company_id, driver_id, title, message, image_url, is_read, created_at)
               VALUES (?, ?, ?, ?, ?, 0, NOW())`,
              [companyId, d.id, title || "رسالة جديدة", message, image_url || null]
            );
          }
        } else {
          throw err;
        }
      }

      return NextResponse.json({ success: true, sent: validDrivers.length });
    }

    // ── Mark notification read ──────────────────────────────────────────────
    if (action === "mark_notification_read") {
      const { notification_id } = body;
      try {
        await execute(
          "UPDATE driver_notifications SET is_read = 1 WHERE id = ? AND company_id = ?",
          [notification_id, companyId]
        );
      } catch { /* ignore if table doesn't exist */ }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Driver tracking POST error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession();
    const companyId = session.company_id;
    if (!companyId) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

    const body = await request.json();
    const { action } = body;

    // ── Bulk activate/deactivate employees in a package ──────────────────────
    if (action === "bulk_activate") {
      const { active_ids, all_ids } = body;
      if (!Array.isArray(all_ids) || all_ids.length === 0) {
        return NextResponse.json({ error: "لم يتم تحديد موظفين" }, { status: 400 });
      }
      const activeSet = new Set((active_ids || []).map(Number));
      // Verify all IDs belong to this company in one query
      const placeholders = all_ids.map(() => "?").join(",");
      const validEmps = await query<any>(
        `SELECT id FROM employees WHERE id IN (${placeholders}) AND company_id = ?`,
        [...all_ids, companyId]
      );
      const validIds = new Set(validEmps.map((e: any) => Number(e.id)));
      // Activate selected, deactivate the rest — two queries
      const toActivate = all_ids.filter((id: number) => activeSet.has(Number(id)) && validIds.has(Number(id)));
      const toDeactivate = all_ids.filter((id: number) => !activeSet.has(Number(id)) && validIds.has(Number(id)));
      if (toActivate.length > 0) {
        const ph = toActivate.map(() => "?").join(",");
        await execute(`UPDATE employees SET is_active = 1 WHERE id IN (${ph}) AND company_id = ?`, [...toActivate, companyId]);
      }
      if (toDeactivate.length > 0) {
        const ph = toDeactivate.map(() => "?").join(",");
        await execute(`UPDATE employees SET is_active = 0 WHERE id IN (${ph}) AND company_id = ?`, [...toDeactivate, companyId]);
      }
      return NextResponse.json({ success: true, activated: toActivate.length, deactivated: toDeactivate.length });
    }

    // ── Toggle driver active status ──────────────────────────────────────────
    if (action === "toggle_active") {
      const { driver_id, is_active } = body;
      const [driver] = await query<any>(
        "SELECT id FROM employees WHERE id = ? AND company_id = ?",
        [driver_id, companyId]
      );
      if (!driver) return NextResponse.json({ error: "السائق غير موجود" }, { status: 404 });
      await execute(
        "UPDATE employees SET is_active = ? WHERE id = ? AND company_id = ?",
        [is_active ? 1 : 0, driver_id, companyId]
      );
      return NextResponse.json({ success: true });
    }

    // ── Approve / reject driver request ────────────────────────────────────
    if (action === "update_request") {
      const { request_id, status, admin_notes } = body;
      const [req] = await query<any>(
        `SELECT dr.id, dr.driver_id, dr.request_type FROM driver_requests dr
         JOIN employees e ON dr.driver_id = e.id
         WHERE dr.id = ? AND e.company_id = ?`,
        [request_id, companyId]
      );
      if (!req) return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
      await execute(
        "UPDATE driver_requests SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?",
        [status, admin_notes || "", request_id]
      );
      // Send notification to driver
      const statusText = status === "approved" ? "تمت الموافقة على طلبك" : "تم رفض طلبك";
      const msg = admin_notes ? `${statusText}. ملاحظة الإدارة: ${admin_notes}` : statusText;
      try {
        await execute(
          `INSERT INTO driver_notifications (company_id, driver_id, title, message, image_url, is_read, created_at)
           VALUES (?, ?, ?, ?, NULL, 0, NOW())`,
          [companyId, req.driver_id, `رد على طلبك — ${statusText}`, msg]
        );
      } catch { /* notifications table may not exist */ }
      return NextResponse.json({ success: true });
    }

    // ── Approve / reject wallet settlement ─────────────────────────────────
    if (action === "update_settlement") {
      const { settlement_id, settlement_status, paid_amount, notes } = body;
      const [s] = await query<any>(
        `SELECT ws.id, ws.total_amount, ws.driver_id FROM wallet_settlements ws
         JOIN employees e ON ws.driver_id = e.id
         WHERE ws.id = ? AND e.company_id = ?`,
        [settlement_id, companyId]
      );
      if (!s) return NextResponse.json({ error: "التسوية غير موجودة" }, { status: 404 });
      const newPaid = parseFloat(paid_amount) || 0;
      const newRemaining = parseFloat(s.total_amount) - newPaid;
      await execute(
        `UPDATE wallet_settlements
         SET settlement_status = ?, paid_amount = ?, remaining_amount = ?, notes = ?
         WHERE id = ?`,
        [settlement_status, newPaid, newRemaining, notes || "", settlement_id]
      );
      // Send notification to driver
      const stMap: Record<string, { title: string; text: string }> = {
        paid:     { title: "موافقة ✅ تسوية محفظة", text: "تمت الموافقة الكاملة على تسويتك — تم تأكيد المبلغ بالكامل" },
        partial:  { title: "موافقة جزئية 💰 تسوية محفظة", text: "تمت الموافقة الجزئية على تسويتك" },
        rejected: { title: "رفض ❌ تسوية محفظة", text: "تم رفض طلب التسوية" },
      };
      const stEntry = stMap[settlement_status] || { title: "تحديث تسوية المحفظة", text: "تم تحديث حالة تسويتك" };
      const stMsg = notes ? `${stEntry.text}. ملاحظة: ${notes}` : stEntry.text;
      try {
        await execute(
          `INSERT INTO driver_notifications (company_id, driver_id, title, message, image_url, is_read, created_at)
           VALUES (?, ?, ?, ?, NULL, 0, NOW())`,
          [companyId, s.driver_id, stEntry.title, stMsg]
        );
      } catch { /* ignore */ }
      return NextResponse.json({ success: true });
    }

    // ── Approve / resolve / reject daily issue ──────────────────────────────
    if (action === "update_issue") {
      const { issue_id, status, admin_notes } = body;
      const [issue] = await query<any>(
        `SELECT di.id, di.driver_id FROM driver_daily_issues di
         JOIN employees e ON di.driver_id = e.id
         WHERE di.id = ? AND e.company_id = ?`,
        [issue_id, companyId]
      );
      if (!issue) return NextResponse.json({ error: "المشكلة غير موجودة" }, { status: 404 });
      // Update issue — add columns if missing
      try {
        await execute(
          "UPDATE driver_daily_issues SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?",
          [status, admin_notes || "", issue_id]
        );
      } catch (err: any) {
        if (err.message?.includes("Unknown column")) {
          try { await execute("ALTER TABLE driver_daily_issues ADD COLUMN status VARCHAR(20) DEFAULT 'pending'", []); } catch { /* ignore */ }
          try { await execute("ALTER TABLE driver_daily_issues ADD COLUMN admin_notes TEXT", []); } catch { /* ignore */ }
          await execute(
            "UPDATE driver_daily_issues SET status = ?, admin_notes = ?, updated_at = NOW() WHERE id = ?",
            [status, admin_notes || "", issue_id]
          );
        } else throw err;
      }
      // Send notification to driver
      const issText = status === "resolved" ? "تم إغلاق بلاغ مشكلتك" : "تم مراجعة بلاغ مشكلتك";
      const issMsg = admin_notes ? `${issText}. ملاحظة الإدارة: ${admin_notes}` : issText;
      try {
        await execute(
          `INSERT INTO driver_notifications (company_id, driver_id, title, message, image_url, is_read, created_at)
           VALUES (?, ?, ?, ?, NULL, 0, NOW())`,
          [companyId, issue.driver_id, "رد على بلاغ المشكلة", issMsg]
        );
      } catch { /* ignore */ }
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير صالح" }, { status: 400 });
  } catch (error: any) {
    console.error("Driver tracking PUT error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ" }, { status: 500 });
  }
}
