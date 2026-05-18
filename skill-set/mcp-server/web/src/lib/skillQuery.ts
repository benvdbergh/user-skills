/** `?skill=` value: `{environmentId}/{skillName}` (skill name may contain `/`). */
export function formatSkillQuery(
  environmentId: string,
  skillName: string,
): string {
  return `${environmentId}/${skillName}`;
}

export function parseSkillQuery(
  value: string,
): { environmentId: string; skillName: string } | null {
  const slash = value.indexOf("/");
  if (slash <= 0) return null;
  const environmentId = value.slice(0, slash);
  const skillName = value.slice(slash + 1);
  if (!environmentId || !skillName) return null;
  return { environmentId, skillName };
}
