exports.id=3260,exports.ids=[3260],exports.modules={43495:(a,b,c)=>{"use strict";c.r(b),c.d(b,{"40072ff7fafa346d2b4ec086600aa07933ec76480c":()=>i,"4031e0de347e909a90b3fa74caed4f36458ede2bab":()=>l,"40648d0544680264eb68d94307c9e2c4bbf6e6cfc2":()=>h,"40cfb57bf263fe7287e9e1f85c2c992f8c46f0d30a":()=>n,"603843423ee986a94ea174857a9362fe5ec99d7cfb":()=>k,"60b8b90136fb496c04dc6957d00c5fbeb14541ab40":()=>m,"60d5ba18760d9641dbdc83fd51a1233a3fa549cc9a":()=>j});var d=c(91488);c(27806);var e=c(67697),f=c(91837),g=c(83622);async function h(a){try{let c=await (0,e.P)("SELECT c.id, c.name, c.commercial_number, u.email FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.id = ? LIMIT 1",[a]);if(0===c.length)return{success:!1,error:"الشركة غير موجودة"};let d=c[0];if(await (0,e.g7)("UPDATE companies SET status = 'approved', is_active = 1 WHERE id = ?",[a]),await (0,e.g7)("UPDATE users SET role = 'user', is_active = 1, is_activated = 1, activation_date = NOW() WHERE company_id = ?",[a]),d.email){var b;let a=(b=d.name,`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); backdrop-filter: blur(20px); border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <div style="background: linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #34d399, #10b981, #059669, #047857, #059669, #10b981, #34d399); background-size: 200% 100%; animation: gradient 3s ease infinite;"></div>
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <span style="font-size: 50px;">✓</span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">تهانينا الحارة!</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">تم تفعيل حسابك بنجاح</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                يسعدنا أن نرحب بشركة<br>
                <strong style="color: #10b981; font-size: 28px; display: block; margin: 15px 0; background: linear-gradient(135deg, #10b981, #059669); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">${b}</strong>
                في عائلة ZoolSpeed
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h3 style="color: #166534; font-size: 18px; margin: 0 0 20px 0; font-weight: 700;">مميزات حسابك المفعّل:</h3>
              <ul style="margin: 0; padding: 0; list-style: none;">
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">إدارة شاملة لأسطول المركبات</span>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">نظام محاسبي متكامل ومتوافق مع الزكاة والدخل</span>
                </li>
                <li style="padding: 12px 0; border-bottom: 1px solid rgba(22,163,74,0.1); display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">إدارة الموارد البشرية والموظفين</span>
                </li>
                <li style="padding: 12px 0; display: flex; align-items: center; gap: 12px;">
                  <span style="width: 32px; height: 32px; background: #10b981; border-radius: 10px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 14px;">✓</span>
                  <span style="color: #374151; font-size: 15px;">تقارير وتحليلات متقدمة في الوقت الفعلي</span>
                </li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="https://zoolspeed.com/login" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 30px rgba(16,185,129,0.4); transition: all 0.3s;">
                ابدأ رحلتك الآن →
              </a>
            </div>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 25px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0 0 10px 0;">هل تحتاج مساعدة؟ فريق الدعم الفني جاهز لخدمتك</p>
              <p style="color: #10b981; font-size: 16px; font-weight: 700; margin: 0;">support@zoolspeed.com</p>
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">\xa9 ${new Date().getFullYear()} ZoolSpeed. جميع الحقوق محفوظة</p>
            <p style="color: #475569; font-size: 11px; margin: 0;">هذا البريد مرسل آلياً، يرجى عدم الرد عليه</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `);await (0,g.ZM)({to:d.email,subject:"تهانينا! تم تفعيل حسابك في ZoolSpeed - مرحباً بك في عائلتنا",html:a})}return(0,f.revalidatePath)("/admin/companies"),{success:!0}}catch(a){return console.error("Approve company error:",a),{success:!1,error:a.message}}}async function i(a){try{let c=await (0,e.P)("SELECT c.id, c.name, c.commercial_number, u.email FROM companies c LEFT JOIN users u ON u.company_id = c.id WHERE c.id = ? LIMIT 1",[a]);if(0===c.length)return{success:!1,error:"الشركة غير موجودة"};let d=c[0];if(await (0,e.g7)("UPDATE companies SET status = 'rejected', is_active = 0 WHERE id = ?",[a]),await (0,e.g7)("UPDATE users SET is_active = 0, is_activated = 0 WHERE company_id = ?",[a]),d.email){var b;let a=(b=d.name,`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); backdrop-filter: blur(20px); border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
          
          <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #fbbf24, #f59e0b, #d97706, #b45309, #d97706, #f59e0b, #fbbf24); background-size: 200% 100%;"></div>
            <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
              <span style="font-size: 50px;">⚠</span>
            </div>
            <h1 style="color: #ffffff; font-size: 32px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">تحديث حالة الطلب</h1>
            <p style="color: rgba(255,255,255,0.9); font-size: 18px; margin: 0; font-weight: 500;">نأسف لإبلاغك بهذا الخبر</p>
          </div>
          
          <div style="padding: 50px 40px; background: #ffffff;">
            <div style="text-align: center; margin-bottom: 40px;">
              <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                عزيزي العميل في شركة<br>
                <strong style="color: #f59e0b; font-size: 26px; display: block; margin: 15px 0;">${b}</strong>
              </p>
            </div>
            
            <div style="background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #fde68a;">
              <p style="color: #92400e; font-size: 16px; line-height: 1.8; margin: 0; text-align: center;">
                نأسف لإبلاغك بأن طلب التسجيل الخاص بشركتك لم يتم الموافقة عليه في الوقت الحالي. 
                قد يكون ذلك بسبب عدم اكتمال المستندات المطلوبة أو عدم مطابقة بعض المعلومات.
              </p>
            </div>
            
            <div style="background: #f0fdf4; border-radius: 16px; padding: 25px; margin-bottom: 30px; border: 1px solid #bbf7d0;">
              <h3 style="color: #166534; font-size: 16px; margin: 0 0 15px 0; font-weight: 700;">ماذا يمكنك فعله؟</h3>
              <ul style="margin: 0; padding: 0 20px; color: #374151; font-size: 14px; line-height: 2;">
                <li>مراجعة البيانات والمستندات المرفقة</li>
                <li>التأكد من صحة رقم السجل التجاري</li>
                <li>التواصل مع فريق الدعم لمعرفة التفاصيل</li>
                <li>إعادة تقديم الطلب بعد استكمال المتطلبات</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 40px 0;">
              <a href="mailto:support@zoolspeed.com" style="display: inline-block; background: linear-gradient(135deg, #0078D4 0%, #8A2BE2 100%); color: white; text-decoration: none; padding: 18px 50px; border-radius: 14px; font-size: 18px; font-weight: 700; box-shadow: 0 10px 30px rgba(0,120,212,0.4);">
                تواصل مع الدعم الفني
              </a>
            </div>
            
            <div style="background: #f8fafc; border-radius: 16px; padding: 25px; text-align: center; border: 1px solid #e2e8f0;">
              <p style="color: #64748b; font-size: 14px; margin: 0;">نحن هنا لمساعدتك في أي استفسار</p>
            </div>
          </div>
          
          <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 10px 0;">\xa9 ${new Date().getFullYear()} ZoolSpeed. جميع الحقوق محفوظة</p>
            <p style="color: #475569; font-size: 11px; margin: 0;">هذا البريد مرسل آلياً، يرجى عدم الرد عليه</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `);await (0,g.ZM)({to:d.email,subject:"تحديث حالة طلبك في ZoolSpeed",html:a})}return(0,f.revalidatePath)("/admin/companies"),{success:!0}}catch(a){return console.error("Reject company error:",a),{success:!1,error:a.message}}}async function j(a,b){try{return await (0,e.P)("UPDATE companies SET is_active = ? WHERE id = ?",[+(1!==b),a]),(0,f.revalidatePath)("/admin/companies"),{success:!0}}catch(a){return{success:!1,error:a.message}}}async function k(a,b){try{let c=Math.random().toString(36).substring(2,15)+Math.random().toString(36).substring(2,15),d=null;if(b>0){let a=new Date;a.setDate(a.getDate()+b),d=a.toISOString().split("T")[0]}return await (0,e.P)("UPDATE companies SET access_token = ?, token_expiry = ? WHERE id = ?",[c,d,a]),(0,f.revalidatePath)("/admin/companies"),{success:!0,token:c}}catch(a){return{success:!1,error:a.message}}}async function l(a){try{return await (0,e.P)("INSERT INTO admin_notifications (title, message, sent_to_all, image_path) VALUES (?, ?, ?, ?)",[a.title,a.message,+!!a.sent_to_all,a.image_path||null]),(0,f.revalidatePath)("/admin/notifications"),{success:!0}}catch(a){return{success:!1,error:a.message}}}async function m(a,b){try{let c=Object.keys(b),d=Object.values(b);if(0===c.length)return{success:!1,error:"No fields to update"};let g=c.map(a=>`${a} = ?`).join(", ");return await (0,e.P)(`UPDATE companies SET ${g} WHERE id = ?`,[...d,a]),(0,f.revalidatePath)("/admin/companies"),(0,f.revalidatePath)(`/admin/companies/${a}`),{success:!0}}catch(a){return{success:!1,error:a.message}}}async function n(a){try{if(1===a)return{success:!1,error:"لا يمكن حذف الشركة الرئيسية للمدير"};if((await (0,e.P)("SELECT id FROM users WHERE company_id = ? AND role = 'admin'",[a])).length>0)return{success:!1,error:"لا يمكن حذف شركة تحتوي على مدير نظام"};return await (0,e.g7)("DELETE FROM multi_shift_notifications WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM multi_shift_assignments WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM multi_shift_settings WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM multi_shifts WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM leave_requests WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM employee_tasks WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM shifts WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM maintenance_requests WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM vehicles WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM spares WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM spares_categories WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM payrolls WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM payroll_headers WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM credit_notes WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM company_bank_accounts WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM company_documents WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM company_features WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM company_permissions WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM zatca_certificates WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM users WHERE company_id = ?",[a]),await (0,e.g7)("DELETE FROM companies WHERE id = ?",[a]),(0,f.revalidatePath)("/admin/companies"),{success:!0,message:"تم حذف الشركة وجميع البيانات المرتبطة بها"}}catch(a){return console.error("Delete company error:",a),{success:!1,error:a.message}}}(0,c(40410).D)([h,i,j,k,l,m,n]),(0,d.A)(h,"40648d0544680264eb68d94307c9e2c4bbf6e6cfc2",null),(0,d.A)(i,"40072ff7fafa346d2b4ec086600aa07933ec76480c",null),(0,d.A)(j,"60d5ba18760d9641dbdc83fd51a1233a3fa549cc9a",null),(0,d.A)(k,"603843423ee986a94ea174857a9362fe5ec99d7cfb",null),(0,d.A)(l,"4031e0de347e909a90b3fa74caed4f36458ede2bab",null),(0,d.A)(m,"60b8b90136fb496c04dc6957d00c5fbeb14541ab40",null),(0,d.A)(n,"40cfb57bf263fe7287e9e1f85c2c992f8c46f0d30a",null)},67697:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(56275).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},83622:(a,b,c)=>{"use strict";c.d(b,{$6:()=>f,ZM:()=>e,zy:()=>g});let d=c(32132).createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});async function e({to:a,subject:b,text:c,html:e}){let f={from:`"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,to:a,subject:b,text:c,html:e};return await d.sendMail(f)}async function f(a,b,c){let d=new Date,f=d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),g=d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),h=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 40px;">🔐</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0;">تسجيل دخول جديد</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">تم رصد دخول إلى حسابك في Logistics Systems Pro</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <div style="text-align: right; margin-bottom: 35px;">
              <p style="font-size: 18px; color: #1e293b; line-height: 1.8; margin: 0;">
                مرحباً <strong style="color: #3b82f6;">${b}</strong>
              </p>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
              <h3 style="color: #334155; font-size: 15px; margin: 0 0 20px 0; font-weight: 700;">تفاصيل العملية</h3>
              
              <div style="display: flex; flex-direction: column; gap: 12px;">
                <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">التاريخ والوقت:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${f} | ${g}</span>
                </div>
                <div style="padding: 12px 0; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">الشركة:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${c}</span>
                </div>
                <div style="padding: 12px 0; display: flex; justify-content: space-between;">
                  <span style="color: #64748b; font-size: 13px;">الحساب:</span>
                  <span style="color: #1e293b; font-size: 13px; font-weight: 700;">${a}</span>
                </div>
              </div>
            </div>
            
            <div style="background: #fffbeb; border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                <strong>تنبيه أمني:</strong> إذا لم تكن أنت من قام بهذا الدخول، يرجى تغيير كلمة المرور فوراً وتأمين حسابك.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://zoolspeed.com/login" style="display: inline-block; background: #1e293b; color: white; text-decoration: none; padding: 14px 35px; border-radius: 12px; font-size: 14px; font-weight: 700;">
                لوحة التحكم
              </a>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Systems Pro - الحل المتكامل لإدارة اللوجستيات</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">\xa9 2026 جميع الحقوق محفوظة</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;try{return await e({to:a,subject:"تم تسجيل دخول جديد إلى حسابك - Logistics Systems Pro",html:h})}catch(a){console.error("Failed to send login notification email:",a)}}async function g(a,b,c){let d=`
    <!DOCTYPE html>
    <html dir="rtl" lang="ar">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f8fafc; min-height: 100vh;">
      <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
        <div style="background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.05);">
          
          <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 50px 40px; text-align: center; position: relative;">
            <div style="width: 80px; height: 80px; background: rgba(255,255,255,0.1); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.1);">
              <span style="font-size: 40px;">🔑</span>
            </div>
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 800; margin: 0 0 12px 0;">استعادة كلمة المرور</h1>
            <p style="color: rgba(255,255,255,0.7); font-size: 14px; margin: 0; font-weight: 500;">Logistics Systems Pro Security</p>
          </div>
          
          <div style="padding: 40px; background: #ffffff;">
            <div style="text-align: right; margin-bottom: 30px;">
              <p style="font-size: 18px; color: #1e293b; line-height: 1.8; margin: 0;">
                مرحباً <strong style="color: #3b82f6;">${b}</strong>
              </p>
              <p style="font-size: 15px; color: #64748b; margin: 10px 0 0 0;">لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. يرجى استخدام الرمز التالي:</p>
            </div>
            
            <div style="background: #f1f5f9; border-radius: 24px; padding: 40px; text-align: center; margin-bottom: 30px; border: 2px dashed #e2e8f0;">
              <div style="font-size: 48px; font-weight: 900; letter-spacing: 12px; color: #1e293b; font-family: monospace;">
                ${c}
              </div>
              <p style="color: #94a3b8; font-size: 12px; margin-top: 20px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
                الرمز صالح لمدة 15 دقيقة فقط
              </p>
            </div>
            
            <div style="background: #fffbeb; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #fef3c7;">
              <p style="color: #92400e; font-size: 13px; margin: 0; line-height: 1.6;">
                إذا لم تطلب أنت هذا الرمز، فيرجى تجاهل هذا البريد الإلكتروني.
              </p>
            </div>
          </div>
          
          <div style="background: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #f1f5f9;">
            <p style="color: #94a3b8; font-size: 11px; margin: 0;">Logistics Systems Pro - نظام إدارة اللوجستيات المتكامل</p>
            <p style="color: #cbd5e1; font-size: 10px; margin: 5px 0 0 0;">\xa9 2026 جميع الحقوق محفوظة</p>
          </div>
          
        </div>
      </div>
    </body>
    </html>
  `;return await e({to:a,subject:"رمز التحقق لاستعادة كلمة المرور - Logistics Systems Pro",html:d})}},87080:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=87080,a.exports=b}};