"use client";
// =============================================================================
// Reusable UI Components - Common Elements
// =============================================================================

import React from "react";
import Link from "next/link";

// =============================================================================
// Button Component
// =============================================================================
type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants: Record<ButtonVariant, string> = {
  primary: "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 shadow-md hover:shadow-lg",
  secondary: "bg-background text-foreground border border-border hover:bg-card hover:border-primary-400",
  success: "bg-success text-white hover:brightness-110",
  danger: "bg-danger text-white hover:brightness-110",
  ghost: "bg-transparent text-muted hover:bg-muted/10 hover:text-foreground",
  outline: "bg-transparent text-primary-600 border border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  isLoading,
  leftIcon,
  rightIcon,
  fullWidth,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold rounded-xl
        transition-all duration-200 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${buttonVariants[variant]}
        ${buttonSizes[size]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        leftIcon
      )}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}

// =============================================================================
// LinkButton Component (Button styled as Link)
// =============================================================================
interface LinkButtonProps {
  href: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  fullWidth,
  className = "",
  children,
  external,
}: LinkButtonProps) {
  const classes = `
    inline-flex items-center justify-center gap-2 font-semibold rounded-xl
    transition-all duration-200 no-underline
    ${buttonVariants[variant]}
    ${buttonSizes[size]}
    ${fullWidth ? "w-full" : ""}
    ${className}
  `;

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {leftIcon}
        {children}
        {rightIcon}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}

// =============================================================================
// Badge Component
// =============================================================================
type BadgeVariant = "default" | "success" | "warning" | "danger" | "info";
type BadgeSize = "sm" | "md" | "lg";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

const badgeVariants: Record<BadgeVariant, string> = {
  default: "bg-muted/10 text-muted",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
  info: "bg-primary-500/10 text-primary-600",
};

const badgeSizes: Record<BadgeSize, string> = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
  lg: "px-3 py-1.5 text-sm",
};

export function Badge({ variant = "default", size = "md", icon, className = "", children }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 font-medium rounded-full
        ${badgeVariants[variant]}
        ${badgeSizes[size]}
        ${className}
      `}
    >
      {icon}
      {children}
    </span>
  );
}

// =============================================================================
// Card Component
// =============================================================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  onClick?: () => void;
}

const cardPadding = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export function Card({ children, className = "", padding = "md", hover, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-card border border-border rounded-2xl shadow-soft overflow-hidden
        ${cardPadding[padding]}
        ${hover ? "transition-all duration-200 hover:shadow-medium hover:border-primary-200 cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-b border-border ${className}`}>
      {children}
    </div>
  );
}

export function CardBody({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}

export function CardFooter({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-4 border-t border-border bg-muted/5 ${className}`}>
      {children}
    </div>
  );
}

// =============================================================================
// Empty State Component
// =============================================================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = "" }: EmptyStateProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && (
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted/10 flex items-center justify-center text-muted">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {description && <p className="text-sm text-muted mb-4 max-w-sm mx-auto">{description}</p>}
      {action}
    </div>
  );
}

// =============================================================================
// Loading Spinner Component
// =============================================================================
interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

const spinnerSizes = {
  sm: "w-4 h-4 border-2",
  md: "w-8 h-8 border-2",
  lg: "w-12 h-12 border-4",
};

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <div
      className={`
        ${spinnerSizes[size]}
        border-primary-500 border-t-transparent rounded-full animate-spin
        ${className}
      `}
    />
  );
}

// =============================================================================
// Loading Overlay Component
// =============================================================================
export function LoadingOverlay({ message = "กำลังโหลด..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4">
        <Spinner size="lg" />
        <p className="text-sm text-muted">{message}</p>
      </div>
    </div>
  );
}

// =============================================================================
// Divider Component
// =============================================================================
interface DividerProps {
  orientation?: "horizontal" | "vertical";
  className?: string;
}

export function Divider({ orientation = "horizontal", className = "" }: DividerProps) {
  if (orientation === "vertical") {
    return <div className={`w-px h-full bg-border ${className}`} />;
  }
  return <div className={`w-full h-px bg-border ${className}`} />;
}

// =============================================================================
// Skeleton Component
// =============================================================================
interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ className = "", variant = "rectangular", width, height }: SkeletonProps) {
  const variantStyles = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  return (
    <div
      className={`skeleton ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}
