// =============================================================================
// Home Page - Public Landing
// =============================================================================

import Link from "next/link";
import { appConfig } from "@/config/app.config";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-xl">
                💰
              </div>
              <span className="font-bold text-xl text-foreground">
                {appConfig.name}
              </span>
            </div>
            
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/pay" className="text-muted hover:text-foreground transition-colors">
                ชำระเงิน
              </Link>
              <Link href="/status" className="text-muted hover:text-foreground transition-colors">
                ตรวจสอบสถานะ
              </Link>
              <Link href="/login" className="btn-primary">
                เข้าสู่ระบบ
              </Link>
            </nav>

            <Link href="/login" className="md:hidden btn-primary btn-sm">
              เข้าสู่ระบบ
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="pt-16">
        <section className="py-20 md:py-32 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 animate-fade-in">
              ระบบบริหารจัดการ
              <br />
              <span className="gradient-text">เงินกองกลางสาขา</span>
            </h1>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-10 animate-slide-up">
              จ่ายง่าย ตรวจสอบได้ โปร่งใสทุกขั้นตอน
              <br />
              สำหรับสาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up">
              <Link href="/pay" className="btn-primary btn-lg w-full sm:w-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                แจ้งชำระเงิน
              </Link>
              <Link href="/status" className="btn-secondary btn-lg w-full sm:w-auto">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                ตรวจสอบสถานะ
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 bg-card/50 backdrop-blur border-y border-border">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              ทำไมต้องใช้ระบบนี้?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="card p-6 text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <h3 className="text-lg font-semibold mb-2">ง่ายและรวดเร็ว</h3>
                <p className="text-muted text-sm">
                  จ่ายเงินผ่าน QR PromptPay แล้วแจ้งใน 3 คลิก
                  ระบบตรวจสอบ Slip อัตโนมัติ
                </p>
              </div>

              {/* Feature 2 */}
              <div className="card p-6 text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  🔍
                </div>
                <h3 className="text-lg font-semibold mb-2">โปร่งใส 100%</h3>
                <p className="text-muted text-sm">
                  ดูสถานะได้ตลอดเวลา รู้ว่าจ่ายเดือนไหนแล้ว
                  เช็คยอดค้างชำระง่ายๆ
                </p>
              </div>

              {/* Feature 3 */}
              <div className="card p-6 text-center group hover:scale-105 transition-transform">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
                  🆓
                </div>
                <h3 className="text-lg font-semibold mb-2">ไม่มีค่าธรรมเนียม</h3>
                <p className="text-muted text-sm">
                  โอนผ่าน PromptPay ไม่มีค่าธรรมเนียม
                  เงินถึงกองทุนเต็มจำนวน
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Payment Info */}
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">
              วิธีการชำระเงิน
            </h2>
            
            <div className="card p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                {/* QR Code Placeholder */}
                <div className="w-48 h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📱</div>
                    <p className="text-xs text-muted">Scan QR</p>
                  </div>
                </div>
                
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400">🏦</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted">ธนาคาร</p>
                      <p className="font-semibold">{appConfig.defaultBank.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400">💳</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted">เลขบัญชี</p>
                      <p className="font-semibold font-mono tracking-wider">
                        {appConfig.defaultBank.accountNo}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center">
                      <span className="text-purple-600 dark:text-purple-400">👤</span>
                    </div>
                    <div>
                      <p className="text-sm text-muted">ชื่อบัญชี</p>
                      <p className="font-semibold">{appConfig.defaultBank.accountName}</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-muted">ค่าธรรมเนียมรายเดือน</span>
                      <span className="text-2xl font-bold text-primary-600">
                        ฿{appConfig.payment.defaultMonthlyFee}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              พร้อมชำระเงินแล้วหรือยัง?
            </h2>
            <p className="text-lg text-primary-100 mb-8 max-w-2xl mx-auto">
              เริ่มต้นใช้งานได้ทันที ไม่ต้องสมัครสมาชิก
              แค่มีรหัสนิสิตก็จ่ายเงินได้เลย
            </p>
            <Link 
              href="/pay" 
              className="inline-flex items-center gap-2 bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              แจ้งชำระเงินเลย
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                💰
              </div>
              <span className="font-semibold text-foreground">
                {appConfig.name}
              </span>
            </div>
            
            <p className="text-sm text-muted text-center">
              © 2026 สาขาวิศวกรรมคอมพิวเตอร์ มหาวิทยาลัยนเรศวร
            </p>
            
            <div className="flex items-center gap-4">
              <Link href="/admin" className="text-sm text-muted hover:text-foreground transition-colors">
                สำหรับแอดมิน
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
