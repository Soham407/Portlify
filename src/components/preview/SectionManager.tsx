import { Eye, EyeOff, GripVertical, RotateCcw } from "lucide-react";
import { PORTFOLIO_SECTIONS } from "@/lib/constants";

type SectionManagerProps = {
  order: string[];
  hiddenSections: string[];
  onMove: (sectionId: string, direction: -1 | 1) => void;
  onToggleHidden: (sectionId: string) => void;
  onReset: () => void;
};

export default function SectionManager({
  order,
  hiddenSections,
  onMove,
  onToggleHidden,
  onReset,
}: SectionManagerProps) {
  const labels = Object.fromEntries(PORTFOLIO_SECTIONS.map((section) => [section.id, section.label]));

  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold">Section Order</h3>
          <p className="text-xs text-muted-foreground">Reorder and hide sections for preview, public page, and PDF export.</p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>

      <div className="mt-4 space-y-2">
        {order.map((sectionId, index) => {
          const hidden = hiddenSections.includes(sectionId);
          return (
            <div key={sectionId} className="flex items-center gap-3 rounded-xl border border-border px-3 py-2.5">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{labels[sectionId] || sectionId}</p>
                <p className="text-xs text-muted-foreground">{hidden ? "Hidden from visitors and exports" : "Visible everywhere"}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMove(sectionId, -1)}
                  disabled={index === 0}
                  className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  onClick={() => onMove(sectionId, 1)}
                  disabled={index === order.length - 1}
                  className="rounded-md border border-border px-2 py-1 text-xs disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() => onToggleHidden(sectionId)}
                  className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs"
                >
                  {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                  {hidden ? "Show" : "Hide"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
