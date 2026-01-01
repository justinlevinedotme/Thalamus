import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  it("renders as password input by default", () => {
    render(<PasswordInput placeholder="Enter password" />);

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("has a toggle button with correct initial aria-label", () => {
    render(<PasswordInput />);

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    expect(toggleButton).toBeInTheDocument();
  });

  it("toggle button has tabIndex -1 to skip in tab order", () => {
    render(<PasswordInput />);

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    expect(toggleButton).toHaveAttribute("tabIndex", "-1");
  });

  describe("uncontrolled mode", () => {
    it("toggles password visibility on button click", async () => {
      const user = userEvent.setup();
      render(<PasswordInput placeholder="password" />);

      const input = screen.getByPlaceholderText("password");
      const toggleButton = screen.getByRole("button", { name: "Show password" });

      expect(input).toHaveAttribute("type", "password");

      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "text");
      expect(screen.getByRole("button", { name: "Hide password" })).toBeInTheDocument();

      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "password");
      expect(screen.getByRole("button", { name: "Show password" })).toBeInTheDocument();
    });
  });

  describe("controlled mode", () => {
    it("respects showPassword prop", () => {
      const { rerender } = render(<PasswordInput placeholder="password" showPassword={false} />);

      const input = screen.getByPlaceholderText("password");
      expect(input).toHaveAttribute("type", "password");

      rerender(<PasswordInput placeholder="password" showPassword={true} />);
      expect(input).toHaveAttribute("type", "text");
    });

    it("calls onVisibilityChange when toggle is clicked", async () => {
      const user = userEvent.setup();
      const onVisibilityChange = vi.fn();

      render(
        <PasswordInput
          placeholder="password"
          showPassword={false}
          onVisibilityChange={onVisibilityChange}
        />
      );

      const toggleButton = screen.getByRole("button", { name: "Show password" });
      await user.click(toggleButton);

      expect(onVisibilityChange).toHaveBeenCalledWith(true);
    });

    it("calls onVisibilityChange with false when hiding", async () => {
      const user = userEvent.setup();
      const onVisibilityChange = vi.fn();

      render(
        <PasswordInput
          placeholder="password"
          showPassword={true}
          onVisibilityChange={onVisibilityChange}
        />
      );

      const toggleButton = screen.getByRole("button", { name: "Hide password" });
      await user.click(toggleButton);

      expect(onVisibilityChange).toHaveBeenCalledWith(false);
    });
  });

  it("passes through standard input props", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<PasswordInput placeholder="password" onChange={onChange} id="test-id" required />);

    const input = screen.getByPlaceholderText("password");
    expect(input).toHaveAttribute("id", "test-id");
    expect(input).toBeRequired();

    await user.type(input, "test");
    expect(onChange).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<PasswordInput className="custom-class" data-testid="input" />);

    const input = screen.getByTestId("input");
    expect(input).toHaveClass("custom-class");
  });

  it("forwards ref to input element", () => {
    const ref = vi.fn();
    render(<PasswordInput ref={ref} />);

    expect(ref).toHaveBeenCalled();
    expect(ref.mock.calls[0][0]).toBeInstanceOf(HTMLInputElement);
  });
});
