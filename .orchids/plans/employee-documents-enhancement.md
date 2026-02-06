# تحسين نظام المستندات للموظفين - Custom Document Types

## Requirements
تحسين قسم المستندات في صفحة تفاصيل الموظف بإضافة:
1. **إعادة زر التعديل والرفع للمستندات الثابتة** - السماح بتعديل ورفع الصور لجميع المستندات (الصورة الشخصية، صورة الإقامة، رخصة القيادة، استمارة المركبة، تصريح أجير، عقد العمل، بطاقة التشغيل، بطاقة السائق)
2. **إضافة أنواع مستندات مخصصة** - السماح للمستخدم بإضافة أي نوع مستند جديد مع تسميته على مستوى الموظف
3. **تاريخ انتهاء اختياري** للمستندات المخصصة
4. **حذف أنواع المستندات المخصصة** مع تأكيد قبل الحذف

## Current State Analysis

### المستندات الثابتة الحالية (في جدول employees):
- `personal_photo` - الصورة الشخصية
- `iqama_file` - صورة الإقامة  
- `license_file` - رخصة القيادة
- `vehicle_file` - استمارة المركبة
- `agir_permit_file` - تصريح أجير
- `work_contract_file` - عقد العمل
- `vehicle_operation_card` - بطاقة التشغيل
- `driver_card` - بطاقة السائق (**ملاحظة: غير موجود في allowedFields**)

### المشاكل الحالية:
1. زر التعديل يظهر فقط في `activeTab === "general"` (السطر 487)
2. `driver_card` غير موجود في `allowedFields` في دالة `updateEmployeeDocument`
3. لا توجد إمكانية رفع الملفات في قسم المستندات
4. لا يوجد جدول للمستندات المخصصة

## Implementation Phases

### Phase 1: DB - إنشاء جدول المستندات المخصصة
**الملفات المتأثرة:**
- لا يوجد (تنفيذ SQL مباشر)

**التغييرات:**
```sql
CREATE TABLE employee_custom_documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    document_name VARCHAR(255) NOT NULL,
    document_name_en VARCHAR(255),
    file_path VARCHAR(500),
    expiry_date DATE NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
    INDEX idx_employee_docs (employee_id)
);
```

### Phase 2: hr.ts - إضافة driver_card + دوال المستندات المخصصة
**الملف:** `lib/actions/hr.ts`

**التغييرات:**
1. إضافة `driver_card` إلى `allowedFields` في `updateEmployeeDocument`:
```typescript
const allowedFields = [
  'personal_photo', 'iqama_file', 'license_file', 'vehicle_file', 
  'agir_permit_file', 'work_contract_file', 'vehicle_operation_card', 'driver_card'
];
```

2. إضافة دوال جديدة:
```typescript
// جلب المستندات المخصصة للموظف
export async function getEmployeeCustomDocuments(employeeId: number)

// إضافة مستند مخصص جديد
export async function addCustomDocument(data: {
  employee_id: number;
  document_name: string;
  document_name_en?: string;
  file_path?: string;
  expiry_date?: string;
  notes?: string;
})

// تحديث مستند مخصص
export async function updateCustomDocument(id: number, employeeId: number, data: {
  document_name?: string;
  document_name_en?: string;
  file_path?: string;
  expiry_date?: string;
  notes?: string;
})

// حذف مستند مخصص (مع تأكيد)
export async function deleteCustomDocument(id: number, employeeId: number)
```

### Phase 3: employee-details-client.tsx - تفعيل رفع وتعديل المستندات
**الملف:** `app/(dashboard)/hr/employees/[id]/employee-details-client.tsx`

**التغييرات:**

1. **إضافة imports جديدة:**
```typescript
import { Upload } from "lucide-react";
import { updateEmployeeDocument, addCustomDocument, updateCustomDocument, deleteCustomDocument } from "@/lib/actions/hr";
```

2. **إضافة state جديد:**
```typescript
const [isDocEditing, setIsDocEditing] = useState(false);
const [showCustomDocForm, setShowCustomDocForm] = useState(false);
const [customDocuments, setCustomDocuments] = useState<any[]>([]);
const [editingCustomDoc, setEditingCustomDoc] = useState<any>(null);
const [newCustomDoc, setNewCustomDoc] = useState({
  document_name: "",
  document_name_en: "",
  expiry_date: "",
  notes: ""
});
```

3. **إضافة زر تعديل لقسم المستندات (بجانب الأزرار الأخرى حول السطر 487-530):**
```typescript
{activeTab === "documents" && (
  <>
    <motion.button 
      onClick={() => setIsDocEditing(!isDocEditing)}
      className="..."
    >
      {isDocEditing ? <X /> : <Edit3 />}
      {isDocEditing ? 'إلغاء التعديل' : 'تعديل المستندات'}
    </motion.button>
    <motion.button 
      onClick={() => setShowCustomDocForm(!showCustomDocForm)}
      className="..."
    >
      <PlusCircle />
      إضافة نوع مستند
    </motion.button>
  </>
)}
```

4. **تعديل GlassDocCard لدعم الرفع:**
```typescript
function GlassDocCard({ 
  label, 
  path, 
  fieldName, 
  employeeId, 
  editable, 
  onUpload 
}: any) {
  // إضافة input file مخفي
  // إضافة زر رفع/تغيير عند editable=true
  // استخدام Supabase Storage للرفع
}
```

5. **إضافة قسم المستندات المخصصة بعد المستندات الثابتة:**
```typescript
{/* المستندات المخصصة */}
{customDocuments.length > 0 && (
  <div className="mt-8 pt-8 border-t border-slate-200">
    <h3>المستندات المخصصة</h3>
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {customDocuments.map(doc => (
        <CustomDocCard 
          key={doc.id} 
          doc={doc} 
          editable={isDocEditing}
          onEdit={() => setEditingCustomDoc(doc)}
          onDelete={() => handleDeleteCustomDoc(doc.id)}
        />
      ))}
    </div>
  </div>
)}
```

6. **إضافة نموذج إضافة مستند مخصص:**
```typescript
{showCustomDocForm && (
  <motion.div className="bg-slate-100 p-5 rounded-2xl mb-5">
    <form onSubmit={handleAddCustomDocument}>
      <input placeholder="اسم المستند (عربي)" />
      <input placeholder="اسم المستند (إنجليزي)" />
      <input type="date" placeholder="تاريخ الانتهاء (اختياري)" />
      <textarea placeholder="ملاحظات (اختياري)" />
      <input type="file" />
      <button type="submit">إضافة</button>
    </form>
  </motion.div>
)}
```

### Phase 4: page.tsx - جلب المستندات المخصصة
**الملف:** `app/(dashboard)/hr/employees/[id]/page.tsx`

**التغييرات:**
```typescript
import { getEmployeeCustomDocuments } from "@/lib/actions/hr";

// في getEmployeeData أو مباشرة في الصفحة
const customDocs = await getEmployeeCustomDocuments(Number(params.id));

// تمرير للكومبوننت
<EmployeeDetailsClient 
  ...
  customDocuments={customDocs.data || []}
/>
```

### Phase 5: Supabase Storage Helper
**الملف:** `lib/supabase-upload.ts` (جديد أو موجود)

**التغييرات:**
```typescript
export async function uploadEmployeeDocument(
  employeeId: number,
  file: File,
  documentType: string
): Promise<{ success: boolean; path?: string; error?: string }>
```

## File Dependencies
```
1. SQL Migration (standalone)
   ↓
2. lib/actions/hr.ts (add functions)
   ↓
3. app/(dashboard)/hr/employees/[id]/page.tsx (fetch custom docs)
   ↓
4. app/(dashboard)/hr/employees/[id]/employee-details-client.tsx (UI changes)
```

## Testing Checklist
- [ ] المستندات الثابتة تظهر زر تعديل/رفع
- [ ] يمكن رفع صورة جديدة لأي مستند ثابت
- [ ] يمكن إضافة نوع مستند مخصص جديد
- [ ] يمكن رفع ملف للمستند المخصص
- [ ] يمكن تعديل المستند المخصص
- [ ] يمكن حذف المستند المخصص (مع تأكيد)
- [ ] تاريخ الانتهاء يعمل بشكل صحيح
- [ ] driver_card يعمل مع الرفع

## Risks & Mitigations
| Risk | Mitigation |
|------|------------|
| فشل رفع الملفات | استخدام Supabase Storage الموجود مسبقاً |
| حذف مستند بالخطأ | إضافة dialog تأكيد قبل الحذف |
| أداء بطيء | lazy loading للصور |
