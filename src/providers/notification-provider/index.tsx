"use client";
// =============================================================================
// Notification Provider - Using react-toastify for Best Practice
// =============================================================================

import { createContext, useContext, ReactNode } from "react";
import { ToastContainer, toast, ToastOptions, Slide } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Notification types
interface NotificationContextType {
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  loading: (title: string) => string | number;
  dismiss: (id?: string | number) => void;
  update: (id: string | number, options: { type: "success" | "error"; message: string }) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Default toast options
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: Slide,
};

// Toast content component
function ToastContent({ title, message }: { title: string; message?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-semibold text-sm">{title}</span>
      {message && <span className="text-xs opacity-80">{message}</span>}
    </div>
  );
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const success = (title: string, message?: string) => {
    toast.success(<ToastContent title={title} message={message} />, defaultOptions);
  };

  const error = (title: string, message?: string) => {
    toast.error(<ToastContent title={title} message={message} />, {
      ...defaultOptions,
      autoClose: 6000,
    });
  };

  const warning = (title: string, message?: string) => {
    toast.warning(<ToastContent title={title} message={message} />, defaultOptions);
  };

  const info = (title: string, message?: string) => {
    toast.info(<ToastContent title={title} message={message} />, defaultOptions);
  };

  const loading = (title: string) => {
    return toast.loading(<ToastContent title={title} message="กรุณารอสักครู่..." />, {
      ...defaultOptions,
      autoClose: false,
    });
  };

  const dismiss = (id?: string | number) => {
    if (id) {
      toast.dismiss(id);
    } else {
      toast.dismiss();
    }
  };

  const update = (id: string | number, options: { type: "success" | "error"; message: string }) => {
    toast.update(id, {
      render: <ToastContent title={options.message} />,
      type: options.type,
      isLoading: false,
      autoClose: 4000,
    });
  };

  return (
    <NotificationContext.Provider value={{ success, error, warning, info, loading, dismiss, update }}>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        limit={5}
        stacked
        toastClassName="!rounded-xl !shadow-lg !text-sm"
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
}
