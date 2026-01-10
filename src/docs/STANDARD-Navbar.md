# 📋 มาตรฐาน Navbar & Layout Components

## CPE Funds Hub - Navigation System Standards

**Version:** 1.2.0  
**Last Updated:** 2026-01-09

---

## 📁 โครงสร้างไฟล์

```
src/components/layout/
├── PublicNavbar.tsx      # Navbar สำหรับหน้าสาธารณะ
├── Footer.tsx            # Footer มาตรฐาน
├── Sidebar.tsx           # Sidebar สำหรับ Admin
└── index.ts              # Export รวม

src/components/common/
└── ThemeToggle.tsx       # ปุ่มเปลี่ยน Theme (Animated)
```

---

## 🎯 หลักการออกแบบ

### 1. Responsive & Mobile Experience

- **Desktop (≥768px)**: แสดง navigation items แนวนอน
- **Mobile (<768px)**:
  - ใช้ **Hamburger Menu** ที่เปลี่ยนเป็น **X icon** เมื่อเปิด (Animated)
  - เมนูเปิดแบบ **Below Header Overlay** (เลื่อนลงมาจากใต้ Navbar)
  - Navbar ด้านบนยังคงแสดงอยู่ตลอดเวลา (Users ยังเห็น Logo/Toggle ได้)
  - Lock Body Scroll เมื่อเปิดเมนู

### 2. Layout Consistency

- **Navbar**: Fixed Top (`top: 0`, `height: 72px`)
- **Footer**: Sticky Bottom (อยู่ล่างสุดของ Content หรือหน้าจอเสมอ)
- **Theme Toggle**: แยก Component เพื่อความลื่นไหล (Framer Motion) และใช้ได้ทั้งใน Navbar และ Mobile Menu

### 3. Z-Index Layering (Standard)

| Element           | Z-Index | Description                         |
| ----------------- | ------- | ----------------------------------- |
| **Navbar Header** | 50      | ส่วนหัวคงที่ (Logo, Hamburger)      |
| **Mobile Menu**   | 40      | Slide ลงมาจากใต้ Header (top: 72px) |
| **Backdrop**      | 40      | พื้นหลังเบลอ (ใต้ Menu Content)     |
| **Page Content**  | 0-10    | เนื้อหาปกติ                         |

---

## 🧩 PublicNavbar Implementation

### การเรียกใช้งาน (Layout)

```tsx
// src/app/(public)/layout.tsx
import PublicNavbar from "@/components/layout/PublicNavbar";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
    >
      <PublicNavbar />
      <main style={{ flex: 1, paddingTop: "72px" }}>{children}</main>
      <Footer />
    </div>
  );
}
```

---

## 🎨 Styling Guidelines

### Navbar Visuals

- **Glassmorphism**: เมื่อ Scroll ลง Navbar จะเปลี่ยนจาก Transparent เป็น `color-mix` + `backdrop-blur(12px)`
- **Border**: มีเส้นขอบล่างบางๆ เมื่อ Scroll

### Mobile Menu Animation (Framer Motion)

```tsx
const menuVariants = {
  closed: { opacity: 0, y: -20 },
  open: { opacity: 1, y: 0 },
};
```

---

## 🔗 Footer Standard

Footer ต้องเป็น Component แยก (`Footer.tsx`) ที่มีลักษณะ:

- Background: `var(--card)`
- Border Top: `var(--border)`
- Responsive: Flex wrap (Stack บน Mobile, Row บน Desktop)
- Copyright: ปีปัจจุบัน (Dynamic Date)

---

## ✅ Checklist สำหรับตรวจสอบ

1. **Mobile Interaction**:
   - กด Hamburger -> icon เปลี่ยนเป็น X -> เมนู Slide ลงมาจาก **ใต้** Navbar
   - Logo และปุ่ม Toggle ด้านบนต้องยังกดได้ปกติ
2. **Scroll Lock**: เปิดเมนูแล้ว Background ต้องเลื่อนไม่ได้
3. **Sticky Footer**: หน้า Content น้อย Footer ต้องอยู่ติดขอบล่างจอเสมอ
4. **Theme Toggle**: กดเปลี่ยนแล้ว icon ต้องหมุน/เปลี่ยนแบบ Smooth (ไม่กระพริบ)

---

**เอกสารเกี่ยวข้อง:**

- [STANDARD-TailwindCSS.md](./STANDARD-TailwindCSS.md)
- [STANDARD-Auth.md](./STANDARD-Auth.md)
