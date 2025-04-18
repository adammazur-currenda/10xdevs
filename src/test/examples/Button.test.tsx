import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";

// Simple Button component for testing
const Button = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}>{children}</button>
);

describe("Button Component", () => {
  it("renders correctly", () => {
    render(<Button onClick={() => {}}>Click me</Button>);

    expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
