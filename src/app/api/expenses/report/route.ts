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
      const expenses = await query<ExpenseRow>(
        `SELECT 
          e.*,
          a.account_code as acc_code,
          a.account_name,
          c.center_code,
          c.center_name
        FROM monthly_expenses e
        LEFT JOIN accounts a ON e.account_id = a.id
        LEFT JOIN cost_centers c ON e.cost_center_id = c.id
        WHERE e.company_id = ? AND e.month_reference = ?
        ORDER BY e.expense_type, e.expense_date ASC`,
        [companyId, month]
      );

      if (expenses && expenses.length > 0) {
        expenses.forEach((expense) => {
          const group = expense.expense_type || 'مصروفات أخرى';
          if (!expensesGrouped[group]) {
            expensesGrouped[group] = [];
          }
          expensesGrouped[group].push({
            ...expense,
            account_code: (expense as any).acc_code || expense.account_code,
            center_code: expense.center_code || expense.cost_center_code,
          });
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
