import { useTheme } from "../lib/theme";

type ThalamusLogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: { icon: 24, text: 16, gap: 6 },
  md: { icon: 32, text: 20, gap: 8 },
  lg: { icon: 48, text: 28, gap: 10 },
};

export function ThalamusLogo({
  className = "",
  showWordmark = true,
  size = "md",
}: ThalamusLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { icon, text, gap } = sizes[size];

  // Colors based on theme - monochrome
  const primaryColor = isDark ? "#fafafa" : "#171717";
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";
  const textColor = isDark ? "#fafafa" : "#171717";

  return (
    <div className={`flex items-center ${className}`} style={{ gap }}>
      {/* Icon */}
      <svg
        width={icon}
        height={icon}
        viewBox="0 0 60 60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="2"
          y="2"
          width="54"
          height="54"
          rx="13"
          fill={primaryColor}
          fillOpacity={0.15}
          transform="rotate(20 30 30)"
        />
        <rect
          x="5"
          y="5"
          width="48"
          height="48"
          rx="12"
          fill={primaryColor}
          fillOpacity={0.3}
          transform="rotate(5 30 30)"
        />
        <rect
          x="8"
          y="8"
          width="42"
          height="42"
          rx="10"
          fill={primaryColor}
          transform="rotate(-10 30 30)"
        />
        <circle cx="30" cy="30" r="7" fill={bgColor} />
        <circle cx="30" cy="30" r="3" fill={primaryColor} />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className="font-semibold tracking-tight" style={{ fontSize: text, color: textColor }}>
          Thalamus
        </span>
      )}
    </div>
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
  const primaryColor = isDark ? "#fafafa" : "#171717";
  const bgColor = isDark ? "#0a0a0a" : "#ffffff";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect
        x="2"
        y="2"
        width="54"
        height="54"
        rx="13"
        fill={primaryColor}
        fillOpacity={0.15}
        transform="rotate(20 30 30)"
      />
      <rect
        x="5"
        y="5"
        width="48"
        height="48"
        rx="12"
        fill={primaryColor}
        fillOpacity={0.3}
        transform="rotate(5 30 30)"
      />
      <rect
        x="8"
        y="8"
        width="42"
        height="42"
        rx="10"
        fill={primaryColor}
        transform="rotate(-10 30 30)"
      />
      <circle cx="30" cy="30" r="7" fill={bgColor} />
      <circle cx="30" cy="30" r="3" fill={primaryColor} />
    </svg>
  );
}
