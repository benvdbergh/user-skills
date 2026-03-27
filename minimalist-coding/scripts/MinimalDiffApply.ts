#!/usr/bin/env bun
/**
 * MinimalDiffApply.ts
 *
 * Apply specific line changes to a file (like git apply).
 * Prevents full file rewrites, enforces minimal edits.
 *
 * Usage:
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/MinimalDiffApply.ts --file <path> --start <line> --end <line> --content <text>
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';

async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  const startIndex = args.indexOf('--start');
  const endIndex = args.indexOf('--end');
  const contentIndex = args.indexOf('--content');

  if (fileIndex === -1 || startIndex === -1 || endIndex === -1 || contentIndex === -1) {
    console.error('❌ Usage: --file <path> --start <line> --end <line> --content <text>');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];
  const startLine = parseInt(args[startIndex + 1], 10);
  const endLine = parseInt(args[endIndex + 1], 10);
  const newContent = args[contentIndex + 1];

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  if (isNaN(startLine) || isNaN(endLine) || startLine < 1 || endLine < startLine) {
    console.error('❌ Invalid line numbers');
    process.exit(1);
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const lines = content.split('\n');

    // Validate line numbers
    if (startLine > lines.length || endLine > lines.length) {
      console.error(`❌ Line numbers out of range (file has ${lines.length} lines)`);
      process.exit(1);
    }

    // Apply diff: replace lines [startLine-1, endLine) with new content
    const before = lines.slice(0, startLine - 1);
    const after = lines.slice(endLine);
    const newLines = newContent.split('\n');

    const updatedContent = [...before, ...newLines, ...after].join('\n');

    await writeFile(filePath, updatedContent, 'utf-8');

    console.log(`✅ Applied diff to ${filePath}`);
    console.log(`   Lines ${startLine}-${endLine} replaced`);
    console.log(`   Old: ${endLine - startLine + 1} lines`);
    console.log(`   New: ${newLines.length} lines`);
  } catch (error) {
    console.error(`❌ Error applying diff: ${error}`);
    process.exit(1);
  }
}

main().catch(console.error);
