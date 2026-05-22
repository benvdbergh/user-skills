import { apiFetch } from "./client";

export interface PatchDiffPreview {
  patchToken: string;
  environmentId: string;
  skillName: string;
  unifiedDiff: string;
}

export async function fetchPatchDiff(
  patchToken: string,
): Promise<PatchDiffPreview> {
  const params = new URLSearchParams({ patchToken });
  return apiFetch<PatchDiffPreview>(`/api/git/diff?${params}`);
}
