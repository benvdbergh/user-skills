import { useCallback, useMemo, useState } from "react";
import {
  fetchHealthReport,
  type CatalogHealthReport,
  type HealthFinding,
  type HealthSeverity,
} from "../api/health";
import { ApiError } from "../api/client";
import { SourceLink } from "../components/SourceLink";
import {
  distinctCategories,
  filterFindings,
  formatScannedAt,
  sortFindings,
} from "../lib/healthView";
import "./HealthPage.css";

export function HealthPage() {
  const [report, setReport] = useState<CatalogHealthReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<HealthSeverity | "">("");
  const [categoryFilter, setCategoryFilter] = useState("");

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

  const categories = useMemo(
    () => (report ? distinctCategories(report.findings) : []),
    [report],
  );

  const visibleFindings = useMemo(() => {
    if (!report) return [];
    return sortFindings(
      filterFindings(report.findings, severityFilter, categoryFilter),
    );
  }, [report, severityFilter, categoryFilter]);

  return (
    <section className="health-page" aria-labelledby="health-heading">
      <header className="health-header">
        <div>
          <h2 id="health-heading">Health</h2>
          <p className="health-subtitle">
            Catalog health scan — index, paths, relationships, escalation, and
            references
          </p>
        </div>
        <button
          type="button"
          className="health-scan-btn"
          onClick={() => void runScan()}
          disabled={loading}
        >
          {loading ? "Scanning…" : "Run scan"}
        </button>
      </header>

      {error && (
        <div className="health-error" role="alert">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="health-summary" role="status">
            <SummaryCard label="Errors" count={report.summary.error} tone="error" />
            <SummaryCard
              label="Warnings"
              count={report.summary.warning}
              tone="warning"
            />
            <SummaryCard label="Info" count={report.summary.info} tone="info" />
            <SummaryCard label="Total" count={report.summary.total} tone="neutral" />
          </div>
          <p className="health-meta">
            Scanned {formatScannedAt(report.scannedAt)} · {report.durationMs}ms
          </p>

          <div className="health-filters" role="group" aria-label="Filter findings">
            <label>
              Severity
              <select
                value={severityFilter}
                onChange={(e) =>
                  setSeverityFilter(e.target.value as HealthSeverity | "")
                }
              >
                <option value="">All</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </label>
            <label>
              Category
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </label>
            <span className="health-count" aria-live="polite">
              {visibleFindings.length} of {report.findings.length} findings
            </span>
          </div>

          <div className="health-table-wrap">
            <table className="health-table">
              <thead>
                <tr>
                  <th scope="col">Severity</th>
                  <th scope="col">Category</th>
                  <th scope="col">Message</th>
                  <th scope="col">Source</th>
                  <th scope="col">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {visibleFindings.length === 0 && (
                  <tr>
                    <td colSpan={5} className="health-empty">
                      No findings match the current filters.
                    </td>
                  </tr>
                )}
                {visibleFindings.map((finding) => (
                  <FindingRow key={finding.id} finding={finding} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!report && !loading && !error && (
        <p className="health-muted">
          Click &quot;Run scan&quot; to load catalog health findings.
        </p>
      )}
    </section>
  );
}

function SummaryCard({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "error" | "warning" | "info" | "neutral";
}) {
  return (
    <div className={`health-summary-card health-summary-${tone}`}>
      <span className="health-summary-count">{count}</span>
      <span className="health-summary-label">{label}</span>
    </div>
  );
}

function FindingRow({ finding }: { finding: HealthFinding }) {
  return (
    <tr className={`health-row health-row-${finding.severity}`}>
      <td>
        <span className={`health-severity health-severity-${finding.severity}`}>
          {finding.severity}
        </span>
      </td>
      <td>
        <code className="health-category">{finding.category}</code>
      </td>
      <td>{finding.message}</td>
      <td className="health-source">
        <SourceLink sourcePath={finding.sourcePath} showFullPath />
      </td>
      <td className="health-recommendation">
        {finding.recommendation ?? "—"}
      </td>
    </tr>
  );
}
