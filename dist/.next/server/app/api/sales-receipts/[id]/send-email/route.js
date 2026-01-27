(()=>{var a={};a.id=9176,a.ids=[9176],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},14985:a=>{"use strict";a.exports=require("dns")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},21820:a=>{"use strict";a.exports=require("os")},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29021:a=>{"use strict";a.exports=require("fs")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},30695:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>C,patchFetch:()=>B,routeModule:()=>x,serverHooks:()=>A,workAsyncStorage:()=>y,workUnitAsyncStorage:()=>z});var d={};c.r(d),c.d(d,{POST:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(35552);async function w(a,{params:b}){try{let{id:d}=await b,{email:e,company_id:f}=await a.json();if(!e||!f)return u.NextResponse.json({error:"بيانات ناقصة"},{status:400});let g=await (0,v.P)(`SELECT sr.*, c.customer_name as system_client_name
       FROM sales_receipts sr
       LEFT JOIN customers c ON sr.client_id = c.id
       WHERE sr.id = ? AND sr.company_id = ?`,[d,f]);if(0===g.length)return u.NextResponse.json({error:"الإيصال غير موجود"},{status:404});let h=g[0],i=h.use_custom_client?h.client_name:h.system_client_name||h.client_name,j=await (0,v.P)("SELECT * FROM sales_receipt_items WHERE receipt_id = ?",[d]),k=(await (0,v.P)("SELECT * FROM companies WHERE id = ?",[f]))[0];if(!k)return u.NextResponse.json({error:"الشركة غير موجودة"},{status:404});let l=`إيصال مبيعات رقم ${h.receipt_number} - ${k.name}`,m=j.map(a=>`
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">${a.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${a.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(a.unit_price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(a.total_with_vat).toFixed(2)}</td>
      </tr>
    `).join(""),n=`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
          .header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; padding: 40px; text-align: center; }
          .content { padding: 40px; }
          .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f1f5f9; padding: 15px; border-radius: 12px; }
          .label { color: #64748b; font-size: 12px; font-weight: bold; margin-bottom: 5px; display: block; }
          .value { color: #1e293b; font-size: 14px; font-weight: 800; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #f8fafc; color: #64748b; font-size: 12px; padding: 12px; text-align: center; border-bottom: 2px solid #e2e8f0; }
          .total-box { margin-top: 30px; background: #0f172a; color: white; padding: 25px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; }
          .footer { padding: 30px; text-align: center; color: #94a3b8; font-size: 11px; border-top: 1px solid #f1f5f9; }
          .brand { color: #3b82f6; font-weight: 900; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 24px;">إيصال مبيعات</h1>
            <p style="margin: 10px 0 0; opacity: 0.7; font-size: 14px;">Sales Receipt</p>
          </div>
          
          <div class="content">
            <div style="text-align: center; margin-bottom: 30px;">
              <h2 style="color: #1e293b; margin: 0;">مرحباً ${i}</h2>
              <p style="color: #64748b; margin: 5px 0;">نرفق لكم تفاصيل إيصال المبيعات الخاص بكم</p>
            </div>

            <div class="info-grid">
              <div class="info-box">
                <span class="label">رقم الإيصال</span>
                <span class="value">${h.receipt_number}</span>
              </div>
              <div class="info-box">
                <span class="label">التاريخ</span>
                <span class="value">${h.receipt_date}</span>
              </div>
            </div>

            <div class="info-box" style="margin-bottom: 30px;">
              <span class="label">المنشأة المصدرة</span>
              <span class="value">${k.name}</span>
              <div style="font-size: 12px; color: #64748b; margin-top: 5px;">الرقم الضريبي: ${k.vat_number}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>البند</th>
                  <th>الكمية</th>
                  <th>السعر</th>
                  <th>الإجمالي</th>
                </tr>
              </thead>
              <tbody>
                ${m||`
                  <tr>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">مبيعات عامة</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">1</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(h.amount).toFixed(2)}</td>
                    <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${Number(h.amount).toFixed(2)}</td>
                  </tr>
                `}
              </tbody>
            </table>

            <div class="total-box">
              <div>
                <span style="font-size: 12px; opacity: 0.7; display: block;">الإجمالي النهائي</span>
                <span style="font-weight: 900;">شامل الضريبة</span>
              </div>
              <div style="text-align: left;">
                <span style="font-size: 28px; font-weight: 900;">${Number(h.total_amount||h.amount).toFixed(2)}</span>
                <span style="font-size: 14px; opacity: 0.7;">ر.س</span>
              </div>
            </div>

            <div style="margin-top: 30px; text-align: center; font-size: 13px; color: #64748b; font-style: italic;">
              نشكركم لتعاملكم معنا. هذا الإيصال تم إنشاؤه إلكترونياً.
            </div>
          </div>

          <div class="footer">
            <div style="margin-bottom: 10px;">
              <span class="brand">Logistics Systems Pro</span>
              <span style="margin: 0 10px;">|</span>
              <span>نظام إدارة الخدمات اللوجستية المتكامل</span>
            </div>
            <p>\xa9 ${new Date().getFullYear()} جميع الحقوق محفوظة لشركة ${k.name}</p>
          </div>
        </div>
      </body>
      </html>
    `,o=(await c.e(5112).then(c.t.bind(c,52731,19))).default.createTransport({host:process.env.SMTP_HOST,port:Number(process.env.SMTP_PORT),secure:"465"===process.env.SMTP_PORT,auth:{user:process.env.SMTP_USER,pass:process.env.SMTP_PASS}});return await o.sendMail({from:`"${k.name}" <${process.env.SMTP_FROM}>`,to:e,subject:l,html:n}),u.NextResponse.json({success:!0})}catch(a){return console.error("Error sending receipt email:",a),u.NextResponse.json({error:a.message},{status:500})}}let x=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/sales-receipts/[id]/send-email/route",pathname:"/api/sales-receipts/[id]/send-email",filename:"route",bundlePath:"app/api/sales-receipts/[id]/send-email/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/abdalltifmohammed/orchids-projects/orchids-logistics-react-app/src/app/api/sales-receipts/[id]/send-email/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:y,workUnitAsyncStorage:z,serverHooks:A}=x;function B(){return(0,g.patchFetch)({workAsyncStorage:y,workUnitAsyncStorage:z})}async function C(a,b,c){var d;let e="/api/sales-receipts/[id]/send-email/route";"/index"===e&&(e="/");let g=await x.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:y,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!y){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||x.isDev||y||(G="/index"===(G=D)?"/":G);let H=!0===x.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>x.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>x.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await x.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await x.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),y&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await x.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},33873:a=>{"use strict";a.exports=require("path")},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(29382).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},55591:a=>{"use strict";a.exports=require("https")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},79646:a=>{"use strict";a.exports=require("child_process")},81630:a=>{"use strict";a.exports=require("http")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,9382,1692],()=>b(b.s=30695));module.exports=c})();