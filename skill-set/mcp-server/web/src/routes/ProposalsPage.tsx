import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  fetchProposalTokens,
  fetchStoredProposal,
  proposalTabKind,
  type StoredProposal,
} from "../api/proposals";
import { ApiError } from "../api/client";
import { ProposalDetail } from "../components/ProposalDetail";
import { ProposalList } from "../components/ProposalList";
import { ProposalWorkbenchBanner } from "../components/ProposalWorkbenchBanner";
import { EmptyState, PageHeader } from "../components/ShellPrimitives";
import { useAgentSession } from "../context/AgentSessionContext";
import { mergeProposalTokenLists } from "../lib/proposalRegistry";
import { addProposalToken, listProposalTokens } from "../lib/proposalStorage";
import { getSessionReturnOrigin } from "../lib/sessionOrigin";
import { formatSkillQuery } from "../lib/skillQuery";

type WorkbenchTab = "patches" | "relationships";

function listErrorMessage(err: unknown): string {
  return err instanceof ApiError
    ? (err.problem.detail ?? err.problem.title)
    : err instanceof Error
      ? err.message
      : "Failed to load proposals";
}

export function ProposalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const patchFromUrl = searchParams.get("patch");
  const skillFromUrl = searchParams.get("skill");
  const readyFromUrl = searchParams.get("ready") === "1";
  const { proposalListRevision, sessionId: activeSessionId } = useAgentSession();
  const [tab, setTab] = useState<WorkbenchTab>("patches");
  const [tokens, setTokens] = useState<string[]>(() => listProposalTokens());
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<string | null>(patchFromUrl);
  const [stored, setStored] = useState<StoredProposal | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [successDismissed, setSuccessDismissed] = useState(false);

  const syncTokensFromRegistry = useCallback(() => {
    setTokens(listProposalTokens());
  }, []);

  const refreshTokens = useCallback(() => {
    setListLoading(true);
    setListError(null);
    const local = listProposalTokens();
    void fetchProposalTokens(
      activeSessionId ? { sessionId: activeSessionId } : undefined,
    )
      .then((serverTokens) => {
        for (const token of serverTokens) {
          addProposalToken(token);
        }
        setTokens(listProposalTokens());
      })
      .catch((err) => {
        setListError(listErrorMessage(err));
        setTokens(mergeProposalTokenLists([], local));
      })
      .finally(() => {
        setListLoading(false);
      });
  }, [activeSessionId]);

  useEffect(() => {
    refreshTokens();
  }, [refreshTokens, proposalListRevision]);

  useEffect(() => {
    if (patchFromUrl) {
      setSelectedToken(patchFromUrl);
      addProposalToken(patchFromUrl);
      syncTokensFromRegistry();
      refreshTokens();
    }
  }, [patchFromUrl, refreshTokens, syncTokensFromRegistry]);

  useEffect(() => {
    if (!selectedToken) {
      setStored(null);
      setDetailError(null);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    setDetailError(null);
    fetchStoredProposal(selectedToken)
      .then((data) => {
        if (!cancelled) {
          setStored(data);
          setTab(proposalTabKind(data));
        }
      })
      .catch((err) => {
        if (cancelled) return;
        setDetailError(listErrorMessage(err));
        setStored(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedToken]);

  useEffect(() => {
    if (readyFromUrl) setSuccessDismissed(false);
  }, [readyFromUrl, patchFromUrl]);

  const selectToken = (token: string) => {
    setSelectedToken(token);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("patch", token);
        next.delete("ready");
        return next;
      },
      { replace: true },
    );
  };

  const handleIgnored = () => {
    refreshTokens();
    setSelectedToken(null);
    setStored(null);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("patch");
        next.delete("ready");
        return next;
      },
      { replace: true },
    );
  };

  const dismissSuccess = () => {
    setSuccessDismissed(true);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("ready");
        return next;
      },
      { replace: true },
    );
  };

  const returnSkillQuery =
    skillFromUrl ??
    (() => {
      const origin = getSessionReturnOrigin();
      return origin?.kind === "skill"
        ? formatSkillQuery(origin.environmentId, origin.skillName)
        : null;
    })();

  const showSuccessBanner =
    !successDismissed &&
    (readyFromUrl || Boolean(patchFromUrl)) &&
    Boolean(selectedToken) &&
    stored?.proposalKind === "patch" &&
    !detailLoading &&
    !detailError;

  return (
    <div className="sl-proposals sl-proposals-workbench">
      <PageHeader
        eyebrow="Advisor"
        title="Proposals"
        subtitle="Review patch and relationship proposals from agent sessions."
      />

      {showSuccessBanner && (
        <ProposalWorkbenchBanner
          skillQuery={returnSkillQuery}
          onDismiss={dismissSuccess}
        />
      )}

      <div className="sl-workbench-tabs" role="tablist" aria-label="Proposal type">
        {(["patches", "relationships"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`sl-workbench-tab ${tab === t ? "is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t === "patches" ? "Patches" : "Relationships"}
          </button>
        ))}
      </div>

      <div className="sl-workbench-layout">
        <aside className="sl-workbench-list" aria-label="Proposal list">
          <ProposalList
            tokens={tokens}
            sessionId={activeSessionId}
            selectedToken={selectedToken}
            tab={tab}
            listLoading={listLoading}
            listError={listError}
            onSelect={selectToken}
            onRefresh={refreshTokens}
          />
        </aside>
        <section className="sl-workbench-detail" aria-label="Proposal detail">
          {!selectedToken && (
            <EmptyState
              title="Select a proposal"
              body="Choose an item from the list or start an advisor session from skill detail."
            />
          )}
          {selectedToken && detailLoading && (
            <p className="sl-muted" role="status">
              Loading proposal…
            </p>
          )}
          {detailError && (
            <div className="sl-proposal-detail-error" role="alert">
              {detailError}
            </div>
          )}
          {stored && selectedToken && !detailLoading && (
            <ProposalDetail
              stored={stored}
              patchToken={selectedToken}
              onIgnored={handleIgnored}
            />
          )}
        </section>
      </div>
    </div>
  );
}
