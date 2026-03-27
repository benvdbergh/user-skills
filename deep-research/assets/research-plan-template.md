# Research Plan

**Query:** {{original_query}}
**Estimated Duration:** {{estimated_duration}}
**Complexity:** {{complexity}}

---

## Core Research Question

{{core_question}}

---

## Research Branches

{{#each branches}}

### Branch {{this.id}}: {{this.title}}

- **Classification:** {{this.classification}}
- **Sub-Question:** {{this.sub_question}}
- **Dependencies:** {{this.dependencies}}
- **Initial Search Queries:**
{{#each this.queries}}
  - {{this}}
{{/each}}
- **Success Criteria:**
{{#each this.success_criteria}}
  - {{this}}
{{/each}}

{{/each}}

---

## Execution Plan

### Parallel Group 1

{{#each parallel_group_1}}
- Branch {{this.id}}: {{this.title}}
{{/each}}

### Parallel Group 2 (if needed)

{{#each parallel_group_2}}
- Branch {{this.id}}: {{this.title}}
{{/each}}

### Sequential (dependent branches)

{{#each sequential_branches}}
- Branch {{this.id}}: {{this.title}} — depends on Branch {{this.depends_on}}
{{/each}}

---

## Expected Deliverables

{{#each deliverables}}
- {{this}}
{{/each}}

---

**Approve this plan to begin research, or request modifications.**
