# خطة ربط التقارير المحاسبية بقواعد البيانات الفعلية

## المشكلة الحالية

الصفحات المحاسبية التالية تعتمد **فقط** على جدول `journal_entries` (القيود اليومية في Supabase):
- دفتر الأستاذ العام (General Ledger)
- ميزان المراجعة (Trial Balance)
- قائمة الدخل (Income Statement)
- الميزانية العمومية (Balance Sheet)

لكن **البيانات الفعلية** للمصروفات والإيرادات موجودة في جداول أخرى:
- `monthly_expenses` - المصروفات الشهرية (MySQL)
- `salary_payrolls` / `salary_payroll_items` - الرواتب (MySQL)
- `sales_invoices` - فواتير المبيعات (MySQL)
- `manual_income` - الدخل اليدوي (Supabase)
- `expenses` - المصروفات العامة (Supabase)
- `payment_vouchers` - سندات الصرف (Supabase)
- `receipt_vouchers` - سندات القبض (MySQL)
- `credit_notes` - إشعارات الدائن (Supabase)

## الحل المقترح

### الخيار 1: إنشاء قيود يومية تلقائية (Recommended)
عند حفظ أي عملية مالية، يتم إنشاء قيد يومي تلقائي في جدول `journal_entries`:

**مثال للمصروفات:**
```
حساب المصروف (مدين) ← حساب الصندوق/البنك (دائن)
```

**مثال للفواتير:**
```
حساب العملاء (مدين) ← حساب الإيرادات (دائن)
```

### الخيار 2: تعديل API للتقارير لتجميع البيانات من كل الجداول
تعديل APIs التقارير لقراءة البيانات مباشرة من جميع الجداول المصدرية بدلاً من الاعتماد على `journal_entries` فقط.

---

## التفاصيل التقنية

### 1. جدول الحسابات (accounts) - Supabase
```sql
- id, account_code, account_name, type (اصل/التزام/حقوق ملكية/ايراد/مصروف)
- company_id, parent_id, opening_balance, balance_type
```

### 2. جدول مراكز التكلفة (cost_centers) - MySQL/Supabase
```sql
- id, center_code, center_name, company_id, parent_id
```

### 3. جدول القيود اليومية (journal_entries) - Supabase
```sql
- id, entry_number, entry_date, account_id, cost_center_id
- description, debit, credit, company_id, created_by
```

---

## مراحل التنفيذ

### المرحلة 1: إنشاء نظام القيود التلقائية
1. إنشاء دالة مساعدة `createAutoJournalEntry()` في `lib/accounting.ts`
2. تعديل API حفظ المصروفات `/api/expenses/save` لإنشاء قيد تلقائي
3. تعديل API حفظ الرواتب `/api/payrolls` لإنشاء قيد تلقائي
4. تعديل API حفظ الفواتير لإنشاء قيد تلقائي

### المرحلة 2: ربط الحسابات بأنواع العمليات
1. إضافة حقول ربط في جدول `accounts`:
   - `is_default_expense_account` - حساب المصروفات الافتراضي
   - `is_default_revenue_account` - حساب الإيرادات الافتراضي
   - `is_default_cash_account` - حساب الصندوق
   - `is_default_bank_account` - حساب البنك
   - `is_default_salary_account` - حساب الرواتب
2. إنشاء صفحة إعدادات الحسابات الافتراضية

### المرحلة 3: ترحيل البيانات القديمة
1. إنشاء script لترحيل المصروفات القديمة إلى قيود يومية
2. إنشاء script لترحيل الرواتب القديمة إلى قيود يومية
3. إنشاء script لترحيل الفواتير القديمة إلى قيود يومية

### المرحلة 4: تحسين التقارير
1. تحديث General Ledger API ليشمل كل مصادر البيانات
2. تحديث Trial Balance API
3. تحديث Income Statement API
4. تحديث Balance Sheet API

---

## الملفات المطلوب تعديلها

### APIs الحفظ (إضافة إنشاء القيود التلقائية):
- `app/api/expenses/save/route.ts`
- `app/api/payrolls/route.ts`
- `app/api/invoices/route.ts` (أو المسار الصحيح للفواتير)
- `app/api/income/save/route.ts`

### APIs التقارير (تحديث لجلب كل البيانات):
- `app/api/general-ledger/route.ts`
- `app/api/trial-balance/route.ts`
- `app/api/income-statement/route.ts`
- `app/api/balance-sheet/route.ts`

### ملفات مساعدة:
- `lib/accounting.ts` - إضافة دوال القيود التلقائية
- `lib/db.ts` - قد يحتاج تحديث

### صفحات جديدة:
- `app/(dashboard)/settings/default-accounts/page.tsx` - إعدادات الحسابات الافتراضية

---

## مثال كود القيد التلقائي للمصروفات

```typescript
// في lib/accounting.ts
export async function createExpenseJournalEntry({
  company_id,
  expense_date,
  amount,
  description,
  expense_account_id,
  cash_account_id,
  cost_center_id,
  created_by
}: {
  company_id: number;
  expense_date: string;
  amount: number;
  description: string;
  expense_account_id: number;
  cash_account_id: number;
  cost_center_id?: number;
  created_by: string;
}) {
  const entry_number = await generateNextEntryNumber(company_id);
  
  return recordJournalEntry({
    entry_date: expense_date,
    entry_number,
    description,
    company_id,
    created_by,
    lines: [
      { account_id: expense_account_id, debit: amount, credit: 0, description, cost_center_id },
      { account_id: cash_account_id, debit: 0, credit: amount, description }
    ]
  });
}
```

---

## الأولوية المقترحة

| الأولوية | المهمة | التقدير |
|---------|--------|---------|
| 1 | إضافة إنشاء قيود تلقائية للمصروفات | 2-3 ساعات |
| 2 | إضافة إنشاء قيود تلقائية للرواتب | 2-3 ساعات |
| 3 | إنشاء صفحة الحسابات الافتراضية | 3-4 ساعات |
| 4 | ترحيل البيانات القديمة | 2-3 ساعات |
| 5 | تحديث APIs التقارير | 4-5 ساعات |

---

## ملاحظات مهمة

1. **التوازن المحاسبي**: كل قيد يجب أن يكون متوازن (مدين = دائن)
2. **الترقيم التسلسلي**: أرقام القيود يجب أن تكون متسلسلة
3. **التراجع**: يجب إنشاء آلية لحذف القيد عند حذف العملية الأصلية
4. **التعديل**: يجب تحديث القيد عند تعديل العملية الأصلية
5. **الصلاحيات**: التحقق من صلاحيات المستخدم قبل إنشاء القيود
