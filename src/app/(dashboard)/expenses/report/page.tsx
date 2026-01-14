import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ExpensesReportClient } from './expenses-report-client';

export default async function ExpensesReportPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('auth_session');

  if (!sessionCookie) {
    redirect('/login');
  }

  let session;
  try {
    session = JSON.parse(sessionCookie.value);
  } catch {
    redirect('/login');
  }
  
  const companyId = session.company_id;

  if (!companyId) {
    redirect('/dashboard');
  }

  return <ExpensesReportClient companyId={companyId} />;
}
