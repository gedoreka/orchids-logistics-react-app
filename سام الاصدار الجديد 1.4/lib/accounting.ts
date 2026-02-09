import { supabase } from "./supabase-client";

export interface JournalLine {
  account_id: number;
  cost_center_id?: number;
  description: string;
  debit: number;
  credit: number;
}

export interface RecordJournalEntryParams {
  entry_date: string;
  entry_number: string;
  description: string;
  company_id: number;
  created_by: string;
  source_type?: string;
  source_id?: string;
  lines: JournalLine[];
}

/**
 * Record a journal entry with multiple lines.
 * Each line is inserted into journal_entries with source_type/source_id for traceability.
 */
export async function recordJournalEntry(params: RecordJournalEntryParams) {
  const { entry_date, entry_number, description, company_id, created_by, source_type, source_id, lines } = params;

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error(`Journal entry is not balanced: debit=${totalDebit}, credit=${totalCredit}`);
  }

  const entriesToInsert = lines.map(line => ({
    entry_date,
    entry_number,
    description: line.description || description,
    account_id: line.account_id,
    cost_center_id: line.cost_center_id || null,
    debit: line.debit,
    credit: line.credit,
    company_id,
    created_by,
    source_type: source_type || null,
    source_id: source_id || null,
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entriesToInsert)
    .select();

  if (error) {
    console.error("Error recording journal entry:", error);
    throw error;
  }

  return data;
}

/**
 * Generate next sequential entry number for a company.
 */
export async function generateNextEntryNumber(companyId: number, prefix = "JE") {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_number")
    .eq("company_id", companyId)
    .like("entry_number", `${prefix}-%`)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return `${prefix}-00001`;
  
  const lastNum = data[0].entry_number;
  const match = lastNum.match(/(\d+)$/);
  if (!match) return `${prefix}-00001`;
  
  const nextNum = parseInt(match[1]) + 1;
  return `${prefix}-${String(nextNum).padStart(5, '0')}`;
}

/**
 * Delete journal entries linked to a specific source.
 */
export async function deleteJournalEntriesBySource(companyId: number, sourceType: string, sourceId: string) {
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("company_id", companyId)
    .eq("source_type", sourceType)
    .eq("source_id", sourceId);

  if (error) {
    console.error("Error deleting journal entries by source:", error);
    throw error;
  }
}

/**
 * Get default accounts for a company from default_accounts table.
 * Returns a map of account_key -> account_id.
 */
export async function getDefaultAccounts(companyId: number): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from("default_accounts")
    .select("account_key, account_id")
    .eq("company_id", companyId);

  if (error) {
    console.error("Error fetching default accounts:", error);
    return {};
  }

  const map: Record<string, number> = {};
  data?.forEach(row => {
    map[row.account_key] = row.account_id;
  });
  return map;
}

/**
 * Resolve the cash/bank account based on payment method.
 */
export function resolvePaymentAccount(
  defaults: Record<string, number>,
  paymentMethod?: string
): number | null {
  if (!paymentMethod) return defaults.cash || null;
  const method = paymentMethod.toLowerCase();
  if (method.includes("بنك") || method.includes("bank") || method.includes("تحويل")) {
    return defaults.bank || defaults.cash || null;
  }
  return defaults.cash || null;
}
