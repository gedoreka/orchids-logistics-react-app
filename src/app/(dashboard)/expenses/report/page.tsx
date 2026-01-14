import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ExpensesReportClient } from './expenses-report-client';

export default async function ExpensesReportPage() {
  const cookieStore = await cookies();
  const companyId = cookieStore.get('company_id')?.value;

  if (!companyId) {
    redirect('/login');
  }

  return <ExpensesReportClient companyId={parseInt(companyId)} />;
}
