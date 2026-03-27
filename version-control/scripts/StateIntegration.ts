#!/usr/bin/env bun

/**
 * StateIntegration.ts - Helper for updating StateManagement when version control operations occur
 * 
 * This module integrates VersionControl with StateManagement skill to automatically
 * track version control operations in the project's state.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { $ } from 'bun';

const PAI_DIR = process.env.PAI_DIR || '/home/ben/.claude';
const KNOWLEDGE_DIR = process.env.KNOWLEDGE_DIR || '/home/ben/Knowledge';
const PROJECTS_DIR = join(KNOWLEDGE_DIR, 'Projects');

/**
 * Detect the current project from workspace or git context
 */
function detectProject(): string | null {
  // Try to get from environment
  const workspacePath = process.env.CURSOR_WORKSPACE || process.env.CWD || process.cwd();
  
  // Check if we're in a project directory
  if (workspacePath.startsWith(PROJECTS_DIR)) {
    const relativePath = workspacePath.substring(PROJECTS_DIR.length + 1);
    const projectName = relativePath.split('/')[0];
    if (projectName && existsSync(join(PROJECTS_DIR, projectName))) {
      return projectName;
    }
  }
  
  // Try to detect from git remote or other indicators
  // For now, return null if we can't detect
  return null;
}

/**
 * Update state with version control operation
 */
export async function updateStateForVCOperation(
  operation: 'commit' | 'checkpoint' | 'branch_create' | 'branch_switch' | 'revert' | 'initialize',
  details: {
    commitHash?: string;
    commitMessage?: string;
    branchName?: string;
    checkpointName?: string;
    revertedTo?: string;
    filesChanged?: string[];
  }
): Promise<void> {
  const project = detectProject();
  
  if (!project) {
    // No project detected - skip state update
    return;
  }

  const stateDir = join(PROJECTS_DIR, project, '.state');
  if (!existsSync(stateDir)) {
    // State not initialized for this project - skip
    return;
  }

  try {
    // Build state update data
    const timestamp = new Date().toISOString();
    let stateData: any = {
      timestamp,
      operation,
    };

    switch (operation) {
      case 'commit':
        stateData = {
          ...stateData,
          commit_hash: details.commitHash,
          commit_message: details.commitMessage,
          files_changed: details.filesChanged || [],
        };
        break;
      
      case 'checkpoint':
        stateData = {
          ...stateData,
          checkpoint_name: details.checkpointName,
          commit_hash: details.commitHash,
          message: details.commitMessage,
        };
        break;
      
      case 'branch_create':
        stateData = {
          ...stateData,
          branch_name: details.branchName,
        };
        break;
      
      case 'branch_switch':
        stateData = {
          ...stateData,
          branch_name: details.branchName,
        };
        break;
      
      case 'revert':
        stateData = {
          ...stateData,
          reverted_to: details.revertedTo,
          commit_hash: details.commitHash,
        };
        break;
      
      case 'initialize':
        stateData = {
          ...stateData,
          initialized: true,
        };
        break;
    }

    // Call StateManager to update state
    const stateManagerPath = join(PAI_DIR, 'skills', 'StateManagement', 'Tools', 'StateManager.ts');
    
    if (!existsSync(stateManagerPath)) {
      // StateManagement skill not available - skip
      return;
    }

    // Update state using StateManager
    const dataJson = JSON.stringify(stateData);
    await $`bun run ${stateManagerPath} --project ${project} --action update --data ${dataJson}`.quiet();
    
  } catch (error) {
    // Silently fail - state update is optional
    // Don't break version control operations if state update fails
    console.error(`[StateIntegration] Failed to update state: ${error}`);
  }
}

/**
 * Get current commit hash
 */
export async function getCurrentCommitHash(): Promise<string | null> {
  try {
    const hash = await $`cd ${PAI_DIR} && git rev-parse --short HEAD`.text();
    return hash.trim() || null;
  } catch {
    return null;
  }
}

/**
 * Get current branch name
 */
export async function getCurrentBranchName(): Promise<string | null> {
  try {
    const branch = await $`cd ${PAI_DIR} && git branch --show-current`.text();
    return branch.trim() || null;
  } catch {
    return null;
  }
}
