# تفعيل ZATCA المرحلة الثانية - الفوترة الإلكترونية الكاملة

## Requirements
تفعيل كامل للمرحلة الثانية من نظام ZATCA للفوترة الإلكترونية في المملكة العربية السعودية، يشمل:
- ترقية رمز QR من 5 إلى 9 حقول TLV
- التوقيع الإلكتروني الرقمي (ECDSA secp256k1)
- توليد UBL 2.1 XML متوافق مع معايير ZATCA
- إدارة CSR/CSID للتسجيل مع الهيئة
- الإرسال الفوري للفواتير (Clearance للـ B2B / Reporting للـ B2C)
- واجهة إعدادات شاملة ومتقدمة

## Analysis

### الوضع الحالي:
1. **QR Code**: حالياً يدعم 5 حقول فقط (المرحلة الأولى):
   - اسم البائع، الرقم الضريبي، الطابع الزمني، الإجمالي، ضريبة VAT
   
2. **الملفات الموجودة**:
   - `lib/zatca-qr.ts` - توليد QR للمرحلة الأولى
   - `app/(dashboard)/tax-settings/` - صفحة إعدادات الضريبة
   - `app/(dashboard)/sales-invoices/` - الفواتير الضريبية
   - `app/(dashboard)/credit-notes/` - إشعارات الدائن
   - `app/api/taxes/settings/` - API إعدادات الضريبة

3. **النواقص للمرحلة الثانية**:
   - لا يوجد توقيع رقمي
   - لا يوجد توليد XML بمعيار UBL 2.1
   - لا توجد آلية إدارة CSR/CSID
   - لا يوجد ربط مع ZATCA API

### متطلبات المرحلة الثانية من ZATCA (2026):

#### 1. QR Code - 9 حقول TLV:
| Tag | الوصف | المصدر |
|-----|-------|--------|
| 1 | اسم البائع | Company Name |
| 2 | الرقم الضريبي | VAT Number |
| 3 | الطابع الزمني | IssueDate + IssueTime |
| 4 | الإجمالي شامل الضريبة | TaxInclusiveAmount |
| 5 | إجمالي الضريبة | TaxAmount |
| 6 | هاش المستند XML | SHA-256 hash |
| 7 | التوقيع الرقمي | ECDSA Signature |
| 8 | المفتاح العام | Public Key (64 bytes) |
| 9 | توقيع الهيئة | CA Signature |

#### 2. API Endpoints (2026):
- **Onboarding**: `/e-invoicing/core/compliance`
- **Compliance Check**: `/e-invoicing/core/compliance/invoices`
- **Production CSID**: `/e-invoicing/core/production/csids`
- **Clearance (B2B)**: `/e-invoicing/core/invoices/clearance/single`
- **Reporting (B2C)**: `/e-invoicing/core/invoices/reporting/single`

#### 3. التوقيع الرقمي:
- خوارزمية: ECDSA مع secp256k1
- هاش المستند: SHA-256
- Canonicalization: C14N11

---

## Implementation Phases

### Phase 1: البنية التحتية للمفاتيح والتوقيع
**الملفات الجديدة:**

1. **`lib/zatca/crypto.ts`** - إدارة التشفير والمفاتيح
   - توليد زوج المفاتيح (Private/Public) بـ secp256k1
   - توليد CSR (Certificate Signing Request)
   - توقيع المستندات بـ ECDSA
   - حساب SHA-256 hash

2. **`lib/zatca/xml-builder.ts`** - بناء XML بمعيار UBL 2.1
   - قوالب Invoice XML
   - قوالب Credit Note XML
   - Canonicalization (C14N11)

3. **`lib/zatca/qr-phase2.ts`** - ترقية QR Code لـ 9 حقول
   - TLV encoding للـ 9 حقول
   - دعم التوقيع والهاش

4. **`lib/zatca/api-client.ts`** - عميل API للتواصل مع ZATCA
   - Onboarding (CSR → CCSID)
   - Compliance testing
   - Production CSID
   - Clearance/Reporting

### Phase 2: جداول قاعدة البيانات
**جداول Supabase الجديدة:**

1. **`zatca_credentials`** - بيانات اعتماد ZATCA
   ```sql
   - id, company_id
   - private_key (encrypted)
   - public_key
   - csr_content
   - ccsid, ccsid_secret
   - pcsid, pcsid_secret
   - certificate
   - environment (sandbox/production)
   - status, created_at, updated_at
   ```

2. **`zatca_submissions`** - سجل الإرسالات
   ```sql
   - id, company_id
   - document_type (invoice/credit_note/debit_note)
   - document_id
   - xml_content, xml_hash
   - signature
   - qr_code
   - submission_type (clearance/reporting)
   - submission_status (pending/success/failed/warning)
   - zatca_response, error_message
   - submitted_at, created_at
   ```

3. **ترقية `tax_settings`** - إضافة حقول ZATCA
   ```sql
   - zatca_enabled, zatca_environment
   - zatca_phase, zatca_vat_number
   - zatca_auto_signature, zatca_immediate_send
   - zatca_otp (للتسجيل)
   - zatca_onboarding_status
   ```

### Phase 3: واجهة إعدادات ZATCA المتقدمة
**ترقية `tax-settings-client.tsx`:**

1. **تبويب ZATCA الجديد بأقسام:**
   - **حالة التكامل**: مؤشرات حالة CSR/CSID/PCSID
   - **بيانات الشركة**: VAT, CR, عنوان مختصر
   - **إعداد المفاتيح**: توليد CSR, إدخال OTP, الحصول على CSID
   - **اختبار التوافق**: إرسال فواتير تجريبية
   - **إعدادات التشغيل**: تفعيل التوقيع التلقائي والإرسال الفوري
   - **سجل الإرسالات**: جدول بكل الإرسالات وحالاتها

2. **خطوات الإعداد التفاعلية (Wizard):**
   - الخطوة 1: إدخال بيانات الشركة
   - الخطوة 2: توليد المفاتيح والـ CSR
   - الخطوة 3: الحصول على OTP من بوابة فاتورة
   - الخطوة 4: التسجيل والحصول على CCSID
   - الخطوة 5: اختبارات التوافق (3 فواتير لكل نوع)
   - الخطوة 6: الحصول على PCSID للإنتاج
   - الخطوة 7: تفعيل التشغيل المباشر

### Phase 4: APIs الجديدة

1. **`/api/zatca/credentials`**
   - GET: جلب حالة الاعتمادات
   - POST: توليد CSR جديد

2. **`/api/zatca/onboarding`**
   - POST: التسجيل مع ZATCA (CSR + OTP → CCSID)

3. **`/api/zatca/compliance`**
   - POST: إرسال فاتورة تجريبية للاختبار
   - GET: حالة اختبارات التوافق

4. **`/api/zatca/production`**
   - POST: الحصول على PCSID

5. **`/api/zatca/submit`**
   - POST: إرسال فاتورة/إشعار للـ Clearance أو Reporting

6. **`/api/zatca/submissions`**
   - GET: قائمة الإرسالات مع الفلترة

### Phase 5: تكامل الفواتير وإشعارات الدائن

1. **ترقية `invoice-view-client.tsx`:**
   - عرض QR Code المرحلة الثانية (9 حقول)
   - زر "إرسال إلى ZATCA" مع حالات
   - عرض حالة الإرسال والختم من الهيئة
   - أيقونة حالة التوافق مع ZATCA

2. **ترقية `credit-note-view-client.tsx`:**
   - نفس الترقيات للفواتير

3. **ترقية `new-invoice-client.tsx`:**
   - خيار الإرسال الفوري عند الحفظ
   - تحذير إذا ZATCA غير مفعل

4. **ترقية APIs الفواتير:**
   - توليد XML وتوقيعه عند الحفظ
   - إرسال تلقائي إذا مفعل
   - حفظ QR المرحلة الثانية

### Phase 6: الإشعارات والتقارير

1. **إشعارات الإرسال:**
   - نجاح/فشل الإرسال
   - تحذيرات من ZATCA
   - تذكير بالفواتير المعلقة

2. **تقرير الإرسالات:**
   - ملخص يومي/أسبوعي/شهري
   - نسبة النجاح
   - الأخطاء الشائعة

---

## Technical Details

### هيكل QR Code المرحلة الثانية:
```typescript
interface ZatcaQRPhase2 {
  sellerName: string;        // Tag 1
  vatNumber: string;         // Tag 2
  timestamp: string;         // Tag 3 (ISO8601)
  totalAmount: string;       // Tag 4
  vatAmount: string;         // Tag 5
  documentHash: string;      // Tag 6 (SHA-256)
  signature: string;         // Tag 7 (ECDSA)
  publicKey: string;         // Tag 8 (64 bytes)
  caSignature: string;       // Tag 9
}
```

### هيكل UBL 2.1 XML:
```xml
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2">
  <UBLExtensions>
    <UBLExtension>
      <ExtensionContent>
        <!-- Digital Signature (XAdES-T) -->
      </ExtensionContent>
    </UBLExtension>
  </UBLExtensions>
  <ProfileID>reporting:1.0</ProfileID>
  <ID>INV-001</ID>
  <IssueDate>2026-02-07</IssueDate>
  <IssueTime>10:00:00</IssueTime>
  <InvoiceTypeCode>388</InvoiceTypeCode>
  <!-- ... -->
</Invoice>
```

### Flow للإرسال الفوري:
```
1. إنشاء الفاتورة
2. بناء XML (UBL 2.1)
3. Canonicalize XML (C14N11)
4. حساب SHA-256 hash
5. توقيع ECDSA
6. بناء QR (9 حقول)
7. إدراج التوقيع في XML
8. إرسال إلى ZATCA
9. استلام الرد والختم
10. تحديث الفاتورة بالحالة
```

---

## File Structure

```
lib/
  zatca/
    crypto.ts           # التشفير والمفاتيح
    xml-builder.ts      # بناء UBL 2.1 XML
    xml-templates.ts    # قوالب XML
    canonicalizer.ts    # C14N11 canonicalization
    qr-phase2.ts        # QR Code 9 حقول
    api-client.ts       # ZATCA API client
    types.ts            # TypeScript interfaces
    constants.ts        # ثوابت (OIDs, endpoints)

app/api/zatca/
  credentials/
    route.ts            # إدارة المفاتيح
  onboarding/
    route.ts            # التسجيل الأولي
  compliance/
    route.ts            # اختبارات التوافق
  production/
    route.ts            # PCSID
  submit/
    route.ts            # إرسال الفواتير
  submissions/
    route.ts            # سجل الإرسالات
```

---

## Risks & Mitigations

| المخاطر | الحل |
|---------|------|
| فقدان المفاتيح | تشفير المفاتيح في DB + نسخ احتياطي |
| فشل الإرسال | Queue مع إعادة المحاولة |
| تغيير ZATCA API | استخدام Accept-Version header |
| الفواتير القديمة | الفواتير الموجودة تبقى كما هي (فقط الجديدة) |
| timeout | timeout طويل + async processing |

---

## Todo List

- [ ] إنشاء `lib/zatca/crypto.ts` - إدارة التشفير والمفاتيح
- [ ] إنشاء `lib/zatca/xml-builder.ts` - بناء UBL 2.1 XML
- [ ] إنشاء `lib/zatca/xml-templates.ts` - قوالب Invoice/CreditNote
- [ ] إنشاء `lib/zatca/canonicalizer.ts` - C14N11 canonicalization
- [ ] إنشاء `lib/zatca/qr-phase2.ts` - QR Code للمرحلة الثانية (9 حقول)
- [ ] إنشاء `lib/zatca/api-client.ts` - ZATCA API integration
- [ ] إنشاء `lib/zatca/types.ts` - TypeScript types
- [ ] إنشاء جداول Supabase (`zatca_credentials`, `zatca_submissions`)
- [ ] ترقية جدول `tax_settings` بحقول ZATCA الجديدة
- [ ] إنشاء `/api/zatca/credentials` - إدارة الاعتمادات
- [ ] إنشاء `/api/zatca/onboarding` - التسجيل مع ZATCA
- [ ] إنشاء `/api/zatca/compliance` - اختبارات التوافق
- [ ] إنشاء `/api/zatca/production` - PCSID
- [ ] إنشاء `/api/zatca/submit` - إرسال الفواتير
- [ ] إنشاء `/api/zatca/submissions` - سجل الإرسالات
- [ ] ترقية `tax-settings-client.tsx` - واجهة ZATCA الشاملة مع Wizard
- [ ] ترقية `invoice-view-client.tsx` - QR المرحلة الثانية + زر الإرسال
- [ ] ترقية `credit-note-view-client.tsx` - نفس الترقيات
- [ ] ترقية `/api/sales-invoices` - توليد XML وتوقيع + إرسال تلقائي
- [ ] ترقية `/api/credit-notes` - توليد XML وتوقيع + إرسال تلقائي
- [ ] إضافة إشعارات حالة الإرسال
- [ ] إضافة تقرير الإرسالات في صفحة ZATCA
