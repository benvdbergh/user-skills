#!/usr/bin/env bun

/**
 * UpdateSpec.ts - Update and version specifications
 *
 * Usage:
 *   bun run UpdateSpec.ts --spec <path> --update <description>
 */

import { parseArgs } from "util";
import { existsSync, readFileSync, writeFileSync, copyFileSync } from "fs";
import { join, dirname, basename } from "path";
import { $ } from "bun";

function getVersionHistoryDir(specPath: string): string {
  return join(dirname(specPath), ".versions");
}

function getBackupPath(specPath: string): string {
  const historyDir = getVersionHistoryDir(specPath);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const baseName = basename(specPath, ".md");
  return join(historyDir, `${baseName}-${timestamp}.md`);
}

async function createBackup(specPath: string): Promise<string> {
  const historyDir = getVersionHistoryDir(specPath);
  if (!existsSync(historyDir)) await $`mkdir -p ${historyDir}`.quiet();
  const backupPath = getBackupPath(specPath);
  copyFileSync(specPath, backupPath);
  return backupPath;
}

function updateVersion(content: string, updateDescription: string): string {
  const versionMatch = content.match(/\*\*Version:\*\*\s*(\S+)/);
  const currentVersion = versionMatch ? versionMatch[1] : "1.0.0";
  const versionParts = currentVersion.split(".");
  const patch = parseInt(versionParts[2] || "0", 10) + 1;
  const newVersion = `${versionParts[0]}.${versionParts[1]}.${patch}`;
  let updated = content.replace(/\*\*Version:\*\*\s*\S+/, `**Version:** ${newVersion}`);
  if (!updated.includes("## Update History")) {
    updated += `\n\n## Update History\n\n### ${newVersion} - ${new Date().toISOString().split("T")[0]}\n\n${updateDescription}\n`;
  } else {
    const historyMatch = updated.match(/(## Update History\n)/);
    if (historyMatch) {
      const insertPos = historyMatch.index! + historyMatch[0].length;
      updated = updated.substring(0, insertPos) + `\n### ${newVersion} - ${new Date().toISOString().split("T")[0]}\n\n${updateDescription}\n\n` + updated.substring(insertPos);
    }
  }
  return updated;
}

async function updateSpec(options: { spec: string; update: string; createBackup?: boolean }): Promise<void> {
  const { spec, update, createBackup: doBackup = true } = options;
  if (!existsSync(spec)) throw new Error(`Spec file not found: ${spec}`);
  if (doBackup) {
    const backupPath = await createBackup(spec);
    console.log(`✓ Created backup: ${backupPath}`);
  }
  const content = readFileSync(spec, "utf-8");
  const updated = updateVersion(content, update);
  writeFileSync(spec, updated, "utf-8");
  console.log(`✓ Updated: ${spec}`);
  const specDir = dirname(spec);
  if (existsSync(join(specDir, ".git"))) {
    try {
      await $`cd ${specDir} && git add ${spec}`.quiet();
      await $`cd ${specDir} && git commit -m "Update spec: ${update}"`.quiet();
      console.log(`✓ Committed to git`);
    } catch (error) {
      console.warn(`Warning: Could not commit to git: ${error}`);
    }
  }
}

function main(): void {
  const { values } = parseArgs({
    args: Bun.argv.slice(2),
    options: { spec: { type: "string", short: "s" }, update: { type: "string", short: "u" }, "no-backup": { type: "boolean" }, help: { type: "boolean", short: "h" } },
    strict: true,
    allowPositionals: false,
  });
  if (values.help || !values.spec || !values.update) {
    console.log(`UpdateSpec - Update and Version Specifications\nUsage: bun run UpdateSpec.ts --spec <path> --update <description>`);
    process.exit(values.help ? 0 : 1);
  }
  updateSpec({
    spec: values.spec as string,
    update: values.update as string,
    createBackup: !values["no-backup"],
  }).catch((error) => {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  });
}

if (import.meta.main) main();
