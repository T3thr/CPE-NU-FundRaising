# ⚙️ Phase 3: Automation - เอกสารสรุปการพัฒนา

**Project:** ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ (CPE Funds Hub)  
**Phase:** 3 - Automation (ระบบอัตโนมัติ)  
**Last Updated:** 2026-01-08

---

## 📋 ภาพรวม Phase 3

Phase 3 เน้นการเชื่อมต่อ External Services และสร้างระบบอัตโนมัติ ประกอบด้วย EasySlip Integration, Line Messaging API, Cron Jobs, และ Storage Management

---

## 🔗 External Services ที่เชื่อมต่อ

| Service                | วัตถุประสงค์            | Free Tier          |
| ---------------------- | ----------------------- | ------------------ |
| **EasySlip**           | ตรวจสอบ Slip อัตโนมัติ  | 50 ครั้ง/สัปดาห์   |
| **Line Messaging API** | แจ้งเตือนผู้ดูแล (2026) | Free tier มี limit |
| **Supabase Storage**   | เก็บไฟล์ Slip           | 1GB                |
| **Vercel Cron**        | งานตั้งเวลา             | Hobby: 2 jobs/day  |

---

## 📁 ไฟล์ที่สร้าง/แก้ไขใน Phase 3

### 1. Server Actions - EasySlip

#### `src/actions/easyslip.actions.ts`

```
src: src/actions/easyslip.actions.ts
```

**Functions:**

| Function                 | คำอธิบาย                             |
| ------------------------ | ------------------------------------ |
| `isEasySlipEnabled()`    | ตรวจสอบว่า API Key ถูกตั้งค่าหรือไม่ |
| `verifySlipByImage()`    | ตรวจสอบ Slip ด้วยรูปภาพ (Base64)     |
| `verifySlipByTransRef()` | ตรวจสอบ Slip ด้วยเลขอ้างอิง          |
| `validateSlipData()`     | ตรวจสอบข้อมูล Slip กับค่าที่คาดหวัง  |
| `getEasySlipQuota()`     | ดูโควต้าที่เหลือ                     |

**Response Format:**

```typescript
interface EasySlipResponse {
  success: boolean;
  data?: {
    transRef: string;
    amount: number;
    date: string;
    sender: { name: string; account: string };
    receiver: { name: string; account: string };
  };
  error?: string;
}
```

**Validation Logic:**

```typescript
// ตรวจสอบจำนวนเงิน (อนุญาต ±1 บาท)
if (Math.abs(slipData.amount - expectedAmount) > 1) {
  errors.push("จำนวนเงินไม่ตรง");
}

// ตรวจสอบบัญชีปลายทาง (เลข 4 ตัวท้าย)
if (expectedLast4 !== receivedLast4) {
  errors.push("บัญชีปลายทางไม่ตรง");
}

// ตรวจสอบว่า Slip ไม่เก่ากว่า 7 วัน
if (daysDiff > 7) {
  errors.push("Slip เก่าเกินไป");
}
```

---

### 2. Server Actions - Line Messaging API (2026)

> ⚠️ **หมายเหตุ:** Line Notify หยุดให้บริการ มี.ค. 2025 ใช้ Line Messaging API แทน

#### `src/actions/line-messaging.actions.ts`

```
src: src/actions/line-messaging.actions.ts
```

**Functions:**

| Function                   | คำอธิบาย                              |
| -------------------------- | ------------------------------------- |
| `isLineMessagingEnabled()` | ตรวจสอบว่า Token ถูกตั้งค่าหรือไม่    |
| `sendLineMessage()`        | ส่งข้อความแจ้งเตือน                   |
| `notifyNewPayment()`       | แจ้งเตือนเมื่อมีการชำระใหม่ (Flex)    |
| `notifyPaymentVerified()`  | แจ้งเตือนเมื่อยืนยันการชำระ (Flex)    |
| `notifyPaymentRejected()`  | แจ้งเตือนเมื่อปฏิเสธการชำระ (Flex)    |
| `notifyMonthlyReminder()`  | แจ้งเตือนประจำเดือน (สมาชิกค้างชำระ)  |
| `notifyQuotaWarning()`     | แจ้งเตือนเมื่อโควต้า EasySlip ใกล้หมด |
| `notifyDailySummary()`     | สรุปประจำวัน                          |
| `getLineStatus()`          | ดูสถานะ (group/user)                  |

**ตัวอย่าง Message:**

```
💰 แจ้งชำระเงินใหม่!

👤 สมชาย ใจดี (65310001)
💵 จำนวน: 70 บาท
📅 เดือน: ม.ค.
⏰ เวลา: 8/1/2569 16:30

กรุณาตรวจสอบ Slip ในระบบ
```

---

### 3. API Routes

#### EasySlip Verify - `src/app/api/easyslip/verify/route.ts`

```
src: src/app/api/easyslip/verify/route.ts
```

**Endpoints:**

| Method | คำอธิบาย                          |
| ------ | --------------------------------- |
| `POST` | ตรวจสอบ Slip + Validate + Notify  |
| `GET`  | ดูสถานะ EasySlip (enabled, quota) |

**POST Request:**

```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "expectedAmount": 70,
  "expectedAccountNo": "1931905372",
  "studentId": "65310001",
  "studentName": "สมชาย ใจดี",
  "month": "ม.ค."
}
```

**POST Response:**

```json
{
  "success": true,
  "autoVerified": true,
  "data": {
    "transRef": "2024011512345678",
    "amount": 70,
    "sender": "นาย สมชาย ใ***"
  },
  "validation": {
    "valid": true,
    "errors": []
  },
  "requiresManualReview": false
}
```

---

#### Line Messaging - `src/app/api/line-messaging/route.ts`

```
src: src/app/api/line-messaging/route.ts
```

**Endpoints:**

| Method | คำอธิบาย                    |
| ------ | --------------------------- |
| `POST` | ส่งแจ้งเตือนตาม action type |
| `GET`  | ดูสถานะ Line Messaging API  |

**POST Request:**

```json
{
  "action": "new_payment",
  "data": {
    "studentId": "65310001",
    "studentName": "สมชาย ใจดี",
    "amount": 70,
    "month": "ม.ค."
  }
}
```

**Action Types:**

- `new_payment` - แจ้งเตือนการชำระใหม่
- `verified` - แจ้งเตือนยืนยันแล้ว
- `rejected` - แจ้งเตือนปฏิเสธ
- `monthly_reminder` - แจ้งเตือนประจำเดือน
- `quota_warning` - เตือนโควต้าใกล้หมด
- `daily_summary` - สรุปประจำวัน
- `custom` - ข้อความกำหนดเอง

---

#### Monthly Cron - `src/app/api/cron/monthly/route.ts`

```
src: src/app/api/cron/monthly/route.ts
```

**Schedule:** ทุกวันที่ 1 เวลา 00:00 UTC (07:00 Thailand)

**Logic:**

1. ดึง Active Cohorts ทั้งหมด
2. สำหรับแต่ละ Cohort:
   - ดึง Active Members
   - ดึง Verified Payments เดือนปัจจุบัน
   - หา Unpaid Members
   - ส่ง Line Notify (ถ้ามีคนค้างชำระ)
3. Return สรุปผล

**Response:**

```json
{
  "success": true,
  "executedAt": "2026-01-01T00:00:00Z",
  "results": [
    {
      "cohortId": "xxx",
      "cohortName": "CPE36",
      "totalMembers": 68,
      "unpaidCount": 12,
      "paidCount": 56,
      "totalUnpaidAmount": 840
    }
  ],
  "summary": {
    "totalCohorts": 1,
    "totalUnpaid": 12,
    "totalAmount": 840
  }
}
```

---

#### Daily Cron - `src/app/api/cron/daily/route.ts`

```
src: src/app/api/cron/daily/route.ts
```

**Schedule:** ทุกวัน เวลา 13:00 UTC (20:00 Thailand)

**Logic:**

1. ดึง Payments ของวันนี้
2. แยกตาม status (verified, pending, rejected)
3. ส่ง Line Notify สรุป

---

#### File Upload - `src/app/api/upload/route.ts`

```
src: src/app/api/upload/route.ts
```

**Endpoints:**

| Method   | คำอธิบาย         |
| -------- | ---------------- |
| `POST`   | อัปโหลดไฟล์ Slip |
| `DELETE` | ลบไฟล์ Slip      |

**POST Request:** FormData

- `file` - ไฟล์รูปภาพ
- `cohortId` - ID ของรุ่น
- `memberId` - ID ของสมาชิก

**Validation:**

- ประเภท: JPEG, PNG, WebP
- ขนาด: ไม่เกิน 5MB

**File Path Structure:**

```
slips/{cohortId}/{memberId}/{timestamp}.{extension}
```

---

### 4. Storage Service

#### `src/utils/supabase/storage.ts`

```
src: src/utils/supabase/storage.ts
```

**Functions:**

| Function                 | คำอธิบาย                       |
| ------------------------ | ------------------------------ |
| `uploadSlip()`           | อัปโหลดไฟล์ Slip (File object) |
| `uploadSlipFromBase64()` | อัปโหลดจาก Base64 string       |
| `deleteSlip()`           | ลบไฟล์ Slip                    |
| `getSlipSignedUrl()`     | สร้าง signed URL สำหรับดู      |
| `listMemberSlips()`      | แสดงรายการ Slips ของสมาชิก     |
| `getStorageStats()`      | สถิติการใช้ storage            |
| `fileToBase64()`         | แปลง File เป็น Base64          |
| `validateSlipFile()`     | ตรวจสอบไฟล์ก่อนอัปโหลด         |

---

### 5. Payment Service (Full Flow)

#### `src/services/payment.service.ts`

```
src: src/services/payment.service.ts
```

**Functions:**

| Function                          | คำอธิบาย                 |
| --------------------------------- | ------------------------ |
| `submitPaymentWithVerification()` | Flow การชำระเต็มรูปแบบ   |
| `verifyPayment()`                 | ยืนยันการชำระ (manual)   |
| `rejectPayment()`                 | ปฏิเสธการชำระ            |
| `bulkVerifyPayments()`            | ยืนยันหลายรายการพร้อมกัน |
| `getMemberPaymentStatus()`        | ดูสถานะการชำระของสมาชิก  |

**Full Payment Flow:**

```
1. Find Member → by student ID
2. Get Cohort Settings → monthly_fee, penalty_fee
3. Get Org Bank Details → for validation
4. Calculate Expected Amount → with lump sum logic
5. Upload Slip → to Supabase Storage
6. Verify Slip → with EasySlip API
7. Validate Slip Data → amount, account, date
8. Create Payment Records → for each month
9. Send Notifications → Line Notify
10. Return Result → success/error
```

---

### 6. Admin Settings Page

#### `src/app/(admin)/admin/settings/page.tsx`

```
src: src/app/(admin)/admin/settings/page.tsx
src: src/app/(admin)/admin/settings/_components/SettingsContent.tsx
```

**Features:**

**Service Status Cards:**

- EasySlip: แสดงสถานะ, โควต้า (used/remaining)
- Line Notify: แสดงสถานะ, ปุ่มทดสอบ

**Payment Settings Form:**

- ค่าธรรมเนียมรายเดือน (บาท)
- ค่าปรับล่าช้า (บาท/เดือน)
- เดือนเริ่มต้นปีการศึกษา
- ปีการศึกษา (พ.ศ.)

**Feature Toggles:**

- ตรวจสอบ Slip อัตโนมัติ
- แจ้งเตือน Line

**Cron Jobs Status:**

- แจ้งเตือนประจำเดือน (ทุกวันที่ 1)
- สรุปประจำวัน (ทุกวัน 20:00)

---

### 7. Vercel Configuration

#### `vercel.json`

```
src: vercel.json
```

**Cron Jobs Configuration:**

```json
{
  "crons": [
    {
      "path": "/api/cron/monthly",
      "schedule": "0 0 1 * *"
    },
    {
      "path": "/api/cron/daily",
      "schedule": "0 13 * * *"
    }
  ]
}
```

**Schedule Format (UTC):**

- `0 0 1 * *` = วันที่ 1 ของทุกเดือน เวลา 00:00 UTC (07:00 TH)
- `0 13 * * *` = ทุกวัน เวลา 13:00 UTC (20:00 TH)

---

### 8. Updated Environment Variables

#### `.env.example` (เพิ่มเติม)

```
# External Services
EASYSLIP_API_KEY=            # สำหรับ EasySlip API
LINE_CHANNEL_ACCESS_TOKEN=   # สำหรับ Line Messaging API
LINE_CHANNEL_SECRET=         # Channel secret
LINE_GROUP_ID=               # Group ID สำหรับแจ้งเตือน

# Cron Security
CRON_SECRET=                 # Secret สำหรับ secure cron endpoints

# Supabase (Service Role)
SUPABASE_SERVICE_ROLE_KEY=   # สำหรับ admin operations
```

---

## 🔄 Automation Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     USER PAYMENT FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User อัปโหลด Slip                                        │
│         │                                                   │
│         ▼                                                   │
│  ┌─────────────────┐                                        │
│  │  /api/upload    │ ──▶ Supabase Storage                   │
│  └────────┬────────┘                                        │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │ /api/easyslip/verify│ ──▶ EasySlip API                   │
│  └────────┬────────────┘                                    │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────────┐                                │
│  │ payment.service.ts      │                                │
│  │ - Validate slip data    │                                │
│  │ - Create payment record │                                │
│  └────────┬────────────────┘                                │
│           │                                                 │
│           ▼                                                 │
│  ┌─────────────────────┐                                    │
│  │ /api/line-messaging │ ──▶ Line Messaging API             │
│  └─────────────────────┘                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                     CRON JOBS                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────┐                              │
│  │ Monthly (1st of month)    │                              │
│  │ /api/cron/monthly         │                              │
│  │ - Get unpaid members      │                              │
│  │ - Send Line reminder      │                              │
│  └───────────────────────────┘                              │
│                                                             │
│  ┌───────────────────────────┐                              │
│  │ Daily (20:00 TH)          │                              │
│  │ /api/cron/daily           │                              │
│  │ - Count today's payments  │                              │
│  │ - Send Line summary       │                              │
│  └───────────────────────────┘                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎯 ผลลัพธ์ Phase 3

| หมวด                       | สถานะ       | รายละเอียด                            |
| -------------------------- | ----------- | ------------------------------------- |
| EasySlip Integration       | ✅ Complete | Auto-verify, validate, quota tracking |
| Line Messaging Integration | ✅ Complete | Flex messages, 7 notification types   |
| Cron Jobs                  | ✅ Complete | Monthly + Daily                       |
| Storage Service            | ✅ Complete | Upload, delete, signed URLs           |
| Payment Service            | ✅ Complete | Full flow with auto-verify            |
| Settings Page              | ✅ Complete | Status, config, toggles               |
| Vercel Config              | ✅ Complete | Cron schedules                        |

---

## 🔒 Security Considerations

1. **CRON_SECRET** - ป้องกัน cron endpoints จากการเรียกโดยไม่ได้รับอนุญาต
2. **Service Role Key** - ใช้สำหรับ admin operations เท่านั้น (ไม่ expose ไป client)
3. **Signed URLs** - สำหรับเข้าถึงไฟล์ใน private bucket
4. **Rate Limiting** - EasySlip มี quota 50/สัปดาห์ (track การใช้งาน)

---

## 📌 Next Steps (Phase 4: Testing & Launch)

1. **Supabase Setup** - สร้างตาราง, Storage bucket, RLS policies
2. **Testing** - Unit tests, Integration tests, E2E tests
3. **Monitoring** - Error tracking, Usage analytics
4. **Documentation** - User guide, Admin guide
5. **Deployment** - Vercel production, Environment variables

---

**ก่อนหน้า:** [Phase 2: Core Features](./PHASE2-CoreFeatures.md)  
**เอกสารเพิ่มเติม:** [Business Rules](./SYSTEM-Validation&BusinessRules.md)
