import { createContext, useContext } from "react";

type PreviewLayoutContextValue = {
  editMode: boolean;
  draggedSectionId: string | null;
  activeDropTargetId: string | null;
  onSectionPressStart: (sectionId: string, pointerId: number, clientX: number, clientY: number) => void;
  onSectionPressMove: (pointerId: number, clientX: number, clientY: number) => void;
  onSectionPressEnd: (pointerId: number) => void;
  onSectionPressCancel: (pointerId: number) => void;
  onToggleHidden?: (sectionId: string) => void;
};

const PreviewLayoutContext = createContext<PreviewLayoutContextValue | null>(null);

export const PreviewLayoutProvider = PreviewLayoutContext.Provider;

export const usePreviewLayout = () => useContext(PreviewLayoutContext);
