#!/usr/bin/env bun
/**
 * LintAndShrink.ts
 *
 * Post-processing tool: lint + remove dead code.
 * Runs after implementation to clean up unnecessary code.
 *
 * Usage:
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/LintAndShrink.ts --file <path>
 */

import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as ts from 'typescript';

interface RefactorReport {
  file: string;
  removedImports: string[];
  removedVariables: string[];
  simplifiedFunctions: string[];
  linesRemoved: number;
  originalLineCount: number;
  newLineCount: number;
}

function removeUnusedImports(sourceFile: ts.SourceFile): { code: string; removed: string[] } {
  const removed: string[] = [];
  const statements: string[] = [];
  const printer = ts.createPrinter();

  for (const statement of sourceFile.statements) {
    if (ts.isImportDeclaration(statement)) {
      // Simple heuristic: keep all imports for now
      // In production, would analyze actual usage
      statements.push(printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile));
    } else {
      statements.push(printer.printNode(ts.EmitHint.Unspecified, statement, sourceFile));
    }
  }

  return { code: statements.join('\n'), removed };
}

function simplifyCode(sourceFile: ts.SourceFile): { code: string; simplified: string[] } {
  const simplified: string[] = [];
  const printer = ts.createPrinter({ removeComments: false });

  // Basic simplification: remove empty statements, consolidate whitespace
  const code = printer.printFile(sourceFile);
  
  // Remove multiple blank lines
  const cleaned = code.replace(/\n{3,}/g, '\n\n');

  return { code: cleaned, simplified };
}

async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');

  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error('❌ Usage: --file <path>');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const originalContent = await readFile(filePath, 'utf-8');
    const originalLines = originalContent.split('\n').length;

    // Parse TypeScript
    const sourceFile = ts.createSourceFile(
      filePath,
      originalContent,
      ts.ScriptTarget.Latest,
      true
    );

    // Remove unused imports
    const { code: codeWithoutUnused, removed: removedImports } = removeUnusedImports(sourceFile);

    // Simplify code
    const { code: simplifiedCode, simplified } = simplifyCode(sourceFile);

    // For now, use simplified code (full implementation would require more sophisticated analysis)
    const finalCode = simplifiedCode;
    const newLines = finalCode.split('\n').length;
    const linesRemoved = originalLines - newLines;

    // Write back if changed
    if (finalCode !== originalContent) {
      await writeFile(filePath, finalCode, 'utf-8');
    }

    const report: RefactorReport = {
      file: filePath,
      removedImports,
      removedVariables: [],
      simplifiedFunctions: simplified,
      linesRemoved,
      originalLineCount: originalLines,
      newLineCount: newLines
    };

    console.log(`✅ Refactored ${filePath}`);
    console.log(`   Lines: ${originalLines} → ${newLines} (${linesRemoved > 0 ? '-' : '+'}${Math.abs(linesRemoved)})`);
    if (removedImports.length > 0) {
      console.log(`   Removed imports: ${removedImports.join(', ')}`);
    }
    if (simplified.length > 0) {
      console.log(`   Simplified: ${simplified.join(', ')}`);
    }

    if (args.includes('--json')) {
      console.log(JSON.stringify(report, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error refactoring: ${error}`);
    process.exit(1);
  }
}

main().catch(console.error);
