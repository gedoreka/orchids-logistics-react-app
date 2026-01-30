import { supabase } from "./supabase-client";

export interface JournalLine {
  account_id: number;
  cost_center_id?: number;
  description: string;
  debit: number;
  credit: number;
}

export async function recordJournalEntry({
  entry_date,
  entry_number,
  description,
  company_id,
  created_by,
  lines
}: {
  entry_date: string;
  entry_number: string;
  description: string;
  company_id: number;
  created_by: string;
  lines: JournalLine[];
}) {
  // 1. Validate balance
  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  
  if (Math.abs(totalDebit - totalCredit) > 0.01) {
    throw new Error("Journal entry is not balanced");
  }

  // 2. Insert lines into journal_entries
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
    created_at: new Date().toISOString()
  }));

  const { data, error } = await supabase
    .from("journal_entries")
    .insert(entriesToInsert);

  if (error) {
    console.error("Error recording journal entry:", error);
    throw error;
  }

  return data;
}

export async function generateNextEntryNumber(companyId: number) {
  const { data, error } = await supabase
    .from("journal_entries")
    .select("entry_number")
    .eq("company_id", companyId)
    .order("entry_number", { ascending: false })
    .limit(1);

  if (error) return "JE-00001";
  
  if (!data || data.length === 0) return "JE-00001";
  
  const lastNum = data[0].entry_number;
  const match = lastNum.match(/\d+/);
  if (!match) return "JE-00001";
  
  const nextNum = parseInt(match[0]) + 1;
  return `JE-${String(nextNum).padStart(5, '0')}`;
}
