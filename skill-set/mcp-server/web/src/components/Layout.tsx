import { useEffect, useRef, type ReactNode } from "react";
import { useNavHealth } from "../context/NavHealthContext";
import {
  DetailPanelSlotProvider,
  useDetailPanelSlot,
} from "../context/DetailPanelSlotContext";
import { SkillDetailPanel } from "./SkillDetailPanel";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { ShellIcon } from "./ShellIcon";

function DetailPanelNotFound({
  skillName,
  onClose,
}: {
  skillName: string;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [skillName]);

  return (
    <aside
      className="sl-detail sl-detail-panel"
      aria-label="Skill not found"
    >
      <header className="sl-detail-header">
        <h2 id="detail-heading">Skill not found</h2>
        <p className="sl-detail-desc">
          <code>{skillName}</code> is not in the current catalog view. Clear
          filters or pick another environment.
        </p>
        <div className="sl-detail-actions">
          <button
            ref={closeRef}
            type="button"
            className="sl-icon-btn"
            onClick={onClose}
            aria-label="Close skill detail"
          >
            <ShellIcon name="close" size={16} />
          </button>
        </div>
      </header>
    </aside>
  );
}

function MainWithDetailPanel({ children }: { children: ReactNode }) {
  const { config, closePanel } = useDetailPanelSlot();
  const panelOpen = Boolean(config);

  return (
    <main
      className={`sl-main${panelOpen ? " detail-open" : ""}`}
      id="main-content"
      tabIndex={-1}
    >
      <div className="sl-page">{children}</div>
      {config?.notFound ? (
        <DetailPanelNotFound
          skillName={`${config.environmentId}/${config.skillName}`}
          onClose={closePanel}
        />
      ) : config ? (
        <SkillDetailPanel
          mode="panel"
          environmentId={config.environmentId}
          skillName={config.skillName}
          catalogSearch={config.catalogSearch}
          scope={config.scope}
          description={config.description}
          sourcePath={config.sourcePath}
          health={config.health}
          onClose={closePanel}
        />
      ) : null}
    </main>
  );
}

function LayoutShell({ children }: { children: ReactNode }) {
  const { counts } = useNavHealth();

  return (
    <div className="sl-shell">
      <Sidebar healthCounts={counts} />
      <div className="sl-workspace">
        <TopBar />
        <MainWithDetailPanel>{children}</MainWithDetailPanel>
      </div>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <DetailPanelSlotProvider>
      <LayoutShell>{children}</LayoutShell>
    </DetailPanelSlotProvider>
  );
}
