import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PasswordStrengthIndicator } from "./PasswordStrengthIndicator";

describe("PasswordStrengthIndicator", () => {
  it("renders all 4 requirements", () => {
    render(<PasswordStrengthIndicator password="" />);

    expect(screen.getByText("At least 8 characters")).toBeInTheDocument();
    expect(screen.getByText("One uppercase letter")).toBeInTheDocument();
    expect(screen.getByText("One lowercase letter")).toBeInTheDocument();
    expect(screen.getByText("One number")).toBeInTheDocument();
  });

  describe("inline variant (default)", () => {
    it("uses inline variant by default", () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);

      expect(container.querySelector(".mt-2.space-y-1")).toBeInTheDocument();
      expect(container.querySelector(".bg-secondary")).not.toBeInTheDocument();
    });

    it("wraps each requirement label in span", () => {
      render(<PasswordStrengthIndicator password="" />);

      const lengthText = screen.getByText("At least 8 characters");
      expect(lengthText.tagName).toBe("SPAN");
    });
  });

  describe("boxed variant", () => {
    it("renders with boxed styling", () => {
      const { container } = render(<PasswordStrengthIndicator password="" variant="boxed" />);

      expect(container.querySelector(".bg-secondary")).toBeInTheDocument();
      expect(screen.getByText("Password requirements:")).toBeInTheDocument();
    });

    it("does not wrap labels in span", () => {
      render(<PasswordStrengthIndicator password="" variant="boxed" />);

      const lengthText = screen.getByText("At least 8 characters");
      expect(lengthText.tagName).toBe("DIV");
    });
  });

  describe("validation display", () => {
    it("shows all requirements as not passed for empty password", () => {
      const { container } = render(<PasswordStrengthIndicator password="" />);

      const items = container.querySelectorAll(".text-muted-foreground");
      expect(items.length).toBe(4);
    });

    it("shows length as passed when password is 8+ chars", () => {
      const { container } = render(<PasswordStrengthIndicator password="12345678" />);

      const passedItems = container.querySelectorAll(".text-green-600");
      expect(passedItems.length).toBeGreaterThanOrEqual(1);
    });

    it("shows all as passed for strong password", () => {
      const { container } = render(<PasswordStrengthIndicator password="StrongPass1" />);

      const passedItems = container.querySelectorAll(".text-green-600");
      expect(passedItems.length).toBe(4);
    });

    it("shows partial compliance correctly", () => {
      const { container } = render(<PasswordStrengthIndicator password="lowercase" />);

      const passedItems = container.querySelectorAll(".text-green-600");
      const failedItems = container.querySelectorAll(".text-muted-foreground");

      expect(passedItems.length).toBe(2);
      expect(failedItems.length).toBe(2);
    });
  });

  it("applies custom className", () => {
    const { container } = render(
      <PasswordStrengthIndicator password="" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies custom className to boxed variant", () => {
    const { container } = render(
      <PasswordStrengthIndicator password="" variant="boxed" className="custom-class" />
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
