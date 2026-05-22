import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useEnvironment } from "../context/EnvironmentContext";
import { useNavHealth } from "../context/NavHealthContext";
import type { AgentSessionKind } from "../api/agent";
import { useAgentSession } from "../context/AgentSessionContext";
import { viewRemediationFromFinding } from "../lib/healthRemediation";
import { skillNameFromSourcePath } from "../lib/skillFromPath";
import {
  applyHealthUrlUpdates,
  parseHealthUrlParams,
} from "../lib/healthUrlParams";
import {
  fetchHealthLatest,
  fetchHealthReport,
  type CatalogHealthReport,
  type HealthFinding,
  type HealthSeverity,
} from "../api/health";
import { ApiError } from "../api/client";
import { SourceLink } from "../components/SourceLink";
import { EmptyState, PageHeader } from "../components/ShellPrimitives";
import { ShellIcon, StatusDot } from "../components/ShellIcon";
import {
  aggregateByCategory,
  distinctCategories,
  filterFindingsByEnvironment,
  filterFindingsWithSearch,
  formatCategorySeveritySummary,
  formatScannedAt,
  getHealthCategoryMeta,
  healthStalenessMessage,
  INFO_TIER_EMPTY_HINT,
  INFO_TIER_LABEL,
  INFO_TIER_SUMMARY_NOTE,
  relativeScannedAt,
  shouldShowInfoSummaryCard,
  sortFindings,
  summarizeFindings,
} from "../lib/healthView";

const SLOW_SCAN_MS = 300;

function healthErrorMessage(err: unknown): string {
  return err instanceof ApiError
    ? (err.problem.detail ?? err.problem.title)
    : err instanceof Error
      ? err.message
      : "Health scan failed";
}

export function HealthPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { environmentId } = useEnvironment();
  const { setScanCounts: setNavHealthCounts } = useNavHealth();
  const {
    busy: sessionStarting,
    authLoading,
    sessionInProgress,
    start: startSession,
  } = useAgentSession();
  const sessionBusy =
    sessionStarting || authLoading || sessionInProgress;
  const [report, setReport] = useState<CatalogHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [slowScan, setSlowScan] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const urlFilters = useMemo(
    () => parseHealthUrlParams(searchParams),
    [searchParams],
  );
  const [severityFilter, setSeverityFilter] = useState<HealthSeverity | "">(
    () => urlFilters.severity,
  );
  const [categoryFilter, setCategoryFilter] = useState(() => urlFilters.category);
  const [search, setSearch] = useState(() => urlFilters.q);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const bootstrapDone = useRef(false);

  useEffect(() => {
    setSeverityFilter(urlFilters.severity);
    setCategoryFilter(urlFilters.category);
    setSearch(urlFilters.q);
  }, [urlFilters.severity, urlFilters.category, urlFilters.q]);

  const updateHealthParams = useCallback(
    (updates: Parameters<typeof applyHealthUrlUpdates>[1]) => {
      setSearchParams(
        (prev) => applyHealthUrlUpdates(prev, updates),
        { replace: true },
      );
    },
    [setSearchParams],
  );
  const slowTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearSlowTimer = useCallback(() => {
    if (slowTimerRef.current) {
      clearTimeout(slowTimerRef.current);
      slowTimerRef.current = null;
    }
    setSlowScan(false);
  }, []);

  const runScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    clearSlowTimer();
    slowTimerRef.current = setTimeout(() => setSlowScan(true), SLOW_SCAN_MS);
    try {
      const result = await fetchHealthReport();
      setReport(result);
    } catch (err) {
      setError(healthErrorMessage(err));
    } finally {
      clearSlowTimer();
      setLoading(false);
    }
  }, [clearSlowTimer]);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setReport(await fetchHealthLatest());
    } catch (err) {
      setError(healthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (bootstrapDone.current) return;
    bootstrapDone.current = true;
    let cancelled = false;

    void (async () => {
      setLoading(true);
      setError(null);
      try {
        const cached = await fetchHealthLatest();
        if (cancelled) return;
        setReport(cached);
      } catch (err) {
        if (cancelled) return;
        setError(healthErrorMessage(err));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      clearSlowTimer();
    };
  }, [clearSlowTimer]);

  const scopedFindings = useMemo(() => {
    if (!report) return [];
    return filterFindingsByEnvironment(report.findings, environmentId);
  }, [report, environmentId]);

  const summary = useMemo(
    () =>
      report
        ? summarizeFindings(scopedFindings)
        : { error: 0, warning: 0, info: 0, total: 0 },
    [report, scopedFindings],
  );

  const isCatalogHealthy =
    Boolean(report) && summary.error === 0 && summary.warning === 0;

  const showSkeleton = loading && slowScan;
  const showReportBody = Boolean(report) && !showSkeleton;

  useEffect(() => {
    if (!report) {
      setNavHealthCounts(null);
      return;
    }
    setNavHealthCounts({
      error: summary.error,
      warning: summary.warning,
    });
  }, [report, summary.error, summary.warning, setNavHealthCounts]);

  const showInfoSummary = shouldShowInfoSummaryCard(summary.info);

  useEffect(() => {
    if (!report || severityFilter !== "info" || summary.info > 0) return;
    setSeverityFilter("");
    updateHealthParams({ severity: "" });
  }, [report, severityFilter, summary.info, updateHealthParams]);

  const categories = useMemo(
    () => distinctCategories(scopedFindings),
    [scopedFindings],
  );

  const visibleFindings = useMemo(() => {
    return sortFindings(
      filterFindingsWithSearch(
        scopedFindings,
        severityFilter,
        categoryFilter,
        search,
      ),
    );
  }, [scopedFindings, severityFilter, categoryFilter, search]);

  const byCategory = useMemo(
    () => aggregateByCategory(visibleFindings),
    [visibleFindings],
  );

  const toggleSeverity = (severity: HealthSeverity | "") => {
    const next = severityFilter === severity ? "" : severity;
    setSeverityFilter(next);
    updateHealthParams({ severity: next });
  };

  const stalenessHint = report ? healthStalenessMessage(report.scannedAt) : null;

  return (
    <div className="sl-health">
      <PageHeader
        eyebrow="Diagnostics"
        title="Health"
        subtitle="Catalog scan — index, paths, references, escalation, relationships"
        right={
          <div className="sl-page-header-actions">
            {report && (
              <ScannedAtMeta
                scannedAt={report.scannedAt}
                durationMs={report.durationMs}
              />
            )}
            <button
              type="button"
              className="sl-btn sl-btn-primary"
              onClick={() => void runScan()}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="sl-spinner" aria-hidden /> Scanning…
                </>
              ) : (
                <>
                  <ShellIcon name="refresh" size={14} />
                  {report ? "Rescan" : "Run scan"}
                </>
              )}
            </button>
          </div>
        }
      />

      {error && (
        <div className="sl-health-error" role="alert">
          <p>{error}</p>
          <button
            type="button"
            className="sl-btn sl-btn-ghost"
            onClick={() => void (report ? runScan() : loadLatest())}
            disabled={loading}
          >
            Try again
          </button>
        </div>
      )}

      {stalenessHint && !error && (
        <p className="sl-health-stale-hint" role="status">
          {stalenessHint}
        </p>
      )}

      {isCatalogHealthy && report && (
        <div className="sl-health-healthy" role="status">
          <span className="sl-health-healthy-icon" aria-hidden>
            <ShellIcon name="check" size={20} />
          </span>
          <div className="sl-health-healthy-text">
            <strong>Catalog healthy</strong>
            <p>
              No errors or warnings in the latest scan.{" "}
              <ScannedAtMeta
                scannedAt={report.scannedAt}
                durationMs={report.durationMs}
                inline
              />
            </p>
          </div>
          <button
            type="button"
            className="sl-btn sl-btn-ghost"
            onClick={() => void runScan()}
            disabled={loading}
          >
            Rescan
          </button>
        </div>
      )}

      {showSkeleton && <HealthScanSkeleton />}

      {showReportBody && report && (
        <>
          <div
            className={`sl-health-summary ${showInfoSummary ? "" : "sl-health-summary-no-info"}`}
          >
            <SummaryCard
              tone="error"
              label="Errors"
              count={summary.error}
              note="Block catalog correctness"
              active={severityFilter === "error"}
              onClick={() => toggleSeverity("error")}
            />
            <SummaryCard
              tone="warning"
              label="Warnings"
              count={summary.warning}
              note="Recommended cleanup"
              active={severityFilter === "warning"}
              onClick={() => toggleSeverity("warning")}
            />
            {showInfoSummary ? (
              <SummaryCard
                tone="info"
                label={INFO_TIER_LABEL}
                count={summary.info}
                note={INFO_TIER_SUMMARY_NOTE}
                active={severityFilter === "info"}
                onClick={() => toggleSeverity("info")}
              />
            ) : null}
            <SummaryCard
              tone="ok"
              label="Total"
              count={summary.total}
              note={`across ${categories.length} categories`}
              active={!severityFilter}
              onClick={() => toggleSeverity("")}
            />
          </div>
          {!showInfoSummary ? (
            <p className="sl-health-info-hint" role="status">
              {INFO_TIER_EMPTY_HINT}
            </p>
          ) : null}

          <div className="sl-health-cols">
            <section className="sl-health-main">
              <div className="sl-toolbar sl-toolbar-tight">
                <div className="sl-search">
                  <ShellIcon name="search" size={14} />
                  <input
                    type="search"
                    placeholder="Search findings…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      updateHealthParams({ q: e.target.value });
                    }}
                  />
                </div>
                <span className="sl-result-count">
                  {visibleFindings.length} of {summary.total}
                </span>
              </div>

              {visibleFindings.length === 0 ? (
                <EmptyState
                  title={
                    severityFilter === "info" && summary.info === 0
                      ? INFO_TIER_EMPTY_HINT
                      : "No findings match the current filters."
                  }
                  body={
                    severityFilter === "info" && summary.info === 0
                      ? "The catalog scanner has not reported info-tier findings for this environment. Errors and warnings remain in the summary strip above."
                      : "Adjust category, search, or severity in the summary strip to inspect findings."
                  }
                />
              ) : (
                <ul className="sl-findings">
                  {visibleFindings.map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      expanded={expandedId === finding.id}
                      environmentId={environmentId}
                      sessionBusy={sessionBusy}
                      onStartAgent={(kind, skillName, envId, healthFinding) =>
                        void startSession({
                          kind,
                          environmentId: envId,
                          skillName,
                          navigateOnComplete: true,
                          healthFinding,
                        })
                      }
                      onToggle={() =>
                        setExpandedId((id) =>
                          id === finding.id ? null : finding.id,
                        )
                      }
                    />
                  ))}
                </ul>
              )}
            </section>

            <aside className="sl-health-side">
              <h3 className="sl-side-title">By category</h3>
              <p className="sl-muted">Click to filter</p>
              <ul className="sl-category-list">
                {byCategory.map(([cat, counts]) => {
                  const meta = getHealthCategoryMeta(cat);
                  return (
                  <li key={cat}>
                    <button
                      type="button"
                      className={`sl-category-row ${categoryFilter === cat ? "is-active" : ""}`}
                      aria-pressed={categoryFilter === cat}
                      aria-label={`${meta.label}: ${formatCategorySeveritySummary(counts)}`}
                      onClick={() => {
                        const next = categoryFilter === cat ? "" : cat;
                        setCategoryFilter(next);
                        updateHealthParams({ category: next });
                      }}
                    >
                      <div className="sl-category-text">
                        <span className="sl-category-label">{meta.label}</span>
                        {meta.description ? (
                          <span className="sl-category-desc">{meta.description}</span>
                        ) : null}
                        <code className="sl-category-code">{cat}</code>
                      </div>
                      <div className="sl-category-bars" aria-hidden>
                        {counts.error > 0 && (
                          <span
                            className="sl-cat-bar sl-cat-bar-error"
                            style={{
                              width: `${(counts.error / counts.total) * 100}%`,
                            }}
                          />
                        )}
                        {counts.warning > 0 && (
                          <span
                            className="sl-cat-bar sl-cat-bar-warning"
                            style={{
                              width: `${(counts.warning / counts.total) * 100}%`,
                            }}
                          />
                        )}
                        {counts.info > 0 && (
                          <span
                            className="sl-cat-bar sl-cat-bar-info"
                            style={{
                              width: `${(counts.info / counts.total) * 100}%`,
                            }}
                          />
                        )}
                      </div>
                      <span className="sl-category-count" aria-hidden>
                        {counts.total}
                      </span>
                    </button>
                  </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        </>
      )}

      {!report && !loading && !error && (
        <EmptyState
          title="No health scan yet"
          body="Run a catalog scan to list index, path, reference, and relationship findings."
          action={
            <button
              type="button"
              className="sl-btn sl-btn-primary"
              onClick={() => void runScan()}
            >
              <ShellIcon name="refresh" size={14} />
              Run scan
            </button>
          }
        />
      )}
    </div>
  );
}

function ScannedAtMeta({
  scannedAt,
  durationMs,
  inline = false,
}: {
  scannedAt: string;
  durationMs: number;
  inline?: boolean;
}) {
  const absolute = formatScannedAt(scannedAt);
  const relative = relativeScannedAt(scannedAt);
  return (
    <span
      className={inline ? "sl-scan-meta-inline" : "sl-scan-meta"}
      title={absolute}
    >
      Scanned {relative}
      {!inline && (
        <>
          {" "}
          · {durationMs}ms
        </>
      )}
    </span>
  );
}

function HealthScanSkeleton() {
  return (
    <div
      className="sl-health-skeleton"
      aria-busy="true"
      aria-label="Scanning catalog health"
    >
      <div className="sl-health-summary">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="sl-skel-card sl-skel-pulse" />
        ))}
      </div>
      <div className="sl-health-cols">
        <div className="sl-health-main">
          <div className="sl-skel-toolbar sl-skel-pulse" />
          <ul className="sl-skel-findings">
            {Array.from({ length: 6 }, (_, i) => (
              <li key={i} className="sl-skel-row sl-skel-pulse" />
            ))}
          </ul>
        </div>
        <aside className="sl-health-side">
          <div className="sl-skel-side-title sl-skel-pulse" />
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="sl-skel-side-row sl-skel-pulse" />
          ))}
        </aside>
      </div>
    </div>
  );
}

function SummaryCard({
  tone,
  label,
  count,
  note,
  active,
  onClick,
}: {
  tone: "error" | "warning" | "info" | "ok";
  label: string;
  count: number;
  note: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={`sl-summary sl-summary-${tone} ${active ? "is-active" : ""}`}
      onClick={onClick}
    >
      <div className="sl-summary-top">
        <span className={`sl-summary-mark sl-summary-mark-${tone}`}>
          {tone === "error" && <ShellIcon name="error" size={14} />}
          {tone === "warning" && <ShellIcon name="warning" size={14} />}
          {tone === "info" && <ShellIcon name="info" size={14} />}
          {tone === "ok" && <ShellIcon name="check" size={14} />}
        </span>
        <span className="sl-summary-label">{label}</span>
      </div>
      <div className="sl-summary-count">{count}</div>
      <div className="sl-summary-note">{note}</div>
    </button>
  );
}

function FindingRow({
  finding,
  expanded,
  environmentId,
  sessionBusy,
  onStartAgent,
  onToggle,
}: {
  finding: HealthFinding;
  expanded: boolean;
  environmentId: string;
  sessionBusy: boolean;
  onStartAgent: (
    kind: AgentSessionKind,
    skillName: string,
    environmentId: string,
    healthFinding?: {
      id?: string;
      category: string;
      message: string;
      recommendation?: string;
      sourcePath?: string;
    },
  ) => void;
  onToggle: () => void;
}) {
  const [pathCopyHint, setPathCopyHint] = useState<string | null>(null);
  const [fixCopyHint, setFixCopyHint] = useState<string | null>(null);
  const panelId = `finding-panel-${finding.id}`;
  const headId = `finding-head-${finding.id}`;
  const skillName =
    finding.skillName ?? skillNameFromSourcePath(finding.sourcePath) ?? undefined;
  const envId = finding.environmentId ?? environmentId;
  const remediation = viewRemediationFromFinding(
    { ...finding, skillName, environmentId: envId },
    environmentId,
  );
  const agentHintId = `${finding.id}-agent-hint`;
  const severityLabel =
    finding.severity === "info" ? "Info" : finding.severity;

  const copySourcePath = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(finding.sourcePath);
      setPathCopyHint("Path copied");
    } catch {
      setPathCopyHint("Copy failed");
    }
  }, [finding.sourcePath]);

  const copyFixSteps = useCallback(async () => {
    const text =
      finding.recommendation?.trim() ||
      finding.message ||
      "No fix steps available for this finding.";
    try {
      await navigator.clipboard.writeText(text);
      setFixCopyHint("Fix steps copied");
    } catch {
      setFixCopyHint("Copy failed");
    }
  }, [finding.message, finding.recommendation]);

  useEffect(() => {
    if (!pathCopyHint) return;
    const t = window.setTimeout(() => setPathCopyHint(null), 2000);
    return () => window.clearTimeout(t);
  }, [pathCopyHint]);

  useEffect(() => {
    if (!fixCopyHint) return;
    const t = window.setTimeout(() => setFixCopyHint(null), 2000);
    return () => window.clearTimeout(t);
  }, [fixCopyHint]);

  return (
    <li
      className={`sl-finding sl-finding-${finding.severity} ${expanded ? "is-expanded" : ""}`}
    >
      <button
        type="button"
        className="sl-finding-head"
        id={headId}
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className={`sl-finding-sev sl-finding-sev-${finding.severity}`}>
          <StatusDot
            status={finding.severity === "info" ? "ok" : finding.severity}
          />
          {severityLabel}
        </span>
        <code className="sl-finding-cat">{finding.category}</code>
        {finding.skillName ? (
          <span className="sl-finding-skill">{finding.skillName}</span>
        ) : null}
        <span className="sl-finding-msg">{finding.message}</span>
        <span className="sl-finding-chevron" aria-hidden>
          <ShellIcon name={expanded ? "chevronDown" : "chevron"} size={12} />
        </span>
      </button>
      {expanded && (
        <div
          id={panelId}
          className="sl-finding-body"
          role="region"
          aria-labelledby={headId}
        >
          <div className="sl-finding-grid">
            <div className="sl-kv">
              <div className="sl-kv-label">Source</div>
              <div className="sl-kv-value sl-finding-source">
                <SourceLink sourcePath={finding.sourcePath} showFullPath />
                <button
                  type="button"
                  className="sl-btn sl-btn-ghost sl-btn-sm"
                  onClick={() => void copySourcePath()}
                >
                  <ShellIcon name="copy" size={14} />
                  Copy path
                </button>
                {pathCopyHint ? (
                  <span className="sl-finding-copy-hint" role="status">
                    {pathCopyHint}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="sl-kv">
              <div className="sl-kv-label">Recommendation</div>
              <div className="sl-kv-value">{finding.recommendation ?? "—"}</div>
            </div>
          </div>
          <FindingRemediationActions
            remediation={remediation}
            sessionBusy={sessionBusy}
            agentHintId={agentHintId}
            onCopyFixSteps={() => void copyFixSteps()}
            onStartAgent={(kind) => {
              if (skillName && envId) {
                onStartAgent(kind, skillName, envId, {
                  id: finding.id,
                  category: finding.category,
                  message: finding.message,
                  recommendation: finding.recommendation,
                  sourcePath: finding.sourcePath,
                });
              }
            }}
          />
          {fixCopyHint ? (
            <p className="sl-finding-copy-hint sl-finding-action-hint" role="status">
              {fixCopyHint}
            </p>
          ) : null}
        </div>
      )}
    </li>
  );
}

function FindingRemediationActions({
  remediation,
  sessionBusy,
  agentHintId,
  onCopyFixSteps,
  onStartAgent,
}: {
  remediation: ReturnType<typeof viewRemediationFromFinding>;
  sessionBusy: boolean;
  agentHintId: string;
  onCopyFixSteps: () => void;
  onStartAgent: (kind: AgentSessionKind) => void;
}) {
  const { primary, agentDisabledReason } = remediation;

  if (primary.mode === "none") {
    return null;
  }

  if (primary.mode === "manual") {
    return (
      <div className="sl-finding-actions">
        <button
          type="button"
          className="sl-btn sl-btn-ghost"
          onClick={onCopyFixSteps}
        >
          <ShellIcon name="copy" size={14} />
          {primary.label}
        </button>
      </div>
    );
  }

  const agentDisabled = Boolean(agentDisabledReason) || sessionBusy;

  return (
    <div className="sl-finding-actions">
      <button
        type="button"
        className="sl-btn sl-btn-ghost"
        disabled={agentDisabled}
        aria-busy={sessionBusy}
        aria-describedby={agentDisabledReason ? agentHintId : undefined}
        onClick={() => onStartAgent(primary.kind)}
      >
        <ShellIcon name="sparkle" size={14} />
        {sessionBusy ? "Starting…" : primary.label}
      </button>
      {agentDisabledReason ? (
        <p
          id={agentHintId}
          className="sl-finding-action-hint"
          role="note"
        >
          {agentDisabledReason}
        </p>
      ) : null}
      <button
        type="button"
        className="sl-btn sl-btn-ghost sl-btn-sm"
        onClick={onCopyFixSteps}
      >
        <ShellIcon name="copy" size={14} />
        Copy fix steps
      </button>
    </div>
  );
}
