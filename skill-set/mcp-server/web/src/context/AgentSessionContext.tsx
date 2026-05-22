import {

  createContext,

  useCallback,

  useContext,

  useEffect,

  useMemo,

  useRef,

  useState,

  type ReactNode,

} from "react";

import { useNavigate } from "react-router-dom";

import {

  fetchAgentAuth,

  startAgentSession,

  type AgentAuthStatus,

  type AgentSession,

  type AgentSessionKind,

  type AgentSessionStatus,

  type AgentSessionStatusValue,

} from "../api/agent";

import { ApiError } from "../api/client";

import { useAgentSessionPoll } from "../hooks/useAgentSessionPoll";

import {

  claudeAuthBlockedMessage,

  shouldBlockAdvisorStart,

} from "../lib/agentAuthPreflight";

import { getPreferredRuntime } from "../lib/agentSettings";

import { addProposalToken } from "../lib/proposalStorage";



export interface AgentSessionStartParams {

  kind: AgentSessionKind;

  environmentId: string;

  skillName: string;

  navigateOnComplete?: boolean;

}



const AgentSessionContext = createContext<{

  sessionId: string | null;

  busy: boolean;

  toast: string | null;

  stripVisible: boolean;

  pollStatus: AgentSessionStatus | null;

  pollError: string | null;

  auth: AgentAuthStatus | null;

  authLoading: boolean;

  authError: string | null;

  refreshAuth: () => void;

  start: (params: AgentSessionStartParams) => Promise<AgentSession | null>;

  clearToast: () => void;

  dismissStrip: () => void;

} | null>(null);



function authErrorMessage(err: unknown): string {

  return err instanceof ApiError

    ? (err.problem.detail ?? err.problem.title)

    : err instanceof Error

      ? err.message

      : "Auth check failed";

}



export function AgentSessionProvider({ children }: { children: ReactNode }) {

  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState<string | null>(null);

  const [stripVisible, setStripVisible] = useState(true);

  const [toast, setToast] = useState<string | null>(null);

  const [busy, setBusy] = useState(false);

  const [auth, setAuth] = useState<AgentAuthStatus | null>(null);

  const [authLoading, setAuthLoading] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);

  const terminalHandledRef = useRef<string | null>(null);

  const authRequestRef = useRef(0);



  const { status: pollStatus, error: pollError } = useAgentSessionPoll(sessionId);



  const loadAuth = useCallback(async (): Promise<AgentAuthStatus | null> => {

    const requestId = ++authRequestRef.current;

    setAuthLoading(true);

    try {

      const next = await fetchAgentAuth();

      if (authRequestRef.current !== requestId) return next;

      setAuth(next);

      setAuthError(null);

      return next;

    } catch (err) {

      if (authRequestRef.current !== requestId) return null;

      setAuth(null);

      setAuthError(authErrorMessage(err));

      return null;

    } finally {

      if (authRequestRef.current === requestId) {

        setAuthLoading(false);

      }

    }

  }, []);



  useEffect(() => {

    void loadAuth();

  }, [loadAuth]);



  const onSessionTerminal = useCallback(

    (

      status: AgentSessionStatusValue,

      proposalIds: string[] | undefined,

      error: string | undefined,

      navigateOnComplete: boolean,

    ) => {

      if (status === "completed" && proposalIds?.length) {

        for (const token of proposalIds) {

          addProposalToken(token);

        }

        setToast("Proposal ready — opening workbench");

        setStripVisible(true);

        if (navigateOnComplete) {

          navigate(

            `/proposals?patch=${encodeURIComponent(proposalIds[0]!)}`,

          );

        }

        return;

      }

      if (status === "failed") {

        setToast(error ?? "Agent session failed");

        setSessionId(null);

        setStripVisible(true);

        return;

      }

      if (status === "cancelled") {

        setToast("Session cancelled");

        setSessionId(null);

        setStripVisible(true);

      }

    },

    [navigate],

  );



  const navigateOnCompleteRef = useRef(true);



  useEffect(() => {

    if (!pollStatus || !sessionId) return;

    if (

      pollStatus.status !== "completed" &&

      pollStatus.status !== "failed" &&

      pollStatus.status !== "cancelled"

    ) {

      return;

    }

    if (terminalHandledRef.current === sessionId) return;

    terminalHandledRef.current = sessionId;

    onSessionTerminal(

      pollStatus.status,

      pollStatus.proposalIds,

      pollStatus.error,

      navigateOnCompleteRef.current,

    );

  }, [pollStatus, sessionId, onSessionTerminal]);



  const start = useCallback(

    async (params: AgentSessionStartParams) => {

      setBusy(true);

      setToast(null);

      terminalHandledRef.current = null;

      navigateOnCompleteRef.current = params.navigateOnComplete !== false;

      try {

        const runtime = getPreferredRuntime();

        const authStatus = auth ?? (await loadAuth());



        if (shouldBlockAdvisorStart(runtime, authStatus)) {

          setToast(claudeAuthBlockedMessage(authStatus ?? undefined));

          return null;

        }



        const session = await startAgentSession({

          kind: params.kind,

          environmentId: params.environmentId,

          skillName: params.skillName,

          runtime,

        });

        setSessionId(session.id);

        setStripVisible(true);

        setToast(`Session started (${session.runtime})`);



        if (session.status === "completed" && session.proposalIds?.length) {

          if (terminalHandledRef.current !== session.id) {

            terminalHandledRef.current = session.id;

            onSessionTerminal(

              session.status,

              session.proposalIds,

              session.error,

              navigateOnCompleteRef.current,

            );

          }

        }

        return session;

      } catch (err) {

        const message =

          err instanceof ApiError

            ? (err.problem.detail ?? err.problem.title)

            : err instanceof Error

              ? err.message

              : "Failed to start session";

        setToast(message);

        return null;

      } finally {

        setBusy(false);

      }

    },

    [auth, loadAuth, onSessionTerminal],

  );



  const clearToast = useCallback(() => setToast(null), []);

  const dismissStrip = useCallback(() => {
    setStripVisible(false);
    const terminal =
      pollStatus?.status === "completed" ||
      pollStatus?.status === "failed" ||
      pollStatus?.status === "cancelled";
    if (terminal) {
      setSessionId(null);
    }
  }, [pollStatus?.status]);

  const refreshAuth = useCallback(() => {

    void loadAuth();

  }, [loadAuth]);



  const value = useMemo(

    () => ({

      sessionId,

      busy,

      toast,

      stripVisible,

      pollStatus,

      pollError,

      auth,

      authLoading,

      authError,

      refreshAuth,

      start,

      clearToast,

      dismissStrip,

    }),

    [

      sessionId,

      busy,

      toast,

      stripVisible,

      pollStatus,

      pollError,

      auth,

      authLoading,

      authError,

      refreshAuth,

      start,

      clearToast,

      dismissStrip,

    ],

  );



  return (

    <AgentSessionContext.Provider value={value}>

      {children}

    </AgentSessionContext.Provider>

  );

}



export function useAgentSession() {

  const ctx = useContext(AgentSessionContext);

  if (!ctx) {

    throw new Error("useAgentSession must be used within AgentSessionProvider");

  }

  return ctx;

}


