import { useCallback, useEffect, useState } from "react";
import {
  fetchStoredProposal,
  proposalListLabel,
  proposalTabKind,
  type StoredProposal,
} from "../api/proposals";
import { ApiError } from "../api/client";
import { ShellIcon } from "./ShellIcon";

export interface ProposalListEntry {
  patchToken: string;
  stored?: StoredProposal;
  error?: string;
  loading?: boolean;
}

function entryLoadError(err: unknown): string {
  return err instanceof ApiError
    ? (err.problem.detail ?? err.problem.title)
    : err instanceof Error
      ? err.message
      : "Load failed";
}

export function ProposalList({
  tokens,
  selectedToken,
  tab,
  listLoading,
  listError,
  onSelect,
  onRefresh,
}: {
  tokens: string[];
  selectedToken: string | null;
  tab: "patches" | "relationships";
  listLoading?: boolean;
  listError?: string | null;
  onSelect: (token: string) => void;
  onRefresh: () => void;
}) {
  const [entries, setEntries] = useState<ProposalListEntry[]>([]);

  const loadEntries = useCallback(async (tokenList: string[]) => {
    if (tokenList.length === 0) {
      setEntries([]);
      return;
    }
    setEntries(tokenList.map((patchToken) => ({ patchToken, loading: true })));
    const results = await Promise.all(
      tokenList.map(async (patchToken) => {
        try {
          const stored = await fetchStoredProposal(patchToken);
          return { patchToken, stored };
        } catch (err) {
          return { patchToken, error: entryLoadError(err) };
        }
      }),
    );
    setEntries(results);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void loadEntries(tokens).then(() => {
      if (cancelled) return;
    });
    return () => {
      cancelled = true;
    };
  }, [tokens, loadEntries]);

  const retryRow = (patchToken: string) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.patchToken === patchToken ? { patchToken, loading: true } : e,
      ),
    );
    void fetchStoredProposal(patchToken)
      .then((stored) => {
        setEntries((prev) =>
          prev.map((e) =>
            e.patchToken === patchToken ? { patchToken, stored } : e,
          ),
        );
      })
      .catch((err) => {
        setEntries((prev) =>
          prev.map((e) =>
            e.patchToken === patchToken
              ? { patchToken, error: entryLoadError(err) }
              : e,
          ),
        );
      });
  };

  const filtered = entries.filter((e) => {
    if (e.loading || e.error || !e.stored) return false;
    return proposalTabKind(e.stored) === tab;
  });

  const loadingCount = entries.filter((e) => e.loading).length;

  if (tokens.length === 0 && !listLoading) {
    return (
      <p className="sl-muted sl-proposal-list-empty">
        No proposals in this session. Run an advisor action from skill detail
        or health.
      </p>
    );
  }

  return (
    <div className="sl-proposal-list">
      <div className="sl-proposal-list-head">
        <span className="sl-muted">
          {listLoading
            ? "Syncing…"
            : `${filtered.length} item${filtered.length === 1 ? "" : "s"}`}
        </span>
        <button
          type="button"
          className="sl-icon-btn"
          onClick={onRefresh}
          disabled={listLoading}
          aria-label="Refresh list"
        >
          <ShellIcon name="refresh" size={14} />
        </button>
      </div>

      {listError && (
        <div className="sl-proposal-list-alert" role="alert">
          <p>{listError}</p>
          <button type="button" className="sl-btn sl-btn-ghost" onClick={onRefresh}>
            Retry
          </button>
        </div>
      )}

      {listLoading && tokens.length === 0 && (
        <p className="sl-muted" role="status">
          Loading proposals…
        </p>
      )}

      {loadingCount > 0 && !listLoading && (
        <p className="sl-muted sl-proposal-list-loading" role="status">
          Loading {loadingCount} proposal
          {loadingCount === 1 ? "" : "s"}…
        </p>
      )}

      <ul>
        {filtered.map((entry) => (
          <li key={entry.patchToken}>
            <button
              type="button"
              className={`sl-proposal-list-item ${selectedToken === entry.patchToken ? "is-active" : ""}`}
              onClick={() => onSelect(entry.patchToken)}
            >
              {entry.stored && (
                <>
                  <span className="sl-proposal-list-label">
                    {proposalListLabel(entry.stored)}
                  </span>
                  <code className="sl-proposal-token">
                    {entry.patchToken.slice(0, 8)}…
                  </code>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>

      {entries
        .filter((e) => e.error)
        .map((entry) => (
          <div
            key={`err-${entry.patchToken}`}
            className="sl-proposal-list-row-error"
            role="alert"
          >
            <code className="sl-proposal-token">{entry.patchToken.slice(0, 8)}…</code>
            <span className="sl-proposal-list-error">{entry.error}</span>
            <button
              type="button"
              className="sl-btn sl-btn-ghost"
              onClick={() => retryRow(entry.patchToken)}
            >
              Retry
            </button>
          </div>
        ))}
    </div>
  );
}
