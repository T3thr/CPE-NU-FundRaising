"use client";
// =============================================================================
// Theme Provider - Best Practice for Next.js 15 + Tailwind 4
// Uses next-themes for zero-flickering theme switching
// =============================================================================

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Best Practice Theme Provider using next-themes
 * - Prevents flash of incorrect theme (FOIT)
 * - SSR compatible with suppressHydrationWarning
 * - Works with Tailwind CSS 4's class-based dark mode
 * - Persists theme preference to localStorage
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="cpe-funds-theme"
    >
      {children}
    </NextThemesProvider>
  );
}

export { useTheme } from "next-themes";
