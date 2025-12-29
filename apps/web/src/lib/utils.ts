/**
 * @file utils.ts
 * @description Shared utility functions for the application. Provides cn() helper
 * for merging Tailwind CSS classes using clsx and tailwind-merge.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
