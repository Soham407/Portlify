import { useEffect, useRef, useCallback } from "react";

export const useAutoSave = <T>(
  data: T,
  saveFn: (data: T) => void,
  delay: number = 2000,
  enabled: boolean = true
) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedRef = useRef<string>("");
  const isFirstRender = useRef(true);

  const save = useCallback(() => {
    const serialized = JSON.stringify(data);
    if (serialized !== lastSavedRef.current) {
      saveFn(data);
      lastSavedRef.current = serialized;
    }
  }, [data, saveFn]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      lastSavedRef.current = JSON.stringify(data);
      return;
    }

    if (!enabled) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(save, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [data, save, delay, enabled]);

  return { saveNow: save };
};
