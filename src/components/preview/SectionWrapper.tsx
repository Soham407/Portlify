import { useRef } from "react";

interface SectionWrapperProps {
  id: string;
  editMode?: boolean;
  onEdit?: (section: string) => void;
  children: React.ReactNode;
}

export default function SectionWrapper({ id, editMode, onEdit, children }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="relative group">
      {editMode && onEdit && (
        <button
          onClick={() => onEdit(id)}
          className="absolute right-3 top-3 z-40 flex items-center gap-1.5 rounded-full border border-border bg-background/95 px-3 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm transition-all hover:bg-accent hover:shadow-lg sm:opacity-0 sm:group-hover:opacity-100"
        >
          ✎ Layout
        </button>
      )}
      {children}
    </div>
  );
}
