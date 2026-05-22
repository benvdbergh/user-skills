import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchAgentSessionStatus,
  isTerminalSessionStatus,
  type AgentSessionStatus,
} from "../api/agent";

const POLL_MS = 1500;

export function useAgentSessionPoll(sessionId: string | null) {
  const [status, setStatus] = useState<AgentSessionStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const pollOnce = useCallback(async (id: string) => {
    try {
      const next = await fetchAgentSessionStatus(id);
      setStatus(next);
      setError(null);
      return next;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load session";
      setError(message);
      return null;
    }
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (!sessionId) {
      setStatus(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const tick = async () => {
      const next = await pollOnce(sessionId);
      if (cancelled || !next) return;
      if (isTerminalSessionStatus(next.status) && timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    void tick();
    timerRef.current = setInterval(() => void tick(), POLL_MS);

    return () => {
      cancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [sessionId, pollOnce]);

  return { status, error };
}
