exports.id=3626,exports.ids=[3626],exports.modules={44943:(a,b,c)=>{"use strict";c.d(b,{cn:()=>f});var d=c(43249),e=c(58829);function f(...a){return(0,e.QP)((0,d.$)(a))}},65121:(a,b,c)=>{"use strict";c.r(b),c.d(b,{"401d8e607bb034ef6953a894a2316ec30bc154de90":()=>q,"406230466286f3d7e82b6ae523ecb811987770db2d":()=>o,"408905b3fe1a9a85cf6dc4a0cb3bfd37d48931233c":()=>n,"40ae47c28ae49a8d66024a251ad4d8e2f3787a369c":()=>m,"40c284d65200c2d24185e4a8875c1046f2c462de6c":()=>p});var d=c(91488);c(27806);var e=c(70495),f=c(70469),g=c(83622),h=c(62046);let i=process.env.SUPABASE_URL,j=process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.SUPABASE_ANON_KEY,k=(0,h.UU)(i,j);var l=c(67697);async function m(a){try{let b=a.get("name"),c=a.get("commercial_number"),d=a.get("vat_number"),e=a.get("phone"),g=a.get("website"),h=a.get("currency"),i=a.get("country"),j=a.get("region"),m=a.get("district"),n=a.get("street"),o=a.get("postal_code"),p=a.get("short_address"),q=a.get("bank_beneficiary"),r=a.get("bank_name"),s=a.get("bank_account"),t=a.get("bank_iban"),u=a.get("transport_license_number"),v=a.get("transport_license_type"),w=a.get("license_start"),x=a.get("license_end"),y=(a.get("user_email")||"").trim().toLowerCase(),z=a.get("password"),A=a.get("logo_path"),B=a.get("stamp_path"),C=a.get("digital_seal_path"),D=a.get("license_image"),E=async(a,b)=>{if(!a||0===a.size)return null;let c=a.name.split(".").pop(),d=`${Math.random().toString(36).substring(2)}_${Date.now()}.${c}`,e=`${b}/${d}`,{data:f,error:g}=await k.storage.from("establishments").upload(e,a);if(g)throw g;let{data:h}=k.storage.from("establishments").getPublicUrl(e);return h.publicUrl},F=await E(A,"logos"),G=await E(B,"stamps"),H=await E(C,"seals"),I=await E(D,"licenses"),J=await (0,l.P)("SELECT id FROM users WHERE email = ?",[y]);if(J&&J.length>0)return{success:!1,error:"البريد الإلكتروني مسجل مسبقاً."};let K=(await (0,l.g7)("INSERT INTO companies (name, status, is_active, commercial_number, vat_number, phone, website, currency, logo_path, stamp_path, digital_seal_path, country, region, district, street, postal_code, short_address, bank_beneficiary, bank_name, bank_account, bank_iban, transport_license_number, transport_license_type, transport_license_image, license_start, license_end, created_at) VALUES (?, 'pending', 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())",[b,c,d,e,g,h,F,G,H,i,j,m,n,o,p,q,r,s,t,u,v,I,w||null,x||null])).insertId,L=await f.Ay.hash(z,10);for(let a of(await (0,l.g7)("INSERT INTO users (name, email, password, role, company_id, is_activated, created_at) VALUES (?, ?, ?, 'admin', ?, 0, NOW())",[b,y,L,K]),["dashboard","drivers","vehicles","tracking","reports","settings"]))await (0,l.g7)("INSERT INTO company_permissions (company_id, feature_key, is_enabled) VALUES (?, ?, 1)",[K,a]);return{success:!0}}catch(a){return console.error("Registration error:",a),{success:!1,error:"حدث خطأ أثناء عملية التسجيل. يرجى المحاولة لاحقاً."}}}async function n(a){let b=(a.get("email")||"").trim().toLowerCase(),c=a.get("password"),d="on"===a.get("remember");try{let a=null,h="owner",i=await (0,l.P)("SELECT * FROM users WHERE email = ?",[b]);if(i&&i.length>0)a=i[0],h="admin@zoolspeed.com"===a.email?"admin":"owner";else{let{data:c,error:d}=await k.from("company_sub_users").select("*").eq("email",b).eq("status","active").single();c&&(a=c,h="sub_user")}if(!a)return{success:!1,error:"البريد الإلكتروني غير مسجل."};if(!await f.Ay.compare(c,a.password||""))return{success:!1,error:"كلمة المرور غير صحيحة."};let j=await (0,l.P)("SELECT name, status, is_active FROM companies WHERE id = ?",[a.company_id]);if(!j||0===j.length)return{success:!1,error:"لم يتم العثور على بيانات الشركة."};let m=j[0];if("admin@zoolspeed.com"!==a.email){if("approved"!==m.status)return{success:!1,error:"الشركة غير مقبولة بعد. يرجى انتظار مراجعة الإدارة."};if(1!==m.is_active)return{success:!1,error:"الشركة موقوفة. يرجى التواصل مع الإدارة."}}if("owner"===h&&0===a.is_activated&&"admin@zoolspeed.com"!==a.email)return{success:!1,error:"الحساب غير مفعل. يرجى انتظار تفعيل الإدارة."};let n={};(await (0,l.P)("SELECT feature_key, is_enabled FROM company_permissions WHERE company_id = ?",[a.company_id])||[]).forEach(a=>{n[a.feature_key]=+!!a.is_enabled}),"sub_user"===h&&((await (0,l.P)("SELECT permission_key FROM sub_user_permissions WHERE sub_user_id = ?",[a.id])||[]).forEach(a=>{n[a.permission_key]=1}),await k.from("company_sub_users").update({last_login_at:new Date().toISOString()}).eq("id",a.id));let o=await (0,e.UL)(),p={user_id:"sub_user"===h?0:a.id,sub_user_id:"sub_user"===h?a.id:void 0,user_name:a.name,company_id:a.company_id,role:a.role||("sub_user"===h?"user":"admin"),permissions:n,user_type:h};if(o.set("auth_session",JSON.stringify(p),{httpOnly:!0,secure:!0,maxAge:d?2592e3:void 0,path:"/"}),d&&o.set("user_email",b,{maxAge:2592e3,path:"/"}),"owner"===h){let b=new Date().toISOString().split("T")[0],c=await (0,l.P)("SELECT DATE(last_login_notification) as last_notification_date FROM users WHERE id = ?",[a.id]),d=c?.[0]?.last_notification_date;d&&d===b||(await (0,l.g7)("UPDATE users SET last_login_notification = NOW() WHERE id = ?",[a.id]),(0,g.$6)(a.email,a.name,m.name||"الشركة").catch(console.error))}return{success:!0,user:{id:a.id,name:a.name,email:a.email,role:p.role,company_id:a.company_id,is_activated:a.is_activated??1,user_type:h},permissions:n}}catch(a){return console.error("Login error:",a),{success:!1,error:"خطأ في الاتصال بقاعدة البيانات."}}}async function o(a){let b=(a.get("email")||"").trim().toLowerCase();try{let a=await (0,l.P)("SELECT id, name FROM users WHERE email = ?",[b]);if(!a||0===a.length)return{success:!1,error:"البريد الإلكتروني غير مسجل في النظام."};let c=a[0],d=Math.floor(1e5+9e5*Math.random()).toString();await (0,l.g7)("DELETE FROM password_resets WHERE email = ?",[b]),await (0,l.g7)("INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())",[b,d]),await (0,g.zy)(b,c.name,d);let f=await (0,e.UL)();return f.set("reset_email",b,{maxAge:900,path:"/"}),f.set("reset_user_name",c.name,{maxAge:900,path:"/"}),f.set("reset_user_type","owner",{maxAge:900,path:"/"}),{success:!0}}catch(a){return console.error("Forgot password error:",a),{success:!1,error:"حدث خطأ أثناء معالجة الطلب."}}}async function p(a){let b=a.get("token"),c=await (0,e.UL)(),d=c.get("reset_email")?.value;if(!d)return{success:!1,error:"انتهت صلاحية الجلسة. يرجى المحاولة مرة أخرى."};try{let a=await (0,l.P)("SELECT * FROM password_resets WHERE email = ? AND token = ? AND created_at > DATE_SUB(NOW(), INTERVAL 15 MINUTE)",[d,b]);if(!a||0===a.length)return{success:!1,error:"رمز التحقق غير صحيح أو منتهي الصلاحية."};return c.set("token_verified","true",{maxAge:900,path:"/"}),{success:!0}}catch(a){return console.error("Verify token error:",a),{success:!1,error:"حدث خطأ أثناء التحقق من الرمز."}}}async function q(a){let b=a.get("password"),c=a.get("confirm"),d=await (0,e.UL)(),g=d.get("reset_email")?.value,h=d.get("token_verified")?.value==="true";if(d.get("reset_user_type")?.value,!g||!h)return{success:!1,error:"غير مصرح لك بالقيام بهذه العملية."};if(b.length<6)return{success:!1,error:"كلمة المرور يجب أن تكون على الأقل 6 أحرف."};if(b!==c)return{success:!1,error:"كلمتا المرور غير متطابقتين."};try{let a=await f.Ay.hash(b,10);return await (0,l.g7)("UPDATE users SET password = ? WHERE email = ?",[a,g]),await (0,l.g7)("DELETE FROM password_resets WHERE email = ?",[g]),d.delete("reset_email"),d.delete("reset_user_name"),d.delete("token_verified"),d.delete("reset_user_type"),{success:!0}}catch(a){return console.error("Reset password error:",a),{success:!1,error:"حدث خطأ أثناء تحديث كلمة المرور."}}}(0,c(40410).D)([m,n,o,p,q]),(0,d.A)(m,"40ae47c28ae49a8d66024a251ad4d8e2f3787a369c",null),(0,d.A)(n,"408905b3fe1a9a85cf6dc4a0cb3bfd37d48931233c",null),(0,d.A)(o,"406230466286f3d7e82b6ae523ecb811987770db2d",null),(0,d.A)(p,"40c284d65200c2d24185e4a8875c1046f2c462de6c",null),(0,d.A)(q,"401d8e607bb034ef6953a894a2316ec30bc154de90",null)},67697:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(56275).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},83622:(a,b,c)=>{"use strict";c.d(b,{$6:()=>f,ZM:()=>e,zy:()=>g});let d=c(32132).createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});async function e({to:a,subject:b,text:c,html:e}){let f={from:`"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,to:a,subject:b,text:c,html:e};return await d.sendMail(f)}async function f(a,b,c){let d=new Date,f=d.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),g=d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),h=`
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