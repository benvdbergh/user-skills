import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { useDetailPanelSlot } from "../context/DetailPanelSlotContext";
import { useNavHealth } from "../context/NavHealthContext";
import { parseSkillQuery } from "../lib/skillQuery";
import {
  fetchRelationshipCounts,
  fetchSkills,
  type SkillSummary,
} from "../api/catalog";
import { ApiError } from "../api/client";
import {
  Badge,
  EmptyState,
  FilterChipDropdown,
  HealthPill,
  PageHeader,
} from "../components/ShellPrimitives";
import { ShellIcon, StatusDot } from "../components/ShellIcon";
import { SourceLink } from "../components/SourceLink";
import { useEnvironment } from "../context/EnvironmentContext";
import {
  EMPTY_CATALOG_FILTERS,
  enrichSkill,
  filterCatalogRows,
  distinctFilterValues,
  type CatalogFilters,
  type CatalogRow,
} from "../lib/catalogView";

type SortKey =
  | "name"
  | "scope"
  | "cluster"
  | "tier"
  | "triggerCount"
  | "workflowCount"
  | "relationshipCount"
  | "health";

interface SortState {
  key: SortKey;
  dir: "asc" | "desc";
}

const HEALTH_FILTER_OPTIONS = ["ok", "warning", "error"] as const;

function catalogSearchWithoutSkill(params: URLSearchParams): string {
  const next = new URLSearchParams(params);
  next.delete("skill");
  return next.toString();
}

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setConfig, registerClosePanel } = useDetailPanelSlot();
  const { setCounts: setNavHealthCounts } = useNavHealth();
  const { environmentId } = useEnvironment();
  const lastOpenedRowKey = useRef<string | null>(null);
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
  const [sort, setSort] = useState<SortState>({ key: "name", dir: "asc" });

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

  const filtered = useMemo(() => {
    const list = filterCatalogRows(rows, search, filters);
    const k = sort.key;
    return [...list].sort((a, b) => {
      let av: string | number = a[k];
      let bv: string | number = b[k];
      if (k === "health") {
        av = a.health.status;
        bv = b.health.status;
      }
      if (k === "relationshipCount") {
        av = a.relationshipCount ?? -1;
        bv = b.relationshipCount ?? -1;
      }
      if (typeof av === "number" && typeof bv === "number") {
        return sort.dir === "asc" ? av - bv : bv - av;
      }
      return sort.dir === "asc"
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [rows, search, filters, sort]);

  const healthCounts = useMemo(() => {
    const c = { ok: 0, warning: 0, error: 0 };
    for (const row of rows) {
      c[row.health.status]++;
    }
    return c;
  }, [rows]);

  useEffect(() => {
    setNavHealthCounts({
      error: healthCounts.error,
      warning: healthCounts.warning,
    });
  }, [healthCounts.error, healthCounts.warning, setNavHealthCounts]);

  const envCount = useMemo(
    () => new Set(rows.map((r) => r.environmentId)).size,
    [rows],
  );

  const totalRelations = useMemo(
    () =>
      rows.reduce((sum, r) => sum + (r.relationshipCount ?? 0), 0),
    [rows],
  );

  const alwaysOnCount = useMemo(
    () => rows.filter((r) => r.tier === "always").length,
    [rows],
  );

  const showEnvironmentColumn = !environmentId;

  const activeFilterCount =
    Object.values(filters).filter(Boolean).length + (search ? 1 : 0);

  function updateFilter(key: keyof CatalogFilters, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function setHealthFilter(health: string) {
    setFilters((prev) => ({ ...prev, health }));
  }

  function clearFilters() {
    setSearch("");
    setFilters(EMPTY_CATALOG_FILTERS);
  }

  function toggleSort(key: SortKey) {
    setSort((s) => ({
      key,
      dir: s.key === key && s.dir === "asc" ? "desc" : "asc",
    }));
  }

  const skillParam = searchParams.get("skill");
  const parsedSkill = skillParam ? parseSkillQuery(skillParam) : null;
  const catalogSearch = useMemo(
    () => catalogSearchWithoutSkill(searchParams),
    [searchParams],
  );
  const selectedSkillKey = parsedSkill
    ? `${parsedSkill.environmentId}/${parsedSkill.skillName}`
    : null;

  const panelRow = useMemo(() => {
    if (!parsedSkill) return null;
    return (
      rows.find(
        (r) =>
          r.environmentId === parsedSkill.environmentId &&
          r.name === parsedSkill.skillName,
      ) ?? null
    );
  }, [rows, parsedSkill]);

  const closeSkillPanel = useCallback(() => {
    const returnKey = lastOpenedRowKey.current;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete("skill");
        return next;
      },
      { replace: true },
    );
    if (returnKey) {
      requestAnimationFrame(() => {
        const el = document.querySelector<HTMLElement>(
          `[data-skill-key="${CSS.escape(returnKey)}"]`,
        );
        el?.focus();
      });
    }
  }, [setSearchParams]);

  useEffect(() => {
    registerClosePanel(closeSkillPanel);
    return () => registerClosePanel(null);
  }, [closeSkillPanel, registerClosePanel]);

  useEffect(() => {
    if (skillParam && !parseSkillQuery(skillParam)) {
      closeSkillPanel();
    }
  }, [skillParam, closeSkillPanel]);

  useEffect(() => {
    if (!parsedSkill) {
      setConfig(null);
      return;
    }

    if (!loading && !panelRow) {
      setConfig({
        environmentId: parsedSkill.environmentId,
        skillName: parsedSkill.skillName,
        catalogSearch,
        notFound: true,
      });
      return;
    }

    if (loading && !panelRow) {
      setConfig({
        environmentId: parsedSkill.environmentId,
        skillName: parsedSkill.skillName,
        catalogSearch,
      });
      return;
    }

    setConfig({
      environmentId: parsedSkill.environmentId,
      skillName: parsedSkill.skillName,
      catalogSearch,
      scope: panelRow?.scope,
      description: panelRow?.description,
      sourcePath: panelRow?.path,
      health: panelRow?.health,
    });
  }, [parsedSkill, panelRow, catalogSearch, loading, setConfig]);

  useEffect(() => {
    if (!parsedSkill) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeSkillPanel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [parsedSkill, closeSkillPanel]);

  function openSkill(row: CatalogRow) {
    lastOpenedRowKey.current = `${row.environmentId}/${row.name}`;
    const skillKey = `${row.environmentId}/${row.name}`;
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("skill", skillKey);
        return next;
      },
      { replace: false },
    );
  }

  const subtitle = environmentId
    ? `Skills in ${environmentId}`
    : `${rows.length} skills across ${envCount} environments`;

  return (
    <section className="sl-catalog" aria-labelledby="catalog-heading">
      <PageHeader
        eyebrow="Inventory"
        title="Catalog"
        subtitle={loading ? "Loading catalog…" : subtitle}
        right={
          <div className="sl-page-header-actions">
            <button type="button" className="sl-btn sl-btn-ghost" disabled>
              <ShellIcon name="refresh" size={14} />
              Reindex
            </button>
            <button type="button" className="sl-btn sl-btn-primary" disabled>
              <ShellIcon name="plus" size={14} />
              New skill
            </button>
          </div>
        }
      />

      <h2 id="catalog-heading" className="visually-hidden">
        Catalog
      </h2>

      {error && (
        <div className="sl-catalog-error" role="alert">
          {error}
        </div>
      )}

      <CatalogStats
        total={rows.length}
        healthCounts={healthCounts}
        healthFilter={filters.health}
        onHealthFilter={setHealthFilter}
        totalRelations={totalRelations}
        alwaysOnCount={alwaysOnCount}
      />

      <div className="sl-toolbar">
        <label className="sl-search">
          <ShellIcon name="search" size={14} />
          <span className="visually-hidden">Search skills</span>
          <input
            type="search"
            placeholder="Search name, description, triggers, workflows…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <kbd aria-hidden>⌘K</kbd>
        </label>
        <div className="sl-filter-chips" role="group" aria-label="Filters">
          <FilterChipDropdown
            label="Scope"
            value={filters.scope}
            options={distinctFilterValues(rows, "scope")}
            onChange={(v) => updateFilter("scope", v)}
          />
          <FilterChipDropdown
            label="Tier"
            value={filters.tier}
            options={distinctFilterValues(rows, "tier")}
            onChange={(v) => updateFilter("tier", v)}
          />
          <FilterChipDropdown
            label="Cluster"
            value={filters.cluster}
            options={distinctFilterValues(rows, "cluster")}
            onChange={(v) => updateFilter("cluster", v)}
          />
          <FilterChipDropdown
            label="Project"
            value={filters.project}
            options={distinctFilterValues(rows, "projectLabel")}
            onChange={(v) => updateFilter("project", v)}
          />
          <FilterChipDropdown
            label="Health"
            value={filters.health}
            options={[...HEALTH_FILTER_OPTIONS]}
            onChange={(v) => updateFilter("health", v)}
          />
          {activeFilterCount > 0 && (
            <button
              type="button"
              className="sl-btn sl-btn-ghost sl-btn-sm"
              onClick={clearFilters}
            >
              Clear ({activeFilterCount})
            </button>
          )}
        </div>
        <p className="sl-result-count" aria-live="polite">
          {loading ? "…" : `${filtered.length} of ${rows.length}`}
        </p>
      </div>

      <CatalogTable
        rows={filtered}
        loading={loading}
        sort={sort}
        onSort={toggleSort}
        onOpen={openSkill}
        showEnvironmentColumn={showEnvironmentColumn}
        selectedSkillKey={selectedSkillKey}
      />

      {!loading && filtered.length === 0 && !error && (
        <EmptyState
          title="No skills match the current filters."
          body="Try clearing filters or widening your search."
          action={
            <button
              type="button"
              className="sl-btn sl-btn-ghost"
              onClick={clearFilters}
            >
              Reset filters
            </button>
          }
        />
      )}
    </section>
  );
}

function CatalogStats({
  total,
  healthCounts,
  healthFilter,
  onHealthFilter,
  totalRelations,
  alwaysOnCount,
}: {
  total: number;
  healthCounts: { ok: number; warning: number; error: number };
  healthFilter: string;
  onHealthFilter: (health: string) => void;
  totalRelations: number;
  alwaysOnCount: number;
}) {
  return (
    <div className="sl-catalog-stats">
      <button
        type="button"
        className={`sl-stat ${!healthFilter ? "is-active" : ""}`}
        onClick={() => onHealthFilter("")}
      >
        <div className="sl-stat-value">{total}</div>
        <div className="sl-stat-label">Total</div>
      </button>
      <button
        type="button"
        className={`sl-stat sl-stat-ok ${healthFilter === "ok" ? "is-active" : ""}`}
        onClick={() => onHealthFilter("ok")}
      >
        <div className="sl-stat-value">
          <StatusDot status="ok" />
          {healthCounts.ok}
        </div>
        <div className="sl-stat-label">Healthy</div>
      </button>
      <button
        type="button"
        className={`sl-stat sl-stat-warn ${healthFilter === "warning" ? "is-active" : ""}`}
        onClick={() => onHealthFilter("warning")}
      >
        <div className="sl-stat-value">
          <StatusDot status="warning" />
          {healthCounts.warning}
        </div>
        <div className="sl-stat-label">Warnings</div>
      </button>
      <button
        type="button"
        className={`sl-stat sl-stat-err ${healthFilter === "error" ? "is-active" : ""}`}
        onClick={() => onHealthFilter("error")}
      >
        <div className="sl-stat-value">
          <StatusDot status="error" />
          {healthCounts.error}
        </div>
        <div className="sl-stat-label">Errors</div>
      </button>
      <div className="sl-stat-spacer" aria-hidden />
      <div className="sl-stat sl-stat-readonly">
        <div className="sl-stat-value">{totalRelations}</div>
        <div className="sl-stat-label">Relations</div>
      </div>
      <div className="sl-stat sl-stat-readonly">
        <div className="sl-stat-value">{alwaysOnCount}</div>
        <div className="sl-stat-label">Always-on</div>
      </div>
    </div>
  );
}

function CatalogTable({
  rows,
  loading,
  sort,
  onSort,
  onOpen,
  showEnvironmentColumn,
  selectedSkillKey,
}: {
  rows: CatalogRow[];
  loading: boolean;
  sort: SortState;
  onSort: (key: SortKey) => void;
  onOpen: (row: CatalogRow) => void;
  showEnvironmentColumn: boolean;
  selectedSkillKey: string | null;
}) {
  const colCount = showEnvironmentColumn ? 9 : 8;

  return (
    <div className="sl-table-wrap">
      <table className="sl-table">
        <thead>
          <tr>
            <SortHead k="name" sort={sort} onSort={onSort}>
              Skill
            </SortHead>
            <SortHead k="scope" sort={sort} onSort={onSort}>
              Scope
            </SortHead>
            {showEnvironmentColumn && <th scope="col">Environment</th>}
            <SortHead k="cluster" sort={sort} onSort={onSort}>
              Cluster
            </SortHead>
            <SortHead k="tier" sort={sort} onSort={onSort}>
              Tier
            </SortHead>
            <SortHead k="triggerCount" sort={sort} onSort={onSort} num>
              Triggers
            </SortHead>
            <SortHead k="workflowCount" sort={sort} onSort={onSort} num>
              Workflows
            </SortHead>
            <SortHead k="relationshipCount" sort={sort} onSort={onSort} num>
              Relations
            </SortHead>
            <SortHead k="health" sort={sort} onSort={onSort}>
              Health
            </SortHead>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td colSpan={colCount} className="sl-catalog-loading">
                Loading catalog…
              </td>
            </tr>
          )}
          {!loading &&
            rows.map((row) => {
              const rowKey = `${row.environmentId}/${row.name}`;
              const isSelected = selectedSkillKey === rowKey;
              return (
              <tr
                key={`${row.environmentId}:${row.name}`}
                data-skill-key={rowKey}
                className={`sl-tr health-${row.health.status}${isSelected ? " is-selected" : ""}`}
                role="button"
                aria-selected={isSelected}
                onClick={() => onOpen(row)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onOpen(row);
                  }
                }}
                tabIndex={0}
                title={row.metadataIssues.join("; ") || undefined}
              >
                <td className="sl-td-name">
                  <div className="sl-skill-name">{row.name}</div>
                  <div
                    className="sl-skill-path"
                    onClick={(e) => e.stopPropagation()}
                    onKeyDown={(e) => e.stopPropagation()}
                  >
                    <SourceLink sourcePath={row.path} />
                  </div>
                </td>
                <td>
                  <Badge tone={row.scope === "user" ? "info" : "neutral"}>
                    {row.scope}
                  </Badge>
                </td>
                {showEnvironmentColumn && <td>{row.environmentId}</td>}
                <td className="sl-cluster">{row.cluster}</td>
                <td>
                  <Badge tone={row.tier === "always" ? "accent" : "neutral"}>
                    {row.tier}
                  </Badge>
                </td>
                <td className="num">{row.triggerCount}</td>
                <td className="num">{row.workflowCount}</td>
                <td className="num">
                  {row.relationshipCount === null
                    ? "—"
                    : row.relationshipCount}
                </td>
                <td onClick={(e) => e.stopPropagation()}>
                  <HealthPill
                    status={row.health.status}
                    findings={row.health.findings}
                  />
                </td>
              </tr>
            );
            })}
        </tbody>
      </table>
    </div>
  );
}

function SortHead({
  k,
  sort,
  onSort,
  num,
  children,
}: {
  k: SortKey;
  sort: SortState;
  onSort: (key: SortKey) => void;
  num?: boolean;
  children: ReactNode;
}) {
  return (
    <th
      scope="col"
      className={`${num ? "num" : ""} ${sort.key === k ? "is-sorted" : ""}`}
      onClick={() => onSort(k)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSort(k);
        }
      }}
      tabIndex={0}
      role="columnheader"
      aria-sort={
        sort.key === k
          ? sort.dir === "asc"
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <span className="sl-th-inner">
        {children}
        <span className="sl-th-sort" aria-hidden>
          {sort.key === k ? (sort.dir === "asc" ? "↑" : "↓") : ""}
        </span>
      </span>
    </th>
  );
}
