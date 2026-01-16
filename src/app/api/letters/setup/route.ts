import { NextResponse } from "next/server";
import { execute, query } from "@/lib/db";

export async function GET() {
  try {
    // Drop and recreate tables for clean setup
    await execute(`DROP TABLE IF EXISTS generated_letters`);
    await execute(`DROP TABLE IF EXISTS letter_templates`);
    
    // Create letter_templates table
    await execute(`
      CREATE TABLE letter_templates (
        id INT AUTO_INCREMENT PRIMARY KEY,
        template_key VARCHAR(100) UNIQUE NOT NULL,
        template_name VARCHAR(255) NOT NULL,
        template_name_ar VARCHAR(255) NOT NULL,
        template_content LONGTEXT NOT NULL,
        placeholders JSON,
        is_system_template TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Create generated_letters table
    await execute(`
      CREATE TABLE generated_letters (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        template_id INT,
        letter_number VARCHAR(50) NOT NULL,
        letter_data JSON,
        status VARCHAR(20) DEFAULT 'active',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (template_id) REFERENCES letter_templates(id) ON DELETE CASCADE,
        INDEX idx_company (company_id),
        INDEX idx_template (template_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Check if templates exist
    const existing = await query<any>("SELECT COUNT(*) as count FROM letter_templates WHERE is_system_template = 1");
    if (existing[0]?.count > 0) {
      return NextResponse.json({ success: true, message: "Tables already set up with templates" });
    }

    // Insert system templates
    const templates = [
      {
        key: 'salary_receipt',
        name: 'Salary Receipt Acknowledgment',
        name_ar: 'إقرار استلام راتب',
        content: `<div class="letter-content" dir="rtl">
<div style="text-align: center; margin-bottom: 20px;">
<p style="font-weight: bold; margin: 0;">بسم الله الرحمن الرحيم</p>
<p style="font-weight: bold; margin: 0;">وزارة الموارد البشرية والتنمية الاجتماعية</p>
<p style="font-weight: bold; margin: 0;">نظام العمل السعودي - اللائحة التنفيذية لنظام العمل</p>
</div>

<h2 style="text-align: center; font-size: 22px; font-weight: bold; margin-bottom: 25px; border-bottom: 2px solid #000; padding-bottom: 10px;">إقرار استلام راتب رسمي ومعتمد</h2>

<div style="margin-bottom: 20px;">
<h3 style="font-size: 18px; font-weight: bold; border-right: 4px solid #000; padding-right: 10px; margin-bottom: 10px;">بيانات المنشأة / الشركة:</h3>
<p>اسم المنشأة: <span class="field">{company_name}</span></p>
<p>السجل التجاري: <span class="field">{commercial_number}</span></p>
</div>

<div style="margin-bottom: 20px;">
<h3 style="font-size: 18px; font-weight: bold; border-right: 4px solid #000; padding-right: 10px; margin-bottom: 10px;">بيانات الموظف:</h3>
<p>اسم الموظف: <span class="field">{employee_name}</span></p>
<p>رقم الهوية / الإقامة: <span class="field">{id_number}</span></p>
<p>المسمى الوظيفي: <span class="field">{job_title}</span></p>
<p>المهنة: <span class="field">{profession}</span></p>
</div>

<p>فترة الراتب: <span class="field">{payroll_period}</span> (شهرية / نصف شهرية / أسبوعية)</p>
<p>للفترة من: <span class="field">{period_from}</span> إلى <span class="field">{period_to}</span></p>

<div style="margin: 20px 0; border: 1px solid #000; padding: 15px;">
<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">تفاصيل الراتب الشهري:</h3>
<table style="width: 100%; border-collapse: collapse;">
<tr><td style="padding: 5px; border-bottom: 1px solid #ddd;">الراتب الأساسي</td><td style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">{basic_salary} ريال</td></tr>
<tr><td style="padding: 5px; border-bottom: 1px solid #ddd;">بدل سكن</td><td style="text-align: left; padding: 5px; border-bottom: 1px solid #ddd; font-weight: bold;">{housing_allowance} ريال</td></tr>
<tr style="background: #f5f5f5;"><td style="padding: 10px; font-weight: bold;">إجمالي المستحقات (أ)</td><td style="text-align: left; padding: 10px; font-weight: bold;">{total_amount} ريال</td></tr>
</table>
</div>

<div style="margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">صافي الراتب المستحق:</h3>
<p>صافي الراتب كتابة: <span class="field">{total_amount_text}</span> ريال سعودي فقط.</p>
<p>صافي الراتب رقمياً: <span class="field">{total_amount}</span> ريال سعودي فقط.</p>
</div>

<div style="margin-bottom: 20px;">
<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">طريقة الدفع:</h3>
<p>☐ نقداً &nbsp;&nbsp;&nbsp; ☐ تحويل بنكي</p>
<p>اسم البنك: <span class="field">{bank_name}</span></p>
<p>رقم الحساب: <span class="field">{account_number}</span></p>
<p>تاريخ التحويل: <span class="field">{transfer_date}</span></p>
</div>

<div style="margin-bottom: 20px;">
<p>تاريخ استحقاق الراتب: <span class="field">{due_date}</span></p>
<p>تاريخ الاستلام الفعلي: <span class="field">{actual_receipt_date}</span></p>
</div>

<div style="margin-bottom: 25px; padding: 10px; border: 1px dashed #000;">
<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">إقرار الموظف:</h3>
<p style="text-align: justify; font-size: 14px;">أقرّ بأنني استلمت راتبي الصافي للفترة المذكورة أعلاه، وقيمة الخصومات موضحة وفقاً لأنظمة العمل السعودية، ولم يتبقَ لي أي مستحقات مالية لدى صاحب العمل عن هذه الفترة.</p>
<div style="display: flex; justify-content: space-between; margin-top: 15px;">
<p>توقيع الموظف: ...........................</p>
<p>الاسم: {employee_name}</p>
<p>التاريخ: {actual_receipt_date}</p>
</div>
</div>

<div style="margin-bottom: 25px; padding: 10px; border: 1px dashed #000;">
<h3 style="font-size: 16px; font-weight: bold; margin-bottom: 10px;">إقرار صاحب العمل / المفوض:</h3>
<p style="text-align: justify; font-size: 14px;">أقرّ بأن جميع البيانات والتفاصيل المذكورة أعلاه صحيحة وواقعية، وتم دفع الراتب وفقاً لأحكام نظام العمل السعودي ولائحته التنفيذية.</p>
<div style="display: flex; justify-content: space-between; margin-top: 15px;">
<p>توقيع المسؤول المالي: ...........................</p>
<p>الاسم: ...........................</p>
<p>تاريخ: {actual_receipt_date}</p>
</div>
<p style="text-align: center; margin-top: 10px;">ختم الشركة / المؤسسة:</p>
<div style="width: 80px; height: 80px; border: 1px dashed #000; margin: 0 auto;"></div>
</div>

<div style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 10px;">
<p>• يُعد هذا الإيصال وثيقة رسمية تستخدم كدليل على سداد الراتب.</p>
<p>• يحق للموظف الاحتفاظ بصورة من هذا الإيصال.</p>
<p>• يتم الرجوع إلى نظام العمل السعودي في حال أي نزاع.</p>
<p>• جميع المبالغ بالريال السعودي.</p>
</div>
</div>`,
        placeholders: JSON.stringify(["company_name", "commercial_number", "employee_name", "id_number", "job_title", "profession", "payroll_period", "period_from", "period_to", "basic_salary", "housing_allowance", "total_amount", "total_amount_text", "bank_name", "account_number", "transfer_date", "due_date", "actual_receipt_date"])
      },
      {
        key: 'work_receipt',
        name: 'Work Receipt Acknowledgment',
        name_ar: 'إقرار استلام عمل',
        content: `<div class="letter-content" dir="rtl">
<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 15px;">إقرار إستلام عمل</h2>
<p style="line-height: 2.2; text-align: justify; font-size: 16px;">
أقرّ أنا: <span class="field">{employee_name}</span> واحمل هوية / إقامة رقم: <span class="field">{id_number}</span> بأنني استلمت العمل في <span class="field">{company_name}</span> سجل تجاري رقم: <span class="field">{commercial_number}</span>، اعتباراً من تاريخ: <span class="field">{start_date}</span> م.
</p>
<p style="line-height: 2; margin: 20px 0; font-size: 16px;">بوظيفة: <span class="field">{job_title}</span>، وأقر بـــ:</p>
<ol style="line-height: 2.2; padding-right: 30px; font-size: 15px;">
<li>التعهد بالالتزام بأنظمة ولوائح الشركة الداخلية.</li>
<li>الحفاظ على العهدة المستلمة من المؤسسة وأتعهد بإحضارها عند الطلب.</li>
<li>الالتزام بارتداء السيفتي كاملاً أثناء العمل وتنفيذ إجراءات السلامة المهنية اللازمة لأداء عملي.</li>
<li>أتعهد بالالتزام بالقوانين المرورية أثناء السير على الطرق واتباع إرشادات السلامة، وأتعهد بتحمل المخالفات والمخاطر الناتجة حيال غير ذلك. وليس على المؤسسة أدنى مسؤولية.</li>
<li>الحفاظ على مواعيد الحضور والانصراف.</li>
<li>التعامل الجيد مع الزملاء والمحافظة على أمن وأمان سكن المؤسسة.</li>
<li>وفي حالة الإخلال بتطبيق هذه الأنظمة فمن حق الشركة أن تتخذ كافة الإجراءات التي تراها مناسبة في حقي، طبقاً لقانون العمل واللوائح الداخلية للشركة.</li>
</ol>
<div style="margin-top: 50px; text-align: left; padding-left: 100px;">
<p style="font-weight: bold; margin-bottom: 20px;">المقر بما فيه</p>
<p style="margin-bottom: 15px;">الاســــــــم: {employee_name}</p>
<p style="margin-bottom: 15px;">التـوقــيــــع: .................................</p>
<p>البصمة: <span style="display: inline-block; width: 80px; height: 80px; border: 2px solid #000; border-radius: 50%; vertical-align: middle;"></span></p>
</div>
</div>`,
        placeholders: JSON.stringify(["employee_name", "id_number", "company_name", "commercial_number", "start_date", "job_title"])
      },
      {
        key: 'custody_receipt',
        name: 'Custody Receipt Acknowledgment',
        name_ar: 'إقرار استلام عهدة',
        content: `<div class="letter-content" dir="rtl">
<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 15px;">إقـــــرار استــــلام عهــــدة</h2>
<div style="margin-bottom: 25px; font-size: 16px; line-height: 2;">
<p>الاسم: <span class="field">{employee_name}</span> &nbsp;&nbsp;&nbsp; رقم الهوية / الإقامة: <span class="field">{id_number}</span> &nbsp;&nbsp;&nbsp; الوظيفة: <span class="field">{job_title}</span></p>
</div>
<table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
<thead><tr style="background: #f5f5f5;">
<th style="border: 2px solid #000; padding: 12px; text-align: center;">العدد</th>
<th style="border: 2px solid #000; padding: 12px; text-align: center;">البيان</th>
<th style="border: 2px solid #000; padding: 12px; text-align: center;">الكمية</th>
<th style="border: 2px solid #000; padding: 12px; text-align: center;">القيمة</th>
<th style="border: 2px solid #000; padding: 12px; text-align: center;">الحالة</th>
<th style="border: 2px solid #000; padding: 12px; text-align: center;">ملاحظات</th>
</tr></thead>
<tbody>
<tr><td style="border: 2px solid #000; padding: 12px; text-align: center;">1</td><td style="border: 2px solid #000; padding: 12px;">{item_1}</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{qty_1}</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{value_1} ريال</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{status_1}</td><td style="border: 2px solid #000; padding: 12px;">{notes_1}</td></tr>
<tr><td style="border: 2px solid #000; padding: 12px; text-align: center;">2</td><td style="border: 2px solid #000; padding: 12px;">{item_2}</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{qty_2}</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{value_2} ريال</td><td style="border: 2px solid #000; padding: 12px; text-align: center;">{status_2}</td><td style="border: 2px solid #000; padding: 12px;">{notes_2}</td></tr>
<tr style="background: #f9f9f9; font-weight: bold;"><td colspan="3" style="border: 2px solid #000; padding: 12px; text-align: center;">إجمالي قيمة العهدة المستلمة</td><td colspan="3" style="border: 2px solid #000; padding: 12px; text-align: center;">{total_value} SAR</td></tr>
</tbody>
</table>
<p style="line-height: 2.2; text-align: justify; font-size: 16px; margin: 30px 0;">
أقر أنا الموقع أدناه بأنني استلمت العهدة الموضحة أعلاه، وأتعهد بالمحافظة عليها وإعادتها إلى <span class="field">{company_name}</span> سجل تجاري رقم: <span class="field">{commercial_number}</span> عند الطلب.
</p>
<p style="text-align: center; font-weight: bold; font-size: 18px; margin: 30px 0;">وهــذا إقــرار منـي بـذلك</p>
<div style="margin-top: 40px;">
<p style="margin-bottom: 15px;">اسم المستلم: {employee_name}</p>
<p style="margin-bottom: 15px;">التوقيع: .................................</p>
<p style="margin-bottom: 15px;">التاريخ: {receipt_date}</p>
<p>البصمة: <span style="display: inline-block; width: 70px; height: 70px; border: 2px solid #000; border-radius: 50%; vertical-align: middle;"></span></p>
</div>
</div>`,
        placeholders: JSON.stringify(["employee_name", "id_number", "job_title", "item_1", "qty_1", "value_1", "status_1", "notes_1", "item_2", "qty_2", "value_2", "status_2", "notes_2", "total_value", "company_name", "commercial_number", "receipt_date"])
      },
      {
        key: 'resignation_letter',
        name: 'Electronic Resignation Letter',
        name_ar: 'خطاب استقالة إلكتروني',
        content: `<div class="letter-content" dir="rtl">
<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 15px;">خطاب استقالة إلكتروني</h2>
<div style="margin-bottom: 30px; line-height: 2; font-size: 16px;">
<p>سعادة مدير عام <span class="field">{company_name}</span> سجل تجاري رقم: <span class="field">{commercial_number}</span></p>
<p style="margin-right: 50px;">حفظه الله ،،</p>
<p style="margin-right: 100px;">السلام عليكم ورحمة الله وبركاته</p>
</div>
<p style="line-height: 2.4; text-align: justify; font-size: 16px; margin-bottom: 20px;">
أتقدم أنا الموظف: <span class="field">{employee_name}</span> - الجنسية: <span class="field">{nationality}</span> - هوية / إقامة رقم: <span class="field">{id_number}</span>
</p>
<p style="line-height: 2.4; text-align: justify; font-size: 16px; margin-bottom: 20px;">
باستقالتي من مؤسستكم الموقرة وذلك اعتباراً من يوم <span class="field">{resignation_day}</span> الموافق: <span class="field">{resignation_date}</span> م وذلك بسبب <span class="field">{resignation_reason}</span>
</p>
<p style="line-height: 2.4; text-align: justify; font-size: 16px; margin-bottom: 20px;">
وأنا بكامل الأوصاف والشروط المعتبرة شرعاً وبمحض اختياري وإرادتي ودون إكراه أو ضغط، وبناءً على نص المادة الرابعة والسبعون والمعدلة بموجب المرسوم الملكي رقم (م/46) وتاريخ 5/6/1436 هـ
</p>
<p style="line-height: 2.4; text-align: justify; font-size: 16px; margin-bottom: 15px;">وعليه آمل التكرم بالموافقة على استقالتي وأتعهد بما يلي:</p>
<ol style="line-height: 2.2; padding-right: 30px; font-size: 15px; margin-bottom: 25px;">
<li>التزام بتسليم جميع الأعمال والمستندات السابقة ذات العلاقة.</li>
<li>التزام إنهاء كافة الأعمال الموكلة لي وتسليم جميع العهد المسلمة.</li>
<li>إبراء الذمة المالية اتجاه الشركة من التزامات مالية مطالب بها.</li>
</ol>
<p style="line-height: 2; font-size: 16px; margin-bottom: 30px;">وأشكر لكم حسن المعاملة وتعاونكم معنا.</p>
<p style="line-height: 2; font-size: 16px; margin-bottom: 40px;">وتفضلوا بقبول وافر التحية وعظيم التقدير</p>
<div style="margin-top: 40px; text-align: left; padding-left: 100px;">
<p style="font-weight: bold; margin-bottom: 20px;">مقدمـــــه</p>
<p style="margin-bottom: 15px;">الاسم: {employee_name}</p>
<p style="margin-bottom: 15px;">رقم الهوية / الإقامة: {id_number}</p>
<p style="margin-bottom: 15px;">التوقيع: .................................</p>
<p>البصمة: <span style="display: inline-block; width: 70px; height: 70px; border: 2px solid #000; border-radius: 50%; vertical-align: middle;"></span></p>
</div>
</div>`,
        placeholders: JSON.stringify(["company_name", "commercial_number", "employee_name", "nationality", "id_number", "resignation_day", "resignation_date", "resignation_reason"])
      },
      {
        key: 'final_clearance',
        name: 'Final Clearance and Rights Receipt',
        name_ar: 'مخالصة نهائية وإقرار استلام الحقوق',
        content: `<div class="letter-content" dir="rtl">
<h2 style="text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 30px; border-bottom: 3px double #000; padding-bottom: 15px;">مخالصة نهائية وإقرار إستلام الحقوق النظامية</h2>
<div style="margin-bottom: 25px; line-height: 2.2; font-size: 16px;">
<p>أقر أنا: <span class="field">{employee_name}</span> &nbsp;&nbsp;&nbsp; المهنة: <span class="field">{job_title}</span> &nbsp;&nbsp;&nbsp; الجنسية: <span class="field">{nationality}</span></p>
<p>بموجب هوية / إقامة رقم: <span class="field">{id_number}</span></p>
</div>
<div style="margin-bottom: 25px; line-height: 2.2; font-size: 16px;">
<p>مدة الخدمة: (<span class="field">{service_days}</span>) يوم (<span class="field">{service_months}</span>) شهر (<span class="field">{service_years}</span>) سنة</p>
<p>اعتباراً من: <span class="field">{start_date}</span> م ، وحتى: <span class="field">{end_date}</span> م</p>
</div>
<div style="background: #f9f9f9; border: 2px solid #000; border-radius: 8px; padding: 20px; margin: 25px 0;">
<h3 style="text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 15px; border-bottom: 1px solid #000; padding-bottom: 10px;">الحقوق النظامية المستحقة للموظف</h3>
<table style="width: 100%; font-size: 15px;">
<tr><td style="padding: 8px;">الراتب الأساسي:</td><td style="padding: 8px; font-weight: bold;">{basic_salary} ريال</td></tr>
<tr><td style="padding: 8px;">بدل السكن:</td><td style="padding: 8px; font-weight: bold;">{housing_allowance} ريال</td></tr>
<tr><td style="padding: 8px;">بدل المواصلات:</td><td style="padding: 8px; font-weight: bold;">{transport_allowance} ريال</td></tr>
<tr><td style="padding: 8px;">مكافأة نهاية الخدمة:</td><td style="padding: 8px; font-weight: bold;">{end_service_bonus} ريال</td></tr>
<tr><td style="padding: 8px;">رصيد الإجازات:</td><td style="padding: 8px; font-weight: bold;">{vacation_balance} ريال</td></tr>
<tr style="background: #e9e9e9; font-weight: bold;"><td style="padding: 10px; border-top: 2px solid #000;">إجمالي المستحقات:</td><td style="padding: 10px; border-top: 2px solid #000;">{total_amount} ريال</td></tr>
</table>
</div>
<p style="line-height: 2.4; text-align: justify; font-size: 16px; margin: 30px 0;">
أقر أنا الموقع اسمي وجنسيتي أعلاه وأنا بكامل الأوصاف والشروط المعتبرة شرعاً وبمحض اختياري وإرادتي ودون إكراه أو ضغط بأنني قد استلمت كافة حقوقي النظامية، راتب شهر كامل عن فترة خدمتي بمؤسسة <span class="field">{company_name}</span> سجل تجاري رقم: <span class="field">{commercial_number}</span>.
</p>
<p style="line-height: 2.2; text-align: justify; font-size: 16px; margin-bottom: 20px; font-weight: bold;">
وبتوقيعي يعد مخالصة نهائية إبراءً تاماً من أي مطالبة
</p>
<p style="text-align: center; font-weight: bold; font-size: 16px; margin: 30px 0;">وعليه فقد تم توقيعي على هذه المخالصة والله خير الشاهدين ،،</p>
<div style="margin-top: 50px; display: flex; justify-content: space-between;">
<div style="text-align: center; width: 45%;">
<p style="font-weight: bold; margin-bottom: 20px; font-size: 16px;">توقيع الموظف المستلم</p>
<p style="margin-bottom: 15px;">اسم المستلم: {employee_name}</p>
<p>التوقيع: .................................</p>
</div>
<div style="text-align: center; width: 45%;">
<p style="font-weight: bold; margin-bottom: 20px; font-size: 16px;">يعتمد /</p>
<p style="margin-bottom: 30px;">المدير العام:</p>
<p style="margin-bottom: 15px;">الختم:</p>
<div style="width: 100px; height: 100px; border: 2px dashed #000; margin: 0 auto;"></div>
</div>
</div>
</div>`,
        placeholders: JSON.stringify(["employee_name", "job_title", "nationality", "id_number", "service_days", "service_months", "service_years", "start_date", "end_date", "basic_salary", "housing_allowance", "transport_allowance", "end_service_bonus", "vacation_balance", "total_amount", "company_name", "commercial_number"])
      }
    ];

    for (const t of templates) {
      await execute(
        `INSERT INTO letter_templates (template_key, template_name, template_name_ar, template_content, placeholders, is_system_template) 
         VALUES (?, ?, ?, ?, ?, 1)`,
        [t.key, t.name, t.name_ar, t.content, t.placeholders]
      );
    }

    return NextResponse.json({ success: true, message: "Tables and templates created successfully" });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
