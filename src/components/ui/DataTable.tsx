"use client";
// =============================================================================
// Data Table Component - Reusable Table with Sorting, Selection, Pagination
// =============================================================================

import React, { useMemo, useState } from "react";
import { Checkbox } from "./Form";
import { Button, Skeleton, EmptyState, Badge } from "./Common";

// =============================================================================
// Types
// =============================================================================
export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  sticky?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  data: T[];
  columns: Column<T>[];
  keyField?: string;
  isLoading?: boolean;
  loadingRows?: number;
  emptyState?: {
    icon?: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
  };
  // Selection
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  // Sorting
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSort?: (key: string) => void;
  // Pagination
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
  };
  // Actions
  onRowClick?: (item: T) => void;
  rowClassName?: (item: T, index: number) => string;
  className?: string;
}

// =============================================================================
// DataTable Component
// =============================================================================
export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  keyField = "id",
  isLoading,
  loadingRows = 5,
  emptyState,
  selectable,
  selectedIds = [],
  onSelectionChange,
  sortable,
  sortBy,
  sortOrder,
  onSort,
  pagination,
  onRowClick,
  rowClassName,
  className = "",
}: DataTableProps<T>) {
  const getKey = (item: T): string => String(item[keyField] || "");

  // Selection handlers
  const isAllSelected = useMemo(
    () => data.length > 0 && data.every((item) => selectedIds.includes(getKey(item))),
    [data, selectedIds]
  );

  const isSomeSelected = useMemo(
    () =>
      data.some((item) => selectedIds.includes(getKey(item))) &&
      !isAllSelected,
    [data, selectedIds, isAllSelected]
  );

  const handleSelectAll = () => {
    if (!onSelectionChange) return;
    if (isAllSelected) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map(getKey));
    }
  };

  const handleSelectItem = (item: T) => {
    if (!onSelectionChange) return;
    const key = getKey(item);
    if (selectedIds.includes(key)) {
      onSelectionChange(selectedIds.filter((id) => id !== key));
    } else {
      onSelectionChange([...selectedIds, key]);
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className={`table-container ${className}`}>
        <table className="table">
          <thead>
            <tr>
              {selectable && <th className="w-12"><Skeleton width={20} height={20} /></th>}
              {columns.map((col) => (
                <th key={col.key} style={{ width: col.width }}>
                  <Skeleton height={16} width="70%" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }).map((_, i) => (
              <tr key={i}>
                {selectable && <td><Skeleton width={20} height={20} /></td>}
                {columns.map((col) => (
                  <td key={col.key}>
                    <Skeleton height={16} width={col.width ? "100%" : "60%"} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // Render empty state
  if (data.length === 0) {
    return (
      <div className={`border border-border rounded-xl ${className}`}>
        <EmptyState
          icon={emptyState?.icon || (
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          )}
          title={emptyState?.title || "ไม่พบข้อมูล"}
          description={emptyState?.description}
          action={emptyState?.action}
        />
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      {/* Selection info */}
      {selectable && selectedIds.length > 0 && (
        <div className="flex items-center justify-between px-4 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <span className="text-sm text-primary-700 dark:text-primary-300">
            เลือก {selectedIds.length} รายการ
          </span>
          <Button variant="ghost" size="sm" onClick={() => onSelectionChange?.([])}>
            ยกเลิกทั้งหมด
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="table-container overflow-x-auto">
        <table className="table min-w-full">
          <thead>
            <tr>
              {selectable && (
                <th className="w-12 text-center">
                  <Checkbox
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    aria-label="Select all"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`
                    ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left"}
                    ${col.sticky ? "sticky left-0 bg-muted/5 z-10" : ""}
                    ${col.sortable && sortable ? "cursor-pointer hover:bg-muted/10 select-none" : ""}
                  `}
                  onClick={() => col.sortable && sortable && onSort?.(col.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.header}</span>
                    {col.sortable && sortable && sortBy === col.key && (
                      <svg
                        className={`w-4 h-4 transition-transform ${sortOrder === "desc" ? "rotate-180" : ""}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const key = getKey(item);
              const isSelected = selectedIds.includes(key);

              return (
                <tr
                  key={key}
                  className={`
                    ${isSelected ? "bg-primary-50/50 dark:bg-primary-900/10" : ""}
                    ${onRowClick ? "cursor-pointer hover:bg-muted/5" : ""}
                    ${rowClassName?.(item, index) || ""}
                  `}
                  onClick={() => onRowClick?.(item)}
                >
                  {selectable && (
                    <td className="text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onChange={() => handleSelectItem(item)}
                        aria-label={`Select row ${index + 1}`}
                      />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`
                        ${col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : ""}
                        ${col.sticky ? "sticky left-0 bg-card z-10" : ""}
                      `}
                    >
                      {col.render
                        ? col.render(item, index)
                        : String(item[col.key] ?? "-")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
          <div className="text-sm text-muted">
            แสดง {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} -{" "}
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} จาก {pagination.total} รายการ
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(1)}
              disabled={pagination.page <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <span className="px-3 py-1 text-sm font-medium">
              หน้า {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize) || 1}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(pagination.page + 1)}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => pagination.onPageChange(Math.ceil(pagination.total / pagination.pageSize))}
              disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
