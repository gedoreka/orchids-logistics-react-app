# Full Accounting Integration Plan

## Requirements
ربط كامل لي:
1. **مسيرات الرواتب (Salary Payrolls)** - ربط شجرة الحسابات ومركز التكلفة
2. **الفواتير الضريبية (Tax Invoices)** - ربط شجرة الحسابات ومركز التكلفة  
3. **مركز الحسابات الشهري (Monthly Expenses Report)** - عرض البيانات بالكامل
4. **القيود اليومية (Journal Entries)** - جلب المحفوظ من شجرة الحسابات ومركز التكلفة
5. **دفتر الأستاذ العام (General Ledger)** - اظهار المعلومات القديمة والجديدة لكل شركة

---

## Current State Analysis

### 1. Salary Payrolls (`/salary-payrolls`)
- **Status**: UI complete with TreeDropdown selectors for accounts & cost centers
- **API**: `account_id` and `cost_center_id` accepted and saved to `salary_payrolls` table
- **Journal Entry**: Auto-records on save but uses hardcoded default accounts, NOT user-selected account/cost_center
- **Gap**: Journal entries don't use the selected `account_id` and `cost_center_id`

### 2. Sales Invoices (`/sales-invoices`) 
- **Status**: UI complete with selectors for accounts & cost centers
- **API**: `account_id` and `cost_center_id` saved to `sales_invoices` table
- **Journal Entry**: Auto-records using default accounts
- **Gap**: Journal entries don't use the selected `account_id` and `cost_center_id`

### 3. General Ledger (`/general-ledger`)
- **Status**: Fetches only from `journal_entries` table in Supabase
- **Gap**: Shows 0 records because entries are in MySQL, not properly aggregating all sources

### 4. Monthly Expenses Report (`/expenses/report`)
- **Status**: Shows expenses, deductions, payrolls with account/cost center names
- **Gap**: Missing link to show full accounting data integration

### 5. Journal Entries (`/journal-entries`)
- **Status**: Manual entry with account & cost center selectors
- **Gap**: No automatic linking from other modules

---

## Database Structure

### journal_entries (Supabase PostgreSQL)
```sql
- id, entry_date, entry_number, description
- account_id, cost_center_id
- debit, credit
- company_id, created_by
- source_type, source_id  -- Links to: 'payroll', 'sales_invoice', 'expense', etc.
```

### salary_payrolls (MySQL)
```sql
- account_id, cost_center_id  -- Already exists
```

### sales_invoices (MySQL)
```sql  
- account_id, cost_center_id  -- Already exists
```

---

## Implementation Phases

### Phase 1: Fix Payroll Journal Entries to Use Selected Account/Cost Center
**Files to modify:**
- `app/api/payrolls/route.ts`

**Changes:**
1. Use `account_id` from request body instead of default salaries account
2. Add `cost_center_id` to each journal line
3. Update description to include cost center reference

**Code Example:**
```typescript
// Current (uses defaults):
const salaryAccountId = defaults.salaries;

// New (uses selected):
const salaryAccountId = account_id || defaults.salaries;
const selectedCostCenter = cost_center_id;

await recordJournalEntry({
  ...
  lines: [
    { 
      account_id: salaryAccountId, 
      cost_center_id: selectedCostCenter,  // ADD THIS
      debit: totalAmount, 
      credit: 0, 
      description: `رواتب شهر ${payroll_month}` 
    },
    ...
  ]
});
```

### Phase 2: Fix Sales Invoice Journal Entries to Use Selected Account/Cost Center
**Files to modify:**
- `app/api/sales-invoices/route.ts`

**Changes:**
1. Use `account_id` from request body for revenue account
2. Add `cost_center_id` to journal lines
3. Ensure VAT journal lines also include cost center

### Phase 3: Enhance General Ledger to Show All Data Sources
**Files to modify:**
- `app/api/general-ledger/route.ts`
- `app/(dashboard)/general-ledger/general-ledger-client.tsx`

**Changes:**
1. Query BOTH Supabase (journal_entries) AND MySQL tables
2. Aggregate data from:
   - `journal_entries` (manual entries + auto-entries)
   - `monthly_expenses` (MySQL)
   - `monthly_deductions` (MySQL)
   - `salary_payrolls` (MySQL)
   - `sales_invoices` (MySQL)
3. Create unified view with source_type badges
4. Show old system data (MySQL) and new system data (Supabase) together
5. Add company filter to show per-company data

**Query Structure:**
```typescript
// Fetch from Supabase journal_entries
const journalEntries = await supabase
  .from("journal_entries")
  .select(`*, accounts(*), cost_centers(*)`)
  .eq("company_id", companyId);

// Fetch from MySQL expenses with journal-like transformation
const expenses = await query(`
  SELECT e.*, a.account_name, c.center_name,
         e.amount as debit, 0 as credit,
         'expense' as source_type
  FROM monthly_expenses e
  LEFT JOIN accounts a ON e.account_id = a.id
  LEFT JOIN cost_centers c ON e.cost_center_id = c.id
  WHERE e.company_id = ?
`, [companyId]);

// Combine all sources
const allEntries = [...journalEntries, ...expenses, ...deductions, ...payrolls];
```

### Phase 4: Enhance Monthly Expenses Report with Full Accounting Link
**Files to modify:**
- `app/(dashboard)/expenses/report/expenses-report-client.tsx`
- `app/api/expenses/report/route.ts`

**Changes:**
1. Add "شجرة الحسابات" column showing full account hierarchy
2. Add "مركز التكلفة" column with full hierarchy
3. Add summary cards showing totals by account and by cost center
4. Add link to view in General Ledger

### Phase 5: Update Journal Entries Page with Better Tree View
**Files to modify:**
- `app/(dashboard)/journal-entries/journal-entries-client.tsx`

**Changes:**
1. Enhance account selector to show full tree hierarchy (like in payrolls)
2. Enhance cost center selector with tree hierarchy
3. Add filtering by source_type to see auto-generated vs manual entries
4. Add "View Source" button to navigate to original document

### Phase 6: Create Accounting Dashboard Summary
**Files to create:**
- `app/(dashboard)/accounting-summary/page.tsx`
- `app/(dashboard)/accounting-summary/accounting-summary-client.tsx`
- `app/api/accounting-summary/route.ts`

**Features:**
1. Summary cards: Total Debits, Total Credits, Balance
2. By Account breakdown
3. By Cost Center breakdown
4. By Source Type (Payroll, Invoice, Expense, Manual)
5. Time-based charts (monthly trends)
6. Quick links to each module

---

## API Changes Summary

### `/api/payrolls` POST
```diff
lines: [
  { 
    account_id: salaryAccountId, 
+   cost_center_id: cost_center_id,
    debit: totalAmount, 
    credit: 0 
  },
  { 
    account_id: cashAccountId, 
+   cost_center_id: cost_center_id,
    debit: 0, 
    credit: totalAmount 
  }
]
```

### `/api/sales-invoices` POST
```diff
lines: [
  { 
    account_id: receivablesAccountId, 
+   cost_center_id: cost_center_id,
    debit: totalWithVat, 
    credit: 0 
  },
  { 
    account_id: revenueAccountId || account_id, 
+   cost_center_id: cost_center_id,
    debit: 0, 
    credit: subtotal 
  },
  { 
    account_id: vatAccountId, 
+   cost_center_id: cost_center_id,
    debit: 0, 
    credit: vatAmount 
  }
]
```

### `/api/general-ledger` GET
```diff
// Add MySQL data sources
+ const mysqlExpenses = await query(...);
+ const mysqlDeductions = await query(...);
+ const mysqlPayrolls = await query(...);
+ const mysqlInvoices = await query(...);

// Combine with Supabase
const entries = [
  ...supabaseEntries,
+ ...transformedExpenses,
+ ...transformedDeductions,
+ ...transformedPayrolls,
+ ...transformedInvoices
];
```

---

## UI Enhancements

### General Ledger Page
1. Add tabs: "All" | "Journal Entries" | "Expenses" | "Payrolls" | "Invoices"
2. Add source_type badge with color coding
3. Add "View Original" link for each entry
4. Add comparison mode: Old System vs New System

### Expenses Report Page
1. Enhance شجرة الحسابات column display
2. Enhance مركز التكلفة column display
3. Add subtotals by account
4. Add subtotals by cost center

---

## Testing Plan

1. **Create Payroll** with account + cost center → Verify journal entry has cost_center_id
2. **Create Sales Invoice** with account + cost center → Verify journal entry has cost_center_id  
3. **View General Ledger** → Should show entries from all sources
4. **View Expenses Report** → Should show full account/cost center names
5. **Filter by Company** → Each company sees only their data

---

## Critical Files for Implementation
1. `app/api/payrolls/route.ts` - Update journal entry creation with cost_center_id
2. `app/api/sales-invoices/route.ts` - Update journal entry creation with cost_center_id
3. `app/api/general-ledger/route.ts` - Add MySQL data aggregation
4. `app/(dashboard)/general-ledger/general-ledger-client.tsx` - Add source tabs and badges
5. `lib/accounting.ts` - Reference for journal entry structure
