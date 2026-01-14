import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
    
    const companyId = session.company_id;
    
    if (!companyId) {
      return NextResponse.json({ error: 'No company ID' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || new Date().toISOString().slice(0, 7);
    const reportType = searchParams.get('report_type') || 'all';

    const { data: companyInfo } = await supabase
      .from('companies')
      .select('id, name, logo_path, currency')
      .eq('id', companyId)
      .single();

    let expensesGrouped: Record<string, any[]> = {};
    let deductionsGrouped: Record<string, any[]> = {};
    let payrolls: any[] = [];
    let totalExpenses = 0;
    let totalDeductions = 0;
    let totalPayrolls = 0;

    if (reportType === 'expenses' || reportType === 'all') {
      const { data: expenses } = await supabase
        .from('monthly_expenses')
        .select(`
          *,
          accounts:account_id (account_code, account_name),
          cost_centers:cost_center_id (center_code, center_name)
        `)
        .eq('company_id', companyId)
        .eq('month_reference', month)
        .order('expense_type')
        .order('expense_date', { ascending: true });

      if (expenses) {
        expenses.forEach((expense: any) => {
          const group = expense.expense_type || 'مصروفات أخرى';
          if (!expensesGrouped[group]) {
            expensesGrouped[group] = [];
          }
          expensesGrouped[group].push({
            ...expense,
            account_code: expense.accounts?.account_code || expense.account_code,
            account_name: expense.accounts?.account_name,
            center_code: expense.cost_centers?.center_code || expense.cost_center_code,
            center_name: expense.cost_centers?.center_name,
          });
          totalExpenses += parseFloat(expense.amount || 0);
        });
      }
    }

    if (reportType === 'deductions' || reportType === 'all') {
      const { data: deductions } = await supabase
        .from('monthly_deductions')
        .select(`
          *,
          accounts:account_id (account_code, account_name),
          cost_centers:cost_center_id (center_code, center_name)
        `)
        .eq('company_id', companyId)
        .eq('month_reference', month)
        .order('deduction_type')
        .order('expense_date', { ascending: true });

      if (deductions) {
        deductions.forEach((deduction: any) => {
          const group = deduction.deduction_type || 'استقطاعات أخرى';
          if (!deductionsGrouped[group]) {
            deductionsGrouped[group] = [];
          }
          deductionsGrouped[group].push({
            ...deduction,
            account_code: deduction.accounts?.account_code,
            account_name: deduction.accounts?.account_name,
            center_code: deduction.cost_centers?.center_code,
            center_name: deduction.cost_centers?.center_name,
          });
          totalDeductions += parseFloat(deduction.amount || 0);
        });
      }
    }

    if (reportType === 'expenses' || reportType === 'all') {
      const { data: payrollsData } = await supabase
        .from('salary_payrolls')
        .select('*')
        .eq('company_id', companyId)
        .eq('payroll_month', month)
        .eq('is_draft', 0);

      if (payrollsData) {
        for (const payroll of payrollsData) {
          const { data: items } = await supabase
            .from('salary_payroll_items')
            .select('*')
            .eq('payroll_id', payroll.id)
            .order('iqama_number');

          payrolls.push({
            ...payroll,
            items: items || [],
            employee_count: items?.length || 0
          });
          totalPayrolls += parseFloat(payroll.total_amount || 0);
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
