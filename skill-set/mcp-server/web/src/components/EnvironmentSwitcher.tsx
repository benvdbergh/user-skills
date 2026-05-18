import { useEnvironment } from "../context/EnvironmentContext";
import "./EnvironmentSwitcher.css";

export function EnvironmentSwitcher() {
  const { environments, environmentId, setEnvironmentId, loading, error } =
    useEnvironment();

  return (
    <label className="env-switcher">
      <span className="env-switcher-label">Environment</span>
      <select
        className="env-switcher-select"
        value={environmentId}
        disabled={loading || Boolean(error)}
        onChange={(e) => setEnvironmentId(e.target.value)}
        aria-label="Select skill environment"
      >
        <option value="">All environments</option>
        {environments.map((env) => (
          <option key={env.id} value={env.id}>
            {env.displayName ?? env.id}
            {!env.pathResolvable ? " (unreachable)" : ""}
          </option>
        ))}
      </select>
    </label>
  );
}
