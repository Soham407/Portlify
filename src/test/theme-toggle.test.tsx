import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { Route, Routes, useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/ThemeToggle";
import { useTheme } from "@/contexts/ThemeContext";
import { AppTestProviders } from "./test-utils";

function ThemeHarness() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const currentTheme = theme ?? "light";

  return (
    <div>
      <p aria-label="current-theme">{currentTheme}</p>
      <ThemeToggle />
      <button type="button" onClick={() => setTheme("light")}>Switch to light</button>
      <button type="button" onClick={() => navigate("/next")}>Go next</button>
    </div>
  );
}

function renderThemeApp(initialEntries = ["/"]) {
  return render(
    <AppTestProviders initialEntries={initialEntries}>
      <Routes>
        <Route path="/" element={<ThemeHarness />} />
        <Route path="/next" element={<ThemeHarness />} />
      </Routes>
    </AppTestProviders>,
  );
}

beforeEach(() => {
  window.localStorage?.removeItem?.("theme");
  document.documentElement.className = "";
});

afterEach(() => {
  window.localStorage?.removeItem?.("theme");
  document.documentElement.className = "";
});

describe("theme toggle", () => {
  it("starts light, switches to wood, and persists through navigation and remounts", async () => {
    const { unmount } = renderThemeApp();

    await waitFor(() => expect(screen.getByLabelText("current-theme")).toHaveTextContent("light"));
    expect(document.documentElement).toHaveClass("light");

    fireEvent.click(screen.getByRole("button", { name: /switch to wood theme/i }));

    await waitFor(() => expect(screen.getByLabelText("current-theme")).toHaveTextContent("wood"));
    expect(document.documentElement).toHaveClass("wood");
    expect(localStorage.getItem("theme")).toBe("wood");

    fireEvent.click(screen.getByRole("button", { name: /go next/i }));

    await waitFor(() => expect(screen.getByLabelText("current-theme")).toHaveTextContent("wood"));
    expect(document.documentElement).toHaveClass("wood");

    unmount();

    renderThemeApp(["/next"]);

    await waitFor(() => expect(screen.getByLabelText("current-theme")).toHaveTextContent("wood"));
    expect(document.documentElement).toHaveClass("wood");
    expect(localStorage.getItem("theme")).toBe("wood");
  });

  it("migrates a stored dark preference to wood", async () => {
    localStorage.setItem("theme", "dark");

    renderThemeApp();

    await waitFor(() => expect(screen.getByLabelText("current-theme")).toHaveTextContent("wood"));
    expect(document.documentElement).toHaveClass("wood");
    await waitFor(() => expect(localStorage.getItem("theme")).toBe("wood"));
  });
});
