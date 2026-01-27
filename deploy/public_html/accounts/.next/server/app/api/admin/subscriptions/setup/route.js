(()=>{var a={};a.id=9034,a.ids=[9034],a.modules={261:a=>{"use strict";a.exports=require("next/dist/shared/lib/router/utils/app-paths")},3295:a=>{"use strict";a.exports=require("next/dist/server/app-render/after-task-async-storage.external.js")},10846:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},19121:a=>{"use strict";a.exports=require("next/dist/server/app-render/action-async-storage.external.js")},19771:a=>{"use strict";a.exports=require("process")},27910:a=>{"use strict";a.exports=require("stream")},28303:a=>{function b(a){var b=Error("Cannot find module '"+a+"'");throw b.code="MODULE_NOT_FOUND",b}b.keys=()=>[],b.resolve=b,b.id=28303,a.exports=b},28354:a=>{"use strict";a.exports=require("util")},29294:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-async-storage.external.js")},29898:(a,b,c)=>{"use strict";c.r(b),c.d(b,{handler:()=>D,patchFetch:()=>C,routeModule:()=>y,serverHooks:()=>B,workAsyncStorage:()=>z,workUnitAsyncStorage:()=>A});var d={};c.r(d),c.d(d,{GET:()=>x,POST:()=>w});var e=c(95736),f=c(9117),g=c(4044),h=c(39326),i=c(32324),j=c(261),k=c(54290),l=c(85328),m=c(38928),n=c(46595),o=c(3421),p=c(17679),q=c(41681),r=c(63446),s=c(86439),t=c(51356),u=c(10641),v=c(35552);async function w(){try{await (0,v.g7)(`
      CREATE TABLE IF NOT EXISTS subscription_plans (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        name_en VARCHAR(255),
        description TEXT,
        description_en TEXT,
        price DECIMAL(10, 2) NOT NULL DEFAULT 0,
        duration_value INT NOT NULL DEFAULT 1,
        duration_unit ENUM('days', 'months', 'years') NOT NULL DEFAULT 'months',
        trial_days INT DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        features JSON,
        services JSON,
        include_all_services TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `),await (0,v.g7)(`
      CREATE TABLE IF NOT EXISTS admin_bank_accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        bank_name VARCHAR(255) NOT NULL,
        account_holder VARCHAR(255) NOT NULL,
        account_number VARCHAR(100),
        iban VARCHAR(100) NOT NULL,
        logo_path VARCHAR(500),
        is_active TINYINT(1) DEFAULT 1,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `),await (0,v.g7)(`
      CREATE TABLE IF NOT EXISTS company_subscriptions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        plan_id INT NOT NULL,
        subscription_code VARCHAR(50) UNIQUE,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        status ENUM('active', 'expired', 'cancelled', 'pending') DEFAULT 'active',
        amount_paid DECIMAL(10, 2) DEFAULT 0,
        payment_method VARCHAR(100),
        is_manual_assignment TINYINT(1) DEFAULT 0,
        assigned_by INT,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (company_id),
        INDEX idx_plan (plan_id),
        INDEX idx_status (status),
        INDEX idx_end_date (end_date)
      )
    `),await (0,v.g7)(`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        company_id INT NOT NULL,
        plan_id INT NOT NULL,
        bank_account_id INT,
        amount DECIMAL(10, 2) NOT NULL,
        receipt_image VARCHAR(500),
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        rejection_reason TEXT,
        processed_by INT,
        processed_at TIMESTAMP NULL,
        subscription_id INT,
        request_type ENUM('new', 'renewal', 'upgrade') DEFAULT 'new',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_company (company_id),
        INDEX idx_status (status),
        INDEX idx_plan (plan_id)
      )
    `),await (0,v.g7)(`
      CREATE TABLE IF NOT EXISTS plan_permissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        plan_id INT NOT NULL,
        permission_key VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_plan_permission (plan_id, permission_key),
        INDEX idx_plan (plan_id)
      )
    `);let a=(await (0,v.P)("SHOW COLUMNS FROM companies")).map(a=>a.Field);a.includes("current_subscription_id")||await (0,v.g7)("ALTER TABLE companies ADD COLUMN current_subscription_id INT DEFAULT NULL"),a.includes("subscription_end_date")||await (0,v.g7)("ALTER TABLE companies ADD COLUMN subscription_end_date DATE DEFAULT NULL"),a.includes("is_subscription_active")||await (0,v.g7)("ALTER TABLE companies ADD COLUMN is_subscription_active TINYINT(1) DEFAULT 0");let b=(await (0,v.P)("SHOW COLUMNS FROM payment_requests")).map(a=>a.Field);b.includes("processed_by")||await (0,v.g7)("ALTER TABLE payment_requests ADD COLUMN processed_by INT AFTER rejection_reason"),b.includes("processed_at")||await (0,v.g7)("ALTER TABLE payment_requests ADD COLUMN processed_at TIMESTAMP NULL AFTER processed_by"),b.includes("subscription_id")||await (0,v.g7)("ALTER TABLE payment_requests ADD COLUMN subscription_id INT AFTER processed_at"),b.includes("request_type")||await (0,v.g7)("ALTER TABLE payment_requests ADD COLUMN request_type ENUM('new', 'renewal', 'upgrade') DEFAULT 'new' AFTER subscription_id"),b.includes("notes")||await (0,v.g7)("ALTER TABLE payment_requests ADD COLUMN notes TEXT");let c=(await (0,v.P)("SHOW COLUMNS FROM company_subscriptions")).map(a=>a.Field);c.includes("notes")||await (0,v.g7)("ALTER TABLE company_subscriptions ADD COLUMN notes TEXT"),c.includes("assigned_by")||await (0,v.g7)("ALTER TABLE company_subscriptions ADD COLUMN assigned_by INT"),c.includes("is_manual_assignment")||await (0,v.g7)("ALTER TABLE company_subscriptions ADD COLUMN is_manual_assignment TINYINT(1) DEFAULT 0");let d=(await (0,v.P)("SHOW COLUMNS FROM subscription_plans")).map(a=>a.Field);d.includes("trial_days")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN trial_days INT DEFAULT 0"),d.includes("include_all_services")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN include_all_services TINYINT(1) DEFAULT 1"),d.includes("name_en")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN name_en VARCHAR(255)"),d.includes("description_en")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN description_en TEXT"),d.includes("features")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN features JSON"),d.includes("services")||await (0,v.g7)("ALTER TABLE subscription_plans ADD COLUMN services JSON");let e=await (0,v.P)("SELECT id FROM subscription_plans LIMIT 1");return 0===e.length&&await (0,v.g7)(`
        INSERT INTO subscription_plans (name, name_en, description, description_en, price, duration_value, duration_unit, trial_days, is_active, include_all_services, sort_order)
        VALUES 
          ('الباقة التجريبية', 'Trial Plan', 'جرب النظام مجاناً لمدة 7 أيام', 'Try the system free for 7 days', 0, 7, 'days', 0, 1, 1, 1),
          ('الباقة الأساسية', 'Basic Plan', 'باقة مناسبة للشركات الصغيرة', 'Suitable for small businesses', 299, 1, 'months', 0, 1, 1, 2),
          ('الباقة الاحترافية', 'Professional Plan', 'باقة متكاملة للشركات المتوسطة', 'Complete package for medium businesses', 599, 1, 'months', 0, 1, 1, 3),
          ('الباقة المؤسسية', 'Enterprise Plan', 'باقة شاملة للمؤسسات الكبيرة', 'Comprehensive package for large enterprises', 999, 1, 'months', 0, 1, 1, 4),
          ('الباقة السنوية', 'Annual Plan', 'وفر 20% مع الاشتراك السنوي', 'Save 20% with annual subscription', 5999, 1, 'years', 0, 1, 1, 5)
      `),u.NextResponse.json({success:!0,message:"تم إعداد جداول نظام الاشتراكات بنجاح"})}catch(a){return console.error("Error setting up subscription tables:",a),u.NextResponse.json({success:!1,error:a.message||"فشل في إعداد الجداول"},{status:500})}}async function x(){try{let a={};for(let b of["subscription_plans","admin_bank_accounts","company_subscriptions","payment_requests","plan_permissions"])try{await (0,v.P)(`SELECT 1 FROM ${b} LIMIT 1`),a[b]=!0}catch{a[b]=!1}return u.NextResponse.json({success:!0,tables:a})}catch(a){return u.NextResponse.json({success:!1,error:a.message},{status:500})}}let y=new e.AppRouteRouteModule({definition:{kind:f.RouteKind.APP_ROUTE,page:"/api/admin/subscriptions/setup/route",pathname:"/api/admin/subscriptions/setup",filename:"route",bundlePath:"app/api/admin/subscriptions/setup/route"},distDir:".next",relativeProjectDir:"",resolvedPagePath:"/Users/abdalltifmohammed/orchids-projects/orchids-logistics-react-app/src/app/api/admin/subscriptions/setup/route.ts",nextConfigOutput:"standalone",userland:d}),{workAsyncStorage:z,workUnitAsyncStorage:A,serverHooks:B}=y;function C(){return(0,g.patchFetch)({workAsyncStorage:z,workUnitAsyncStorage:A})}async function D(a,b,c){var d;let e="/api/admin/subscriptions/setup/route";"/index"===e&&(e="/");let g=await y.prepare(a,b,{srcPage:e,multiZoneDraftMode:!1});if(!g)return b.statusCode=400,b.end("Bad Request"),null==c.waitUntil||c.waitUntil.call(c,Promise.resolve()),null;let{buildId:u,params:v,nextConfig:w,isDraftMode:x,prerenderManifest:z,routerServerContext:A,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,resolvedPathname:D}=g,E=(0,j.normalizeAppPath)(e),F=!!(z.dynamicRoutes[E]||z.routes[D]);if(F&&!x){let a=!!z.routes[D],b=z.dynamicRoutes[E];if(b&&!1===b.fallback&&!a)throw new s.NoFallbackError}let G=null;!F||y.isDev||x||(G="/index"===(G=D)?"/":G);let H=!0===y.isDev||!F,I=F&&!H,J=a.method||"GET",K=(0,i.getTracer)(),L=K.getActiveScopeSpan(),M={params:v,prerenderManifest:z,renderOpts:{experimental:{cacheComponents:!!w.experimental.cacheComponents,authInterrupts:!!w.experimental.authInterrupts},supportsDynamicResponse:H,incrementalCache:(0,h.getRequestMeta)(a,"incrementalCache"),cacheLifeProfiles:null==(d=w.experimental)?void 0:d.cacheLife,isRevalidate:I,waitUntil:c.waitUntil,onClose:a=>{b.on("close",a)},onAfterTaskError:void 0,onInstrumentationRequestError:(b,c,d)=>y.onRequestError(a,b,d,A)},sharedContext:{buildId:u}},N=new k.NodeNextRequest(a),O=new k.NodeNextResponse(b),P=l.NextRequestAdapter.fromNodeNextRequest(N,(0,l.signalFromNodeResponse)(b));try{let d=async c=>y.handle(P,M).finally(()=>{if(!c)return;c.setAttributes({"http.status_code":b.statusCode,"next.rsc":!1});let d=K.getRootSpanAttributes();if(!d)return;if(d.get("next.span_type")!==m.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${d.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let e=d.get("next.route");if(e){let a=`${J} ${e}`;c.setAttributes({"next.route":e,"http.route":e,"next.span_name":a}),c.updateName(a)}else c.updateName(`${J} ${a.url}`)}),g=async g=>{var i,j;let k=async({previousCacheEntry:f})=>{try{if(!(0,h.getRequestMeta)(a,"minimalMode")&&B&&C&&!f)return b.statusCode=404,b.setHeader("x-nextjs-cache","REVALIDATED"),b.end("This page could not be found"),null;let e=await d(g);a.fetchMetrics=M.renderOpts.fetchMetrics;let i=M.renderOpts.pendingWaitUntil;i&&c.waitUntil&&(c.waitUntil(i),i=void 0);let j=M.renderOpts.collectedTags;if(!F)return await (0,o.I)(N,O,e,M.renderOpts.pendingWaitUntil),null;{let a=await e.blob(),b=(0,p.toNodeOutgoingHttpHeaders)(e.headers);j&&(b[r.NEXT_CACHE_TAGS_HEADER]=j),!b["content-type"]&&a.type&&(b["content-type"]=a.type);let c=void 0!==M.renderOpts.collectedRevalidate&&!(M.renderOpts.collectedRevalidate>=r.INFINITE_CACHE)&&M.renderOpts.collectedRevalidate,d=void 0===M.renderOpts.collectedExpire||M.renderOpts.collectedExpire>=r.INFINITE_CACHE?void 0:M.renderOpts.collectedExpire;return{value:{kind:t.CachedRouteKind.APP_ROUTE,status:e.status,body:Buffer.from(await a.arrayBuffer()),headers:b},cacheControl:{revalidate:c,expire:d}}}}catch(b){throw(null==f?void 0:f.isStale)&&await y.onRequestError(a,b,{routerKind:"App Router",routePath:e,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})},A),b}},l=await y.handleResponse({req:a,nextConfig:w,cacheKey:G,routeKind:f.RouteKind.APP_ROUTE,isFallback:!1,prerenderManifest:z,isRoutePPREnabled:!1,isOnDemandRevalidate:B,revalidateOnlyGenerated:C,responseGenerator:k,waitUntil:c.waitUntil});if(!F)return null;if((null==l||null==(i=l.value)?void 0:i.kind)!==t.CachedRouteKind.APP_ROUTE)throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${null==l||null==(j=l.value)?void 0:j.kind}`),"__NEXT_ERROR_CODE",{value:"E701",enumerable:!1,configurable:!0});(0,h.getRequestMeta)(a,"minimalMode")||b.setHeader("x-nextjs-cache",B?"REVALIDATED":l.isMiss?"MISS":l.isStale?"STALE":"HIT"),x&&b.setHeader("Cache-Control","private, no-cache, no-store, max-age=0, must-revalidate");let m=(0,p.fromNodeOutgoingHttpHeaders)(l.value.headers);return(0,h.getRequestMeta)(a,"minimalMode")&&F||m.delete(r.NEXT_CACHE_TAGS_HEADER),!l.cacheControl||b.getHeader("Cache-Control")||m.get("Cache-Control")||m.set("Cache-Control",(0,q.getCacheControlHeader)(l.cacheControl)),await (0,o.I)(N,O,new Response(l.value.body,{headers:m,status:l.value.status||200})),null};L?await g(L):await K.withPropagatedContext(a.headers,()=>K.trace(m.BaseServerSpan.handleRequest,{spanName:`${J} ${a.url}`,kind:i.SpanKind.SERVER,attributes:{"http.method":J,"http.target":a.url}},g))}catch(b){if(b instanceof s.NoFallbackError||await y.onRequestError(a,b,{routerKind:"App Router",routePath:E,routeType:"route",revalidateReason:(0,n.c)({isRevalidate:I,isOnDemandRevalidate:B})}),F)throw b;return await (0,o.I)(N,O,new Response(null,{status:500})),null}}},34631:a=>{"use strict";a.exports=require("tls")},35552:(a,b,c)=>{"use strict";c.d(b,{P:()=>f,g7:()=>g});let d=c(29382).createPool({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,database:process.env.DB_NAME,waitForConnections:!0,connectionLimit:10,queueLimit:0,enableKeepAlive:!0,keepAliveInitialDelay:1e4,idleTimeout:6e4,maxIdle:10});async function e(a,b=3){let c;for(let d=0;d<b;d++)try{return await a()}catch(a){if(c=a,("PROTOCOL_CONNECTION_LOST"===a.code||"EPIPE"===a.code||"ECONNRESET"===a.code||!0===a.fatal)&&d<b-1){let a=500*Math.pow(2,d);await new Promise(b=>setTimeout(b,a));continue}throw a}throw c}async function f(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}async function g(a,b=[]){let c=b.map(a=>void 0===a?null:a);return e(async()=>{let[b]=await d.execute(a,c);return b})}d.on("error",a=>{console.error("Unexpected error on idle database connection",a)})},41204:a=>{"use strict";a.exports=require("string_decoder")},44870:a=>{"use strict";a.exports=require("next/dist/compiled/next-server/app-route.runtime.prod.js")},55511:a=>{"use strict";a.exports=require("crypto")},63033:a=>{"use strict";a.exports=require("next/dist/server/app-render/work-unit-async-storage.external.js")},66136:a=>{"use strict";a.exports=require("timers")},74075:a=>{"use strict";a.exports=require("zlib")},78335:()=>{},79428:a=>{"use strict";a.exports=require("buffer")},79551:a=>{"use strict";a.exports=require("url")},86439:a=>{"use strict";a.exports=require("next/dist/shared/lib/no-fallback-error.external")},91645:a=>{"use strict";a.exports=require("net")},94735:a=>{"use strict";a.exports=require("events")},96487:()=>{}};var b=require("../../../../../webpack-runtime.js");b.C(a);var c=b.X(0,[4586,9382,1692],()=>b(b.s=29898));module.exports=c})();