import { Button as EmailButton } from "@react-email/components";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger";
}

export const Button = ({ href, children, variant = "primary" }: ButtonProps) => {
  const styles: React.CSSProperties = {
    borderRadius: "6px",
    display: "inline-block",
    fontSize: "14px",
    fontWeight: "500",
    padding: "10px 20px",
    textDecoration: "none",
    textAlign: "center" as const,
  };

  if (variant === "danger") {
    styles.backgroundColor = "#dc2626"; // red-600
    styles.color = "#ffffff";
  } else if (variant === "secondary") {
    styles.backgroundColor = "#ffffff";
    styles.color = "#0f172a"; // slate-900
    styles.border = "1px solid #e2e8f0"; // slate-200
  } else {
    styles.backgroundColor = "#0f172a"; // slate-900
    styles.color = "#ffffff";
  }

  return (
    <EmailButton href={href} style={styles}>
      {children}
    </EmailButton>
  );
};

export default Button;
