"use client";

import Image from "next/image";

type ThalamusLogoProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
};

const sizes = {
  sm: 28,
  md: 36,
  lg: 48,
};

export function ThalamusLogo({ className = "", size = "md" }: ThalamusLogoProps) {
  const height = sizes[size];

  return (
    <>
      <Image
        src="/assets/logo/thalamus-full-lockup---horizontal-black-rgb.svg"
        alt="Thalamus"
        width={200}
        height={height}
        className={`dark:hidden ${className}`}
        style={{ height, width: "auto" }}
        priority
      />
      <Image
        src="/assets/logo/thalamus-full-lockup---horizontal-white-rgb.svg"
        alt="Thalamus"
        width={200}
        height={height}
        className={`hidden dark:block ${className}`}
        style={{ height, width: "auto" }}
        priority
      />
    </>
  );
}
