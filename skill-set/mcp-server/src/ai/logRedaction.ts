const SECRET_PATTERNS: RegExp[] = [
  /(?:ANTHROPIC|OPENAI|GITHUB|AWS|AZURE|LINEAR|SUPABASE|SKILL_LAB)_[A-Z0-9_]*\s*=\s*\S+/gi,
  /\bBearer\s+[A-Za-z0-9._~+/=-]+/gi,
  /\bsk-[A-Za-z0-9]{8,}\b/g,
  /"(?:access_?token|refresh_?token|api_?key|secret|password)"\s*:\s*"[^"]*"/gi,
  /(?:token|apikey|api_key)\s*[:=]\s*['"]?[A-Za-z0-9._~+/=-]{12,}/gi,
];

/** NFR-010: redact credentials and env secrets from agent logs and auth diagnostics. */
export function redactSecrets(text: string): string {
  let out = text;
  for (const pattern of SECRET_PATTERNS) {
    out = out.replace(pattern, (match) => {
      const eq = match.indexOf("=");
      if (eq > 0 && match.includes("=")) {
        return `${match.slice(0, eq + 1)} [REDACTED]`;
      }
      if (/^Bearer\s/i.test(match)) return "Bearer [REDACTED]";
      if (/^sk-/i.test(match)) return "sk-[REDACTED]";
      if (match.startsWith('"')) {
        const key = match.slice(0, match.indexOf(":") + 1);
        return `${key} "[REDACTED]"`;
      }
      const sep = match.search(/[:=]/);
      return sep > 0
        ? `${match.slice(0, sep + 1)} [REDACTED]`
        : "[REDACTED]";
    });
  }
  return out;
}
