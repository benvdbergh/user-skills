import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavHealth } from "../context/NavHealthContext";
import {
  fetchHealthReport,
  type CatalogHealthReport,
  type HealthFinding,
  type HealthSeverity,
} from "../api/health";
import { ApiError } from "../api/client";
import { SourceLink } from "../components/SourceLink";
import { EmptyState, MonoPath, PageHeader } from "../components/ShellPrimitives";
import { ShellIcon, StatusDot } from "../components/ShellIcon";
import {
  aggregateByCategory,
  distinctCategories,
  filterFindingsWithSearch,
  relativeScannedAt,
  sortFindings,
} from "../lib/healthView";

export function HealthPage() {
  const { setCounts: setNavHealthCounts } = useNavHealth();
  const [report, setReport] = useState<CatalogHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<HealthSeverity | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const runScan = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchHealthReport();
      setReport(result);
    } catch (err) {
      const message =
        err instanceof ApiError
          ? (err.problem.detail ?? err.problem.title)
          : err instanceof Error
            ? err.message
            : "Health scan failed";
      setError(message);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const summary = report?.summary ?? {
    error: 0,
    warning: 0,
    info: 0,
    total: 0,
  };

  useEffect(() => {
    if (!report) return;
    setNavHealthCounts({
      error: report.summary.error,
      warning: report.summary.warning,
    });
  }, [report, setNavHealthCounts]);

  const categories = useMemo(
    () => (report ? distinctCategories(report.findings) : []),
    [report],
  );

  const visibleFindings = useMemo(() => {
    if (!report) return [];
    return sortFindings(
      filterFindingsWithSearch(
        report.findings,
        severityFilter,
        categoryFilter,
        search,
      ),
    );
  }, [report, severityFilter, categoryFilter, search]);

  const byCategory = useMemo(
    () => aggregateByCategory(visibleFindings),
    [visibleFindings],
  );

  const toggleSeverity = (severity: HealthSeverity | "") => {
    setSeverityFilter((current) => (current === severity ? "" : severity));
  };

  return (
    <div className="sl-health">
      <PageHeader
        eyebrow="Diagnostics"
        title="Health"
        subtitle="Catalog scan — index, paths, references, escalation, relationships"
        right={
          <div className="sl-page-header-actions">
            {report && (
              <span className="sl-scan-meta">
                Scanned {relativeScannedAt(report.scannedAt)} · {report.durationMs}
                ms
              </span>
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
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="sl-health-summary">
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
            <SummaryCard
              tone="info"
              label="Suggestions"
              count={summary.info}
              note="Polish & metadata"
              active={severityFilter === "info"}
              onClick={() => toggleSeverity("info")}
            />
            <SummaryCard
              tone="ok"
              label="Total"
              count={summary.total}
              note={`across ${categories.length} categories`}
              active={!severityFilter}
              onClick={() => toggleSeverity("")}
            />
          </div>

          <div className="sl-health-cols">
            <section className="sl-health-main">
              <div className="sl-toolbar sl-toolbar-tight">
                <div className="sl-search">
                  <ShellIcon name="search" size={14} />
                  <input
                    type="search"
                    placeholder="Search findings…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="sl-filter-chips">
                  {(["error", "warning", "info"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      className={`sl-chip sl-chip-${sev} ${severityFilter === sev ? "is-active" : ""}`}
                      onClick={() => toggleSeverity(sev)}
                    >
                      <StatusDot status={sev === "info" ? "ok" : sev} />
                      {sev}
                      <span className="sl-chip-count">{summary[sev]}</span>
                    </button>
                  ))}
                </div>
                <span className="sl-result-count">
                  {visibleFindings.length} of {summary.total}
                </span>
              </div>

              {visibleFindings.length === 0 ? (
                <EmptyState
                  title="No findings match the current filters."
                  body="Adjust filters or search to inspect a specific category."
                />
              ) : (
                <ul className="sl-findings">
                  {visibleFindings.map((finding) => (
                    <FindingRow
                      key={finding.id}
                      finding={finding}
                      expanded={expandedId === finding.id}
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
                {byCategory.map(([cat, counts]) => (
                  <li key={cat}>
                    <button
                      type="button"
                      className={`sl-category-row ${categoryFilter === cat ? "is-active" : ""}`}
                      onClick={() =>
                        setCategoryFilter((c) => (c === cat ? "" : cat))
                      }
                    >
                      <code className="sl-category-name">{cat}</code>
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
                      <span className="sl-category-count">{counts.total}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </>
      )}

      {!report && !loading && !error && (
        <p className="sl-muted">
          Click &quot;Run scan&quot; to load catalog health findings.
        </p>
      )}
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
  onToggle,
}: {
  finding: HealthFinding;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <li
      className={`sl-finding sl-finding-${finding.severity} ${expanded ? "is-expanded" : ""}`}
    >
      <button type="button" className="sl-finding-head" onClick={onToggle}>
        <span className={`sl-finding-sev sl-finding-sev-${finding.severity}`}>
          <StatusDot
            status={finding.severity === "info" ? "ok" : finding.severity}
          />
          {finding.severity}
        </span>
        <code className="sl-finding-cat">{finding.category}</code>
        <span className="sl-finding-msg">{finding.message}</span>
        <ShellIcon name={expanded ? "chevronDown" : "chevron"} size={12} />
      </button>
      {expanded && (
        <div className="sl-finding-body">
          <div className="sl-finding-grid">
            <div className="sl-kv">
              <div className="sl-kv-label">Source</div>
              <div className="sl-kv-value">
                <MonoPath path={finding.sourcePath} maxLen={64} />
                <SourceLink sourcePath={finding.sourcePath} />
              </div>
            </div>
            <div className="sl-kv">
              <div className="sl-kv-label">Recommendation</div>
              <div className="sl-kv-value">{finding.recommendation ?? "—"}</div>
            </div>
          </div>
          <div className="sl-finding-actions">
            <SourceLink sourcePath={finding.sourcePath} />
            <button type="button" className="sl-btn sl-btn-ghost" disabled>
              Suggest fix (R0.4)
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
