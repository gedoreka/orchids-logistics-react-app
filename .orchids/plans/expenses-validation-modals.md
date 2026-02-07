# نظام التحقق والإشعارات الفاخمة للمنصرفات والاستقطاعات

## المتطلبات

### 1. الحقول الإجبارية
جعل الحقول التالية إجبارية في كافة أنواع المنصرفات والاستقطاعات:
- **شجرة الحسابات** ★
- **مركز التكلفة** ★  
- **المبلغ** ★

### 2. إشعارات التحقق (Validation Notifications)
عند محاولة الحفظ بدون ملء الحقول الإجبارية:
- عرض مودال تحذيري فاخم بنفس تصميم salary-payrolls
- توضيح النواقص بشكل واضح وجميل
- لون برتقالي/كهرماني للتحذير

### 3. استبدال إشعارات الحفظ القديمة
استبدال نظام الإشعارات الحالي بنظام فاخم جديد يتضمن:
- **مودال فحص المنصرف** (جاري التحقق...)
- **مودال تأكيد الحفظ** (هل تريد حفظ X منصرف؟)
- **مودال جاري الحفظ** (Loading)
- **مودال نجاح الحفظ** (تم الحفظ بنجاح + تفاصيل)

### 4. مودال الحذف الفاخم
- مودال تأكيد الحذف بتصميم أحمر فاخم
- مودال نجاح الحذف بتصميم أخضر

### 5. معلومات الحفظ في مودال النجاح
عرض:
- عدد المنصرفات
- إجمالي المبالغ
- شجرة الحسابات
- مركز التكلفة
- تفاصيل أخرى

---

## الملفات المستهدفة

### المنصرفات (Expenses)
1. `app/(dashboard)/expenses/new/expense-form-client.tsx`
2. `app/(dashboard)/expenses/expenses-client.tsx` (للحذف)

### الاستقطاعات (Deductions)
3. `app/(dashboard)/expenses/deductions/deduction-form-client.tsx`

---

## مراحل التنفيذ

### المرحلة 1: إضافة علامة النجمة للحقول الإجبارية
**الملفات:** expense-form-client.tsx, deduction-form-client.tsx

**التغييرات:**
- إضافة `*` أو نجمة حمراء بجانب labels: شجرة الحسابات، مركز التكلفة، المبلغ
- تحسين التصميم البصري للحقول الإجبارية

```tsx
// مثال على التصميم
<th className="...">
  {t("form.account")}
  <span className="text-red-500 mr-1">*</span>
</th>
```

---

### المرحلة 2: نظام الإشعارات الفاخم (Notification System)

**إضافة State جديد:**
```tsx
interface NotificationState {
  show: boolean;
  type: 'warning' | 'confirm' | 'loading' | 'success' | 'error';
  title: string;
  message: string;
  details?: {
    count: number;
    totalAmount: number;
    accountName?: string;
    costCenterName?: string;
    month?: string;
    types?: string[];
  };
  missingFields?: string[];
  onConfirm?: () => void;
}

const [notification, setNotification] = useState<NotificationState>({
  show: false,
  type: 'warning',
  title: '',
  message: '',
});
```

**Function للإشعارات:**
```tsx
const showNotification = (
  type: NotificationState['type'],
  title: string,
  message: string,
  details?: NotificationState['details'],
  missingFields?: string[],
  onConfirm?: () => void
) => {
  setNotification({
    show: true,
    type,
    title,
    message,
    details,
    missingFields,
    onConfirm
  });
};
```

---

### المرحلة 3: تحديث handleSubmit للمنصرفات

**الملف:** expense-form-client.tsx

```tsx
const handleSubmit = async () => {
  if (Object.keys(sections).length === 0) return;

  // جمع الحقول الناقصة
  const missingFields: string[] = [];
  let rowsWithMissingFields: string[] = [];
  
  Object.entries(sections).forEach(([type, rows]) => {
    rows.forEach((row, index) => {
      const rowNumber = index + 1;
      const missing: string[] = [];
      
      if (!row.account_code) missing.push('شجرة الحسابات');
      if (!row.cost_center_code) missing.push('مركز التكلفة');
      if (!row.amount || parseFloat(row.amount) <= 0) missing.push('المبلغ');
      
      if (missing.length > 0) {
        rowsWithMissingFields.push(`صف ${rowNumber} (${t(`types.${type}`)}) - ${missing.join('، ')}`);
      }
    });
  });

  if (rowsWithMissingFields.length > 0) {
    showNotification(
      'warning',
      'حقول إجبارية مفقودة',
      'يرجى إكمال الحقول التالية قبل الحفظ:',
      undefined,
      rowsWithMissingFields
    );
    return;
  }

  // حساب الإجماليات
  const allRows = Object.values(sections).flat();
  const totalCount = allRows.length;
  const totalAmount = allRows.reduce((sum, row) => sum + (parseFloat(row.net_amount) || 0), 0);
  const types = Object.keys(sections).map(type => t(`types.${type}`));

  // عرض مودال التأكيد
  showNotification(
    'confirm',
    'تأكيد حفظ المنصرفات',
    'هل تريد حفظ المنصرفات التالية؟',
    {
      count: totalCount,
      totalAmount,
      types,
      month: new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
    },
    undefined,
    () => executeSave()
  );
};
```

---

### المرحلة 4: تنفيذ الحفظ الفعلي

```tsx
const executeSave = async () => {
  // عرض Loading
  showNotification('loading', 'جاري الحفظ...', 'يتم حفظ المنصرفات في النظام');

  try {
    // ... كود الحفظ الحالي ...
    
    if (data.success) {
      showNotification(
        'success',
        '✓ تم الحفظ بنجاح',
        `تم حفظ ${data.savedCount} منصرف بنجاح`,
        {
          count: data.savedCount,
          totalAmount: calculatedTotal,
          month: new Date().toLocaleDateString('ar-SA', { month: 'long', year: 'numeric' })
        }
      );
    }
  } catch (error) {
    showNotification('error', 'خطأ في الحفظ', error.message);
  }
};
```

---

### المرحلة 5: مكونات المودالات الفاخمة

**مودال التحذير (Warning Modal):**
```tsx
{notification.type === "warning" && (
  <motion.div className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-[0_0_100px_rgba(245,158,11,0.3)] overflow-hidden border-4 border-amber-500/20">
    {/* Header برتقالي */}
    <div className="relative bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 p-10 text-white text-center">
      <div className="mx-auto w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={48} className="text-white" />
      </div>
      <h3 className="text-3xl font-black">{notification.title}</h3>
      <p className="text-white/80 mt-2">{notification.message}</p>
    </div>
    
    {/* قائمة الحقول الناقصة */}
    <div className="p-8 space-y-3">
      {notification.missingFields?.map((field, i) => (
        <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-3 border border-amber-100">
          <AlertTriangle size={16} className="text-amber-600" />
          <span className="text-sm font-bold text-gray-800">{field}</span>
        </div>
      ))}
      
      <button onClick={() => setNotification({...notification, show: false})}
        className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white py-4 rounded-2xl font-black">
        حسناً
      </button>
    </div>
  </motion.div>
)}
```

**مودال التأكيد (Confirm Modal):**
```tsx
{notification.type === "confirm" && (
  <motion.div className="... border-4 border-violet-500/20 shadow-[0_0_100px_rgba(139,92,246,0.3)]">
    {/* Header بنفسجي */}
    <div className="bg-gradient-to-br from-violet-500 via-purple-600 to-violet-700 ...">
      <FileCheck size={48} />
      <h3>تأكيد الحفظ</h3>
    </div>
    
    {/* تفاصيل الحفظ */}
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-xl p-3">
        <span>عدد المنصرفات</span>
        <p className="font-black">{notification.details?.count}</p>
      </div>
      <div className="bg-white rounded-xl p-3">
        <span>الإجمالي</span>
        <p className="font-black">{notification.details?.totalAmount} ر.س</p>
      </div>
    </div>
    
    {/* أزرار */}
    <div className="flex gap-4">
      <button onClick={() => setNotification({...notification, show: false})}
        className="flex-1 bg-slate-100 text-slate-700 py-4 rounded-2xl">إلغاء</button>
      <button onClick={notification.onConfirm}
        className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white py-4 rounded-2xl">
        تأكيد الحفظ
      </button>
    </div>
  </motion.div>
)}
```

**مودال Loading:**
```tsx
{notification.type === "loading" && (
  <motion.div className="... border-4 border-blue-500/20">
    <div className="bg-gradient-to-br from-blue-500 via-indigo-600 to-blue-700 ...">
      <div className="animate-spin">
        <Loader2 size={48} />
      </div>
      <h3>{notification.title}</h3>
      <p>{notification.message}</p>
    </div>
  </motion.div>
)}
```

**مودال النجاح (Success Modal):**
```tsx
{notification.type === "success" && (
  <motion.div className="... border-4 border-emerald-500/20 shadow-[0_0_100px_rgba(16,185,129,0.3)]">
    {/* Header أخضر */}
    <div className="bg-gradient-to-br from-emerald-500 via-teal-600 to-emerald-700 ...">
      {/* Sparkles متحركة */}
      {[...Array(6)].map((_, i) => (
        <motion.div animate={{ y: [-100, 100], opacity: [0, 1, 0] }}>
          <Sparkles size={20} />
        </motion.div>
      ))}
      
      <CheckCircle2 size={56} />
      <h3>{notification.title}</h3>
    </div>
    
    {/* تفاصيل الحفظ */}
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-emerald-50 rounded-xl p-3">
          <span>تم حفظ</span>
          <p className="font-black text-emerald-600">{notification.details?.count} منصرف</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-3">
          <span>الإجمالي</span>
          <p className="font-black text-emerald-600">{notification.details?.totalAmount?.toLocaleString()} ر.س</p>
        </div>
      </div>
      
      <button className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-5 rounded-2xl font-black">
        <CheckCircle2 /> حسناً
      </button>
    </div>
  </motion.div>
)}
```

---

### المرحلة 6: تطبيق نفس النظام على الاستقطاعات

**الملف:** deduction-form-client.tsx

نفس التغييرات مع تعديل:
- الألوان (استخدام rose/pink بدلاً من blue)
- النصوص المناسبة للاستقطاعات
- حقول التحقق المناسبة

---

### المرحلة 7: مودال الحذف الفاخم (للتقارير/القوائم)

**State إضافي:**
```tsx
const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ 
  isOpen: boolean; 
  item: any | null 
}>({ isOpen: false, item: null });

const [successModal, setSuccessModal] = useState<{ 
  isOpen: boolean; 
  type: 'delete' | 'update' | 'create' | null; 
  title: string 
}>({ isOpen: false, type: null, title: '' });
```

**مودال تأكيد الحذف:**
- خلفية حمراء gradient
- أيقونة AlertTriangle متحركة
- زرين: إلغاء (رمادي) + حذف (أحمر)

**مودال نجاح الحذف:**
- خلفية خضراء gradient
- أيقونة CheckCircle2
- Sparkles متحركة

---

## الألوان والتصميم

| النوع | اللون الرئيسي | التدرج |
|-------|--------------|--------|
| تحذير | كهرماني | `from-amber-500 via-orange-600 to-amber-700` |
| تأكيد | بنفسجي | `from-violet-500 via-purple-600 to-violet-700` |
| تحميل | أزرق | `from-blue-500 via-indigo-600 to-blue-700` |
| نجاح | أخضر | `from-emerald-500 via-teal-600 to-emerald-700` |
| خطأ/حذف | أحمر | `from-red-500 via-rose-600 to-red-700` |

## خصائص التصميم الموحدة

- `rounded-[3rem]` للمودال
- `rounded-2xl` للأزرار
- `shadow-[0_0_100px_rgba(R,G,B,0.3)]`
- `border-4 border-{color}-500/20`
- `backdrop-blur-2xl` للخلفية
- `font-black` للعناوين

---

## Imports المطلوبة

```tsx
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Loader2,
  FileCheck,
  Sparkles,
  Calendar,
  DollarSign,
  X
} from "lucide-react";
```

---

## ملاحظات هامة

1. **عدم المساس بالكود الأساسي** - فقط إضافة نظام الإشعارات والتحقق
2. **الحفاظ على التوافقية** - استخدام نفس APIs والـ state الحالي
3. **حذف toast القديمة** - استبدال `toast.error()` بـ `showNotification()`
4. **RTL Support** - استخدام `dir="rtl"` في المودالات
