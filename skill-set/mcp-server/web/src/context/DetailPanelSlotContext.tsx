import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { HealthStatus } from "../api/catalog";

/** Serializable panel state — rendered in Layout (avoids storing React elements). */
export interface DetailPanelConfig {
  environmentId: string;
  skillName: string;
  catalogSearch: string;
  scope?: string;
  description?: string;
  sourcePath?: string;
  health?: { status: HealthStatus; findings: number };
  notFound?: boolean;
}

interface DetailPanelSlotValue {
  config: DetailPanelConfig | null;
  setConfig: (config: DetailPanelConfig | null) => void;
  closePanel: () => void;
  registerClosePanel: (handler: (() => void) | null) => void;
}

const DetailPanelSlotContext = createContext<DetailPanelSlotValue | null>(null);

export function DetailPanelSlotProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<DetailPanelConfig | null>(null);
  const closeHandlerRef = useRef<(() => void) | null>(null);

  const registerClosePanel = useCallback((handler: (() => void) | null) => {
    closeHandlerRef.current = handler;
  }, []);

  const closePanel = useCallback(() => {
    closeHandlerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({ config, setConfig, closePanel, registerClosePanel }),
    [config, closePanel, registerClosePanel],
  );

  return (
    <DetailPanelSlotContext.Provider value={value}>
      {children}
    </DetailPanelSlotContext.Provider>
  );
}

export function useDetailPanelSlot(): DetailPanelSlotValue {
  const ctx = useContext(DetailPanelSlotContext);
  if (!ctx) {
    throw new Error(
      "useDetailPanelSlot must be used within DetailPanelSlotProvider",
    );
  }
  return ctx;
}
