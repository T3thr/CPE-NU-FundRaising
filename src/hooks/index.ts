"use client";
// =============================================================================
// Custom Hooks - Data & State Management
// =============================================================================

import { useState, useEffect, useCallback, useMemo } from "react";
import { useNotification } from "@/providers/notification-provider";

// =============================================================================
// useDebounce - Debounce value changes
// =============================================================================
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// =============================================================================
// useLocalStorage - Persistent state in localStorage
// =============================================================================
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        if (typeof window !== "undefined") {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error("useLocalStorage error:", error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// =============================================================================
// useMediaQuery - Responsive breakpoint detection
// =============================================================================
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener("change", listener);


    return () => media.removeEventListener("change", listener);
  }, [query]);

  return matches;
}

// Preset breakpoints
export function useIsMobile(): boolean {
  return useMediaQuery("(max-width: 767px)");
}

export function useIsTablet(): boolean {
  return useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)");
}

// =============================================================================
// useToggle - Boolean toggle state
// =============================================================================
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

// =============================================================================
// useAsync - Async function wrapper with loading/error states
// =============================================================================
interface AsyncState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useAsync<T>(
  asyncFn: () => Promise<T>,
  dependencies: unknown[] = []
): AsyncState<T> & { execute: () => Promise<void>; reset: () => void } {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(async () => {
    setState({ data: null, isLoading: true, error: null });
    try {
      const result = await asyncFn();
      setState({ data: result, isLoading: false, error: null });
    } catch (error) {
      setState({ data: null, isLoading: false, error: error as Error });
    }
  }, dependencies);

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// =============================================================================
// usePagination - Pagination state management
// =============================================================================
interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface PaginationState {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
}

export function usePagination(options: PaginationOptions = {}): PaginationState {
  const {
    initialPage = 1,
    initialPageSize = 10,
    totalItems: initialTotal = 0,
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [totalItems, setTotalItems] = useState(initialTotal);

  const totalPages = useMemo(
    () => Math.ceil(totalItems / pageSize) || 1,
    [totalItems, pageSize]
  );

  const startIndex = useMemo(() => (page - 1) * pageSize, [page, pageSize]);
  const endIndex = useMemo(
    () => Math.min(startIndex + pageSize, totalItems),
    [startIndex, pageSize, totalItems]
  );

  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const nextPage = useCallback(() => {
    if (hasNextPage) setPage((p) => p + 1);
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) setPage((p) => p - 1);
  }, [hasPrevPage]);

  const firstPage = useCallback(() => setPage(1), []);
  const lastPage = useCallback(() => setPage(totalPages), [totalPages]);

  // Reset to first page when pageSize changes
  useEffect(() => {
    setPage(1);
  }, [pageSize]);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    setPage,
    setPageSize,
    setTotalItems,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
  };
}

// =============================================================================
// useSelection - Multi-select state management
// =============================================================================
interface SelectionState<T> {
  selectedItems: T[];
  isSelected: (item: T) => boolean;
  toggle: (item: T) => void;
  select: (item: T) => void;
  deselect: (item: T) => void;
  selectAll: (items: T[]) => void;
  deselectAll: () => void;
  toggleAll: (items: T[]) => void;
  isAllSelected: (items: T[]) => boolean;
  isSomeSelected: (items: T[]) => boolean;
  count: number;
}

export function useSelection<T>(
  getKey: (item: T) => string = (item: any) => item.id
): SelectionState<T> {
  const [selectedMap, setSelectedMap] = useState<Map<string, T>>(new Map());

  const selectedItems = useMemo(
    () => Array.from(selectedMap.values()),
    [selectedMap]
  );

  const isSelected = useCallback(
    (item: T) => selectedMap.has(getKey(item)),
    [selectedMap, getKey]
  );

  const toggle = useCallback(
    (item: T) => {
      const key = getKey(item);
      setSelectedMap((prev) => {
        const next = new Map(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.set(key, item);
        }
        return next;
      });
    },
    [getKey]
  );

  const select = useCallback(
    (item: T) => {
      setSelectedMap((prev) => new Map(prev).set(getKey(item), item));
    },
    [getKey]
  );

  const deselect = useCallback(
    (item: T) => {
      setSelectedMap((prev) => {
        const next = new Map(prev);
        next.delete(getKey(item));
        return next;
      });
    },
    [getKey]
  );

  const selectAll = useCallback(
    (items: T[]) => {
      setSelectedMap(new Map(items.map((item) => [getKey(item), item])));
    },
    [getKey]
  );

  const deselectAll = useCallback(() => {
    setSelectedMap(new Map());
  }, []);

  const toggleAll = useCallback(
    (items: T[]) => {
      const allSelected = items.every((item) => selectedMap.has(getKey(item)));
      if (allSelected) {
        deselectAll();
      } else {
        selectAll(items);
      }
    },
    [selectedMap, getKey, selectAll, deselectAll]
  );

  const isAllSelected = useCallback(
    (items: T[]) =>
      items.length > 0 && items.every((item) => selectedMap.has(getKey(item))),
    [selectedMap, getKey]
  );

  const isSomeSelected = useCallback(
    (items: T[]) =>
      items.some((item) => selectedMap.has(getKey(item))) &&
      !items.every((item) => selectedMap.has(getKey(item))),
    [selectedMap, getKey]
  );

  return {
    selectedItems,
    isSelected,
    toggle,
    select,
    deselect,
    selectAll,
    deselectAll,
    toggleAll,
    isAllSelected,
    isSomeSelected,
    count: selectedItems.length,
  };
}

// =============================================================================
// useFilter - Filter state management with search
// =============================================================================
interface FilterState<T> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filters: T;
  setFilter: <K extends keyof T>(key: K, value: T[K]) => void;
  setFilters: (filters: Partial<T>) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
}

export function useFilter<T extends Record<string, unknown>>(
  initialFilters: T
): FilterState<T> {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFiltersState] = useState<T>(initialFilters);

  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFiltersState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFilters = useCallback((newFilters: Partial<T>) => {
    setFiltersState((prev) => ({ ...prev, ...newFilters }));
  }, []);

  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setFiltersState(initialFilters);
  }, [initialFilters]);

  const hasActiveFilters = useMemo(() => {
    if (searchQuery) return true;
    return Object.entries(filters).some(([key, value]) => {
      const initial = initialFilters[key as keyof T];
      return value !== initial;
    });
  }, [searchQuery, filters, initialFilters]);

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
  };
}

// =============================================================================
// useConfirm - Confirmation dialog state
// =============================================================================
interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirm: (options: { title: string; message: string }) => Promise<boolean>;
}

export function useConfirm(): ConfirmState {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(
    null
  );

  const confirm = useCallback(
    (options: { title: string; message: string }): Promise<boolean> => {
      setTitle(options.title);
      setMessage(options.message);
      setIsOpen(true);

      return new Promise((resolve) => {
        setResolver(() => resolve);
      });
    },
    []
  );

  const onConfirm = useCallback(() => {
    setIsOpen(false);
    resolver?.(true);
    setResolver(null);
  }, [resolver]);

  const onCancel = useCallback(() => {
    setIsOpen(false);
    resolver?.(false);
    setResolver(null);
  }, [resolver]);

  return {
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirm,
  };
}
