import { motion } from "framer-motion";
import { useRef } from "react";
import { EyeOff, GripVertical } from "lucide-react";
import { usePreviewLayout } from "./PreviewLayoutContext";
import { isLockedSection } from "@/lib/portfolioSections";

interface SectionWrapperProps {
  id: string;
  editMode?: boolean;
  onEdit?: (section: string) => void;
  children: React.ReactNode;
}

export default function SectionWrapper({ id, editMode, onEdit, children }: SectionWrapperProps) {
  const ref = useRef<HTMLDivElement>(null);
  const previewLayout = usePreviewLayout();
  const isDragging = previewLayout?.draggedSectionId === id;
  const isDropTarget = previewLayout?.activeDropTargetId === id && !isDragging;
  const canReorder = Boolean(editMode && previewLayout && !isLockedSection(id) && id !== "contact");
  const canHide = !isLockedSection(id);

  return (
    <motion.div
      ref={ref}
      layout
      data-preview-section-id={id}
      transition={{ layout: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
      animate={{
        scale: isDragging ? 0.94 : 1,
      }}
      className={`group relative ${
        editMode ? "rounded-2xl border-2 border-dashed border-red-400/70 bg-red-50/20" : ""
      } ${
        isDragging ? "z-20 border-solid border-primary bg-primary/10 shadow-2xl ring-4 ring-primary/20" : ""
      } ${
        isDropTarget ? "border-primary/80 bg-primary/5" : ""
      } ${
        isDragging ? "cursor-grabbing" : ""
      }`}
    >
      {editMode && onEdit && (
        <div className="absolute right-3 top-3 z-40 flex items-center gap-2 rounded-full border border-border bg-background/95 px-2 py-1.5 text-xs font-medium text-foreground shadow-md backdrop-blur-sm sm:opacity-0 sm:group-hover:opacity-100">
          {canReorder && (
            <button
              type="button"
              onPointerDown={(event) => {
                if (!previewLayout) return;
                event.preventDefault();
                event.stopPropagation();
                event.currentTarget.setPointerCapture(event.pointerId);
                previewLayout.onDragHandleStart(id, event.pointerId);
              }}
              onPointerMove={(event) => {
                if (!previewLayout) return;
                previewLayout.onDragHandleMove(event.pointerId, event.clientX, event.clientY);
              }}
              onPointerUp={(event) => {
                if (!previewLayout) return;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                previewLayout.onDragHandleEnd(event.pointerId);
              }}
              onPointerCancel={(event) => {
                if (!previewLayout) return;
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  event.currentTarget.releasePointerCapture(event.pointerId);
                }
                previewLayout.onDragHandleCancel(event.pointerId);
              }}
              className={`inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition-all hover:bg-accent ${
                isDragging ? "cursor-grabbing bg-accent" : "cursor-grab"
              }`}
            >
              <GripVertical className="h-3.5 w-3.5" />
              Drag
            </button>
          )}
          <button
            type="button"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => onEdit(id)}
            className="rounded-full border border-border px-3 py-1 transition-all hover:bg-accent"
          >
            Edit Layout
          </button>
          {previewLayout?.onToggleHidden && canHide && (
            <button
              type="button"
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => previewLayout.onToggleHidden?.(id)}
              className="inline-flex items-center gap-1 rounded-full border border-border px-3 py-1 transition-all hover:bg-accent"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide
            </button>
          )}
        </div>
      )}
      {children}
    </motion.div>
  );
}
