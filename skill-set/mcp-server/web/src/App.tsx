import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { CatalogPage } from "./routes/CatalogPage";
import { GraphPage } from "./routes/GraphPage";
import { HealthPage } from "./routes/HealthPage";
import { ProposalsPage } from "./routes/ProposalsPage";
import { SkillDetailPage } from "./routes/SkillDetailPage";

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route
          path="/skills/:environmentId/:skillName"
          element={<SkillDetailPage />}
        />
        <Route path="/graph" element={<GraphPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/proposals" element={<ProposalsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
