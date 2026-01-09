"use client";
// =============================================================================
// Reusable UI Components - Form Elements
// =============================================================================

import React, { forwardRef, useId } from "react";

// =============================================================================
// Input Component
// =============================================================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 rounded-xl border bg-background text-foreground
              transition-all duration-200 text-sm
              placeholder:text-muted
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${leftIcon ? "pl-10" : ""}
              ${rightIcon ? "pr-10" : ""}
              ${error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border"}
              ${className}
            `}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-muted">{helperText}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

// =============================================================================
// Select Component
// =============================================================================
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, options, placeholder, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3 rounded-xl border bg-background text-foreground
              transition-all duration-200 text-sm appearance-none cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border"}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-muted">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-muted">{helperText}</p>}
      </div>
    );
  }
);
Select.displayName = "Select";

// =============================================================================
// Textarea Component
// =============================================================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`
            w-full px-4 py-3 rounded-xl border bg-background text-foreground
            transition-all duration-200 text-sm resize-y min-h-[100px]
            placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-border"}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-1.5 text-sm text-danger">{error}</p>}
        {helperText && !error && <p className="mt-1.5 text-sm text-muted">{helperText}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// =============================================================================
// Checkbox Component
// =============================================================================
interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const checkboxId = id || generatedId;

    return (
      <label htmlFor={checkboxId} className={`flex items-start gap-3 cursor-pointer group ${className}`}>
        <div className="relative flex items-center justify-center">
          <input
            ref={ref}
            type="checkbox"
            id={checkboxId}
            className="
              w-5 h-5 rounded border-2 border-border bg-background
              transition-all duration-200 cursor-pointer appearance-none
              checked:bg-primary-500 checked:border-primary-500
              focus:outline-none focus:ring-2 focus:ring-primary-500/20
              disabled:opacity-50 disabled:cursor-not-allowed
            "
            {...props}
          />
          <svg
            className="absolute w-3 h-3 text-white opacity-0 pointer-events-none transition-opacity peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
          </div>
        )}
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

// =============================================================================
// Switch/Toggle Component
// =============================================================================
interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const generatedId = useId();
    const switchId = id || generatedId;

    return (
      <label htmlFor={switchId} className={`flex items-center justify-between gap-3 cursor-pointer ${className}`}>
        {(label || description) && (
          <div className="flex-1">
            {label && <span className="text-sm font-medium text-foreground">{label}</span>}
            {description && <p className="text-sm text-muted mt-0.5">{description}</p>}
          </div>
        )}
        <div className="relative">
          <input
            ref={ref}
            type="checkbox"
            id={switchId}
            className="sr-only peer"
            {...props}
          />
          <div className="
            w-11 h-6 rounded-full bg-muted/30 transition-colors duration-200
            peer-checked:bg-primary-500 peer-focus:ring-2 peer-focus:ring-primary-500/20
            peer-disabled:opacity-50 peer-disabled:cursor-not-allowed
          " />
          <div className="
            absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md
            transition-transform duration-200 peer-checked:translate-x-5
          " />
        </div>
      </label>
    );
  }
);
Switch.displayName = "Switch";

// =============================================================================
// SearchInput Component
// =============================================================================
interface SearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onClear?: () => void;
  isLoading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onClear, isLoading, className = "", value, ...props }, ref) => {
    return (
      <div className={`relative ${className}`}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-muted border-t-primary-500 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
        <input
          ref={ref}
          type="search"
          value={value}
          className="
            w-full pl-10 pr-10 py-3 rounded-xl border border-border bg-background text-foreground
            transition-all duration-200 text-sm
            placeholder:text-muted
            focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500
          "
          {...props}
        />
        {value && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";
