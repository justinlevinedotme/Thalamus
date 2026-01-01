import { describe, it, expect } from "vitest";
import { PASSWORD_REQUIREMENTS, validatePassword, isPasswordValid } from "./constants";

describe("PASSWORD_REQUIREMENTS", () => {
  it("has 4 requirements", () => {
    expect(PASSWORD_REQUIREMENTS).toHaveLength(4);
  });

  it("each requirement has id, label, and test function", () => {
    PASSWORD_REQUIREMENTS.forEach((req) => {
      expect(req).toHaveProperty("id");
      expect(req).toHaveProperty("label");
      expect(req).toHaveProperty("test");
      expect(typeof req.test).toBe("function");
    });
  });

  describe("length requirement", () => {
    const lengthReq = PASSWORD_REQUIREMENTS.find((r) => r.id === "length")!;

    it("fails for passwords shorter than 8 characters", () => {
      expect(lengthReq.test("")).toBe(false);
      expect(lengthReq.test("1234567")).toBe(false);
    });

    it("passes for passwords 8+ characters", () => {
      expect(lengthReq.test("12345678")).toBe(true);
      expect(lengthReq.test("123456789")).toBe(true);
    });
  });

  describe("uppercase requirement", () => {
    const upperReq = PASSWORD_REQUIREMENTS.find((r) => r.id === "uppercase")!;

    it("fails for passwords without uppercase", () => {
      expect(upperReq.test("lowercase")).toBe(false);
      expect(upperReq.test("12345678")).toBe(false);
    });

    it("passes for passwords with uppercase", () => {
      expect(upperReq.test("Uppercase")).toBe(true);
      expect(upperReq.test("ABC")).toBe(true);
    });
  });

  describe("lowercase requirement", () => {
    const lowerReq = PASSWORD_REQUIREMENTS.find((r) => r.id === "lowercase")!;

    it("fails for passwords without lowercase", () => {
      expect(lowerReq.test("UPPERCASE")).toBe(false);
      expect(lowerReq.test("12345678")).toBe(false);
    });

    it("passes for passwords with lowercase", () => {
      expect(lowerReq.test("lowercase")).toBe(true);
      expect(lowerReq.test("ABC123a")).toBe(true);
    });
  });

  describe("number requirement", () => {
    const numberReq = PASSWORD_REQUIREMENTS.find((r) => r.id === "number")!;

    it("fails for passwords without numbers", () => {
      expect(numberReq.test("NoNumbers")).toBe(false);
      expect(numberReq.test("abcdefgh")).toBe(false);
    });

    it("passes for passwords with numbers", () => {
      expect(numberReq.test("Has1Number")).toBe(true);
      expect(numberReq.test("12345678")).toBe(true);
    });
  });
});

describe("validatePassword", () => {
  it("returns array with passed status for each requirement", () => {
    const result = validatePassword("Test123!");

    expect(result).toHaveLength(4);
    result.forEach((req) => {
      expect(req).toHaveProperty("id");
      expect(req).toHaveProperty("label");
      expect(req).toHaveProperty("test");
      expect(req).toHaveProperty("passed");
      expect(typeof req.passed).toBe("boolean");
    });
  });

  it("marks all as failed for empty password", () => {
    const result = validatePassword("");

    expect(result.every((r) => r.passed === false)).toBe(true);
  });

  it("marks all as passed for strong password", () => {
    const result = validatePassword("StrongPass1");

    expect(result.every((r) => r.passed === true)).toBe(true);
  });

  it("correctly identifies partial compliance", () => {
    const result = validatePassword("short");

    const lengthResult = result.find((r) => r.id === "length");
    const lowercaseResult = result.find((r) => r.id === "lowercase");
    const uppercaseResult = result.find((r) => r.id === "uppercase");
    const numberResult = result.find((r) => r.id === "number");

    expect(lengthResult?.passed).toBe(false);
    expect(lowercaseResult?.passed).toBe(true);
    expect(uppercaseResult?.passed).toBe(false);
    expect(numberResult?.passed).toBe(false);
  });
});

describe("isPasswordValid", () => {
  it("returns false for empty password", () => {
    expect(isPasswordValid("")).toBe(false);
  });

  it("returns false for password missing length", () => {
    expect(isPasswordValid("Aa1")).toBe(false);
  });

  it("returns false for password missing uppercase", () => {
    expect(isPasswordValid("lowercase1")).toBe(false);
  });

  it("returns false for password missing lowercase", () => {
    expect(isPasswordValid("UPPERCASE1")).toBe(false);
  });

  it("returns false for password missing number", () => {
    expect(isPasswordValid("NoNumbersHere")).toBe(false);
  });

  it("returns true for valid password meeting all requirements", () => {
    expect(isPasswordValid("ValidPass1")).toBe(true);
    expect(isPasswordValid("Another1Good")).toBe(true);
    expect(isPasswordValid("12345678Aa")).toBe(true);
  });
});
