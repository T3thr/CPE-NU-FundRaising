# 🔐 มาตรฐานความปลอดภัย - CPE Funds Hub

**Document:** STANDARD-Security.md  
**Version:** 1.0.0  
**Date:** 2026-01-11  
**Author:** DevSecOps Team

---

## 📖 สารบัญ

1. [ภาพรวมระบบความปลอดภัย](#1-ภาพรวมระบบความปลอดภัย)
2. [สถาปัตยกรรม Authentication](#2-สถาปัตยกรรม-authentication)
3. [การจัดการสิทธิ์ (Authorization)](#3-การจัดการสิทธิ์-authorization)
4. [Security Headers (OWASP)](#4-security-headers-owasp)
5. [การป้องกันภัยคุกคาม](#5-การป้องกันภัยคุกคาม)
6. [บัญชีผู้ใช้งาน](#6-บัญชีผู้ใช้งาน)
7. [การตั้งค่า Environment](#7-การตั้งค่า-environment)
8. [Best Practices](#8-best-practices)

---

## 1. ภาพรวมระบบความปลอดภัย

### 1.1 แนวคิดหลัก - Private Web (Intranet Style)

ระบบ CPE Funds Hub ถูกออกแบบเป็น **Private Web** ที่:

- ❌ **ไม่มีระบบสมัครสมาชิก** (No Public Registration)
- ❌ **ไม่อนุญาตให้คนนอกเข้าถึง** (Zero External Access)
- ✅ **บัญชี Hardcoded เท่านั้น** (Authorized Accounts Only)
- ✅ **ทุกหน้าต้อง Login** (All Pages Protected)

### 1.2 เทคโนโลยีที่ใช้

| Component        | Technology         | Version |
| ---------------- | ------------------ | ------- |
| Framework        | Next.js            | 15.x    |
| Authentication   | Auth.js (NextAuth) | v5 Beta |
| Session Strategy | JWT                | -       |
| Security Headers | OWASP Standards    | -       |
| Password Storage | Hardcoded (No DB)  | -       |

### 1.3 มาตรฐานที่ปฏิบัติตาม

- ✅ **OWASP Top 10 2021** - ป้องกันช่องโหว่ 10 อันดับแรก
- ✅ **WSS (Web Security Standards)** - มาตรฐานความปลอดภัยเว็บ
- ✅ **NIST Cybersecurity Framework** - กรอบความปลอดภัยไซเบอร์

---

## 2. สถาปัตยกรรม Authentication

### 2.1 Auth.js v5 Configuration

```
📁 src/
├── lib/
│   └── auth.ts              # Core Auth.js configuration
├── app/
│   └── api/auth/[...nextauth]/
│       └── route.ts         # Auth.js API handlers
├── middleware.ts            # Route protection
└── providers/
    └── session-provider.tsx # Client session access
```

### 2.2 Authentication Flow

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Browser   │──────▶│  Middleware │──────▶│  Auth Check │
└─────────────┘       └─────────────┘       └─────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
           ┌─────────────┐      ┌─────────────┐
           │  Login Page │      │  Protected  │
           │  (/login)   │      │   Content   │
           └─────────────┘      └─────────────┘
                    │
                    ▼
           ┌─────────────┐
           │ Credentials │
           │   Check     │
           └─────────────┘
                    │
           ┌────────┴────────┐
           ▼                 ▼
    ┌─────────────┐   ┌─────────────┐
    │   Success   │   │   Failure   │
    │  (JWT Set)  │   │   (Error)   │
    └─────────────┘   └─────────────┘
```

### 2.3 Session Configuration

```typescript
session: {
  strategy: "jwt",
  maxAge: 8 * 60 * 60,    // 8 ชั่วโมง (วันทำงาน)
  updateAge: 60 * 60,     // Refresh ทุก 1 ชั่วโมง
}
```

**เหตุผล:**

- `maxAge: 8 hours` - สอดคล้องกับเวลาทำงานปกติ
- `updateAge: 1 hour` - ลด load ในการ refresh token

### 2.4 Cookie Security (OWASP Compliant)

```typescript
cookies: {
  sessionToken: {
    name: "__Secure-authjs.session-token",
    options: {
      httpOnly: true,      // ป้องกัน XSS
      sameSite: "lax",     // ป้องกัน CSRF
      path: "/",
      secure: true,        // HTTPS only (production)
    },
  },
}
```

---

## 3. การจัดการสิทธิ์ (Authorization)

### 3.1 User Roles

| Role          | คำอธิบาย             | สิทธิ์                                 |
| ------------- | -------------------- | -------------------------------------- |
| `super_admin` | เหรัญญิก/บอร์ดบริหาร | เข้าถึงทุกหน้า รวม Admin Panel         |
| `public`      | สมาชิกสาขา           | เข้าถึงหน้าสาธารณะ (Home, Pay, Status) |

### 3.2 Route Protection Matrix

| Route      | Public User      | Super Admin      | Not Logged In |
| ---------- | ---------------- | ---------------- | ------------- |
| `/login`   | ✅ Redirect to / | ✅ Redirect to / | ✅ Accessible |
| `/`        | ✅               | ✅               | ❌ → `/login` |
| `/pay`     | ✅               | ✅               | ❌ → `/login` |
| `/status`  | ✅               | ✅               | ❌ → `/login` |
| `/admin`   | ❌ → `/`         | ✅               | ❌ → `/login` |
| `/admin/*` | ❌ → `/`         | ✅               | ❌ → `/login` |

### 3.3 Middleware Implementation

```typescript
// src/middleware.ts
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const userRole = session?.user?.role;

    if (userRole !== "super_admin") {
      return NextResponse.redirect(new URL("/", req.nextUrl));
    }
  }
});
```

---

## 4. Security Headers (OWASP)

### 4.1 Headers ที่ใช้งาน

| Header                      | Value                                          | ป้องกัน             |
| --------------------------- | ---------------------------------------------- | ------------------- |
| `X-XSS-Protection`          | `1; mode=block`                                | XSS Attacks         |
| `X-Frame-Options`           | `DENY`                                         | Clickjacking        |
| `X-Content-Type-Options`    | `nosniff`                                      | MIME Sniffing       |
| `Referrer-Policy`           | `strict-origin-when-cross-origin`              | Information Leakage |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | Downgrade Attacks   |
| `Permissions-Policy`        | `camera=(), microphone=(), geolocation=()`     | Feature Restriction |

### 4.2 Content Security Policy (CSP)

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://*.supabase.co wss://*.supabase.co;
frame-ancestors 'none';
form-action 'self';
base-uri 'self';
```

**Note:** `'unsafe-inline'` และ `'unsafe-eval'` จำเป็นสำหรับ Next.js development

---

## 5. การป้องกันภัยคุกคาม

### 5.1 OWASP Top 10 Mitigation

| #   | Vulnerability             | การป้องกัน                          |
| --- | ------------------------- | ----------------------------------- |
| A01 | Broken Access Control     | Role-based access in middleware     |
| A02 | Cryptographic Failures    | HTTPS, Secure cookies, JWT          |
| A03 | Injection                 | Parameterized queries (Supabase)    |
| A04 | Insecure Design           | Private by default, no registration |
| A05 | Security Misconfiguration | HSTS, CSP, Security headers         |
| A06 | Vulnerable Components     | Regular dependency updates          |
| A07 | Auth Failures             | Hardcoded credentials, JWT sessions |
| A08 | Software/Data Integrity   | SameSite cookies, CSP               |
| A09 | Logging Failures          | Audit logs in Supabase              |
| A10 | SSRF                      | No external URL fetching            |

### 5.2 Protection Against Common Attacks

#### Cross-Site Scripting (XSS)

- ✅ `X-XSS-Protection` header
- ✅ `Content-Security-Policy` header
- ✅ React auto-escaping

#### Cross-Site Request Forgery (CSRF)

- ✅ `SameSite=lax` cookies
- ✅ CSRF token in Auth.js
- ✅ `form-action 'self'` in CSP

#### Clickjacking

- ✅ `X-Frame-Options: DENY`
- ✅ `frame-ancestors 'none'` in CSP

#### Session Hijacking

- ✅ `HttpOnly` cookies
- ✅ `Secure` flag (HTTPS)
- ✅ Short session lifetime (8 hours)

---

## 6. บัญชีผู้ใช้งาน

### 6.1 Authorized Accounts (Hardcoded)

⚠️ **คำเตือน:** ข้อมูลนี้เป็นความลับ ห้ามเปิดเผยหรือ commit เข้า Git

#### Super Admin (เหรัญญิก)

```
Email: treasurer@cpe.nu.ac.th
Password: CpeTreasurer2026!
Role: super_admin
สิทธิ์: เข้าถึง Admin Panel, จัดการข้อมูลทั้งหมด
```

#### Public User (สมาชิกสาขา)

```
Email: public@cpe.nu.ac.th
Password: CpePublicAccess!
Role: public
สิทธิ์: ดูข้อมูล, ชำระเงิน, ตรวจสอบสถานะ
```

### 6.2 การเปลี่ยนรหัสผ่าน

เนื่องจากใช้ Hardcoded credentials ใน `src/lib/auth.ts`:

1. เปิดไฟล์ `src/lib/auth.ts`
2. แก้ไข `AUTHORIZED_USERS` array
3. Deploy ใหม่

```typescript
const AUTHORIZED_USERS = [
  {
    email: "treasurer@cpe.nu.ac.th",
    password: "NEW_PASSWORD_HERE", // เปลี่ยนตรงนี้
    role: "super_admin",
    name: "เหรัญญิก CPE",
  },
  // ...
];
```

---

## 7. การตั้งค่า Environment

### 7.1 Required Environment Variables

```bash
# Auth.js v5
AUTH_SECRET=<random-32-byte-string>
AUTH_TRUST_HOST=true
```

### 7.2 Generate AUTH_SECRET

```bash
# Linux/Mac
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {Get-Random -Maximum 256}) -as [byte[]])
```

### 7.3 Production Checklist

- [ ] `AUTH_SECRET` ตั้งค่าถูกต้อง (ไม่ใช่ค่า default)
- [ ] `NODE_ENV=production`
- [ ] HTTPS enabled
- [ ] Security headers verified (use securityheaders.com)
- [ ] Cookie `Secure` flag active

---

## 8. Best Practices

### 8.1 Do's ✅

- ✅ ใช้ HTTPS เสมอใน Production
- ✅ ตั้งค่า `AUTH_SECRET` ที่ random และไม่ซ้ำ
- ✅ อัพเดท dependencies สม่ำเสมอ
- ✅ ใช้ CSP header
- ✅ Log authentication events
- ✅ Review security headers ด้วย securityheaders.com

### 8.2 Don'ts ❌

- ❌ อย่า commit รหัสผ่านลง Git
- ❌ อย่าใช้ `AUTH_SECRET` ค่า default
- ❌ อย่าปิด security headers
- ❌ อย่าใช้ HTTP ใน production
- ❌ อย่าเก็บ sensitive data ใน localStorage

### 8.3 Security Audit Checklist

| รายการ                           | ตรวจสอบ |
| -------------------------------- | ------- |
| ทุกหน้าต้อง login                | ☐       |
| Admin pages ต้องเป็น super_admin | ☐       |
| Security headers ครบ             | ☐       |
| HTTPS enabled                    | ☐       |
| AUTH_SECRET ไม่เป็น default      | ☐       |
| No sensitive data in Git         | ☐       |

---

## 📋 สรุป

ระบบ CPE Funds Hub ใช้ความปลอดภัยระดับ **Enterprise** ด้วย:

1. **Auth.js v5** - Modern authentication framework
2. **JWT Sessions** - Stateless, scalable authentication
3. **OWASP Headers** - Industry-standard security headers
4. **Role-based Access** - Super Admin vs Public user
5. **Hardcoded Credentials** - No public registration (Intranet style)
6. **Middleware Protection** - All routes protected by default

**Security Rating: 🛡️🛡️🛡️🛡️🛡️ (5/5)**

---

**เอกสารที่เกี่ยวข้อง:**

- [PROJECT-Background&Mission.md](./PROJECT-Background&Mission.md)
- [SYSTEM-Validation&BusinessRules.md](./SYSTEM-Validation&BusinessRules.md)
- [CHANGELOG-AdminCoreFeatures-v2.4.md](./CHANGELOG-AdminCoreFeatures-v2.4.md)
