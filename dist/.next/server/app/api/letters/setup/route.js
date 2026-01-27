(()=>{var a={};a.id=331,a.ids=[331],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(29382).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},83023:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{GET:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(35552);async function w(){try{await (0,v.g7)("DROP TABLE IF EXISTS generated_letters"),await (0,v.g7)("DROP TABLE IF EXISTS letter_templates"),await (0,v.g7)(`
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
    `),await (0,v.g7)(`
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
    `);let a=await (0,v.P)("SELECT COUNT(*) as count FROM letter_templates WHERE is_system_template = 1");if(a[0]?.count>0)return u.NextResponse.json({success:!0,message:"Tables already set up with templates"});for(let a of[{key:"salary_receipt",name:"Salary Receipt Acknowledgment",name_ar:"إقرار استلام راتب",content:`<div class="letter-content" dir="rtl">
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
</div>`,placeholders:JSON.stringify(["company_name","commercial_number","employee_name","id_number","job_title","profession","payroll_period","period_from","period_to","basic_salary","housing_allowance","total_amount","total_amount_text","bank_name","account_number","transfer_date","due_date","actual_receipt_date"])},{key:"work_receipt",name:"Work Receipt Acknowledgment",name_ar:"إقرار استلام عمل",content:`<div class="letter-content" dir="rtl">
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
</div>`,placeholders:JSON.stringify(["employee_name","id_number","company_name","commercial_number","start_date","job_title"])},{key:"custody_receipt",name:"Custody Receipt Acknowledgment",name_ar:"إقرار استلام عهدة",content:`<div class="letter-content" dir="rtl">
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
</div>`,placeholders:JSON.stringify(["employee_name","id_number","job_title","item_1","qty_1","value_1","status_1","notes_1","item_2","qty_2","value_2","status_2","notes_2","total_value","company_name","commercial_number","receipt_date"])},{key:"resignation_letter",name:"Electronic Resignation Letter",name_ar:"خطاب استقالة إلكتروني",content:`<div class="letter-content" dir="rtl">
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
</div>`,placeholders:JSON.stringify(["company_name","commercial_number","employee_name","nationality","id_number","resignation_day","resignation_date","resignation_reason"])},{key:"final_clearance",name:"Final Clearance and Rights Receipt",name_ar:"مخالصة نهائية وإقرار استلام الحقوق",content:`<div class="letter-content" dir="rtl">
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
</div>`,placeholders:JSON.stringify(["employee_name","job_title","nationality","id_number","service_days","service_months","service_years","start_date","end_date","basic_salary","housing_allowance","transport_allowance","end_service_bonus","vacation_balance","total_amount","company_name","commercial_number"])}])await (0,v.g7)(`INSERT INTO letter_templates (template_key, template_name, template_name_ar, template_content, placeholders, is_system_template) 
         VALUES (?, ?, ?, ?, ?, 1)`,[a.key,a.name,a.name_ar,a.content,a.placeholders]);return u.NextResponse.json({success:!0,message:"Tables and templates created successfully"})}catch(a){return console.error("Setup error:",a),u.NextResponse.json({success:!1,error:a.message},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/letters/setup/route",pathname:"/api/letters/setup",filename:"route",bundlePath:"app/api/letters/setup/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/abdalltifmohammed/orchids-projects/orchids-logistics-react-app/src/app/api/letters/setup/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/letters/setup/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,9382,1692],()=>b(b.s=83023));module.exports=c})();