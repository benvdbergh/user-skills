# Workflow: FeatureReleaseSequencing

## Trigger

"What feature should be next and in which release?"

## Steps

1. Gather candidate features and enabling work.
2. Choose scoring model by scale:
   - RICE for product-level bets.
   - WSJF for cross-team/program prioritization.
3. Score each item and record confidence level.
4. Apply dependency and runway constraints:
   - must-have enablers
   - compliance/security/platform prerequisites
5. Build release slices:
   - committed (high confidence)
   - forecast (medium confidence)
   - option queue (low confidence)
6. Generate recommendation with:
   - chosen release
   - rationale
   - risk and fallback

## Done Criteria

- Sequencing rationale is transparent and reproducible.
- Dependencies and enablers are represented in release slices.
- Recommended release placement includes confidence.
