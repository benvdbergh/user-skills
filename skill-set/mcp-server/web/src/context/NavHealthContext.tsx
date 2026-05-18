import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface NavHealthCounts {
  error: number;
  warning: number;
}

const defaultCounts: NavHealthCounts = { error: 0, warning: 0 };

const NavHealthContext = createContext<{
  counts: NavHealthCounts;
  setCounts: (counts: NavHealthCounts) => void;
} | null>(null);

export function NavHealthProvider({ children }: { children: ReactNode }) {
  const [counts, setCountsState] = useState<NavHealthCounts>(defaultCounts);

  const setCounts = useCallback((next: NavHealthCounts) => {
    setCountsState((prev) =>
      prev.error === next.error && prev.warning === next.warning ? prev : next,
    );
  }, []);

  const value = useMemo(
    () => ({ counts, setCounts }),
    [counts, setCounts],
  );

  return (
    <NavHealthContext.Provider value={value}>{children}</NavHealthContext.Provider>
  );
}

export function useNavHealth(): {
  counts: NavHealthCounts;
  setCounts: (counts: NavHealthCounts) => void;
} {
  const ctx = useContext(NavHealthContext);
  if (!ctx) {
    throw new Error("useNavHealth must be used within NavHealthProvider");
  }
  return ctx;
}
