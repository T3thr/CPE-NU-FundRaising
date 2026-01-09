# 🔐 มาตรฐาน Authentication System

## CPE Funds Hub - Auth Standards

**Version:** 1.0.0  
**Last Updated:** 2026-01-09

---

## 📋 ภาพรวม

ระบบ Authentication ของ CPE Funds Hub ออกแบบมาเพื่อ:

1. **ความปลอดภัย** - ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต
2. **ความสะดวก** - ใช้งานง่าย ไม่ยุ่งยาก
3. **ความยืดหยุ่น** - รองรับหลาย provider ในอนาคต
4. **มาตรฐานสากล** - ปฏิบัติตาม OWASP และ Best Practices

---

## 🏗️ โครงสร้างไฟล์

```
src/
├── app/
│   ├── login/
│   │   └── page.tsx                    # หน้า Login
│   ├── register/
│   │   └── page.tsx                    # หน้าสมัครสมาชิก (ถ้าต้องการ)
│   └── forgot-password/
│       └── page.tsx                    # หน้าลืมรหัสผ่าน
│
├── providers/
│   └── auth-provider/
│       ├── auth-provider.client.ts     # Client-side auth
│       └── auth-provider.server.ts     # Server-side auth
│
├── middleware.ts                        # Route protection
│
└── utils/
    └── supabase/
        ├── client.ts                    # Browser client
        ├── server.ts                    # Server client
        └── middleware.ts                # Session management
```

---

## 🔑 การพิสูจน์ตัวตน (Authentication)

### 1. Demo Mode (Development)

สำหรับการทดสอบและพัฒนา:

```tsx
const DEMO_CREDENTIALS = {
  email: "demo@cpe.nu.ac.th",
  password: "CPEFunds2026!",
};
```

> ⚠️ **สำคัญ:** Demo credentials ใช้สำหรับการทดสอบเท่านั้น ในระบบ production ต้องใช้ Supabase Auth จริง

### 2. Production Mode (Supabase Auth)

```tsx
// auth-provider.client.ts
import { supabaseBrowserClient } from "@utils/supabase/client";

export const authProviderClient: AuthProvider = {
  login: async ({ email, password }) => {
    const { data, error } = await supabaseBrowserClient.auth.signInWithPassword(
      {
        email,
        password,
      }
    );

    if (error) {
      return { success: false, error };
    }

    return { success: true, redirectTo: "/admin" };
  },

  logout: async () => {
    await supabaseBrowserClient.auth.signOut();
    return { success: true, redirectTo: "/login" };
  },

  check: async () => {
    const { data } = await supabaseBrowserClient.auth.getUser();

    if (data.user) {
      return { authenticated: true };
    }

    return { authenticated: false, redirectTo: "/login" };
  },
};
```

---

## 🛡️ Route Protection

### Middleware

```typescript
// src/middleware.ts
import { updateSession } from "@/utils/supabase/middleware";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

### Protected Routes

| Route Pattern     | Protection Level | Description          |
| ----------------- | ---------------- | -------------------- |
| `/admin/*`        | 🔒 Authenticated | ต้อง login           |
| `/super-admin/*`  | 🔐 Super Admin   | ต้องเป็น super admin |
| `/pay`, `/status` | 🌐 Public        | เปิดให้ทุกคน         |
| `/`               | 🌐 Public        | หน้าแรก              |

---

## 🎨 หน้า Login UI

### Design Principles

1. **Professional** - ดูน่าเชื่อถือ เหมาะกับองค์กร
2. **Split Layout** - ซ้าย=Branding, ขวา=Form
3. **Mobile Friendly** - ปรับ layout ตามขนาดหน้าจอ
4. **Dark/Light Mode** - รองรับทั้งสองโหมด

### Key Components

```tsx
// Logo & Branding
<div style={{
  width: "80px",
  height: "80px",
  borderRadius: "20px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  backdropFilter: "blur(10px)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}}>
  <Building2 style={{ width: "40px", height: "40px" }} />
</div>

// Email Input
<input
  id="email"
  type="email"
  placeholder="example@cpe.nu.ac.th"
  required
  style={{
    width: "100%",
    padding: "0.875rem 1rem 0.875rem 3rem",
    border: "2px solid var(--border)",
    borderRadius: "12px",
    backgroundColor: "var(--card)",
    color: "var(--foreground)",
  }}
/>

// Password with Toggle
<button onClick={() => setShowPassword(!showPassword)}>
  {showPassword ? <EyeOff /> : <Eye />}
</button>
```

---

## 🔄 Auth Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   User      │      │   Login     │      │   Supabase  │
│   Browser   │──────│   Page      │──────│   Auth      │
└─────────────┘      └─────────────┘      └─────────────┘
       │                    │                    │
       │   1. Visit /admin  │                    │
       │───────────────────>│                    │
       │                    │                    │
       │   2. Redirect to   │                    │
       │      /login        │                    │
       │<───────────────────│                    │
       │                    │                    │
       │   3. Enter         │                    │
       │      credentials   │                    │
       │───────────────────>│                    │
       │                    │   4. Verify        │
       │                    │─────────────────── >│
       │                    │                    │
       │                    │   5. JWT Token     │
       │                    │<───────────────────│
       │                    │                    │
       │   6. Redirect to   │                    │
       │      /admin        │                    │
       │<───────────────────│                    │
```

---

## 🔒 Security Measures

### 1. Password Requirements

```typescript
const passwordPolicy = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSpecialChar: true,
};
```

### 2. Rate Limiting

```typescript
// Supabase handles rate limiting automatically
// Default: 10 requests per 10 seconds
```

### 3. Session Management

```typescript
// Session expires after 1 hour of inactivity
// Refresh token valid for 7 days
const sessionConfig = {
  accessTokenExpiry: 60 * 60, // 1 hour
  refreshTokenExpiry: 60 * 60 * 24 * 7, // 7 days
};
```

### 4. CSRF Protection

```typescript
// Next.js 15+ has built-in CSRF protection
// Supabase uses httpOnly cookies
```

---

## 👤 User Roles

| Role          | Level | Permissions             |
| ------------- | ----- | ----------------------- |
| `member`      | 1     | ดูข้อมูลตัวเอง          |
| `admin`       | 2     | จัดการ cohort ของตัวเอง |
| `super_admin` | 3     | จัดการทั้งระบบ          |

### Role Check

```typescript
const CheckRole = async (requiredRole: string) => {
  const { data } = await supabase.auth.getUser();

  if (!data.user) return false;

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("role")
    .eq("user_id", data.user.id)
    .single();

  return profile?.role === requiredRole;
};
```

---

## 📱 Mobile Considerations

### Touch-Friendly

- Input fields: 48px minimum height
- Buttons: 48px minimum height
- Tap targets: 44x44px minimum

### Keyboard

- `inputMode="email"` for email fields
- `inputMode="none"` for password fields
- Auto-focus first input

---

## 🚨 Error Handling

### Error Messages (Thai)

```typescript
const errorMessages = {
  "Invalid login credentials": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  "Email not confirmed": "กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ",
  "Too many requests": "คำขอมากเกินไป กรุณารอสักครู่",
  "Network error": "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
};
```

### Error Display

```tsx
{
  error && (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.75rem",
        padding: "1rem",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        borderRadius: "12px",
        border: "1px solid rgba(239, 68, 68, 0.2)",
      }}
    >
      <AlertCircle style={{ color: "#ef4444" }} />
      <p style={{ color: "#ef4444" }}>{error}</p>
    </div>
  );
}
```

---

## ✅ Checklist

### Development

- [ ] Demo credentials พร้อมใช้งาน
- [ ] Error messages เป็นภาษาไทย
- [ ] Theme toggle ทำงาน
- [ ] Responsive design

### Production

- [ ] Supabase Auth configured
- [ ] Environment variables set
- [ ] Rate limiting enabled
- [ ] HTTPS enabled
- [ ] Demo credentials removed/disabled

---

## 📚 References

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Refine Auth Provider](https://refine.dev/docs/core/providers/auth-provider/)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [OWASP Authentication Guide](https://owasp.org/www-project-web-security-testing-guide/)

---

**เอกสารเกี่ยวข้อง:**

- [STANDARD-Navbar.md](./STANDARD-Navbar.md)
- [STANDARD-TailwindCSS.md](./STANDARD-TailwindCSS.md)
- [PHASE1-Foundation.md](./PHASE1-Foundation.md)
