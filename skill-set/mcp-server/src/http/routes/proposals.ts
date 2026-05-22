import type { Hono } from "hono";
import { z } from "zod";
import type { RelationshipSuggestionAdvisor } from "../../ai/RelationshipSuggestionAdvisor.js";
import type { SkillImprovementAdvisor } from "../../ai/SkillImprovementAdvisor.js";
import type { ChangeProposalService } from "../../domain/ChangeProposalService.js";
import type { SkillCatalogService } from "../../domain/SkillCatalogService.js";
import { ProposalValidationError } from "../../domain/proposalValidation.js";
import {
  PatchProposalSchema,
  ProposeSkillPatchInputSchema,
  RelationshipProposalSchema,
  StoredProposalSchema,
  SuggestedEdgeInputSchema,
  TriggerConflictReportSchema,
} from "../../domain/types.js";
import type { GitDiffService } from "../../git/GitDiffService.js";
import { formatZodError } from "../queryParams.js";
import { notFoundProblem, validationProblem } from "../problemDetails.js";

export interface ProposalRouteDeps {
  catalog: SkillCatalogService;
  proposals: ChangeProposalService;
  relationshipAdvisor: RelationshipSuggestionAdvisor;
  skillAdvisor: SkillImprovementAdvisor;
  gitDiff: GitDiffService;
}

const PostRelationshipsBodySchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("suggest-edges"),
    environmentId: z.string(),
    skillName: z.string().optional(),
    sessionId: z.string().optional(),
    edges: z.array(SuggestedEdgeInputSchema).optional(),
  }),
  z.object({
    action: z.literal("detect-conflicts"),
    environmentId: z.string().optional(),
    sessionId: z.string().optional(),
  }),
]);

function isNotFoundError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("not found");
}

export function registerProposalRoutes(
  app: Hono,
  deps: ProposalRouteDeps,
): void {
  const { catalog, proposals, relationshipAdvisor, skillAdvisor, gitDiff } =
    deps;

  app.post("/api/proposals/skill-patch", async (c) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return validationProblem(c, "Request body must be JSON", c.req.path);
    }
    const parsed = ProposeSkillPatchInputSchema.safeParse(body);
    if (!parsed.success) {
      return validationProblem(c, formatZodError(parsed.error), c.req.path);
    }
    try {
      const proposal = PatchProposalSchema.parse(
        skillAdvisor.proposePatch(parsed.data),
      );
      return c.json({ proposal }, 201);
    } catch (err) {
      if (err instanceof ProposalValidationError) {
        return validationProblem(c, err.message, c.req.path);
      }
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      throw err;
    }
  });

  app.get("/api/git/diff", (c) => {
    const patchToken = c.req.query("patchToken");
    if (!patchToken) {
      return validationProblem(
        c,
        "Query parameter patchToken is required",
        c.req.path,
      );
    }
    try {
      const preview = gitDiff.previewPatch(patchToken);
      return c.json({ diff: preview });
    } catch (err) {
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      throw err;
    }
  });

  app.post("/api/proposals/relationships", async (c) => {
    let body: z.infer<typeof PostRelationshipsBodySchema>;
    try {
      const raw = await c.req.json();
      const parsed = PostRelationshipsBodySchema.safeParse(raw);
      if (!parsed.success) {
        return validationProblem(c, formatZodError(parsed.error), c.req.path);
      }
      body = parsed.data;
    } catch {
      return validationProblem(c, "Invalid JSON body", c.req.path);
    }

    try {
      if (body.action === "detect-conflicts") {
        const skills = catalog.listSkills({
          environmentId: body.environmentId,
        });
        const conflicts = relationshipAdvisor.detectTriggerConflicts({
          environmentId: body.environmentId,
        });
        const report = proposals.ingestTriggerConflicts({
          environmentId: body.environmentId,
          sessionId: body.sessionId,
          conflicts,
          scannedSkillCount: skills.length,
        });
        return c.json({
          report: TriggerConflictReportSchema.parse(report),
        });
      }

      const edgeInputs =
        body.edges ??
        (body.skillName
          ? relationshipAdvisor.draftEdgesForSkill(body.skillName)
          : []);
      const { accepted, rejected } = relationshipAdvisor.validateEdges(
        edgeInputs,
      );
      if (accepted.length === 0) {
        return validationProblem(
          c,
          rejected[0]?.reason ??
            "No valid edges; evidence.quote and evidence.sourceFile are required",
          c.req.path,
        );
      }
      const proposal = proposals.ingestRelationship({
        environmentId: body.environmentId,
        skillName: body.skillName,
        sessionId: body.sessionId,
        edges: accepted,
        rejectedEdges: rejected.length > 0 ? rejected : undefined,
      });
      return c.json({
        proposal: RelationshipProposalSchema.parse(proposal),
        rejectedCount: rejected.length,
      });
    } catch (err) {
      if (isNotFoundError(err)) {
        return notFoundProblem(
          c,
          err instanceof Error ? err.message : "Not found",
          c.req.path,
        );
      }
      throw err;
    }
  });

  app.get("/api/proposals", (c) => {
    const tokens = proposals.listProposalTokens();
    return c.json({ tokens });
  });

  app.get("/api/proposals/:patchToken", (c) => {
    const { patchToken } = c.req.param();
    const stored = proposals.getStored(patchToken);
    if (!stored) {
      return notFoundProblem(
        c,
        `Proposal not found: ${patchToken}`,
        c.req.path,
      );
    }
    return c.json(StoredProposalSchema.parse(stored));
  });
}
