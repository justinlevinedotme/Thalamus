import { useTheme } from "@/lib/theme";

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

  const logoSrc = isDark ? "/logo-white.svg" : "/logo-black.svg";

  return (
    <img src={logoSrc} alt="Thalamus" height={height} style={{ height }} className={className} />
  );
}
