"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle with Enhanced Radial Ripple Animation
 * - More visible ripple effect (opacity 0.6 → 0)
 * - Gradient ripple color for better visibility
 * - Consistent animation trigger
 * - Does NOT block content (pointerEvents: none)
 */
export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { setTheme, resolvedTheme } = useTheme();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    targetTheme: "light" | "dark";
    key: number;
  } | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = resolvedTheme === "dark" ? "light" : "dark";

    // Get button position for ripple origin
    const button = buttonRef.current;
    if (button) {
      const rect = button.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      // Show visual ripple guide with unique key to force re-render
      setRipple({ x, y, targetTheme: newTheme, key: Date.now() });
    }

    // Change theme immediately - CSS transitions handle the visual change
    setTheme(newTheme);

    // Clear ripple after animation
    setTimeout(() => {
      setRipple(null);
    }, 800);
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

  // Calculate max radius for full screen coverage
  const getMaxRadius = () => {
    if (typeof window === "undefined") return 2000;
    return Math.ceil(Math.sqrt(
      Math.pow(window.innerWidth, 2) + Math.pow(window.innerHeight, 2)
    ));
  };

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
          transition: "background-color 0.3s ease, border-color 0.3s ease",
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

      {/* Enhanced Radial Ripple - More visible but still doesn't block */}
      <AnimatePresence>
        {ripple && (
          <motion.div
            key={ripple.key}
            initial={{
              clipPath: `circle(0px at ${ripple.x}px ${ripple.y}px)`,
              opacity: 0.65,
            }}
            animate={{
              clipPath: `circle(${getMaxRadius()}px at ${ripple.x}px ${ripple.y}px)`,
              opacity: 0,
            }}
            exit={{
              opacity: 0,
            }}
            transition={{
              clipPath: { duration: 0.7, ease: [0.4, 0, 0.2, 1] },
              opacity: { duration: 0.7, ease: "easeOut" },
            }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: ripple.targetTheme === "dark" 
                ? "radial-gradient(circle at center, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)"
                : "radial-gradient(circle at center, #fef3c7 0%, #fde68a 50%, #fbbf24 100%)",
              zIndex: 9998,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* Global transition styles for smooth theme change */}
      <style jsx global>{`
        /* Smooth transitions for all themed elements */
        body,
        main,
        header,
        footer,
        nav,
        .card,
        [style*="background"],
        [style*="border"],
        [class*="bg-"],
        [class*="border-"] {
          transition: 
            background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
            color 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Respect user preferences */
        @media (prefers-reduced-motion: reduce) {
          body,
          .card,
          [style*="background"],
          [style*="border"] {
            transition: none !important;
          }
        }
      `}</style>
    </>
  );
}
