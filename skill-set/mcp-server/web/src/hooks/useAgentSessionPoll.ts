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
  const inFlightRef = useRef(false);
  const generationRef = useRef(0);

  const pollOnce = useCallback(async (id: string, generation: number) => {
    if (inFlightRef.current) return null;
    inFlightRef.current = true;
    try {
      const next = await fetchAgentSessionStatus(id);
      if (generationRef.current !== generation) return next;
      setStatus(next);
      setError(null);
      return next;
    } catch (err) {
      if (generationRef.current !== generation) return null;
      const message =
        err instanceof Error ? err.message : "Failed to load session";
      setError(message);
      return null;
    } finally {
      inFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    const generation = ++generationRef.current;

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    inFlightRef.current = false;

    if (!sessionId) {
      setStatus(null);
      setError(null);
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (cancelled || generationRef.current !== generation) return;
      if (inFlightRef.current) return;

      const next = await pollOnce(sessionId, generation);
      if (cancelled || generationRef.current !== generation || !next) return;

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
