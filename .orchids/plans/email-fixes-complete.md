# Email System Fixes - Complete Plan

## Requirements

إصلاح واجهة البريد الإلكتروني مع 4 متطلبات رئيسية:

1. **إصلاح التمرير (Scroll)** - قوائم الرسائل والمجلدات لا تستجيب للتمرير
2. **إظهار نص الرسائل والوقت** - الرسائل تظهر بدون النص المختصر والوقت
3. **إمكانية إرسال بريد إلكتروني** - واجهة مبسطة (To, Subject, Body فقط)
4. **إشعارات البريد الجديد** - عند فتح واجهة البريد: صوت + إشعار منبثق + تحديث تلقائي

## Current State Analysis

### Files Involved
- `components/layout/header.tsx` - واجهة البريد الإلكتروني (lines 2340-2690)
- `app/api/email/fetch/route.ts` - API جلب الرسائل
- `app/api/email/send/route.ts` - API إرسال البريد (موجود ويعمل)

### Current Issues

1. **Scrolling Problem**
   - Line 2628: `<div className="flex-1 overflow-y-auto p-4 space-y-3">` - should work but parent may block
   - Parent container at line 2418: `<div className="flex-1 flex overflow-hidden">` - correct
   - Issue: `flex-1` without explicit height constraints can cause scroll issues

2. **Missing Text/Time**
   - Line 2662: `{email.snippet && <p>...` - snippet is always empty (headers-only fetch)
   - Line 2657-2659: Date shows only date, not time

3. **No Compose Email UI**
   - `app/api/email/send/route.ts` exists and works
   - No compose modal/form in the frontend

4. **No New Email Notifications**
   - No polling mechanism when email modal is open
   - No notification sound or popup

## Implementation Phases

### Phase 1: Fix Scrolling Issues
**File: `components/layout/header.tsx`**

1. Add proper height constraints to email modal content area
2. Fix flex container hierarchy:
   ```tsx
   // Line ~2418 - ensure proper height inheritance
   <div className="flex-1 flex overflow-hidden min-h-0">
   ```
3. Add `min-h-0` to parent flex containers (critical for flex + overflow scroll)
4. Fix folders section overflow at line 2464

### Phase 2: Fix Email Display (Text & Time)
**File: `components/layout/header.tsx`**

1. Update date display to show time:
   ```tsx
   // Line 2657-2659, change from:
   {new Date(email.date).toLocaleDateString('en-US')}
   // To:
   {new Date(email.date).toLocaleString('ar-SA', { 
     day: 'numeric', 
     month: 'short', 
     hour: '2-digit', 
     minute: '2-digit' 
   })}
   ```

2. Generate snippet from subject if empty (fallback):
   ```tsx
   // Show subject as preview or placeholder text
   {email.snippet || (isRTL ? 'اضغط لعرض الرسالة' : 'Click to view message')}
   ```

### Phase 3: Add Compose Email Feature
**File: `components/layout/header.tsx`**

1. Add state variables:
   ```tsx
   const [showCompose, setShowCompose] = useState(false);
   const [sendingEmail, setSendingEmail] = useState(false);
   const [composeData, setComposeData] = useState({to: '', subject: '', body: ''});
   ```

2. Add compose button in header toolbar (after refresh button, line ~2406):
   ```tsx
   <motion.button
     onClick={() => setShowCompose(true)}
     className="p-2.5 bg-blue-500 text-white rounded-xl..."
   >
     <Edit3 size={20} />
   </motion.button>
   ```

3. Add compose form UI (simple modal or slide panel):
   - To field (required)
   - Subject field (required)
   - Body textarea (with basic formatting)
   - Send button

4. Add send handler:
   ```tsx
   const handleSendEmail = async () => {
     if (!selectedEmailAccount || !composeData.to || !composeData.subject) return;
     setSendingEmail(true);
     try {
       const res = await fetch('/api/email/send', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({
           accountId: selectedEmailAccount.id,
           company_id: user?.company_id,
           to: composeData.to,
           subject: composeData.subject,
           body: composeData.body
         })
       });
       const data = await res.json();
       if (data.success) {
         toast.success('تم إرسال البريد بنجاح');
         setShowCompose(false);
         setComposeData({to: '', subject: '', body: ''});
       } else {
         toast.error(data.error);
       }
     } catch (error) {
       toast.error('خطأ في إرسال البريد');
     } finally {
       setSendingEmail(false);
     }
   };
   ```

### Phase 4: New Email Notifications (When Modal Open)
**File: `components/layout/header.tsx`**

1. Add notification state:
   ```tsx
   const [lastEmailCount, setLastEmailCount] = useState(0);
   const [newEmailAlert, setNewEmailAlert] = useState<{show: boolean, count: number}>({show: false, count: 0});
   const notificationAudioRef = useRef<HTMLAudioElement | null>(null);
   ```

2. Add notification sound (use simple chime):
   ```tsx
   // In useEffect or component mount
   notificationAudioRef.current = new Audio('/sounds/email-notification.mp3');
   // Or use Web Audio API for embedded sound
   ```

3. Add polling when modal is open:
   ```tsx
   useEffect(() => {
     if (!showEmailModal || !selectedEmailAccount) return;
     
     const checkNewEmails = async () => {
       try {
         const res = await fetch(`/api/email/fetch?accountId=${selectedEmailAccount.id}&company_id=${user?.company_id}&action=unread`);
         const data = await res.json();
         const newCount = data.unreadCount || 0;
         
         if (lastEmailCount > 0 && newCount > lastEmailCount) {
           // New email arrived!
           const diff = newCount - lastEmailCount;
           setNewEmailAlert({ show: true, count: diff });
           notificationAudioRef.current?.play();
           
           // Auto-hide after 5 seconds
           setTimeout(() => setNewEmailAlert({ show: false, count: 0 }), 5000);
           
           // Refresh email list
           fetchEmails(selectedEmailAccount.id, activeEmailFolder);
         }
         setLastEmailCount(newCount);
       } catch (e) {}
     };
     
     checkNewEmails(); // Initial check
     const interval = setInterval(checkNewEmails, 30000); // Every 30 seconds
     return () => clearInterval(interval);
   }, [showEmailModal, selectedEmailAccount, lastEmailCount]);
   ```

4. Add popup notification UI:
   ```tsx
   <AnimatePresence>
     {newEmailAlert.show && (
       <motion.div
         initial={{ opacity: 0, y: -20, scale: 0.9 }}
         animate={{ opacity: 1, y: 0, scale: 1 }}
         exit={{ opacity: 0, y: -20, scale: 0.9 }}
         className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-blue-500 text-white px-6 py-3 rounded-2xl shadow-xl flex items-center gap-3"
       >
         <Bell size={20} />
         <span className="font-bold">
           {newEmailAlert.count} {isRTL ? 'رسالة جديدة!' : 'new email(s)!'}
         </span>
       </motion.div>
     )}
   </AnimatePresence>
   ```

5. Add sound file or embed sound:
   - Option A: Add `/public/sounds/email-notification.mp3`
   - Option B: Use embedded base64 audio or Web Audio API

## Technical Notes

### Scroll Fix Pattern
```tsx
// Parent: flex-1 + flex + overflow-hidden + min-h-0
<div className="flex-1 flex overflow-hidden min-h-0">
  // Sidebar: shrink-0 + overflow-y-auto
  <div className="w-64 shrink-0 overflow-y-auto">...</div>
  // Content: flex-1 + flex-col + min-h-0
  <div className="flex-1 flex flex-col min-h-0">
    // Scrollable list: flex-1 + overflow-y-auto
    <div className="flex-1 overflow-y-auto">...</div>
  </div>
</div>
```

### Sound Notification
Use embedded short chime sound via data URI to avoid needing external file:
```tsx
const playNotificationSound = () => {
  const audio = new Audio('data:audio/mp3;base64,//uQx...');
  audio.volume = 0.5;
  audio.play();
};
```

## Dependencies

- `Edit3` icon from lucide-react (for compose button)
- `Bell` icon from lucide-react (for notification popup)
- Toast notifications (already imported)

## Testing Checklist

- [ ] Scroll works in message list (INBOX with 30+ emails)
- [ ] Scroll works in folders sidebar
- [ ] Email cards show date + time
- [ ] Email cards show placeholder text for snippet
- [ ] Compose email button visible in toolbar
- [ ] Compose form opens and closes properly
- [ ] Send email works (test with real email)
- [ ] When modal open, new email triggers notification sound
- [ ] Popup shows "X رسالة جديدة!" and auto-hides
- [ ] Email list auto-refreshes after new email notification
