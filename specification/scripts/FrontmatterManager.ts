#!/usr/bin/env bun

/**
 * FrontmatterManager.ts - Manage YAML frontmatter in Knowledge documents
 *
 * Usage:
 *   bun run FrontmatterManager.ts --action <read|write|validate|migrate> --file <path> [options]
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";

interface FrontmatterData {
  [key: string]: any;
}

function parseDocument(filePath: string): { frontmatter: FrontmatterData; body: string } {
  if (!existsSync(filePath)) throw new Error(`File not found: ${filePath}`);
  const content = readFileSync(filePath, "utf-8");
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (match) {
    return { frontmatter: parseYaml(match[1]) as FrontmatterData, body: match[2] };
  }
  return { frontmatter: {}, body: content };
}

function writeDocument(filePath: string, frontmatter: FrontmatterData, body: string): void {
  const frontmatterYaml = stringifyYaml(frontmatter, { lineWidth: 0, sortKeys: false });
  writeFileSync(filePath, `---\n${frontmatterYaml}---\n\n${body}`, "utf-8");
}

function migrateFromOldFormat(filePath: string): { frontmatter: FrontmatterData; body: string } {
  const content = readFileSync(filePath, "utf-8");
  const frontmatter: FrontmatterData = {};
  let body = content;
  const titleMatch = content.match(/^#\s+(.+)/);
  if (titleMatch) frontmatter.title = titleMatch[1].trim();
  const oldPattern = /\*\*(\w+):\*\*\s*(.+?)(?=\n\*\*|\n##|$)/g;
  let match;
  while ((match = oldPattern.exec(content)) !== null) {
    const key = match[1].toLowerCase().replace(/\s+/g, "_");
    let value: any = match[2].trim();
    if (value === "true" || value === "false") value = value === "true";
    else if (!isNaN(Number(value)) && value !== "") value = Number(value);
    frontmatter[key] = value;
    body = body.replace(match[0], "");
  }
  body = body.replace(/^\s*\n+/gm, "\n").trim();
  return { frontmatter, body };
}

function validateFrontmatter(filePath: string, template?: string): { valid: boolean; errors: string[] } {
  const { frontmatter } = parseDocument(filePath);
  const errors: string[] = [];
  const strategyPath = join(dirname(__dirname), "references", "FrontmatterStrategy.yaml");
  if (!existsSync(strategyPath)) return { valid: true, errors: [] };
  const strategy = parseYaml(readFileSync(strategyPath, "utf-8")) as any;
  const commonRequired = strategy.common?.required || [];
  for (const field of commonRequired) {
    if (!frontmatter[field]) errors.push(`Missing required field: ${field}`);
  }
  if (template && strategy.templates?.[template]) {
    const templateRequired = strategy.templates[template].required || [];
    for (const field of templateRequired) {
      if (!frontmatter[field]) errors.push(`Missing template-required field (${template}): ${field}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: { action: { type: "string" }, file: { type: "string", short: "f" }, key: { type: "string" }, value: { type: "string" }, template: { type: "string" }, help: { type: "boolean", short: "h" } },
    strict: true,
    allowPositionals: false,
  });
  if (values.help || !values.action || !values.file) {
    console.log("FrontmatterManager - Manage YAML Frontmatter\nUsage: bun run FrontmatterManager.ts --action <read|migrate|update|validate> --file <path>");
    process.exit(values.help ? 0 : 1);
  }
  const action = values.action as string;
  const filePath = values.file as string;
  try {
    if (action === "read") {
      console.log(JSON.stringify(parseDocument(filePath).frontmatter, null, 2));
    } else if (action === "migrate") {
      const { frontmatter, body } = migrateFromOldFormat(filePath);
      writeDocument(filePath, frontmatter, body);
      console.log(`✓ Migrated ${filePath} to YAML frontmatter`);
    } else if (action === "update") {
      if (!values.key || !values.value) {
        console.error("--key and --value required for update action");
        process.exit(1);
      }
      const { frontmatter, body } = parseDocument(filePath);
      const updated = { ...frontmatter, [values.key as string]: values.value, updated: new Date().toISOString().split("T")[0] };
      writeDocument(filePath, updated, body);
      console.log(`✓ Updated ${values.key} in ${filePath}`);
    } else if (action === "validate") {
      const result = validateFrontmatter(filePath, values.template as string | undefined);
      if (result.valid) console.log("✓ Frontmatter is valid");
      else {
        console.error("❌ Frontmatter validation failed:");
        result.errors.forEach((e) => console.error(`  - ${e}`));
        process.exit(1);
      }
    } else {
      console.error(`Unknown action: ${action}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

if (import.meta.main) main();
