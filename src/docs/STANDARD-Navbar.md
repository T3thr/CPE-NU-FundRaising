# 📋 มาตรฐาน Navbar Component

## CPE Funds Hub - Navigation System Standards

**Version:** 1.0.0  
**Last Updated:** 2026-01-09

---

## 📁 โครงสร้างไฟล์

```
src/components/layout/
├── PublicNavbar.tsx      # Navbar สำหรับหน้าสาธารณะ
├── Sidebar.tsx           # Sidebar สำหรับ Admin
└── index.ts              # Export รวม
```

---

## 🎯 หลักการออกแบบ

### 1. Responsive First

- Desktop (≥768px): แสดง navigation items ปกติ
- Mobile (<768px): ใช้ hamburger menu

### 2. Accessibility

- ใช้ `aria-label` สำหรับ buttons
- รองรับ keyboard navigation
- High contrast colors

### 3. Performance

- ใช้ `useEffect` ตรวจจับ scroll เพื่อเปลี่ยน background
- Lazy load mobile menu ด้วย AnimatePresence

---

## 🧩 PublicNavbar Component

### การใช้งาน

```tsx
// ใน layout.tsx
import PublicNavbar from "@/components/layout/PublicNavbar";

export default function PublicLayout({ children }) {
  return (
    <>
      <PublicNavbar />
      <main style={{ paddingTop: "72px" }}>{children}</main>
    </>
  );
}
```

### Props

| Prop | Type | Default | Description                   |
| ---- | ---- | ------- | ----------------------------- |
| -    | -    | -       | Component นี้ไม่รับ props ใดๆ |

### Features

1. **Fixed Header** - ติดอยู่บนสุดเสมอ
2. **Scroll Effect** - พื้นหลังเปลี่ยนเมื่อ scroll
3. **Theme Toggle** - เปลี่ยน Light/Dark mode
4. **Mobile Menu** - แสดง hamburger menu บน mobile
5. **Active Link** - ไฮไลท์ link ที่กำลังอยู่

---

## 🎨 Styling Guidelines

### Colors

```css
/* Primary Brand */
--navbar-bg: var(--card);
--navbar-border: var(--border);
--navbar-text: var(--foreground);

/* Active State */
--navbar-active-bg: rgba(59, 130, 246, 0.1);
--navbar-active-text: #3b82f6;

/* Hover State */
--navbar-hover-bg: var(--accent);
```

### Height

```css
--navbar-height: 72px;
```

### Logo

```tsx
<div
  style={{
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
  }}
>
  <Building2 style={{ width: "22px", height: "22px", color: "white" }} />
</div>
```

---

## 📱 Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 767px) {
  .hidden-mobile {
    display: none !important;
  }
  .show-mobile {
    display: flex !important;
  }
}

/* Desktop */
@media (min-width: 768px) {
  .hidden-mobile {
    display: flex !important;
  }
  .show-mobile {
    display: none !important;
  }
}
```

---

## 🔗 Navigation Items

### Public Pages

```tsx
const publicNavItems = [
  { label: "ชำระเงิน", href: "/pay", icon: CreditCard },
  { label: "เช็คสถานะ", href: "/status", icon: Search },
];
```

### Admin Pages

```tsx
const adminNavItems = [
  { label: "ภาพรวม", href: "/admin", icon: Home },
  { label: "สมาชิก", href: "/admin/members", icon: Users },
  { label: "การชำระ", href: "/admin/payments", icon: CreditCard },
  { label: "ตรวจสลิป", href: "/admin/verify", icon: CheckCircle2 },
  { label: "รายงาน", href: "/admin/reports", icon: BarChart3 },
  { label: "ตั้งค่า", href: "/admin/settings", icon: Settings },
];
```

---

## 🌓 Theme Toggle

```tsx
import { useTheme } from "next-themes";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </button>
  );
}
```

---

## 📄 Route Structure

### Public Routes (ใช้ PublicNavbar)

| Route     | Page     | Description     |
| --------- | -------- | --------------- |
| `/`       | Homepage | หน้าแรก         |
| `/pay`    | Payment  | หน้าชำระเงิน    |
| `/status` | Status   | หน้าเช็คสถานะ   |
| `/login`  | Login    | หน้าเข้าสู่ระบบ |

### Admin Routes (ใช้ Sidebar)

| Route             | Page      | Description   |
| ----------------- | --------- | ------------- |
| `/admin`          | Dashboard | ภาพรวม        |
| `/admin/members`  | Members   | จัดการสมาชิก  |
| `/admin/payments` | Payments  | จัดการการชำระ |
| `/admin/verify`   | Verify    | ตรวจสอบสลิป   |
| `/admin/reports`  | Reports   | รายงาน        |
| `/admin/settings` | Settings  | ตั้งค่าระบบ   |

---

## ✅ Best Practices

1. **ใช้ inline styles** สำหรับ critical layout เพื่อป้องกัน Tailwind purge
2. **ใช้ CSS variables** สำหรับ theming
3. **ใช้ lucide-react** สำหรับ icons (consistent set)
4. **ใช้ framer-motion** สำหรับ animations
5. **ตรวจสอบ mounted state** ก่อน render theme-dependent UI

---

## 🔧 Troubleshooting

### Navbar ไม่แสดง

1. ตรวจสอบว่า import ถูกต้อง
2. ตรวจสอบว่า layout มี `paddingTop: "72px"` สำหรับ main content

### Theme Toggle ไม่ทำงาน

1. ตรวจสอบว่ามี ThemeProvider ใน root layout
2. ตรวจสอบว่าใช้ `mounted` state ก่อน render

### Mobile Menu ไม่แสดง

1. ตรวจสอบว่ามี CSS classes `.hidden-mobile` และ `.show-mobile`
2. ตรวจสอบ z-index ของ menu

---

**เอกสารเกี่ยวข้อง:**

- [STANDARD-TailwindCSS.md](./STANDARD-TailwindCSS.md)
- [STANDARD-Auth.md](./STANDARD-Auth.md)
