/**
 * Git working tree the version-control scripts operate on.
 * Precedence: REPO_ROOT, GIT_WORK_TREE, then a legacy single-tree env alias, then cwd.
 */
export function getRepoRoot(): string {
  const fromEnv =
    process.env.REPO_ROOT?.trim() ||
    process.env.GIT_WORK_TREE?.trim() ||
    process.env.PAI_DIR?.trim();
  if (fromEnv) {
    return fromEnv;
  }
  return process.cwd();
}
