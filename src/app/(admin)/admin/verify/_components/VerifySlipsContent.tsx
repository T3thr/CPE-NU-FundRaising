"use client";
// =============================================================================
// Verify Slips Content - Admin Slip Verification Dashboard
// =============================================================================

import React, { useState } from "react";
import { Button, Card, Badge, EmptyState } from "@/components/ui";
import { Modal, ConfirmDialog } from "@/components/ui/Modal";
import { useNotification } from "@/providers/notification-provider";
import { appConfig } from "@/config/app.config";
import { formatRelativeTime, formatThaiDateShort } from "@/utils/date";

// Mock pending payments
const mockPendingPayments = [
  {
    id: "1",
    studentId: "65310001",
    memberName: "สมชาย ใจดี",
    amount: 70,
    months: [1],
    slipUrl: "https://placehold.co/400x600/e2e8f0/64748b?text=Slip+1",
    createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 mins ago
    verificationData: {
      transRef: "2024011512345678",
      amount: 70,
      date: "2024-01-15 10:30:45",
      sender: "นาย สมชาย ใ***",
      receiver: "นาย ธีรพัฒน์ พ***",
    },
  },
  {
    id: "2",
    studentId: "65310002",
    memberName: "สมหญิง รักเรียน",
    amount: 140,
    months: [1, 2],
    slipUrl: "https://placehold.co/400x600/e2e8f0/64748b?text=Slip+2",
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 mins ago
    verificationData: null, // Failed auto-verify
  },
  {
    id: "3",
    studentId: "65310003",
    memberName: "นายพร้อม เสมอ",
    amount: 70,
    months: [1],
    slipUrl: "https://placehold.co/400x600/e2e8f0/64748b?text=Slip+3",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    verificationData: {
      transRef: "2024011598765432",
      amount: 70,
      date: "2024-01-15 08:15:22",
      sender: "น.ส. พร้อม เ***",
      receiver: "นาย ธีรพัฒน์ พ***",
    },
  },
];

type PendingPayment = typeof mockPendingPayments[0];

export default function VerifySlipsContent() {
  const { success, error } = useNotification();
  const [pendingPayments, setPendingPayments] = useState(mockPendingPayments);
  const [selectedPayment, setSelectedPayment] = useState<PendingPayment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectDialog, setShowRejectDialog] = useState(false);

  const handleOpenSlip = (payment: PendingPayment) => {
    setSelectedPayment(payment);
    setIsModalOpen(true);
  };

  const handleVerify = async (paymentId: string) => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setPendingPayments((prev) => prev.filter((p) => p.id !== paymentId));
    setIsModalOpen(false);
    setSelectedPayment(null);
    setIsProcessing(false);
    
    success("ยืนยันสำเร็จ", "บันทึกการชำระเงินเรียบร้อยแล้ว");
  };

  const handleReject = async () => {
    if (!selectedPayment) return;
    
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setPendingPayments((prev) => prev.filter((p) => p.id !== selectedPayment.id));
    setShowRejectDialog(false);
    setIsModalOpen(false);
    setSelectedPayment(null);
    setRejectReason("");
    setIsProcessing(false);
    
    error("ปฏิเสธ Slip", "ระบบจะแจ้งเตือนผู้ใช้ให้อัปโหลดใหม่");
  };

  const handleBulkVerify = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const verifiedCount = pendingPayments.filter((p) => p.verificationData).length;
    setPendingPayments((prev) => prev.filter((p) => !p.verificationData));
    setIsProcessing(false);
    
    success(`ยืนยันสำเร็จ ${verifiedCount} รายการ`, "บันทึกการชำระเงินเรียบร้อยแล้ว");
  };

  const autoVerifiableCount = pendingPayments.filter((p) => p.verificationData).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">ตรวจสอบ Slip</h1>
          <p className="text-muted">
            มี {pendingPayments.length} รายการรอตรวจสอบ
          </p>
        </div>
        {autoVerifiableCount > 0 && (
          <Button
            variant="success"
            onClick={handleBulkVerify}
            isLoading={isProcessing}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ยืนยันทั้งหมด ({autoVerifiableCount})
          </Button>
        )}
      </div>

      {/* Info Banner */}
      <div className="alert-info">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="font-medium">เคล็ดลับการตรวจสอบ</p>
          <p className="text-sm">
            Slip ที่มีเครื่องหมาย ✓ สีเขียว หมายถึงผ่านการตรวจสอบอัตโนมัติแล้ว สามารถกดยืนยันได้เลย
          </p>
        </div>
      </div>

      {/* Empty State */}
      {pendingPayments.length === 0 ? (
        <Card padding="lg">
          <EmptyState
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            title="ไม่มี Slip รอตรวจสอบ 🎉"
            description="ทุกรายการได้รับการตรวจสอบแล้ว"
          />
        </Card>
      ) : (
        /* Pending Slips Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingPayments.map((payment) => (
            <Card key={payment.id} padding="none" hover onClick={() => handleOpenSlip(payment)}>
              {/* Slip Preview */}
              <div className="relative aspect-[3/4] bg-muted/10">
                <img
                  src={payment.slipUrl}
                  alt="Payment slip"
                  className="w-full h-full object-cover"
                />
                
                {/* Auto-verify Badge */}
                {payment.verificationData && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="success" icon={<span>✓</span>}>
                      ตรวจสอบอัตโนมัติแล้ว
                    </Badge>
                  </div>
                )}
                
                {!payment.verificationData && (
                  <div className="absolute top-2 right-2">
                    <Badge variant="warning" icon={<span>⚠</span>}>
                      ต้องตรวจสอบด้วยตนเอง
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{payment.memberName}</h3>
                    <p className="text-sm text-muted">{payment.studentId}</p>
                  </div>
                  <span className="text-lg font-bold text-primary-600">
                    ฿{payment.amount}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted">
                  <span>
                    {payment.months.map((m) => appConfig.thaiMonthsShort[m - 1]).join(", ")}
                  </span>
                  <span>{formatRelativeTime(payment.createdAt)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Slip Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isProcessing && setIsModalOpen(false)}
        title="ตรวจสอบ Slip"
        size="lg"
      >
        {selectedPayment && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Slip Image */}
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border bg-muted/10">
              <img
                src={selectedPayment.slipUrl}
                alt="Payment slip"
                className="w-full h-full object-contain"
              />
            </div>
            
            {/* Verification Data */}
            <div className="space-y-4">
              {/* Member Info */}
              <div>
                <h4 className="font-semibold mb-2">ข้อมูลผู้ชำระ</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">ชื่อ</span>
                    <span className="font-medium">{selectedPayment.memberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">รหัสนิสิต</span>
                    <span className="font-mono">{selectedPayment.studentId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">เดือนที่ชำระ</span>
                    <span>
                      {selectedPayment.months.map((m) => appConfig.thaiMonthsShort[m - 1]).join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">จำนวนเงิน</span>
                    <span className="font-bold text-primary-600">
                      ฿{selectedPayment.amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* EasySlip Result */}
              <div className="pt-4 border-t border-border">
                <h4 className="font-semibold mb-2">ผลการตรวจสอบ EasySlip</h4>
                
                {selectedPayment.verificationData ? (
                  <div className="space-y-2 text-sm">
                    <div className="alert-success py-2 px-3 text-sm">
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>ตรวจสอบอัตโนมัติผ่าน</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted">เลขอ้างอิง</span>
                      <span className="font-mono text-xs">{selectedPayment.verificationData.transRef}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted">จำนวนเงินใน Slip</span>
                      <span className="font-bold text-success">
                        ฿{selectedPayment.verificationData.amount}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted">วันที่โอน</span>
                      <span>{selectedPayment.verificationData.date}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-border">
                      <span className="text-muted">ผู้โอน</span>
                      <span>{selectedPayment.verificationData.sender}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-muted">ผู้รับ</span>
                      <span>{selectedPayment.verificationData.receiver}</span>
                    </div>
                  </div>
                ) : (
                  <div className="alert-warning py-2 px-3 text-sm">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div>
                      <span className="font-medium">ไม่สามารถตรวจสอบอัตโนมัติได้</span>
                      <p className="text-xs mt-0.5">กรุณาตรวจสอบด้วยตนเองจาก Slip</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button
                  variant="danger"
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isProcessing}
                  fullWidth
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  ปฏิเสธ
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleVerify(selectedPayment.id)}
                  isLoading={isProcessing}
                  fullWidth
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  ยืนยัน
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showRejectDialog}
        onConfirm={handleReject}
        onCancel={() => setShowRejectDialog(false)}
        title="ปฏิเสธ Slip นี้?"
        message="ระบบจะแจ้งเตือนผู้ใช้ให้อัปโหลด Slip ใหม่อีกครั้ง"
        confirmText="ปฏิเสธ"
        cancelText="ยกเลิก"
        variant="danger"
        isLoading={isProcessing}
      />
    </div>
  );
}
