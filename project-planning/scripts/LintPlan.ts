#!/usr/bin/env bun

/**
 * LintPlan.ts — Validate epic/story frontmatter, traces_to for ready, DAG on depends_on.
 */

import { parseArgs } from "util";
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { contextFromArgs } from "./lib/cliShared";
import type { PlanningContext } from "./lib/types";
import { getEpicsDir, getStoriesDir, epicPrefix, storyPrefix } from "./lib/planningPaths";
import {
  parseMarkdownFrontmatter,
  getKind,
  getId,
  getDependsOn,
  getStatus,
  hasTracesTo,
} from "./lib/frontmatter";

type Node = { file: string; id: string; depends_on: string[] };

function collectNodes(ctx: PlanningContext): Node[] {
  const out: Node[] = [];
  const dirs = [
    { dir: getEpicsDir(ctx), prefix: epicPrefix(ctx) },
    { dir: getStoriesDir(ctx), prefix: storyPrefix(ctx) },
  ];
  for (const { dir, prefix } of dirs) {
    if (!existsSync(dir)) {
      continue;
    }
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md") || !f.startsWith(prefix)) {
        continue;
      }
      const file = join(dir, f);
      const content = readFileSync(file, "utf-8");
      const fm = parseMarkdownFrontmatter(content);
      if (!fm) {
        console.warn(`WARN ${f}: no YAML frontmatter`);
        continue;
      }
      const kind = getKind(fm.data);
      if (kind !== "epic" && kind !== "story" && kind !== "task") {
        continue;
      }
      const id = getId(fm.data);
      if (!id) {
        console.warn(`WARN ${f}: missing id (or story_id/epic_id)`);
        continue;
      }
      out.push({ file: f, id, depends_on: getDependsOn(fm.data) });
    }
  }
  return out;
}

/** If A depends_on B, edge B -> A. Cycle iff topological sort cannot consume all nodes. */
function findCycleIds(nodes: Node[]): string[] | null {
  const ids = new Set(nodes.map((n) => n.id));
  const inDegree = new Map<string, number>();
  const unblock = new Map<string, string[]>();

  for (const n of nodes) {
    const internalDeps = n.depends_on.filter((d) => ids.has(d));
    inDegree.set(n.id, internalDeps.length);
  }

  for (const n of nodes) {
    for (const d of n.depends_on) {
      if (!ids.has(d)) {
        continue;
      }
      if (!unblock.has(d)) {
        unblock.set(d, []);
      }
      unblock.get(d)!.push(n.id);
    }
  }

  const queue = nodes.filter((n) => (inDegree.get(n.id) ?? 0) === 0).map((n) => n.id);
  let processed = 0;

  while (queue.length > 0) {
    const u = queue.shift()!;
    processed++;
    for (const v of unblock.get(u) ?? []) {
      const next = (inDegree.get(v) ?? 0) - 1;
      inDegree.set(v, next);
      if (next === 0) {
        queue.push(v);
      }
    }
  }

  if (processed === nodes.length) {
    return null;
  }
  const stuck = nodes.find((n) => (inDegree.get(n.id) ?? 0) > 0);
  return stuck ? [stuck.id, "(cycle in depends_on — see stuck nodes)"] : ["(cycle)"];
}

function lintReadyWithoutTraces(ctx: PlanningContext): string[] {
  const issues: string[] = [];
  const dirs = [
    { dir: getStoriesDir(ctx), prefix: storyPrefix(ctx) },
    { dir: getEpicsDir(ctx), prefix: epicPrefix(ctx) },
  ];
  for (const { dir, prefix } of dirs) {
    if (!existsSync(dir)) {
      continue;
    }
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".md") || !f.startsWith(prefix)) {
        continue;
      }
      const file = join(dir, f);
      const fm = parseMarkdownFrontmatter(readFileSync(file, "utf-8"));
      if (!fm) {
        continue;
      }
      const st = getStatus(fm.data);
      if (st === "ready" && !hasTracesTo(fm.data)) {
        issues.push(`${f}: status ready but traces_to empty`);
      }
    }
  }
  return issues;
}

function lintMissingDependencyTargets(nodes: Node[]): string[] {
  const ids = new Set(nodes.map((n) => n.id));
  const issues: string[] = [];
  for (const n of nodes) {
    for (const d of n.depends_on) {
      if (!ids.has(d)) {
        issues.push(`${n.file}: depends_on unknown id "${d}"`);
      }
    }
  }
  return issues;
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: {
      project: { type: "string" },
      root: { type: "string" },
      config: { type: "string" },
      help: { type: "boolean", short: "h" },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(`
LintPlan — Validate planning markdown

Usage:
  bun run LintPlan.ts --root <dir>
  bun run LintPlan.ts --project <name>
`);
    process.exit(0);
  }

  const ctx = contextFromArgs({
    project: values.project,
    root: values.root,
    config: values.config,
  });

  const nodes = collectNodes(ctx);
  const missing = lintMissingDependencyTargets(nodes);
  for (const m of missing) {
    console.warn(`WARN ${m}`);
  }

  const cycleHint = findCycleIds(nodes);
  if (cycleHint) {
    console.error("ERROR depends_on contains a cycle (topological sort blocked).");
    console.error(`  ${cycleHint.join(" ")}`);
    process.exit(1);
  }

  const traceIssues = lintReadyWithoutTraces(ctx);
  if (traceIssues.length > 0) {
    console.error("ERROR traceability:");
    for (const t of traceIssues) {
      console.error(`  ${t}`);
    }
    process.exit(1);
  }

  console.log(`Lint OK (${nodes.length} work items with ids).`);
}

if (import.meta.main) {
  main();
}
