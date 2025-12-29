/**
 * @file ThalamusLogo.tsx
 * @description Thalamus brand logo component with theme-aware rendering. Displays the
 * appropriate logo variant (light/dark) based on the current theme.
 */

import { useTheme } from "../lib/theme";

type ThalamusLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { height: 28 },
  md: { height: 36 },
  lg: { height: 48 },
};

export function ThalamusLogo({ className = "", size = "md" }: ThalamusLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { height } = sizes[size];

  // Use white logo for dark mode, black logo for light mode
  const logoSrc = isDark
    ? "/assets/logo/thalamus-full-lockup---horizontal-white-rgb.svg"
    : "/assets/logo/thalamus-full-lockup---horizontal-black-rgb.svg";

  return (
    <img src={logoSrc} alt="Thalamus" height={height} style={{ height }} className={className} />
  );
}

export function ThalamusLogoIcon({
  className = "",
  size = 32,
}: {
  className?: string;
  size?: number;
}) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Use white logo for dark mode, black logo for light mode
  const logoSrc = isDark
    ? "/assets/logo/thalamus-simplified-white-rgb.svg"
    : "/assets/logo/thalamus-simplified-black-rgb.svg";

  return <img src={logoSrc} alt="Thalamus" width={size} height={size} className={className} />;
}
