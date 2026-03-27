#!/usr/bin/env bun
/**
 * GetDependencies.ts
 *
 * Find all call sites of a specific function/class.
 * Helps determine if editing a function is safe.
 *
 * Usage:
 *   bun run $PAI_DIR/skills/MinimalistCoding/Tools/GetDependencies.ts --symbol <name> --file <path>
 */

import { readdir, readFile } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { existsSync } from 'fs';
import * as ts from 'typescript';

interface CallSite {
  file: string;
  line: number;
  context: string;
  callType: 'direct' | 'method' | 'property';
}

interface DependencyResult {
  symbol: string;
  definition: {
    file: string;
    line: number;
    signature: string;
  };
  callers: CallSite[];
}

async function findTypeScriptFiles(dir: string, fileList: string[] = []): Promise<string[]> {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = join(dir, file.name);
    
    if (file.name.startsWith('.') || file.name === 'node_modules' || file.name === 'dist' || file.name === 'build') {
      continue;
    }
    
    if (file.isDirectory()) {
      await findTypeScriptFiles(filePath, fileList);
    } else if (extname(file.name) === '.ts' || extname(file.name) === '.tsx') {
      fileList.push(filePath);
    }
  }
  
  return fileList;
}

function findCallSites(sourceFile: ts.SourceFile, symbolName: string, definitionFile: string): CallSite[] {
  const callSites: CallSite[] = [];

  function visit(node: ts.Node) {
    // Check for call expressions
    if (ts.isCallExpression(node)) {
      const expression = node.expression;
      let calledName: string | null = null;

      if (ts.isIdentifier(expression)) {
        calledName = expression.text;
      } else if (ts.isPropertyAccessExpression(expression)) {
        calledName = expression.name.text;
      }

      if (calledName && calledName.toLowerCase() === symbolName.toLowerCase()) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const context = node.getText().substring(0, 100);
        callSites.push({
          file: sourceFile.fileName,
          line,
          context,
          callType: ts.isPropertyAccessExpression(expression) ? 'method' : 'direct'
        });
      }
    }

    // Check for property access (e.g., obj.symbolName)
    if (ts.isPropertyAccessExpression(node)) {
      if (node.name.text.toLowerCase() === symbolName.toLowerCase()) {
        const line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        const context = node.getText().substring(0, 100);
        callSites.push({
          file: sourceFile.fileName,
          line,
          context,
          callType: 'property'
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return callSites;
}

function findSymbolDefinition(sourceFile: ts.SourceFile, symbolName: string): { line: number; signature: string } | null {
  let definition: { line: number; signature: string } | null = null;

  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name && node.name.text === symbolName) {
      const signature = node.name.text + '(' + node.parameters.map(p => p.getText()).join(', ') + ')';
      definition = {
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        signature
      };
      return;
    }

    if (ts.isClassDeclaration(node) && node.name && node.name.text === symbolName) {
      definition = {
        line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1,
        signature: node.name.text
      };
      return;
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return definition;
}

async function main() {
  const args = process.argv.slice(2);
  const symbolIndex = args.indexOf('--symbol');
  const fileIndex = args.indexOf('--file');
  const dirIndex = args.indexOf('--dir');

  if (symbolIndex === -1 || !args[symbolIndex + 1]) {
    console.error('❌ Usage: --symbol <name> --file <path> [--dir <search-directory>]');
    process.exit(1);
  }

  const symbolName = args[symbolIndex + 1];
  const definitionFile = fileIndex !== -1 ? args[fileIndex + 1] : undefined;
  const searchDir = dirIndex !== -1 ? args[dirIndex + 1] : (definitionFile ? dirname(definitionFile) : process.cwd());

  if (!existsSync(searchDir)) {
    console.error(`❌ Directory not found: ${searchDir}`);
    process.exit(1);
  }

  console.log(`🔍 Finding call sites for "${symbolName}"...\n`);

  const tsFiles = await findTypeScriptFiles(searchDir);
  const allCallSites: CallSite[] = [];
  let definition: { file: string; line: number; signature: string } | null = null;

  // Find definition first
  if (definitionFile && existsSync(definitionFile)) {
    const content = await readFile(definitionFile, 'utf-8');
    const sourceFile = ts.createSourceFile(definitionFile, content, ts.ScriptTarget.Latest, true);
    const def = findSymbolDefinition(sourceFile, symbolName);
    if (def) {
      definition = { file: definitionFile, ...def };
    }
  }

  // Find all call sites
  for (const filePath of tsFiles) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);
      const callSites = findCallSites(sourceFile, symbolName, definitionFile || '');
      allCallSites.push(...callSites);
    } catch (error) {
      continue;
    }
  }

  const result: DependencyResult = {
    symbol: symbolName,
    definition: definition || { file: 'unknown', line: 0, signature: 'unknown' },
    callers: allCallSites
  };

  if (allCallSites.length === 0) {
    console.log(`⚠️  No call sites found for "${symbolName}"`);
    if (definition) {
      console.log(`\n📍 Definition: ${definition.file}:${definition.line}`);
      console.log(`   ${definition.signature}`);
    }
  } else {
    console.log(`✅ Found ${allCallSites.length} call site(s):\n`);
    if (definition) {
      console.log(`📍 Definition: ${definition.file}:${definition.line}`);
      console.log(`   ${definition.signature}\n`);
    }
    for (const caller of allCallSites) {
      console.log(`   ${caller.file}:${caller.line} (${caller.callType})`);
      console.log(`   ${caller.context.substring(0, 80)}...\n`);
    }
  }

  if (args.includes('--json')) {
    console.log(JSON.stringify(result, null, 2));
  }
}

main().catch(console.error);
