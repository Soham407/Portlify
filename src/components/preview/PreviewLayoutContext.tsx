import { createContext, useContext } from "react";

type PreviewLayoutContextValue = {
  editMode: boolean;
  draggedSectionId: string | null;
  activeDropTargetId: string | null;
  onDragHandleStart: (sectionId: string, pointerId: number) => void;
  onDragHandleMove: (pointerId: number, clientX: number, clientY: number) => void;
  onDragHandleEnd: (pointerId: number) => void;
  onDragHandleCancel: (pointerId: number) => void;
  onToggleHidden?: (sectionId: string) => void;
};

const PreviewLayoutContext = createContext<PreviewLayoutContextValue | null>(null);

export const PreviewLayoutProvider = PreviewLayoutContext.Provider;

export const usePreviewLayout = () => useContext(PreviewLayoutContext);
