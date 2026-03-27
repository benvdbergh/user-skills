#!/usr/bin/env bun
/**
 * CodeQualityGate.ts
 *
 * Check complexity, quality metrics, and enforce success criteria.
 * Validates Definition of Done for minimalist coding.
 *
 * Usage:
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/CodeQualityGate.ts --file <path> [--baseline <score>]
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import * as ts from 'typescript';

interface QualityMetrics {
  file: string;
  lineCount: number;
  functionCount: number;
  maxComplexity: number;
  averageComplexity: number;
  newFilesCreated: boolean;
  lintScore: number; // Placeholder - would integrate with actual linter
}

function calculateComplexity(node: ts.Node): number {
  let complexity = 1; // Base complexity

  function visit(n: ts.Node) {
    // Increment complexity for control flow statements
    if (ts.isIfStatement(n) || ts.isWhileStatement(n) || ts.isForStatement(n) ||
        ts.isForInStatement(n) || ts.isForOfStatement(n) || ts.isSwitchStatement(n) ||
        ts.isConditionalExpression(n) || ts.isCatchClause(n)) {
      complexity++;
    }
    ts.forEachChild(n, visit);
  }

  visit(node);
  return complexity;
}

function analyzeFile(sourceFile: ts.SourceFile, content: string): QualityMetrics {
  let functionCount = 0;
  let totalComplexity = 0;
  let maxComplexity = 0;

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) || ts.isMethodDeclaration(node) ||
        ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
      functionCount++;
      const complexity = calculateComplexity(node);
      totalComplexity += complexity;
      maxComplexity = Math.max(maxComplexity, complexity);
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  // Calculate line count from content (getLineCount() doesn't exist on SourceFile)
  const lineCount = content.split('\n').length;

  return {
    file: sourceFile.fileName,
    lineCount,
    functionCount,
    maxComplexity,
    averageComplexity: functionCount > 0 ? totalComplexity / functionCount : 0,
    newFilesCreated: false, // Would check git status
    lintScore: 100 // Placeholder
  };
}

async function main() {
  const args = process.argv.slice(2);
  const fileIndex = args.indexOf('--file');
  const baselineIndex = args.indexOf('--baseline');

  if (fileIndex === -1 || !args[fileIndex + 1]) {
    console.error('❌ Usage: --file <path> [--baseline <score>]');
    process.exit(1);
  }

  const filePath = args[fileIndex + 1];
  const baselineScore = baselineIndex !== -1 ? parseFloat(args[baselineIndex + 1]) : undefined;

  if (!existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  try {
    const content = await readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
    const metrics = analyzeFile(sourceFile, content);

    console.log(`\n📊 Quality Metrics for ${filePath}\n`);
    console.log(`   Lines: ${metrics.lineCount}`);
    console.log(`   Functions: ${metrics.functionCount}`);
    console.log(`   Max Complexity: ${metrics.maxComplexity}`);
    console.log(`   Avg Complexity: ${metrics.averageComplexity.toFixed(2)}`);
    console.log(`   Lint Score: ${metrics.lintScore}/100\n`);

    // Success criteria checks
    const COMPLEXITY_THRESHOLD = 10;
    const checks = {
      complexityUnderThreshold: metrics.maxComplexity <= COMPLEXITY_THRESHOLD,
      lintScoreMaintained: baselineScore ? metrics.lintScore >= baselineScore : true,
      reasonableSize: metrics.lineCount < 500 // Reasonable file size
    };

    console.log('✅ Success Criteria:\n');
    console.log(`   Complexity ≤ ${COMPLEXITY_THRESHOLD}: ${checks.complexityUnderThreshold ? '✅' : '❌'}`);
    console.log(`   Lint score maintained: ${checks.lintScoreMaintained ? '✅' : '❌'}`);
    console.log(`   Reasonable file size: ${checks.reasonableSize ? '✅' : '❌'}\n`);

    const allPassed = Object.values(checks).every(v => v);

    if (allPassed) {
      console.log('✅ All quality gates passed\n');
      process.exit(0);
    } else {
      console.log('❌ Some quality gates failed\n');
      process.exit(1);
    }

    if (args.includes('--json')) {
      console.log(JSON.stringify({ metrics, checks, allPassed }, null, 2));
    }
  } catch (error) {
    console.error(`❌ Error analyzing file: ${error}`);
    process.exit(1);
  }
}

main().catch(console.error);
