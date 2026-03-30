import { query } from '@/lib/db';

export async function getSystemStats(companyId: string) {
  try {
    const invoiceCount = await query<any>('SELECT COUNT(*) as count FROM sales_invoices WHERE company_id = ?', [companyId]);
    const employeeCount = await query<any>('SELECT COUNT(*) as count FROM employees WHERE company_id = ?', [companyId]);
    const customerCount = await query<any>('SELECT COUNT(*) as count FROM customers WHERE company_id = ?', [companyId]);
    
    return {
      invoices: invoiceCount[0]?.count || 0,
      employees: employeeCount[0]?.count || 0,
      customers: customerCount[0]?.count || 0,
      lastUpdated: new Date()
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return null;
  }
}
