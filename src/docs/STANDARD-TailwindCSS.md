# 📐 มาตรฐาน Tailwind CSS 4.0 - CPE Funds Hub

**Project:** ระบบบริหารจัดการเงินกองกลางสาขาวิศวกรรมคอมพิวเตอร์ (CPE Funds Hub)  
**Version:** Tailwind CSS v4.0 + Next.js 15  
**Last Updated:** 2026-01-09

---

## 📖 สารบัญ

1. [หลักการออกแบบ](#1-หลักการออกแบบ)
2. [CSS Custom Properties](#2-css-custom-properties)
3. [Typography](#3-typography)
4. [Colors & Theme](#4-colors--theme)
5. [Spacing & Layout](#5-spacing--layout)
6. [Components](#6-components)
7. [Animations](#7-animations)
8. [Responsive Design](#8-responsive-design)
9. [Best Practices](#9-best-practices)

---

## 1. หลักการออกแบบ

### 1.1 User-Centric Design

- **ความชัดเจน:** UI ต้องสื่อสารชัดเจน ผู้ใช้เข้าใจการทำงานได้ทันที
- **ความสะดวก:** ลดขั้นตอนการใช้งานให้น้อยที่สุด
- **การเข้าถึง:** รองรับ Accessibility (a11y) ทุกฟีเจอร์

### 1.2 Design Principles

```
┌─────────────────────────────────────────────────────────┐
│  1. Consistency  - ใช้ style เดียวกันทั้งระบบ           │
│  2. Hierarchy    - จัดลำดับความสำคัญด้วย size/color     │
│  3. Feedback     - แสดง feedback ทุก action            │
│  4. Efficiency   - ใช้ space อย่างมีประสิทธิภาพ         │
└─────────────────────────────────────────────────────────┘
```

---

## 2. CSS Custom Properties

### 2.1 ตำแหน่งไฟล์

```
src/styles/global.css
```

### 2.2 Theme Variables (Best Practice)

เราใช้ CSS Custom Properties และ `next-themes` พร้อมกับ **Smooth Global Transition** เพื่อประสบการณ์การใช้งานระดับ Professional:

```css
/* Light Mode */
:root {
  --background: #f8fafc;
  --foreground: #0f172a;
  --card: #ffffff;
  --muted: #64748b;
  --border: #e2e8f0;
  --accent: #f1f5f9;

  /* Semantic */
  --surface-primary: #ffffff;
  --surface-secondary: #f1f5f9;
  --text-primary: #0f172a;
  --text-secondary: #475569;
}

/* Dark Mode */
.dark {
  --background: #0f172a;
  --foreground: #f1f5f9;
  --card: #1e293b;
  --muted: #94a3b8;
  --border: #334155;
  --accent: #1e293b;
}

/* Global Smooth Transition */
body {
  transition: background-color 0.3s ease, color 0.3s ease,
    border-color 0.3s ease;
}
```

### 2.3 การใช้งาน

```tsx
// ใน JSX
<div className="bg-[var(--background)] text-[var(--foreground)]">
  <p className="text-[var(--muted)]">Secondary text</p>
</div>

// หรือใช้ class ที่กำหนดไว้
<div className="card p-6">Card content</div>
```

**เหตุผล:** CSS Variables ทำให้ Theme switching ไม่ต้อง re-render React components และ Transition property ทำให้การเปลี่ยน Theme นุ่มนวล ดูเป็นธรรมชาติ

---

## 3. Typography

### 3.1 Font Family

```css
font-family: "Inter", "Noto Sans Thai", -apple-system, BlinkMacSystemFont, sans-serif;
```

### 3.2 Font Sizes

| Class       | Size     | Use Case               |
| ----------- | -------- | ---------------------- |
| `text-xs`   | 0.75rem  | captions, badges       |
| `text-sm`   | 0.875rem | secondary text, labels |
| `text-base` | 1rem     | body text              |
| `text-lg`   | 1.125rem | emphasized text        |
| `text-xl`   | 1.25rem  | small headings         |
| `text-2xl`  | 1.5rem   | section headings       |
| `text-3xl`  | 1.875rem | page titles            |
| `text-4xl+` | 2.25rem+ | hero sections          |

### 3.3 Heading Scale

```tsx
<h1 className="text-2xl md:text-3xl font-bold">Page Title</h1>
<h2 className="text-xl md:text-2xl font-bold">Section Title</h2>
<h3 className="text-lg font-bold">Card Title</h3>
```

**เหตุผล:** ใช้ responsive font sizes เพื่อให้อ่านง่ายบนทุกอุปกรณ์

---

## 4. Colors & Theme

### 4.1 Primary Color Palette

```css
@theme {
  --color-primary-50: #eff6ff;
  --color-primary-100: #dbeafe;
  --color-primary-200: #bfdbfe;
  --color-primary-300: #93c5fd;
  --color-primary-400: #60a5fa;
  --color-primary-500: #3b82f6; /* Main */
  --color-primary-600: #2563eb;
  --color-primary-700: #1d4ed8;
  --color-primary-800: #1e40af;
  --color-primary-900: #1e3a8a;
}
```

### 4.2 Status Colors

| Status  | Light BG       | Text             |
| ------- | -------------- | ---------------- |
| Success | `bg-green-100` | `text-green-700` |
| Warning | `bg-amber-100` | `text-amber-700` |
| Danger  | `bg-red-100`   | `text-red-700`   |
| Info    | `bg-blue-100`  | `text-blue-700`  |

### 4.3 การใช้งาน

```tsx
// Badge
<span className="badge badge-success">ยืนยันแล้ว</span>
<span className="badge badge-warning">รอตรวจสอบ</span>
<span className="badge badge-danger">ปฏิเสธ</span>
```

---

## 5. Spacing & Layout

### 5.1 Spacing Scale

| Class          | Value   | Use Case           |
| -------------- | ------- | ------------------ |
| `gap-1`, `p-1` | 0.25rem | tight elements     |
| `gap-2`, `p-2` | 0.5rem  | inline elements    |
| `gap-3`, `p-3` | 0.75rem | card padding small |
| `gap-4`, `p-4` | 1rem    | default spacing    |
| `gap-6`, `p-6` | 1.5rem  | section spacing    |
| `gap-8`, `p-8` | 2rem    | large sections     |

### 5.2 Container

```tsx
// Max-width containers
<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Full-width with padding
<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
  {/* Wide content */}
</div>
```

### 5.3 Grid System

```tsx
// 2 columns → 4 columns responsive
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
  {cards.map(card => <Card key={card.id} />)}
</div>

// Form layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <Input />
  <Input />
</div>
```

### 5.4 Card Layout

```tsx
<div className="card p-6">
  <div className="flex items-center gap-3 mb-4">
    <Icon />
    <div>
      <h3 className="font-bold">Title</h3>
      <p className="text-sm text-[var(--muted)]">Subtitle</p>
    </div>
  </div>
  <div className="space-y-4">{/* Content */}</div>
</div>
```

---

## 6. Components

### 6.1 Buttons

```css
/* Base */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-weight: 500;
  font-size: 0.875rem;
  border-radius: var(--radius-lg);
  transition: all 0.2s ease;
}

/* Variants */
.btn-primary {
  /* Blue gradient with shadow */
}
.btn-secondary {
  /* Gray background */
}
.btn-success {
  /* Green gradient */
}
.btn-danger {
  /* Red gradient */
}
.btn-ghost {
  /* Transparent */
}
```

**การใช้งาน:**

```tsx
<button className="btn btn-primary">
  <Icon className="w-4 h-4" />
  Button Text
</button>
```

### 6.2 Cards

```css
.card {
  background: var(--card);
  border-radius: var(--radius-xl);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-soft);
  transition: all 0.2s ease;
}

.card:hover {
  box-shadow: var(--shadow-medium);
}
```

### 6.3 Badges

```tsx
<span className="badge badge-primary">Primary</span>
<span className="badge badge-success">Success</span>
<span className="badge badge-warning">Warning</span>
<span className="badge badge-danger">Danger</span>
```

### 6.4 Inputs

```css
.input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: var(--surface-primary);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 3px rgb(59 130 246 / 0.15);
}
```

### 6.5 Tables

```tsx
<div className="table-container">
  <table className="table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 7. Animations

### 7.1 Framer Motion Variants

```typescript
// Fade in with slide up
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Stagger children
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Scale in
const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1 },
};
```

### 7.2 Theme Toggle Animation (View Transitions API)

**มาตรฐาน 2026:** ใช้ View Transitions API

**หลักการสำคัญ:**

- **ไม่มี blocking overlay** - สีของเนื้อหาจริงเปลี่ยนตาม radial pattern
- Browser จับภาพ "before" และ "after" แล้ว animate ระหว่างกัน
- รองรับ Chrome 111+, Edge 111+, Safari 18+

```typescript
// View Transitions API - No blocking overlay
if (doc.startViewTransition) {
  document.documentElement.style.setProperty("--theme-x", `${x}px`);
  document.documentElement.style.setProperty("--theme-y", `${y}px`);
  doc.startViewTransition(() => setTheme(newTheme));
}
```

**CSS สำหรับ View Transitions:**

```css
::view-transition-new(root) {
  z-index: 2;
  animation: radialReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes radialReveal {
  from {
    clip-path: circle(0px at var(--theme-x) var(--theme-y));
  }
  to {
    clip-path: circle(var(--theme-radius) at var(--theme-x) var(--theme-y));
  }
}
```

**ข้อดี:**

- ✅ **เนื้อหาจริงเปลี่ยนสี** - ไม่มี overlay บดบัง
- ✅ **GPU Accelerated** - clip-path ทำงานบน compositor
- ✅ **Browser Native** - ใช้ API มาตรฐาน

### 7.3 CSS Animations

```css
/* Skeleton loading */
.skeleton {
  background: linear-gradient(
    90deg,
    var(--surface-secondary) 0%,
    var(--surface-tertiary) 50%,
    var(--surface-secondary) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}
```

---

## 8. Responsive Design

### 8.1 Breakpoints

| Prefix | Min-width | Device        |
| ------ | --------- | ------------- |
| `sm:`  | 640px     | Large phones  |
| `md:`  | 768px     | Tablets       |
| `lg:`  | 1024px    | Laptops       |
| `xl:`  | 1280px    | Desktops      |
| `2xl:` | 1536px    | Large screens |

### 8.2 Mobile-First Approach

```tsx
// Start with mobile, add for larger screens
<div className="
  px-4           // mobile: small padding
  sm:px-6        // tablet: medium padding
  lg:px-8        // desktop: large padding
">

<div className="
  grid grid-cols-1   // mobile: 1 column
  md:grid-cols-2     // tablet: 2 columns
  lg:grid-cols-4     // desktop: 4 columns
  gap-4
">
```

### 8.3 ตัวอย่าง Responsive Patterns

```tsx
// Typography
<h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">

// Buttons
<button className="btn btn-primary w-full sm:w-auto">

// Hide/Show
<span className="hidden sm:inline">Desktop Only</span>
<span className="sm:hidden">Mobile Only</span>

// Flexbox direction
<div className="flex flex-col sm:flex-row gap-4">
```

---

## 9. Best Practices

### 9.1 Class Organization

```tsx
// Order: Layout → Sizing → Spacing → Typography → Colors → Effects
<div className="
  flex items-center justify-between  // Layout
  w-full h-12                        // Sizing
  px-4 gap-3                         // Spacing
  text-sm font-medium                // Typography
  bg-white text-gray-900             // Colors
  rounded-lg shadow-sm               // Effects
  hover:shadow-md transition-shadow  // States
">
```

### 9.2 Avoid Magic Numbers

```tsx
// ❌ Bad
<div style={{ marginTop: '23px' }}>

// ✅ Good
<div className="mt-6">
```

### 9.3 Use Semantic Classes

```tsx
// ❌ Bad
<span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">

// ✅ Good
<span className="badge badge-success">
```

### 9.4 Component Composition

```tsx
// ❌ Bad - ใหญ่เกินไป
<div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all">
  <div className="flex items-center gap-3 mb-4">
    ...
  </div>
</div>

// ✅ Good - ใช้ class ที่กำหนดไว้
<div className="card p-6">
  <div className="flex items-center gap-3 mb-4">
    ...
  </div>
</div>
```

### 9.5 Dark Mode Support

```tsx
// ใช้ CSS Variables แทน hardcode colors
<div className="bg-[var(--card)] text-[var(--foreground)]">

// ใช้ <ThemeToggle /> Component เพื่อเปลี่ยน Theme
import { ThemeToggle } from "@/components/common/ThemeToggle";
<ThemeToggle />
```

---

## 📚 Resources

- [Tailwind CSS v4 Docs](https://tailwindcss.com)
- [Framer Motion](https://www.framer.com/motion/)
- [Lucide Icons](https://lucide.dev)
- [next-themes](https://github.com/pacocoursey/next-themes)

---

**เอกสารเกี่ยวข้อง:**

- [CHANGELOG-CriticalFixes.md](./CHANGELOG-CriticalFixes.md)
- [GUIDE-MockToRealData.md](./GUIDE-MockToRealData.md)
