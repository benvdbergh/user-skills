#!/usr/bin/env bun

/**
 * ScanSources.ts — List markdown sources from manifest source_globs.
 */

import { parseArgs } from "util";
import { readFileSync, existsSync } from "fs";
import { relative } from "path";
import { contextFromArgs } from "./lib/cliShared";
import { expandSourceGlobs } from "./lib/globUtils";

function firstHeading(md: string): string | undefined {
  const m = md.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : undefined;
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
ScanSources — Print markdown paths from source_globs

Usage:
  bun run ScanSources.ts --root <dir>
  bun run ScanSources.ts --project <name>
  bun run ScanSources.ts --config <manifest.yaml>
`);
    process.exit(0);
  }

  const ctx = contextFromArgs({
    project: values.project,
    root: values.root,
    config: values.config,
  });

  const globs = ctx.manifest.source_globs?.length
    ? ctx.manifest.source_globs
    : ["PRD.md"];

  const paths = expandSourceGlobs(ctx.projectRoot, globs);
  console.log(`Project root: ${ctx.projectRoot}`);
  console.log(`Globs: ${globs.join(", ")}`);
  console.log("");
  console.log("| Path | Title |");
  console.log("|------|-------|");
  for (const abs of paths) {
    if (!existsSync(abs)) {
      continue;
    }
    let title = "";
    try {
      const raw = readFileSync(abs, "utf-8");
      title = firstHeading(raw) ?? "";
    } catch {
      title = "(unreadable)";
    }
    console.log(`| ${relative(ctx.projectRoot, abs)} | ${title.replace(/\|/g, "\\|")} |`);
  }
  console.log(`\n${paths.length} file(s)`);
}

if (import.meta.main) {
  main();
}
