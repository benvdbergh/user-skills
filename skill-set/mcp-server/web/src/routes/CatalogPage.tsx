import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  fetchRelationshipCounts,
  fetchSkills,
  type SkillSummary,
} from "../api/catalog";
import { ApiError } from "../api/client";
import { SourceLink } from "../components/SourceLink";
import { useEnvironment } from "../context/EnvironmentContext";
import {
  EMPTY_CATALOG_FILTERS,
  enrichSkill,
  filterCatalogRows,
  distinctFilterValues,
  healthStatusLabel,
  type CatalogFilters,
  type CatalogRow,
} from "../lib/catalogView";
import "./CatalogPage.css";

export function CatalogPage() {
  const [searchParams] = useSearchParams();
  const { environmentId } = useEnvironment();
  const [skills, setSkills] = useState<SkillSummary[]>([]);
  const [relationshipCounts, setRelationshipCounts] = useState<Map<
    string,
    number
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<CatalogFilters>(
    EMPTY_CATALOG_FILTERS,
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      fetchSkills(environmentId || undefined),
      fetchRelationshipCounts(),
    ])
      .then(([skillList, counts]) => {
        if (cancelled) return;
        setSkills(skillList);
        setRelationshipCounts(counts);
      })
      .catch((err) => {
        if (cancelled) return;
        const message =
          err instanceof ApiError
            ? (err.problem.detail ?? err.problem.title)
            : err instanceof Error
              ? err.message
              : "Failed to load catalog";
        setError(message);
        setSkills([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [environmentId]);

  const rows = useMemo(
    () => skills.map((s) => enrichSkill(s, relationshipCounts)),
    [skills, relationshipCounts],
  );

  const filtered = useMemo(
    () => filterCatalogRows(rows, search, filters),
    [rows, search, filters],
  );

  const showEnvironmentColumn = !environmentId;

  function updateFilter(key: keyof CatalogFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function skillDetailPath(row: CatalogRow): string {
    const base = `/skills/${encodeURIComponent(row.environmentId)}/${encodeURIComponent(row.name)}`;
    const qs = searchParams.toString();
    return qs ? `${base}?${qs}` : base;
  }

  return (
    <section className="catalog-page" aria-labelledby="catalog-heading">
      <header className="catalog-header">
        <div>
          <h2 id="catalog-heading">Catalog</h2>
          <p className="catalog-subtitle">
            {environmentId
              ? `Skills in ${environmentId}`
              : "All user and project inventories"}
          </p>
        </div>
        <p className="catalog-count" aria-live="polite">
          {loading ? "Loading…" : `${filtered.length} of ${rows.length} skills`}
        </p>
      </header>

      {error && (
        <div className="catalog-error" role="alert">
          {error}
        </div>
      )}

      <div className="catalog-toolbar">
        <label className="catalog-search">
          <span className="visually-hidden">Search skills</span>
          <input
            type="search"
            placeholder="Search name, description, triggers…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="catalog-filters" role="group" aria-label="Filters">
          <FilterSelect
            label="Scope"
            value={filters.scope}
            options={distinctFilterValues(rows, "scope")}
            onChange={(v) => updateFilter("scope", v)}
          />
          <FilterSelect
            label="Tier"
            value={filters.tier}
            options={distinctFilterValues(rows, "tier")}
            onChange={(v) => updateFilter("tier", v)}
          />
          <FilterSelect
            label="Cluster"
            value={filters.cluster}
            options={distinctFilterValues(rows, "cluster")}
            onChange={(v) => updateFilter("cluster", v)}
          />
          <FilterSelect
            label="Project"
            value={filters.project}
            options={distinctFilterValues(rows, "projectLabel")}
            onChange={(v) => updateFilter("project", v)}
          />
          <FilterSelect
            label="Health"
            value={filters.health}
            options={["ok", "warning", "error"]}
            onChange={(v) => updateFilter("health", v)}
          />
        </div>
      </div>

      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th scope="col">Name</th>
              <th scope="col">Scope</th>
              {showEnvironmentColumn && <th scope="col">Environment</th>}
              <th scope="col">Project</th>
              <th scope="col">Cluster</th>
              <th scope="col">Tier</th>
              <th scope="col" className="num">
                Triggers
              </th>
              <th scope="col" className="num">
                Workflows
              </th>
              <th scope="col" className="num">
                Relations
              </th>
              <th scope="col">Health</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td
                  colSpan={showEnvironmentColumn ? 10 : 9}
                  className="catalog-empty"
                >
                  Loading catalog…
                </td>
              </tr>
            )}
            {!loading && filtered.length === 0 && (
              <tr>
                <td
                  colSpan={showEnvironmentColumn ? 10 : 9}
                  className="catalog-empty"
                >
                  No skills match the current filters.
                </td>
              </tr>
            )}
            {!loading &&
              filtered.map((row) => (
                <tr
                  key={`${row.environmentId}:${row.name}`}
                  className={rowClassName(row)}
                  title={row.metadataIssues.join("; ") || undefined}
                >
                  <td className="catalog-name">
                    <Link to={skillDetailPath(row)} className="catalog-name-link">
                      {row.name}
                    </Link>
                    <span
                      className="catalog-path"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <SourceLink sourcePath={row.path} />
                    </span>
                  </td>
                  <td>{row.scope}</td>
                  {showEnvironmentColumn && <td>{row.environmentId}</td>}
                  <td>{row.projectLabel}</td>
                  <td>{row.cluster}</td>
                  <td>{row.tier}</td>
                  <td className="num">{row.triggerCount}</td>
                  <td className="num">{row.workflowCount}</td>
                  <td className="num">
                    {row.relationshipCount === null
                      ? "—"
                      : row.relationshipCount}
                  </td>
                  <td>
                    <HealthBadge status={row.health.status} findings={row.health.findings} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="catalog-filter">
      <span>{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={`Filter by ${label.toLowerCase()}`}
      >
        <option value="">All</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

function HealthBadge({
  status,
  findings,
}: {
  status: CatalogRow["health"]["status"];
  findings: number;
}) {
  return (
    <span className={`health-badge health-${status}`}>
      {healthStatusLabel(status)}
      {findings > 0 ? ` (${findings})` : ""}
    </span>
  );
}

function rowClassName(row: CatalogRow): string {
  const classes = ["catalog-row"];
  if (row.metadataIssues.length > 0) {
    classes.push("catalog-row-stale");
  }
  if (row.health.status === "error") {
    classes.push("catalog-row-error");
  } else if (row.health.status === "warning") {
    classes.push("catalog-row-warning");
  }
  return classes.join(" ");
}
