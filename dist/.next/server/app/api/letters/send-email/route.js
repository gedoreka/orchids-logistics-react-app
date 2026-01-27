(()=>{var a={};a.id=8177,a.ids=[8177],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},30787:(a,b,c)=>{"use strict";Object.defineProperty(b,"__esModule",{value:!0}),Object.defineProperty(b,"createDedupedByCallsiteServerErrorLoggerDev",{enumerable:!0,get:function(){return i}});let d=function(a,b){if(a&&a.__esModule)return a;if(null===a||"object"!=typeof a&&"function"!=typeof a)return{default:a};var c=e(b);if(c&&c.has(a))return c.get(a);var d={__proto__:null},f=Object.defineProperty&&Object.getOwnPropertyDescriptor;for(var g in a)if("default"!==g&&Object.prototype.hasOwnProperty.call(a,g)){var h=f?Object.getOwnPropertyDescriptor(a,g):null;h&&(h.get||h.set)?Object.defineProperty(d,g,h):d[g]=a[g]}return d.default=a,c&&c.set(a,d),d}(c(74515));function e(a){if("function"!=typeof WeakMap)return null;var b=new WeakMap,c=new WeakMap;return(e=function(a){return a?c:b})(a)}let f={current:null},g="function"==typeof d.cache?d.cache:a=>a,h=console.warn;function i(a){return function(...b){h(a(...b))}}g(a=>{try{h(f.current)}finally{f.current=null}})},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(29382).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},61837:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>E,patchFetch:()=>D,routeModule:()=>z,serverHooks:()=>C,workAsyncStorage:()=>A,workUnitAsyncStorage:()=>B});var d={};c.r(d),c.d(d,{POST:()=>y});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(35552),w=c(86802);async function x(){let a=(await (0,w.cookies)()).get("auth_session");if(!a)return null;let b=JSON.parse(a.value),c=await (0,v.P)("SELECT id, name, commercial_number FROM companies WHERE id = ?",[b.company_id]);if(!c||0===c.length)return null;let d=c[0],e=await (0,v.P)("SELECT email FROM users WHERE id = ?",[b.user_id]);return e&&e.length>0&&(d.email=e[0].email),d}async function y(a){try{let b=await x();if(!b)return u.NextResponse.json({error:"Unauthorized"},{status:401});let{recipientEmail:d,letterNumber:e,letterType:f,pdfBase64:g}=await a.json();if(!d||!e||!g)return u.NextResponse.json({error:"بيانات ناقصة"},{status:400});let h=new Date,i=h.toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),j=h.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:!0}),k=`خطاب رسمي - ${f} | ${e}`,l=`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); min-height: 100vh;">
        <div style="max-width: 650px; margin: 0 auto; padding: 40px 20px;">
          <div style="background: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%); backdrop-filter: blur(20px); border-radius: 32px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);">
            
            <div style="background: linear-gradient(135deg, #0078D4 0%, #5B21B6 50%, #7C3AED 100%); padding: 50px 40px; text-align: center; position: relative;">
              <div style="position: absolute; top: 0; left: 0; right: 0; height: 4px; background: linear-gradient(90deg, #60a5fa, #a78bfa, #c084fc, #a78bfa, #60a5fa); background-size: 200% 100%;"></div>
              <div style="width: 100px; height: 100px; background: rgba(255,255,255,0.2); border-radius: 24px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                <span style="font-size: 50px;">📄</span>
              </div>
              <h1 style="color: #ffffff; font-size: 28px; font-weight: 800; margin: 0 0 12px 0; text-shadow: 0 4px 20px rgba(0,0,0,0.3);">خطاب رسمي</h1>
              <p style="color: rgba(255,255,255,0.9); font-size: 16px; margin: 0; font-weight: 500;">${f}</p>
            </div>
            
            <div style="padding: 50px 40px; background: #ffffff;">
              <div style="text-align: center; margin-bottom: 35px;">
                <p style="font-size: 20px; color: #1e293b; line-height: 1.8; margin: 0;">
                  السلام عليكم ورحمة الله وبركاته
                </p>
              </div>
              
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 20px; padding: 30px; margin-bottom: 30px; border: 1px solid #bae6fd;">
                <div style="text-align: center; margin-bottom: 20px;">
                  <span style="font-size: 40px;">✉️</span>
                </div>
                <p style="color: #0369a1; font-size: 16px; line-height: 1.8; margin: 0; text-align: center; font-weight: 600;">
                  نرفق لسيادتكم الخطاب الرسمي المطلوب
                </p>
              </div>
              
              <div style="background: #f8fafc; border-radius: 20px; padding: 25px; margin-bottom: 30px; border: 1px solid #e2e8f0;">
                <h3 style="color: #334155; font-size: 16px; margin: 0 0 20px 0; font-weight: 700; text-align: center;">تفاصيل الخطاب</h3>
                
                <div style="display: flex; flex-direction: column; gap: 15px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">📋 رقم الخطاب</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${e}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">📑 نوع الخطاب</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${f}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">📅 التاريخ</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${i}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">🕐 الوقت</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${j}</span>
                  </div>
                  
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: white; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <span style="color: #64748b; font-size: 14px; font-weight: 600;">🏢 الجهة المرسلة</span>
                    <span style="color: #1e293b; font-size: 14px; font-weight: 700;">${b.name}</span>
                  </div>
                </div>
              </div>
              
              <div style="background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%); border-radius: 16px; padding: 20px; margin-bottom: 25px; border: 1px solid #6ee7b7;">
                <div style="display: flex; align-items: center; gap: 12px; justify-content: center;">
                  <span style="font-size: 24px;">📎</span>
                  <div>
                    <p style="color: #065f46; font-size: 14px; margin: 0; font-weight: 700;">مرفقات</p>
                    <p style="color: #059669; font-size: 13px; margin: 4px 0 0 0;">تم إرفاق ملف PDF بالخطاب الرسمي</p>
                  </div>
                </div>
              </div>
              
              <div style="background: #f8fafc; border-radius: 16px; padding: 20px; text-align: center; border: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px 0;">للاستفسارات والتواصل</p>
                <p style="color: #0078D4; font-size: 15px; font-weight: 700; margin: 0;">info@zoolspeed.com</p>
              </div>
            </div>
            
            <div style="background: #0f172a; padding: 30px 40px; text-align: center;">
              <div style="margin-bottom: 15px;">
                <span style="color: #60a5fa; font-size: 18px; font-weight: 800;">Logistics Systems Pro</span>
                <span style="color: #475569; font-size: 12px; margin-right: 8px;">| نظام إدارة اللوجستيات</span>
              </div>
              <p style="color: #64748b; font-size: 11px; margin: 0 0 8px 0;">\xa9 ${new Date().getFullYear()} جميع الحقوق محفوظة لشركة زول اسبيد للأنشطة المتعددة</p>
              <p style="color: #475569; font-size: 10px; margin: 0;">هذا البريد مرسل من نظام الخطابات الرسمية</p>
            </div>
            
          </div>
        </div>
      </body>
      </html>
    `,m=Buffer.from(g,"base64"),n=(await c.e(5112).then(c.t.bind(c,52731,19))).default.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});return await n.sendMail({from:`"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_FROM}>`,to:d,subject:k,html:l,attachments:[{filename:`${e}.pdf`,content:m,contentType:"application/pdf"}]}),u.NextResponse.json({success:!0,message:"تم إرسال البريد بنجاح"})}catch(a){return console.error("Error sending letter email:",a),u.NextResponse.json({success:!1,error:a.message},{status:500})}}let z=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/letters/send-email/route",pathname:"/api/letters/send-email",filename:"route",bundlePath:"app/api/letters/send-email/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/abdalltifmohammed/orchids-projects/orchids-logistics-react-app/src/app/api/letters/send-email/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:A,workUnitAsyncStorage:B,serverHooks:C}=z;function D(){return(0,g.patchFetch)({workAsyncStorage:A,workUnitAsyncStorage:B})}async function E(a,b,c){var d;let e="/api/letters/send-email/route";"/index"===e&&(e="/");let g=await z.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:y,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(y.dynamicRoutes[E]||y.routes[D]);if(F&&!x){let a=!!y.routes[D],b=y.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||z.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===z.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:y,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>z.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>z.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await z.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await z.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:y,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await z.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,9382,6802,1692],()=>b(b.s=61837));module.exports=c})();