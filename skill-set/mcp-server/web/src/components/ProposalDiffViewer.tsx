import { useEffect, useState } from "react";
import { fetchPatchDiff } from "../api/git";
import { ApiError } from "../api/client";
import { EmptyState } from "./ShellPrimitives";

export function ProposalDiffViewer({ patchToken }: { patchToken: string }) {
  const [diff, setDiff] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setDiff(null);
    fetchPatchDiff(patchToken)
      .then((preview) => {
        if (!cancelled) setDiff(preview.unifiedDiff || "(empty diff)");
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? (err.problem.detail ?? err.problem.title)
            : err instanceof Error
              ? err.message
              : "Failed to load diff";
        setError(message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [patchToken]);

  if (loading) {
    return <p className="sl-muted">Loading diff…</p>;
  }
  if (error) {
    return (
      <div className="sl-proposal-diff-error" role="alert">
        {error}
      </div>
    );
  }
  if (!diff?.trim()) {
    return (
      <EmptyState
        title="No unified diff"
        body="This proposal has no materialized file changes to preview."
      />
    );
  }

  return (
    <pre className="sl-proposal-diff" aria-label="Unified diff preview">
      {diff}
    </pre>
  );
}
