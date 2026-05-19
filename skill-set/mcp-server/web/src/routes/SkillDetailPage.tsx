import { useParams, useSearchParams } from "react-router-dom";
import { SkillDetailPanel } from "../components/SkillDetailPanel";

export function SkillDetailPage() {
  const { environmentId, skillName } = useParams<{
    environmentId: string;
    skillName: string;
  }>();
  const [searchParams] = useSearchParams();
  const catalogSearch = searchParams.toString();

  if (!environmentId || !skillName) {
    return (
      <section className="sl-skill-detail-route">
        <p className="sl-detail-error" role="alert">
          Missing environment or skill name in URL.
        </p>
      </section>
    );
  }

  return (
    <SkillDetailPanel
      mode="fullscreen"
      environmentId={environmentId}
      skillName={skillName}
      catalogSearch={catalogSearch}
    />
  );
}
