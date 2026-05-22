import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

export interface NavHealthCounts {
  error: number;
  warning: number;
}

const defaultCounts: NavHealthCounts = { error: 0, warning: 0 };

/**
 * Sidebar health pip precedence:
 * 1. On `/health` with a loaded scan report → scan summary (error/warning from POST /api/health).
 * 2. Otherwise → catalog per-row index health aggregates (updated when Catalog loads).
 *
 * Catalog and Health each publish to separate slots; effective `counts` picks the winner above.
 */
const NavHealthContext = createContext<{
  counts: NavHealthCounts;
  setCatalogCounts: (counts: NavHealthCounts) => void;
  setScanCounts: (counts: NavHealthCounts | null) => void;
} | null>(null);

export function NavHealthProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [catalogCounts, setCatalogCountsState] =
    useState<NavHealthCounts>(defaultCounts);
  const [scanCounts, setScanCountsState] = useState<NavHealthCounts | null>(
    null,
  );

  const setCatalogCounts = useCallback((next: NavHealthCounts) => {
    setCatalogCountsState((prev) =>
      prev.error === next.error && prev.warning === next.warning ? prev : next,
    );
  }, []);

  const setScanCounts = useCallback((next: NavHealthCounts | null) => {
    setScanCountsState((prev) => {
      if (next === null) return null;
      if (
        prev &&
        prev.error === next.error &&
        prev.warning === next.warning
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const onHealthRoute = location.pathname.startsWith("/health");
  const counts =
    onHealthRoute && scanCounts !== null ? scanCounts : catalogCounts;

  const value = useMemo(
    () => ({ counts, setCatalogCounts, setScanCounts }),
    [counts, setCatalogCounts, setScanCounts],
  );

  return (
    <NavHealthContext.Provider value={value}>{children}</NavHealthContext.Provider>
  );
}

export function useNavHealth(): {
  counts: NavHealthCounts;
  setCatalogCounts: (counts: NavHealthCounts) => void;
  setScanCounts: (counts: NavHealthCounts | null) => void;
} {
  const ctx = useContext(NavHealthContext);
  if (!ctx) {
    throw new Error("useNavHealth must be used within NavHealthProvider");
  }
  return ctx;
}
