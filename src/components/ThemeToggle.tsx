import { SunMedium, TreePine } from "lucide-react";
import { useEffect, useState } from "react";
import { APP_THEMES, type AppTheme, useTheme } from "@/contexts/ThemeContext";
import { cn } from "@/lib/utils";

type ThemeToggleProps = {
  className?: string;
  compact?: boolean;
};

const themeOptions: Array<{
  value: AppTheme;
  label: string;
  icon: typeof SunMedium;
}> = [
  { value: APP_THEMES[0], label: "Light", icon: SunMedium },
  { value: APP_THEMES[1], label: "Wood", icon: TreePine },
];

export default function ThemeToggle({ className, compact = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeTheme: AppTheme = mounted && theme === "wood" ? "wood" : "light";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-border/70 bg-card/85 p-1 text-foreground shadow-card backdrop-blur",
        className,
      )}
      role="group"
      aria-label="Theme selection"
    >
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const active = value === activeTheme;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-full text-xs font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              compact ? "h-8 w-8" : "h-8 px-3",
              active
                ? "bg-background text-foreground shadow-[0_10px_22px_-16px_hsl(var(--foreground)/0.4)]"
                : "text-muted-foreground hover:bg-background/70 hover:text-foreground",
            )}
            aria-pressed={active}
            aria-label={`Switch to ${label} theme`}
            title={label}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact && <span>{label}</span>}
          </button>
        );
      })}
    </div>
  );
}
