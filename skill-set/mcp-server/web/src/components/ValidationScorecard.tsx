import { useCallback, useEffect, useState } from "react";
import {
  fetchLatestValidation,
  runSkillValidation,
  type LintReport,
  type ValidationReport,
} from "../api/validation";
import { ApiError } from "../api/client";
import { Badge } from "./ShellPrimitives";
import { ShellIcon } from "./ShellIcon";

export function ValidationScorecard({
  environmentId,
  skillName,
}: {
  environmentId: string;
  skillName: string;
}) {
  const [lint, setLint] = useState<LintReport | null>(null);
  const [validation, setValidation] = useState<ValidationReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadLatest = useCallback(async () => {
    const latest = await fetchLatestValidation(environmentId, skillName);
    if (latest) {
      setLint(latest.lint ?? null);
      setValidation(latest.validation ?? null);
    }
  }, [environmentId, skillName]);

  useEffect(() => {
    void loadLatest();
  }, [loadLatest]);

  const runLint = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await runSkillValidation(environmentId, skillName, {
        mode: "lint",
        persist: false,
      });
      setLint(result.lint ?? null);
      setValidation(result.validation ?? validation);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.problem.detail ?? err.problem.title)
          : err instanceof Error
            ? err.message
            : "Validation failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const score = lint?.score ?? validation?.score;
  const level = lint?.complianceLevel ?? validation?.effectivenessLevel;

  return (
    <section className="sl-detail-section sl-validation-scorecard">
      <h3>
        <span>Validation</span>
        {score !== undefined && (
          <span className="sl-detail-section-count">{score}</span>
        )}
      </h3>
      <div className="sl-validation-head">
        {level && <Badge tone="accent">{level}</Badge>}
        <button
          type="button"
          className="sl-btn sl-btn-ghost"
          disabled={loading}
          onClick={() => void runLint()}
        >
          {loading ? (
            <>
              <span className="sl-spinner" aria-hidden /> Running lint…
            </>
          ) : (
            <>
              <ShellIcon name="refresh" size={14} />
              Run lint
            </>
          )}
        </button>
      </div>
      {error && (
        <p className="sl-validation-error" role="alert">
          {error}
        </p>
      )}
      {lint && (
        <div className="sl-validation-lint">
          <p className="sl-muted">
            {lint.findings.length} finding
            {lint.findings.length === 1 ? "" : "s"} · scored{" "}
            {new Date(lint.scoredAt).toLocaleString()}
          </p>
          {lint.categories.length > 0 && (
            <ul className="sl-validation-cats">
              {lint.categories.map((c) => (
                <li key={c.category}>
                  <code>{c.category}</code>
                  <span>
                    {c.passed}/{c.total}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {validation && (
        <p className="sl-muted">
          Deep validation: {validation.effectivenessLevel} (
          {validation.score}/100)
        </p>
      )}
      {!lint && !validation && !loading && !error && (
        <p className="sl-muted">No validation report yet. Run lint to score.</p>
      )}
    </section>
  );
}
