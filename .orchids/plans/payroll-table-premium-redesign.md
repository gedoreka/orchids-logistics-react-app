# تحسين تصميم جدول المسيرات والإحصائيات بأسلوب فاخر

## الملخص
تحسين تصميم جدول التارجت والعمولات بأسلوب فاخر ومتناسق مع إزالة الخلفيات السوداء للحقول، وتحسين الإحصائيات السفلية مع التدرجات اللونية، وترقية قائمة حالة الدفع بأيقونات ملونة وتأثيرات بصرية.

## المشكلة الحالية
1. **حقول الإدخال** تظهر بخلفية سوداء/داكنة غير مناسبة
2. **الجدول** يحتاج لتنسيق أكثر فخامة واحترافية
3. **الإحصائيات السفلية** بسيطة جداً وتحتاج تدرجات لونية وأيقونات
4. **قائمة حالة الدفع** تحتاج أيقونات ملونة حسب كل حالة

## Requirements
- تغيير تصميم الجدول إلى تصميم premium stripe متناوب مع ظلال خفيفة
- تحويل حقول الإدخال إلى حقول مسطحة أنيقة مع حدود سفلية ملونة (نمط Material Design)
- ترقية الإحصائيات السفلية لبطاقات فاخرة متدرجة مع أيقونات ورموز بصرية
- إضافة أيقونات وألوان مميزة لكل طريقة دفع في القائمة المنسدلة

## التصميم المقترح

### 1. تصميم الجدول الجديد (Premium Stripe Design)
```
- صفوف متناوبة بين الأبيض والرمادي الفاتح جداً
- ظلال خفيفة للصفوف عند hover
- خط فاصل رقيق بين الصفوف
- رأس الجدول بتدرج لوني أزرق داكن
- تنسيق RTL محسّن
```

### 2. حقول الإدخال (Material Design Inputs)
```
- حقول بدون حدود علوية وجانبية
- خط سفلي رمادي يتحول لأزرق عند التركيز
- خلفية شفافة/بيضاء
- تأثير ripple عند النقر
- أرقام بخط واضح ومقروء
```

### 3. الإحصائيات السفلية (Premium Statistics Cards)
```
- بطاقة إجمالي الرواتب: تدرج أخضر/زمردي مع أيقونة DollarSign
- بطاقة إجمالي الطلبات: تدرج أزرق/نيلي مع أيقونة Target
- بطاقة إجمالي الخصومات: تدرج أحمر/وردي مع أيقونة AlertTriangle
- كل بطاقة تحتوي على أيقونة كبيرة شبه شفافة في الخلفية
```

### 4. قائمة حالة الدفع الفاخرة
```
- "غير محدد": أيقونة CircleDot بلون رمادي + خلفية رمادية فاتحة
- "مدد": أيقونة Building بلون أزرق + خلفية زرقاء فاتحة
- "كاش": أيقونة Banknote بلون أخضر + خلفية خضراء فاتحة
- "تحويل بنكي": أيقونة ArrowLeftRight بلون بنفسجي + خلفية بنفسجية فاتحة
```

## Implementation Phases

### المرحلة 1: تحسين تصميم الجدول
- تعديل تنسيق `<thead>` برأس متدرج فاخر
- إضافة تصميم صفوف متناوبة مع ظلال
- تحسين تنسيق الخلايا والحدود
- إضافة تأثيرات hover سلسة للصفوف

### المرحلة 2: إعادة تصميم حقول الإدخال
- إنشاء مكون `PremiumTableInput` جديد
- تصميم نمط Material Design مع خط سفلي ملون
- إزالة الخلفيات الداكنة واستبدالها بخلفيات شفافة
- إضافة حالات تفاعلية (focus, hover, error)
- تطبيق على جميع حقول: الطلبات، خصم التارجت، المكافأة الشهرية، خصم المشغل، داخلي، المحفظة، المكافآت

### المرحلة 3: ترقية الإحصائيات السفلية
- إنشاء مكون `PremiumStatCard` للإحصائيات
- تصميم بطاقات بتدرجات لونية فاخرة
- إضافة أيقونات كبيرة في الخلفية
- تحسين الأرقام والوحدات بخطوط مميزة
- إضافة تأثيرات ظل وعمق

### المرحلة 4: ترقية قائمة حالة الدفع
- إنشاء مكون `PaymentMethodSelect` مخصص
- تصميم خيارات بأيقونات ملونة
- إضافة تأثيرات بصرية عند الاختيار
- عرض الأيقونة الملونة بجانب القيمة المختارة

## الملفات المتأثرة
- `app/(dashboard)/salary-payrolls/new/new-payroll-client.tsx`

## كود المكونات المقترحة

### PremiumTableInput Component
```tsx
// حقل إدخال بتصميم Material Design
<div className="relative">
  <input
    type="number"
    className="w-full bg-transparent border-0 border-b-2 border-gray-200 px-2 py-1.5 text-center text-sm font-semibold 
    focus:border-blue-500 focus:outline-none transition-all duration-300
    placeholder:text-gray-400"
  />
</div>
```

### Premium Statistics Cards
```tsx
// بطاقة إحصائية بتدرج لوني
<div className="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/25">
  {/* أيقونة خلفية كبيرة */}
  <div className="absolute top-0 left-0 w-32 h-32 -mt-8 -ml-8 opacity-20">
    <DollarSign size={128} />
  </div>
  {/* المحتوى */}
  <div className="relative z-10">
    <div className="flex items-center gap-2 text-white/80 mb-2">
      <DollarSign size={16} />
      <span className="text-xs font-bold">إجمالي الرواتب</span>
    </div>
    <p className="text-3xl font-black">22,500.00</p>
    <p className="text-white/60 text-xs mt-1">ر.س</p>
  </div>
</div>
```

### PaymentMethodSelect Component
```tsx
// قائمة دفع بأيقونات ملونة
const paymentOptions = [
  { value: 'غير محدد', icon: CircleDot, color: 'text-gray-500', bg: 'bg-gray-100' },
  { value: 'مدد', icon: Building, color: 'text-blue-600', bg: 'bg-blue-50' },
  { value: 'كاش', icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { value: 'تحويل بنكي', icon: ArrowLeftRight, color: 'text-violet-600', bg: 'bg-violet-50' },
];
```

## ملاحظات مهمة
- الحفاظ على جميع وظائف الحفظ والخيارات كما هي
- دعم جميع أنواع الباقات (salary, target, tiers)
- الحفاظ على RTL والترجمات
- التأكد من عمل الحسابات التلقائية
