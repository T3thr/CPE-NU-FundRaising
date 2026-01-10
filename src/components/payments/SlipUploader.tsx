"use client";
// =============================================================================
// Slip Uploader Component
// =============================================================================

import React, { useState, useCallback } from "react";
import { appConfig } from "@/config/app.config";

interface SlipUploaderProps {
  onUpload: (file: File, preview: string) => void;
  onRemove: () => void;
  preview?: string;
  isLoading?: boolean;
  error?: string;
}

export function SlipUploader({
  onUpload,
  onRemove,
  preview,
  isLoading = false,
  error,
}: SlipUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      // Validate file type
      const allowedTypes = appConfig.upload.allowedTypes as readonly string[];
      if (!allowedTypes.includes(file.type)) {
        return;
      }

      // Validate file size
      if (file.size > appConfig.upload.maxFileSize) {
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const preview = reader.result as string;
        onUpload(file, preview);
      };
      reader.readAsDataURL(file);
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  if (preview) {
    return (
      <div className="relative group">
        <div className="relative aspect-[3/4] max-w-xs mx-auto rounded-xl overflow-hidden border-2 border-border">
          <img
            src={preview}
            alt="Slip preview"
            className="w-full h-full object-cover"
          />
          
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              onClick={onRemove}
              className="btn-danger"
              disabled={isLoading}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>ลบ</span>
            </button>
          </div>
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted">กำลังตรวจสอบ...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`
        relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200
        ${isDragging 
          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20" 
          : "border-border hover:border-primary-400"
        }
        ${error ? "border-red-500 bg-red-50 dark:bg-red-900/20" : ""}
      `}
    >
      <input
        type="file"
        accept={appConfig.upload.allowedTypes.join(",")}
        onChange={handleInputChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
          <svg className="w-8 h-8 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        <div>
          <p className="font-medium text-foreground">
            วางไฟล์ที่นี่ หรือ คลิกเพื่อเลือก
          </p>
          <p className="text-sm text-muted mt-1">
            รองรับ JPG, PNG, WebP (ไม่เกิน {appConfig.upload.maxFileSize / 1024 / 1024}MB)
          </p>
        </div>
        
        {error && (
          <p className="text-sm text-red-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// Slip Verification Status Badge
// =============================================================================

interface SlipStatusBadgeProps {
  status: "pending" | "verified" | "rejected";
  size?: "sm" | "md" | "lg";
}

export function SlipStatusBadge({ status, size = "md" }: SlipStatusBadgeProps) {
  const getStyles = () => {
    switch (status) {
      case "verified":
        return "badge-success";
      case "pending":
        return "badge-warning";
      case "rejected":
        return "badge-danger";
    }
  };

  const getLabel = () => {
    switch (status) {
      case "verified":
        return "ยืนยันแล้ว";
      case "pending":
        return "รอตรวจสอบ";
      case "rejected":
        return "ปฏิเสธ";
    }
  };

  const getIcon = () => {
    switch (status) {
      case "verified":
        return "✓";
      case "pending":
        return "⏳";
      case "rejected":
        return "✗";
    }
  };

  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <span className={`${getStyles()} ${sizeClasses[size]}`}>
      <span className="mr-1">{getIcon()}</span>
      {getLabel()}
    </span>
  );
}

// =============================================================================
// Slip Preview Modal
// =============================================================================

interface SlipPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  slipUrl: string;
  onVerify?: () => void;
  onReject?: () => void;
  isLoading?: boolean;
  verificationData?: {
    transRef?: string;
    amount?: number;
    date?: string;
    sender?: string;
    receiver?: string;
  };
}

export function SlipPreviewModal({
  isOpen,
  onClose,
  slipUrl,
  onVerify,
  onReject,
  isLoading = false,
  verificationData,
}: SlipPreviewModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal max-w-2xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="text-lg font-semibold">ตรวจสอบ Slip</h3>
          <button onClick={onClose} className="btn-ghost btn-icon">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="modal-body">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Slip Image */}
            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-border">
              <img
                src={slipUrl}
                alt="Payment slip"
                className="w-full h-full object-contain bg-gray-100 dark:bg-gray-800"
              />
            </div>
            
            {/* Verification Data */}
            <div className="space-y-4">
              <h4 className="font-semibold">ข้อมูลการโอน</h4>
              
              {verificationData ? (
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">เลขอ้างอิง</span>
                    <span className="font-mono">{verificationData.transRef || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">จำนวนเงิน</span>
                    <span className="font-bold text-primary-600">
                      ฿{verificationData.amount?.toLocaleString() || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">วันที่</span>
                    <span>{verificationData.date || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">ผู้โอน</span>
                    <span>{verificationData.sender || "-"}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border">
                    <span className="text-muted">ผู้รับ</span>
                    <span>{verificationData.receiver || "-"}</span>
                  </div>
                </div>
              ) : (
                <div className="alert-warning">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-medium">ไม่สามารถตรวจสอบอัตโนมัติได้</p>
                    <p className="text-sm">กรุณาตรวจสอบด้วยตนเอง</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {(onVerify || onReject) && (
          <div className="modal-footer">
            {onReject && (
              <button 
                onClick={onReject} 
                className="btn-danger"
                disabled={isLoading}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                ปฏิเสธ
              </button>
            )}
            {onVerify && (
              <button 
                onClick={onVerify} 
                className="btn-success"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                ยืนยัน
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
