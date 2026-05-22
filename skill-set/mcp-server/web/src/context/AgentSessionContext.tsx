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

  isTerminalSessionStatus,

  startAgentSession,

  type AgentAuthStatus,

  type AgentHealthFindingContext,

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

import {
  setSessionReturnOrigin,
  type SessionReturnOrigin,
} from "../lib/sessionOrigin";



export interface AgentSessionStartParams {

  kind: AgentSessionKind;

  environmentId: string;

  skillName: string;

  navigateOnComplete?: boolean;

  /** Passed when starting from a health finding (e.g. missing escalation). */

  healthFinding?: AgentHealthFindingContext;

  /** Workbench “Return to …” target; defaults to skill from environmentId/skillName. */

  returnOrigin?: SessionReturnOrigin;

}



const AgentSessionContext = createContext<{

  sessionId: string | null;

  busy: boolean;

  /** True while a session is pending/running (not terminal). */

  sessionInProgress: boolean;

  toast: string | null;

  stripVisible: boolean;

  pollStatus: AgentSessionStatus | null;

  pollError: string | null;

  auth: AgentAuthStatus | null;

  authLoading: boolean;

  authError: string | null;

  refreshAuth: () => void;

  /** Bumps when proposals are ingested (poll) or session reaches terminal with proposals. */

  proposalListRevision: number;

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

  const seenProposalIdsRef = useRef<Set<string>>(new Set());

  const [proposalListRevision, setProposalListRevision] = useState(0);

  const bumpProposalListRevision = useCallback(() => {

    setProposalListRevision((revision) => revision + 1);

  }, []);

  const ingestProposalIds = useCallback(

    (proposalIds: string[] | undefined) => {

      if (!proposalIds?.length) return;

      let added = false;

      for (const token of proposalIds) {

        if (seenProposalIdsRef.current.has(token)) continue;

        seenProposalIdsRef.current.add(token);

        addProposalToken(token);

        added = true;

      }

      if (added) bumpProposalListRevision();

    },

    [bumpProposalListRevision],

  );



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

        ingestProposalIds(proposalIds);

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

    [navigate, ingestProposalIds],

  );



  const navigateOnCompleteRef = useRef(true);



  useEffect(() => {

    ingestProposalIds(pollStatus?.proposalIds);

  }, [pollStatus?.proposalIds, ingestProposalIds]);



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

      seenProposalIdsRef.current = new Set();

      navigateOnCompleteRef.current = params.navigateOnComplete !== false;

      setSessionReturnOrigin(
        params.returnOrigin ?? {
          kind: "skill",
          environmentId: params.environmentId,
          skillName: params.skillName,
        },
      );

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

          healthFinding: params.healthFinding,

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



  const sessionInProgress = useMemo(() => {

    if (!sessionId) return false;

    if (!pollStatus) return true;

    return !isTerminalSessionStatus(pollStatus.status);

  }, [sessionId, pollStatus]);



  const value = useMemo(

    () => ({

      sessionId,

      busy,

      sessionInProgress,

      toast,

      stripVisible,

      pollStatus,

      pollError,

      auth,

      authLoading,

      authError,

      refreshAuth,

      proposalListRevision,

      start,

      clearToast,

      dismissStrip,

    }),

    [

      sessionId,

      busy,

      sessionInProgress,

      toast,

      stripVisible,

      pollStatus,

      pollError,

      auth,

      authLoading,

      authError,

      refreshAuth,

      proposalListRevision,

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


