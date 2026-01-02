/**
 * @file constants.ts
 * @description Shared constants for authentication components including password validation rules.
 */

/**
 * Password validation requirements used across signup and password reset flows.
 * Each requirement has a unique id, display label, and test function.
 */
export const PASSWORD_REQUIREMENTS = [
  { id: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
  { id: "uppercase", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
  { id: "lowercase", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
  { id: "number", label: "One number", test: (p: string) => /\d/.test(p) },
] as const;

export type PasswordRequirement = (typeof PASSWORD_REQUIREMENTS)[number];

/**
 * Validates a password against all requirements.
 * @param password - The password to validate
 * @returns Array of requirements with their pass/fail status
 */
export function validatePassword(password: string) {
  return PASSWORD_REQUIREMENTS.map((req) => ({
    ...req,
    passed: req.test(password),
  }));
}

/**
 * Checks if a password meets all requirements.
 * @param password - The password to check
 * @returns true if all requirements are met
 */
export function isPasswordValid(password: string): boolean {
  return PASSWORD_REQUIREMENTS.every((req) => req.test(password));
}
