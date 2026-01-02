/**
 * @file AuthPageLayout.tsx
 * @description Shared layout wrapper for authentication pages.
 * Provides consistent styling with horizon glow background, header, and footer.
 */

import type { ReactNode } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useTheme } from "../../lib/theme";

export interface AuthPageLayoutProps {
  /** Main content to render in the centered card area */
  children: ReactNode;
}

/**
 * Layout wrapper for authentication pages (login, signup, password reset, etc.)
 * Provides:
 * - Horizon glow background (adapts to light/dark theme)
 * - Site header
 * - Centered content area
 * - Site footer
 */
export function AuthPageLayout({ children }: AuthPageLayoutProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full">
      {/* Horizon Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: isDark
            ? "radial-gradient(125% 125% at 50% 90%, #000000 40%, #1a0a00 100%)"
            : "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #fff5f0 100%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center px-4 py-12">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
