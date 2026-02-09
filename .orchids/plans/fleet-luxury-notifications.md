# خطة تحديث الإشعارات الفاخرة لإدارة الأسطول والمخزون

## ملخص المتطلبات

تحديث نظام الإشعارات في صفحة إدارة المركبات والمخزون (`/fleet`) ليشمل:
1. إصلاح أخطاء الترجمة (fleet.success، fleet.common.loading، إلخ)
2. استبدال إشعارات toast البسيطة بمودالات فاخرة متحركة
3. إضافة نظام إشعارات البريد الإلكتروني للصيانة
4. إضافة خدمة تأكيد اكتمال الصيانة عبر رابط

---

## المشاكل الحالية

### 1. أخطاء الترجمة
- الكود يستخدم `t('success')` و `t('error')` و `t('cancel')` و `t('common.loading')`
- هذه المفاتيح غير موجودة في قسم `fleet` في ملفات اللغة
- النتيجة: تظهر النصوص كـ `fleet.success` بدلاً من النص المترجم

### 2. نظام الإشعارات الحالي
- يستخدم `toast.success()` و `toast.error()` من مكتبة sonner
- إشعارات بسيطة وغير متوافقة مع التصميم الفاخر للصفحة

### 3. عدم وجود إشعارات البريد الإلكتروني
- لا يوجد إشعار للفني عند إنشاء أمر صيانة
- لا يوجد إشعار عند اكتمال الصيانة

---

## الحل المقترح

### المرحلة 1: إصلاح ملفات اللغة

#### 1.1 تحديث messages/ar.json
إضافة مفاتيح الإشعارات في قسم `fleet`:

```json
{
  "fleet": {
    // ... المفاتيح الموجودة ...
    "success": "تمت العملية بنجاح",
    "error": "حدث خطأ",
    "cancel": "إلغاء",
    "loading": "جاري التحميل...",
    "saving": "جاري الحفظ...",
    
    // إشعارات الحفظ والحذف
    "notifications": {
      "vehicleCategoryAdded": "تمت إضافة فئة المركبات بنجاح",
      "vehicleCategoryDeleted": "تم حذف فئة المركبات",
      "spareCategoryAdded": "تمت إضافة فئة قطع الغيار بنجاح",
      "spareCategoryDeleted": "تم حذف فئة قطع الغيار",
      "vehicleAdded": "تمت إضافة المركبة بنجاح",
      "vehicleDeleted": "تم حذف المركبة",
      "vehicleUpdated": "تم تحديث بيانات المركبة",
      "spareAdded": "تمت إضافة الصنف للمخزون",
      "spareDeleted": "تم حذف الصنف من المخزون",
      "spareUpdated": "تم تحديث بيانات الصنف",
      "maintenanceCreated": "تم إصدار أمر الصيانة بنجاح",
      "maintenanceCompleted": "تم تأكيد اكتمال الصيانة",
      "maintenanceDeleted": "تم حذف أمر الصيانة",
      "emailSent": "تم إرسال البريد الإلكتروني بنجاح",
      "emailFailed": "فشل إرسال البريد الإلكتروني",
      "completionConfirmed": "تم تأكيد اكتمال الصيانة من الفني"
    },
    
    // عناوين المودالات
    "modals": {
      "confirmDelete": "تأكيد الحذف",
      "cannotUndo": "هذا الإجراء لا يمكن التراجع عنه",
      "deleteQuestion": "هل أنت متأكد من حذف",
      "permanentDelete": "سيتم الحذف نهائياً ولا يمكن التراجع عنه",
      "yesDelete": "نعم، احذف",
      "successTitle": "تمت العملية بنجاح!",
      "createdTitle": "تم الإنشاء بنجاح!",
      "updatedTitle": "تم التحديث بنجاح!",
      "deletedTitle": "تم الحذف بنجاح!",
      "addedToSystem": "تمت الإضافة إلى النظام",
      "removedFromSystem": "تمت الإزالة من النظام",
      "changesPublished": "تم نشر التعديلات",
      "itemCreated": "العنصر المنشأ:",
      "itemUpdated": "العنصر المحدّث:",
      "itemDeleted": "العنصر المحذوف:",
      "ok": "حسناً"
    },
    
    // إشعارات الصيانة
    "maintenanceNotifications": {
      "newOrderTitle": "أمر صيانة جديد",
      "orderCompleteTitle": "اكتمال أمر الصيانة",
      "orderNumber": "رقم الأمر",
      "technicianAssigned": "الفني المسؤول",
      "confirmCompletion": "تأكيد اكتمال الصيانة",
      "completionConfirmedBy": "تم التأكيد بواسطة الفني",
      "clickToConfirm": "اضغط هنا لتأكيد اكتمال الصيانة"
    }
  }
}
```

#### 1.2 تحديث messages/en.json
نفس البنية بالإنجليزية.

---

### المرحلة 2: إنشاء مكونات الإشعارات الفاخرة

#### 2.1 إنشاء ملف components/fleet/notification-modals.tsx

```typescript
// مودال تأكيد الحذف الفاخر
export function DeleteConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName, 
  isLoading,
  t 
}: DeleteConfirmModalProps)

// مودال النجاح الفاخر
export function SuccessModal({ 
  isOpen, 
  onClose, 
  type, // 'delete' | 'create' | 'update'
  title,
  t 
}: SuccessModalProps)

// إشعار اكتمال الصيانة (يظهر في أي صفحة)
export function MaintenanceCompletionNotification({
  isOpen,
  maintenanceId,
  technicianName,
  onClose,
  t
}: MaintenanceCompletionNotificationProps)
```

#### 2.2 مواصفات التصميم

| العنصر | المواصفات |
|--------|-----------|
| Border Radius | `rounded-[3rem]` للمودال، `rounded-2xl` للأزرار |
| Shadow | `shadow-[0_0_100px_rgba(R,G,B,0.3)]` |
| Border | `border-4 border-{color}-500/20` |
| Backdrop | `bg-slate-950/90 backdrop-blur-2xl` |
| Icon Container | `w-24 h-24` مع `bg-white/20 backdrop-blur-xl border-4 border-white/30` |
| Button Shadow | `shadow-xl shadow-{color}-500/30` |
| Button Border | `border-b-4 border-{color}-700/50` |

#### 2.3 الألوان حسب نوع الإشعار

| النوع | التدرج |
|-------|--------|
| حذف/تحذير | `from-red-500 via-rose-600 to-red-700` |
| نجاح الحذف | `from-emerald-500 via-teal-600 to-emerald-700` |
| نجاح الإنشاء | `from-blue-500 via-indigo-600 to-blue-700` |
| نجاح التحديث | `from-blue-500 via-indigo-600 to-blue-700` |

---

### المرحلة 3: تحديث fleet-client.tsx

#### 3.1 استيراد المكونات الجديدة

```typescript
import { 
  DeleteConfirmModal, 
  SuccessModal, 
  MaintenanceCompletionNotification 
} from "@/components/fleet/notification-modals";
```

#### 3.2 إضافة State للمودالات

```typescript
// States للمودالات
const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ 
  isOpen: boolean; 
  item: any | null;
  type: 'vehicle' | 'spare' | 'maintenance' | 'category' | null;
}>({ isOpen: false, item: null, type: null });

const [successModal, setSuccessModal] = useState<{ 
  isOpen: boolean; 
  type: 'delete' | 'create' | 'update' | null; 
  title: string;
  itemType: string;
}>({ isOpen: false, type: null, title: '', itemType: '' });

const [maintenanceNotification, setMaintenanceNotification] = useState<{
  isOpen: boolean;
  maintenanceId: number | null;
  technicianName: string;
}>({ isOpen: false, maintenanceId: null, technicianName: '' });
```

#### 3.3 تحديث دوال الحذف

استبدال `toast.success()` بفتح `SuccessModal`:

```typescript
// بدلاً من
toast.success(t('success'));

// استخدام
setSuccessModal({ 
  isOpen: true, 
  type: 'delete', 
  title: item.name,
  itemType: 'vehicle'
});
```

#### 3.4 تحديث دوال الإضافة

```typescript
// بدلاً من
toast.success(t('success'));

// استخدام
setSuccessModal({ 
  isOpen: true, 
  type: 'create', 
  title: formData.get("name") as string,
  itemType: 'vehicleCategory'
});
```

---

### المرحلة 4: نظام إشعارات البريد الإلكتروني

#### 4.1 إنشاء API route جديد: app/api/fleet/maintenance-email/route.ts

```typescript
export async function POST(req: Request) {
  const { type, maintenanceId, recipientEmail, companyName } = await req.json();
  
  // type: 'new_order' | 'completion_request' | 'completion_confirmed'
  
  // إرسال البريد مع قالب HTML فاخر
}
```

#### 4.2 قالب البريد الإلكتروني الفاخر

- تصميم RTL مع خطوط عربية (Cairo)
- ألوان متناسقة مع التصميم
- تفاصيل أمر الصيانة الكاملة:
  - رقم الأمر
  - بيانات المركبة
  - قطع الغيار المستخدمة
  - الفني المسؤول
  - التاريخ
  - الملاحظات
- زر "تأكيد اكتمال الصيانة" (رابط)

#### 4.3 صفحة تأكيد الاكتمال: app/maintenance-confirm/[token]/page.tsx

- صفحة عامة (بدون تسجيل دخول)
- تستخدم token آمن (JWT)
- عند الفتح: تُحدّث حالة الصيانة إلى "مكتمل"
- ترسل إشعار للنظام

---

### المرحلة 5: إشعارات اكتمال الصيانة في النظام

#### 5.1 إنشاء جدول قاعدة بيانات للإشعارات

```sql
CREATE TABLE maintenance_notifications (
  id SERIAL PRIMARY KEY,
  company_id INT REFERENCES companies(id),
  maintenance_id INT REFERENCES fleet_maintenance(id),
  type VARCHAR(50), -- 'completion_confirmed'
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  technician_name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 5.2 مكون الإشعارات العائم

يظهر في أي صفحة عند وجود إشعار جديد:

```typescript
// في layout.tsx أو header
<MaintenanceCompletionNotification
  isOpen={hasNewNotification}
  maintenanceId={notification.maintenanceId}
  technicianName={notification.technicianName}
  onClose={() => markAsRead(notification.id)}
  t={t}
/>
```

---

### المرحلة 6: إصلاح خطأ حفظ أمر الصيانة

#### 6.1 تحليل المشكلة
- الحفظ يفشل لكن عند تحديث الصفحة يظهر محفوظاً
- السبب المحتمل: خطأ في معالجة الاستجابة أو race condition

#### 6.2 الحل
```typescript
// في createMaintenanceRequest
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setLoading(true);
  
  try {
    const res = await createMaintenanceRequest(data, selectedSpares);
    
    if (res.success) {
      // إرسال البريد للفني
      await fetch('/api/fleet/maintenance-email', {
        method: 'POST',
        body: JSON.stringify({
          type: 'new_order',
          maintenanceId: res.maintenanceId,
          recipientEmail: technicianEmail,
          companyName
        })
      });
      
      // عرض مودال النجاح
      setSuccessModal({ 
        isOpen: true, 
        type: 'create', 
        title: `أمر صيانة #${res.maintenanceId}`,
        itemType: 'maintenance'
      });
      
      setOpen(false);
      setSelectedSpares([]);
      
      // تحديث القائمة محلياً بدون reload
      setMaintenance(prev => [...prev, res.newMaintenance]);
    } else {
      // عرض مودال الخطأ
      toast.error(t('notifications.error'));
    }
  } catch (error) {
    toast.error(t('notifications.error'));
  } finally {
    setLoading(false);
  }
}
```

---

## ملخص الملفات المطلوب تعديلها

| الملف | التعديل |
|-------|---------|
| `messages/ar.json` | إضافة مفاتيح fleet.notifications و fleet.modals |
| `messages/en.json` | نفس الإضافات بالإنجليزية |
| `components/fleet/notification-modals.tsx` | ملف جديد - مكونات المودالات الفاخرة |
| `app/(dashboard)/fleet/fleet-client.tsx` | تحديث الإشعارات + إضافة States |
| `app/api/fleet/maintenance-email/route.ts` | ملف جديد - إرسال بريد الصيانة |
| `app/maintenance-confirm/[token]/page.tsx` | ملف جديد - صفحة تأكيد الاكتمال |
| `lib/actions/fleet.ts` | تحديث دوال الصيانة |

---

## مراحل التنفيذ المقترحة

### المرحلة 1 (أساسية - إصلاح فوري)
1. ✅ إصلاح ملفات اللغة ar.json و en.json
2. ✅ إنشاء مكونات المودالات الفاخرة
3. ✅ تحديث fleet-client.tsx لاستخدام المودالات الجديدة

### المرحلة 2 (متوسطة)
4. إنشاء API لإرسال البريد الإلكتروني
5. تصميم قوالب البريد الفاخرة
6. إضافة إرسال البريد عند إنشاء أمر صيانة

### المرحلة 3 (متقدمة)
7. إنشاء صفحة تأكيد الاكتمال
8. إنشاء جدول الإشعارات
9. إضافة مكون الإشعارات العائم في النظام

---

## الاختبار

- [ ] التأكد من ظهور الإشعارات بالعربية والإنجليزية
- [ ] اختبار جميع عمليات الحذف مع المودال الفاخر
- [ ] اختبار جميع عمليات الإضافة مع مودال النجاح
- [ ] اختبار إرسال البريد الإلكتروني
- [ ] اختبار رابط تأكيد الاكتمال
- [ ] اختبار إشعار اكتمال الصيانة في النظام
