import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import { ReactNode, useEffect } from "react";

export const APP_THEMES = ["light", "wood"] as const;
export type AppTheme = (typeof APP_THEMES)[number];

const LEGACY_THEMES = ["dark"] as const;
const NEXT_THEME_VALUES = [...APP_THEMES, ...LEGACY_THEMES] as const;

const normalizeAppTheme = (theme?: string) => {
  if (theme === "dark") return "wood";
  if (theme === "light" || theme === "wood") return theme;
  return undefined;
};

const LegacyThemeMigration = ({ children }: { children: ReactNode }) => {
  const { theme, setTheme } = useNextTheme();

  useEffect(() => {
    if (theme === "dark") {
      setTheme("wood");
    }
  }, [setTheme, theme]);

  return <>{children}</>;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      themes={[...NEXT_THEME_VALUES]}
      value={{
        light: "light",
        wood: "wood",
        dark: "wood",
      }}
      disableTransitionOnChange
    >
      <LegacyThemeMigration>{children}</LegacyThemeMigration>
    </NextThemesProvider>
  );
};

export const useTheme = () => {
  const themeState = useNextTheme();

  return {
    ...themeState,
    theme: normalizeAppTheme(themeState.theme),
    resolvedTheme: normalizeAppTheme(themeState.resolvedTheme),
    systemTheme: undefined,
    themes: [...APP_THEMES],
    setTheme: (theme: AppTheme) => themeState.setTheme(theme),
  };
};
