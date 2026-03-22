import { MemoryRouter } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

type AppTestProvidersProps = {
  children: ReactNode;
  initialEntries?: string[];
};

export function AppTestProviders({ children, initialEntries = ["/"] }: AppTestProvidersProps) {
  return (
    <ThemeProvider>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </ThemeProvider>
  );
}

export function renderWithAppProviders(ui: ReactElement, initialEntries?: string[], options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    wrapper: ({ children }) => <AppTestProviders initialEntries={initialEntries}>{children}</AppTestProviders>,
    ...options,
  });
}
