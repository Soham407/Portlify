import { useEffect, useRef } from "react";
import { SECTION_LAYOUTS } from "@/lib/sectionLayouts";
import { X, Check } from "lucide-react";

interface SectionLayoutPickerProps {
  section: string;
  current?: string;
  onSelect: (layoutId: string) => void;
  onClose: () => void;
}

const VARIANT_PREVIEWS: Record<string, Record<string, React.ReactNode>> = {
  bio: {
    centered: (
      <div className="flex flex-col items-center gap-1 p-2">
        <div className="h-6 w-6 rounded-full bg-current opacity-40" />
        <div className="h-1.5 w-16 rounded bg-current opacity-30" />
        <div className="h-1 w-12 rounded bg-current opacity-20" />
        <div className="h-1 w-20 rounded bg-current opacity-20" />
      </div>
    ),
    left: (
      <div className="flex flex-col gap-1 p-2">
        <div className="h-5 w-5 rounded-full bg-current opacity-40" />
        <div className="h-1.5 w-14 rounded bg-current opacity-30" />
        <div className="h-1 w-10 rounded bg-current opacity-20" />
        <div className="h-1 w-18 rounded bg-current opacity-20" />
      </div>
    ),
    split: (
      <div className="flex items-center gap-2 p-2">
        <div className="h-10 w-10 rounded bg-current opacity-30" />
        <div className="flex flex-1 flex-col gap-1">
          <div className="h-1.5 w-full rounded bg-current opacity-30" />
          <div className="h-1 w-3/4 rounded bg-current opacity-20" />
          <div className="h-1 w-full rounded bg-current opacity-20" />
        </div>
      </div>
    ),
  },
  projects: {
    grid: (
      <div className="grid grid-cols-2 gap-1 p-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-8 rounded bg-current opacity-25" />
        ))}
      </div>
    ),
    list: (
      <div className="flex flex-col gap-1.5 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div className="h-6 w-6 flex-shrink-0 rounded bg-current opacity-25" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full rounded bg-current opacity-30" />
              <div className="h-1 w-3/4 rounded bg-current opacity-20" />
            </div>
          </div>
        ))}
      </div>
    ),
    featured: (
      <div className="flex flex-col gap-1 p-2">
        <div className="h-10 w-full rounded bg-current opacity-30" />
        <div className="grid grid-cols-2 gap-1">
          <div className="h-6 rounded bg-current opacity-20" />
          <div className="h-6 rounded bg-current opacity-20" />
        </div>
      </div>
    ),
  },
  skills: {
    tags: (
      <div className="flex flex-wrap gap-1 p-2">
        {[10, 14, 8, 12, 10, 14].map((w, i) => (
          <div key={i} className="h-4 rounded-full bg-current opacity-25" style={{ width: `${w * 3}px` }} />
        ))}
      </div>
    ),
    grouped: (
      <div className="flex flex-col gap-1.5 p-2">
        {[0, 1].map((g) => (
          <div key={g}>
            <div className="mb-0.5 h-1 w-10 rounded bg-current opacity-40" />
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-3.5 rounded bg-current opacity-20" style={{ width: "28px" }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  },
  experience: {
    timeline: (
      <div className="relative pl-4 p-2">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-current opacity-30" />
        {[0, 1, 2].map((i) => (
          <div key={i} className="relative mb-2 flex items-start gap-2">
            <div className="absolute -left-[9px] mt-1 h-2 w-2 rounded-full bg-current opacity-50" />
            <div className="flex flex-col gap-0.5 pl-1">
              <div className="h-1.5 w-16 rounded bg-current opacity-30" />
              <div className="h-1 w-10 rounded bg-current opacity-20" />
            </div>
          </div>
        ))}
      </div>
    ),
    compact: (
      <div className="flex flex-col gap-0.5 p-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between border-b border-current/10 pb-0.5">
            <div className="h-1.5 w-16 rounded bg-current opacity-30" />
            <div className="h-1 w-8 rounded bg-current opacity-20" />
          </div>
        ))}
      </div>
    ),
  },
  education: {
    cards: (
      <div className="grid grid-cols-2 gap-1 p-2">
        {[0, 1].map((i) => (
          <div key={i} className="rounded bg-current/10 p-1.5">
            <div className="mb-0.5 h-1.5 w-full rounded bg-current opacity-30" />
            <div className="h-1 w-3/4 rounded bg-current opacity-20" />
          </div>
        ))}
      </div>
    ),
    list: (
      <div className="flex flex-col gap-1.5 p-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-1.5 w-16 rounded bg-current opacity-30" />
            <div className="h-1 w-10 rounded bg-current opacity-20" />
          </div>
        ))}
      </div>
    ),
  },
};

export default function SectionLayoutPicker({ section, current, onSelect, onClose }: SectionLayoutPickerProps) {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const def = SECTION_LAYOUTS[section];

  useEffect(() => {
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [onClose]);

  if (!def) return null;

  const activeCurrent = current ?? def.variants[0]?.id;

  return (
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[998] bg-black/30 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Right sidebar panel */}
      <div
        ref={sidebarRef}
        className="fixed right-0 top-0 z-[999] flex h-full w-80 max-w-[85vw] flex-col border-l border-border bg-card shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h3 className="text-sm font-semibold">{def.label} Layout</h3>
            <p className="text-xs text-muted-foreground">Choose a layout variant</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-accent transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Variant options */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3">
            {def.variants.map((variant) => {
              const isActive = activeCurrent === variant.id;
              const preview = VARIANT_PREVIEWS[section]?.[variant.id];
              return (
                <button
                  key={variant.id}
                  onClick={() => onSelect(variant.id)}
                  className={`relative flex flex-col overflow-hidden rounded-xl border-2 transition-all hover:shadow-lg ${
                    isActive
                      ? "border-primary ring-2 ring-primary/20 shadow-md"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-1.5 top-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>
                  )}
                  <div className={`flex h-20 items-center justify-center text-foreground ${isActive ? "bg-primary/10" : "bg-muted"}`}>
                    {preview ?? <div className="h-6 w-6 rounded bg-current opacity-20" />}
                  </div>
                  <div className="px-2 py-2 text-left">
                    <p className="text-xs font-medium leading-tight">{variant.label}</p>
                    <p className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{variant.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer with OK button */}
        <div className="border-t border-border px-5 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      </div>
    </>
  );
}
