# 🎨 Phase 2: Core Features - เอกสารสรุปการพัฒนา

**Project:** ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ (CPE Funds Hub)  
**Phase:** 2 - Core Features (ฟีเจอร์หลัก)  
**Last Updated:** 2026-01-08

---

## 📋 ภาพรวม Phase 2

Phase 2 เน้นการพัฒนา UI Components ที่ใช้ซ้ำได้, Admin Dashboard, และหน้า Public สำหรับผู้ใช้งานทั่วไป รวมถึง Utility Functions และ Custom Hooks

---

## 📁 ไฟล์ที่สร้าง/แก้ไขใน Phase 2

### 1. Utility Functions

#### `src/utils/calculations/payment.utils.ts`

```
src: src/utils/calculations/payment.utils.ts
```

**Functions สำหรับคำนวณการชำระเงิน:**

| Function                    | คำอธิบาย                                      |
| --------------------------- | --------------------------------------------- |
| `getAcademicYearMonths()`   | คืนค่าลำดับเดือนตามปีการศึกษา (มิ.ย. - มี.ค.) |
| `isFutureMonth()`           | ตรวจสอบว่าเดือนนั้นเป็นอนาคตหรือไม่           |
| `calculateMonthsOwed()`     | คำนวณจำนวนเดือนที่ค้างชำระ                    |
| `calculatePenalty()`        | คำนวณค่าปรับ (10 บาท/เดือน หลังเดือนแรก)      |
| `calculateTotalDebt()`      | คำนวณยอดหนี้รวม (เงินต้น + ค่าปรับ)           |
| `calculatePaymentAmount()`  | คำนวณยอดที่ต้องชำระ (รองรับเหมาจ่าย)          |
| `formatCurrency()`          | จัดรูปแบบเงินบาทไทย (฿70)                     |
| `getThaiMonthName()`        | แปลงหมายเลขเดือนเป็นชื่อไทย                   |
| `getPaymentStatusColor()`   | คืนค่าสี CSS ตามสถานะการชำระ                  |
| `getPaymentStatusLabel()`   | คืนค่า Label ตามสถานะการชำระ                  |
| `calculateCollectionRate()` | คำนวณอัตราการเก็บเงิน (%)                     |

**ตัวอย่างการใช้งาน:**

```typescript
// คำนวณยอดที่ต้องชำระ 3 เดือน
const amount = calculatePaymentAmount(3, 70, 10); // 210 บาท (ไม่มีค่าปรับเพราะจ่ายพร้อมกัน)

// เหมาจ่าย 9 เดือน (ยกเว้นค่าปรับ)
const lumpSum = calculatePaymentAmount(9, 70, 10, true); // 630 บาท
```

---

#### `src/utils/date/index.ts`

```
src: src/utils/date/index.ts
```

**Functions สำหรับวันที่:**

| Function                | คำอธิบาย                                  |
| ----------------------- | ----------------------------------------- |
| `formatThaiDate()`      | แปลงวันที่เป็นภาษาไทย (1 มกราคม 2569)     |
| `formatThaiDateShort()` | แปลงวันที่แบบสั้น (1 ม.ค. 69)             |
| `formatThaiDateTime()`  | แปลงวันที่พร้อมเวลา                       |
| `formatRelativeTime()`  | แสดงเวลาแบบ relative (5 นาทีที่แล้ว)      |
| `getMonthRange()`       | คืนค่าวันเริ่มต้น/สิ้นสุดของเดือน         |
| `isDateInRange()`       | ตรวจสอบว่าวันที่อยู่ในช่วงหรือไม่         |
| `parseDate()`           | แปลง string เป็น Date object อย่างปลอดภัย |
| `toISOString()`         | แปลง Date เป็น ISO string                 |

---

#### `src/utils/validation/index.ts`

```
src: src/utils/validation/index.ts
```

**Functions สำหรับ Validation:**

| Function                | คำอธิบาย                                    |
| ----------------------- | ------------------------------------------- |
| `isValidStudentId()`    | ตรวจสอบรหัสนิสิต (8 หลัก, format: YYMMXXXX) |
| `isValidCPEStudentId()` | ตรวจสอบว่าเป็นนิสิต CPE (XX36XXXX)          |
| `isValidEmail()`        | ตรวจสอบรูปแบบอีเมล                          |
| `isValidPhoneNumber()`  | ตรวจสอบเบอร์โทร (10 หลัก, เริ่ม 0)          |
| `isValidLineId()`       | ตรวจสอบ Line ID                             |
| `isValidSlipFile()`     | ตรวจสอบไฟล์ Slip (ประเภท, ขนาด)             |
| `isValidAmount()`       | ตรวจสอบจำนวนเงิน (> 0)                      |
| `sanitizeString()`      | ทำความสะอาด string (ป้องกัน XSS)            |
| `cleanStudentId()`      | ลบ space และ format รหัสนิสิต               |
| `validateMemberData()`  | ตรวจสอบข้อมูลสมาชิกทั้งหมด                  |
| `validatePaymentData()` | ตรวจสอบข้อมูลการชำระทั้งหมด                 |

**Regex Patterns:**

```typescript
// รหัสนิสิต CPE
const CPE_STUDENT_ID_PATTERN = /^\d{2}36\d{4}$/;

// เบอร์โทรไทย
const THAI_PHONE_PATTERN = /^0[689]\d{8}$/;
```

---

### 2. Custom Hooks

#### `src/hooks/index.ts`

```
src: src/hooks/index.ts
```

**Hooks ที่สร้าง:**

| Hook                   | คำอธิบาย                                    |
| ---------------------- | ------------------------------------------- |
| `useDebounce<T>()`     | Debounce ค่าที่เปลี่ยนแปลง (default 300ms)  |
| `useLocalStorage<T>()` | จัดการ state ที่ persist ใน localStorage    |
| `useMediaQuery()`      | ตรวจสอบ media query                         |
| `useIsMobile()`        | ตรวจสอบว่าเป็น mobile หรือไม่               |
| `useIsTablet()`        | ตรวจสอบว่าเป็น tablet หรือไม่               |
| `useIsDesktop()`       | ตรวจสอบว่าเป็น desktop หรือไม่              |
| `useToggle()`          | จัดการ boolean state                        |
| `useAsync<T>()`        | จัดการ async operations พร้อม loading/error |
| `usePagination()`      | จัดการ pagination logic                     |
| `useSelection<T>()`    | จัดการ multi-selection                      |
| `useFilter<T>()`       | จัดการ search และ filter                    |
| `useConfirm()`         | แสดง confirmation dialog                    |

**ตัวอย่างการใช้งาน:**

```typescript
// Debounce search
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

// Pagination
const { page, pageSize, goToPage, nextPage, prevPage } = usePagination({
  totalItems: 100,
  initialPageSize: 20,
});

// Selection
const { selectedIds, toggle, selectAll, clearAll, isSelected } =
  useSelection<string>();
```

---

### 3. UI Components

#### `src/components/ui/Form.tsx`

```
src: src/components/ui/Form.tsx
```

**Form Components:**

- `Input` - Text input พร้อม label, error, icons
- `Select` - Dropdown select
- `Textarea` - Multi-line text input
- `Checkbox` - Checkbox พร้อม label/description
- `Switch` - Toggle switch
- `SearchInput` - Search input พร้อม clear button

**Props สำคัญ:**

```typescript
interface InputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  required?: boolean;
}
```

---

#### `src/components/ui/Common.tsx`

```
src: src/components/ui/Common.tsx
```

**Common Components:**

| Component        | คำอธิบาย                                                        |
| ---------------- | --------------------------------------------------------------- |
| `Button`         | ปุ่มพร้อม variants (primary, secondary, success, danger, ghost) |
| `LinkButton`     | Button ที่เป็น Link                                             |
| `Badge`          | Badge/Tag แสดงสถานะ                                             |
| `Card`           | Card container พร้อม CardHeader, CardBody, CardFooter           |
| `EmptyState`     | แสดงเมื่อไม่มีข้อมูล                                            |
| `Spinner`        | Loading spinner                                                 |
| `LoadingOverlay` | Full-screen loading                                             |
| `Divider`        | เส้นแบ่ง (horizontal/vertical)                                  |
| `Skeleton`       | Loading skeleton                                                |

---

#### `src/components/ui/Modal.tsx`

```
src: src/components/ui/Modal.tsx
```

**Modal Components:**

- `Modal` - Modal dialog พร้อม header, body, footer
- `ConfirmDialog` - Confirmation dialog (danger/warning/info)
- `Drawer` - Side panel (left/right)

**Features:**

- Close on backdrop click / ESC key
- Portal rendering
- Body scroll lock
- Animations (fade, slide)

---

#### `src/components/ui/DataTable.tsx`

```
src: src/components/ui/DataTable.tsx
```

**Features:**

- Sortable columns
- Selectable rows (single/multi)
- Pagination controls
- Loading skeleton
- Empty state
- Responsive design

**Props:**

```typescript
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  selectable?: boolean;
  sortable?: boolean;
  pagination?: PaginationConfig;
  onRowClick?: (item: T) => void;
}
```

---

### 4. Member Components

#### `src/components/members/MemberForm.tsx`

```
src: src/components/members/MemberForm.tsx
```

**Components:**

- `MemberForm` - ฟอร์มสร้าง/แก้ไขสมาชิก
- `MemberCard` - Card แสดงข้อมูลสมาชิก + สถานะการชำระ

**Form Fields:**

- รหัสนิสิต (disabled เมื่อแก้ไข)
- ชื่อ-นามสกุล
- ชื่อเล่น
- อีเมล
- เบอร์โทรศัพท์
- Line ID

---

### 5. Payment Components

#### `src/components/payments/PaymentGrid.tsx`

```
src: src/components/payments/PaymentGrid.tsx
```

**Features:**

- ตารางแสดงสถานะการชำระรายเดือน
- Color-coded cells (paid/unpaid/pending/future)
- Responsive design
- Click to view details

#### `src/components/payments/SlipUploader.tsx`

```
src: src/components/payments/SlipUploader.tsx
```

**Features:**

- Drag & drop upload
- Preview ก่อนอัปโหลด
- Validation (ประเภท, ขนาด)
- Progress indicator

---

### 6. Admin Pages

#### Dashboard - `src/app/(admin)/admin/page.tsx`

```
src: src/app/(admin)/admin/page.tsx
src: src/app/(admin)/admin/_components/DashboardContent.tsx
```

**แสดงข้อมูล:**

- Stats cards: สมาชิก, จ่ายแล้ว, รอตรวจ, ยังไม่จ่าย
- ยอดเก็บประจำเดือน (progress bar)
- การชำระล่าสุด
- สมาชิกค้างชำระ
- Quick actions

---

#### Members - `src/app/(admin)/admin/members/page.tsx`

```
src: src/app/(admin)/admin/members/page.tsx
src: src/app/(admin)/admin/members/_components/MembersListContent.tsx
```

**Features:**

- Data table แสดงรายชื่อสมาชิก
- Search & filter
- Status badges
- Actions: แก้ไข, ดูรายละเอียด
- Import CSV / เพิ่มสมาชิก

---

#### Create Member - `src/app/(admin)/admin/members/create/page.tsx`

```
src: src/app/(admin)/admin/members/create/page.tsx
src: src/app/(admin)/admin/members/create/_components/CreateMemberContent.tsx
```

**Features:**

- ฟอร์มเพิ่มสมาชิกใหม่
- Validation
- Breadcrumb navigation

---

#### Payments - `src/app/(admin)/admin/payments/page.tsx`

```
src: src/app/(admin)/admin/payments/page.tsx
src: src/app/(admin)/admin/payments/_components/PaymentsListContent.tsx
```

**Features:**

- Payment grid view
- Filter by status, month
- Verify/Reject actions

---

#### Verify Slips - `src/app/(admin)/admin/verify/page.tsx`

```
src: src/app/(admin)/admin/verify/page.tsx
src: src/app/(admin)/admin/verify/_components/VerifySlipsContent.tsx
```

**Features:**

- Grid cards แสดง pending slips
- Auto-verified indicator
- Modal preview + verify/reject
- Bulk verify

---

#### Reports - `src/app/(admin)/admin/reports/page.tsx`

```
src: src/app/(admin)/admin/reports/page.tsx
src: src/app/(admin)/admin/reports/_components/ReportsContent.tsx
```

**Features:**

- Summary cards
- Bar chart (ยอดเก็บรายเดือน)
- Data table
- Export PDF

---

### 7. Public Pages

#### Homepage - `src/app/(public)/page.tsx`

```
src: src/app/(public)/page.tsx
```

- Landing page
- Links to ชำระเงิน / เช็คสถานะ

#### Pay - `src/app/(public)/pay/page.tsx`

```
src: src/app/(public)/pay/page.tsx
src: src/app/(public)/pay/_components/PayPageContent.tsx
```

**Features:**

- Multi-step wizard
- Member selection (by student ID)
- Month selection
- Slip upload
- Amount calculation

#### Status - `src/app/(public)/status/page.tsx`

```
src: src/app/(public)/status/page.tsx
src: src/app/(public)/status/_components/StatusPageContent.tsx
```

**Features:**

- ค้นหาด้วยรหัสนิสิต
- แสดงสถานะการชำระรายเดือน
- Progress bar
- ยอดค้างชำระ

---

### 8. Layout Components

#### Admin Layout - `src/app/(admin)/layout.tsx`

```
src: src/app/(admin)/layout.tsx
src: src/app/(admin)/_components/AdminLayoutClient.tsx
```

- Sidebar navigation
- Header with user info
- Mobile-responsive

#### Sidebar - `src/components/layout/Sidebar.tsx`

```
src: src/components/layout/Sidebar.tsx
```

**Features:**

- Collapsible sidebar
- Active state
- Icon + label
- Mobile bottom navigation

---

## 🎯 ผลลัพธ์ Phase 2

| หมวด              | สถานะ       | จำนวน          |
| ----------------- | ----------- | -------------- |
| Utility Functions | ✅ Complete | 30+ functions  |
| Custom Hooks      | ✅ Complete | 12 hooks       |
| UI Components     | ✅ Complete | 15+ components |
| Admin Pages       | ✅ Complete | 6 pages        |
| Public Pages      | ✅ Complete | 3 pages        |
| Responsive Design | ✅ Complete | Mobile-first   |

---

## 📸 Screenshots

| หน้า            | คำอธิบาย                                     |
| --------------- | -------------------------------------------- |
| Admin Dashboard | Stats cards, recent payments, unpaid members |
| Members List    | Data table with search, status badges        |
| Verify Slips    | Grid cards with auto-verify indicators       |
| Reports         | Bar chart, monthly breakdown                 |

---

**ก่อนหน้า:** [Phase 1: Foundation](./PHASE1-Foundation.md)  
**ถัดไป:** [Phase 3: Automation](./PHASE3-Automation.md)
