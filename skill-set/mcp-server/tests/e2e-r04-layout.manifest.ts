/**
 * R0.4 milestone layout manifest (BUG-R0.4-14 / BEN-75).
 *
 * Checked by `e2e-r04-layout.test.ts` — not the milestone AC gate.
 * Milestone acceptance lives in `e2e-r04.test.ts` (HTTP flows, NFR-012, AC-006–008).
 *
 * Unit/integration gates by area:
 * - MCP tools: `mcp-smoke.test.ts`, `mcp-prompts.test.ts`, `mcp-graph.test.ts`
 * - Schemas: `schema-contract.test.ts`
 * - Security: `security.test.ts`
 * - Validation: `validation.test.ts`
 * - Proposals: `proposals-patch.test.ts`, `proposals-relationship.test.ts`
 * - Agent: `agent-session.test.ts`
 * - Web build: `web-build.test.ts`
 */
export const E2E_R04_LAYOUT_PATHS = [
  "src/prompts/PromptSourceService.ts",
  "src/prompts/SkillReferenceSource.ts",
  "src/prompts/templateSources.ts",
  "src/domain/SkillValidationService.ts",
  "src/domain/ChangeProposalService.ts",
  "src/ai/AgentSessionRunner.ts",
  "src/ai/StubAgentSessionRunner.ts",
  "src/ai/SkillImprovementAdvisor.ts",
  "src/ai/RelationshipSuggestionAdvisor.ts",
  "src/git/GitDiffService.ts",
  "src/http/routes/validation.ts",
  "src/http/routes/proposals.ts",
  "src/http/routes/agentSessions.ts",
  "src/mcp/prompts.ts",
  "src/mcp/skillLabMcpServer.ts",
  "schemas/lint-report.schema.json",
  "schemas/validation-report.schema.json",
  "schemas/patch-proposal.schema.json",
  "schemas/relationship-proposal.schema.json",
  "schemas/agent-session.schema.json",
  "web/src/api/validation.ts",
  "web/src/api/proposals.ts",
  "web/src/api/agent.ts",
  "web/src/components/ValidationScorecard.tsx",
  "web/src/components/PromptActions.tsx",
  "web/src/components/ProposalList.tsx",
  "web/src/components/ProposalWorkbenchBanner.tsx",
  "web/src/lib/proposalRegistry.ts",
  "web/src/lib/sessionOrigin.ts",
  "web/src/components/ProposalDetail.tsx",
  "web/src/components/ProposalDiffViewer.tsx",
  "web/src/components/AgentSessionStrip.tsx",
  "web/src/components/CitationChip.tsx",
  "web/src/components/SettingsAiStrip.tsx",
] as const;
