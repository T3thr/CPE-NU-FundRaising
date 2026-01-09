"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle with View Transitions API
 * 
 * Modern approach (2025-2026 standard):
 * - Uses View Transitions API for browsers that support it
 * - Content colors change following radial pattern - NO blocking overlay
 * - Fallback to smooth CSS transitions for older browsers
 * 
 * How View Transitions work:
 * 1. Browser captures "before" screenshot
 * 2. Theme changes
 * 3. Browser captures "after" screenshot  
 * 4. CSS animates between them with clip-path
 * 5. ACTUAL content is visible and changing - not covered by overlay
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(async () => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";
    
    // Get button position for radial origin
    const button = buttonRef.current;
    if (!button) {
      setTheme(newTheme);
      return;
    }

    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    // Calculate max radius to cover entire screen
    const maxX = Math.max(x, window.innerWidth - x);
    const maxY = Math.max(y, window.innerHeight - y);
    const maxRadius = Math.ceil(Math.sqrt(maxX * maxX + maxY * maxY));

    // Set CSS variables for the animation origin
    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-radius", `${maxRadius}px`);

    // Check for View Transitions API support
    const doc = document as Document & {
      startViewTransition?: (callback: () => Promise<void> | void) => {
        ready: Promise<void>;
        finished: Promise<void>;
      };
    };

    if (doc.startViewTransition) {
      // Use View Transitions API - content changes with radial reveal, NO overlay
      const transition = doc.startViewTransition(() => {
        setTheme(newTheme);
      });

      // Wait for transition to be ready then add "active" class for CSS targeting
      await transition.ready;
      document.documentElement.classList.add("theme-transitioning");
      
      await transition.finished;
      document.documentElement.classList.remove("theme-transitioning");
    } else {
      // Fallback: Just change theme with CSS transitions
      setTheme(newTheme);
    }
  }, [resolvedTheme, setTheme]);

  if (!mounted) {
    return (
      <div
        style={{ width: "40px", height: "40px" }}
        className="animate-pulse bg-slate-200 dark:bg-slate-700 rounded-lg"
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleTheme}
        aria-label="Toggle Theme"
        style={{
          position: "relative",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: "1px solid var(--border)",
          backgroundColor: "var(--card)",
          color: "var(--foreground)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          cursor: "pointer",
        }}
        className="hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={resolvedTheme}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            {isDark ? (
              <Moon style={{ width: "20px", height: "20px" }} />
            ) : (
              <Sun style={{ width: "20px", height: "20px" }} />
            )}
          </motion.div>
        </AnimatePresence>
      </button>

      {/* View Transitions CSS - This makes CONTENT change radially, not an overlay */}
      <style jsx global>{`
        /* CSS Variables for animation origin */
        :root {
          --theme-x: 50vw;
          --theme-y: 50vh;
          --theme-radius: 150vmax;
        }

        /* View Transitions API - Radial Reveal Animation */
        /* This affects the ACTUAL content, not an overlay */
        ::view-transition-old(root),
        ::view-transition-new(root) {
          animation: none;
          mix-blend-mode: normal;
        }

        ::view-transition-old(root) {
          z-index: 1;
        }

        ::view-transition-new(root) {
          z-index: 2;
          animation: radialReveal 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        @keyframes radialReveal {
          from {
            clip-path: circle(0px at var(--theme-x) var(--theme-y));
          }
          to {
            clip-path: circle(var(--theme-radius) at var(--theme-x) var(--theme-y));
          }
        }

        /* Fallback for browsers without View Transitions API */
        /* Smooth color transitions when API not available */
        @supports not (view-transition-name: root) {
          body,
          .card,
          header,
          footer,
          nav,
          main {
            transition: 
              background-color 0.3s ease-out,
              border-color 0.3s ease-out,
              color 0.25s ease-out;
          }
        }

        /* Respect user preferences */
        @media (prefers-reduced-motion: reduce) {
          ::view-transition-old(root),
          ::view-transition-new(root) {
            animation: none !important;
          }
        }
      `}</style>
    </>
  );
}
