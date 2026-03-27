# **The Architecture of Autonomous Expertise: A Comprehensive Framework for the SkillSet Lifecycle and Global Management System**

The emergence of the Agent Skills open standard marks a transformative juncture in the development of autonomous systems, moving from stateless, general-purpose large language models toward persistent, specialized agents capable of executing complex, multi-step workflows with deterministic reliability. By modularizing procedural knowledge into a portable, standardized format, developers can now inject domain-specific expertise into AI assistants without the token overhead or degradation of focus associated with monolithic system prompts. 

This report establishes a technical blueprint for "SkillSet," a meta-skill designed to automate the lifecycle of these capabilities—spanning creation from session logs, iterative optimization, sandbox testing, and validation—while providing a robust framework for local and global management across disparate projects.

## **The Structural Ontology of Agent Skills**

To architect a management framework like SkillSet, one must first understand the fundamental requirements of the Agent Skills standard. A skill is defined as a directory containing a hierarchy of instructional layers and executable resources. This structure is designed to facilitate "Progressive Disclosure," a mechanism where the agent only loads the minimum amount of data required for any given state, thereby preserving the attention capacity of the underlying model.

| Component | Status | Technical Role |
| :---- | :---- | :---- |
| SKILL.md | Mandatory | Primary entry point; contains discovery metadata and core procedural instructions. |
| scripts/ | Optional | Directory for executable logic (Python, Bash, Node.js) to perform deterministic tasks. |
| references/ | Optional | Contextual documentation loaded only when specific sub-tasks require deep domain knowledge. |
| assets/ | Optional | Static resources such as templates, fonts, icons, or base data files for output generation. |
| metadata.json | Optional | Extended platform-specific properties for discovery, versioning, and authorship tracking. |

Source: 3

The structural integrity of this directory is governed by strict technical constraints. The SKILL.md file must be named exactly as such, case-sensitively, and must reside at the top level of the folder. The folder name itself must follow a kebab-case convention, a requirement that is often ignored by early-stage validators but leads to silent loading failures in production environments like Claude Code.

### **The Three-Level Loading Mechanism**

The efficiency of the standard is derived from its three-level disclosure system, which ensures that token consumption remains proportional to task complexity.

1. **Level One (Discovery):** Only the YAML frontmatter (name and description) is pre-loaded into the system prompt. This allows the agent to maintain awareness of hundreds of skills without overwhelming the context window.
2. **Level Two (Activation):** If the agent identifies a semantic match between the user prompt and a skill's description, it loads the full markdown body of SKILL.md.
3. **Level Three (Deep Access):** Files within references/ or scripts/ are only accessed via Read or Bash tools when the agent determines they are necessary to execute a specific instruction within the main body.

### **Metadata Specifications and Constraints**

The YAML frontmatter serves as the "discovery layer" and must be formatted with extreme precision. Research into failed skill triggers indicates that malformed YAML is the primary cause of nondeterministic agent behavior

| Field | Requirement | Validation Rule |
| :---- | :---- | :---- |
| name | Mandatory | Lowercase letters, numbers, and hyphens only; no spaces or reserved prefixes. |
| description | Mandatory | Max 1024 characters; must explicitly state the "what" and "when" for trigger matching. |
| license | Optional | Must be a recognized SPDX license string (e.g., MIT, Apache-2.0). |
| compatibility | Optional | Defines environment needs such as required system packages or network access. |
| allowed-tools | Optional | A whitelist of executable environments permitted for this skill. |
| metadata | Optional | Custom key-value pairs used for versioning (SemVer) and authorship. |

Source: 3

The description field is particularly sensitive; it must include trigger phrases that reflect actual user intent rather than abstract summaries. For instance, a skill for Linear project management should include phrases like "sprint planning" or "create tickets" rather than just "helps with projects".

## **The SkillSet Framework: A Plan for Lifecycle Management**

The SkillSet framework is conceptualized as a meta-skill residing in the user's home directory (\~/.claude/skills/skillset/ or \~/.copilot/skills/skillset/), providing a global orchestrator for local and project-specific capabilities. Its implementation must satisfy four primary functional pillars: automated synthesis, iterative optimization, isolated testing, and rigorous validation.

### **Automated Synthesis from Contextual Inputs**

The SkillSet orchestrator must be capable of generating new skills from three distinct inputs: agent session history, general descriptions, and structured frameworks.

#### **Session-Based Extraction Logic**

Extraction from history is the most sophisticated form of skill creation. By analyzing \~/.claude/history.jsonl, the SkillSet framework identifies repetitive tasks using a "What-How" axes model.

* **The WHAT Axis:** Determines the functional goal, such as "committing at an appropriate granularity" or "fixing lint errors".
* **The HOW Axis:** Determines the technical methodology, such as "orchestrating sub-agents" or "using git worktrees".15

Candidates for automation are then ranked based on a composite score S, calculated as:

S = w_f F + w_c C + w_r R


where F is frequency of occurrence, C is the consistency of procedures across sessions, and R is the ratio of routine, mechanical steps to those requiring human judgment. Patterns with a high S score are automatically proposed as candidates for packaging into a new skill folder.


### **Iterative Optimization through Feedback Loops**

Skills are rarely perfect upon initial creation. The SkillSet framework implements a "Define, Create, Refine" loop to improve skill efficacy over time. Optimization is driven by two primary signals:

#### **Signal 1: Correction Patterns**

SkillSet monitors active sessions for instances where the user must manually override or correct a skill-driven task. These "correction signals" indicate a mismatch between the skill's instructions and the desired outcome. SkillSet analyzes these gaps and automatically proposes updates to the SKILL.md body to harden the instructions against similar errors in the future.

#### **Signal 2: Triggering Anomalies**

If a skill fails to load when appropriate (undertriggering) or loads for irrelevant queries (overtriggering), SkillSet refines the frontmatter description. For overtriggering, it adds "negative triggers"—explicit guidance on when the skill should not be invoked—to the manifest. For undertriggering, it expands the description with a wider range of technical keywords and synonyms identified in the missed prompts.


### **Validation and Compliance Auditing**

The SkillSet validator is the "clippy" of the agentic world, catching errors that are syntactically valid but semantically broken. It integrates the agnix linter, which enforces over 229 validation rules derived from official specifications and real-world breakage patterns.

| Validation Category | Rules | Primary Checks |
| :---- | :---- | :---- |
| **Structural** | 31 | Case-sensitive file naming; required metadata presence; path traversal prevention. |
| **Syntax** | 45 | Proper quoting of description strings; YAML delimiter integrity; markdown linting. |
| **Security** | 52 | Detection of prompt injection patterns; script permission checks; credential leakage. |
| **Portability** | 28 | Compatibility with Claude Code, Cursor, and the Claude API beta headers. |

Source: 8

A critical component of the SkillSet validator is its ability to handle "extension fields." While the base standard defines six fields (name, description, license, compatibility, metadata, allowed-tools), platform-specific implementations like Claude Code add fields such as model, context, and hooks. The SkillSet validator must distinguish between a "malformed" skill and a "platform-extended" skill to ensure portability without breaking functionality.

## **Global and Local Management Framework**

The SkillSet framework manages skills as a hierarchical library, separating core system capabilities from project-specific nuances. This mirrors the design of Daniel Miessler’s PAI, where a clear distinction is maintained between SYSTEM/ (core infrastructure) and USER/ (customizations).

### **The Skill Registry and Home Directory Strategy**

The framework establishes a global skills repository in the user's home directory (\~/.claude/skills/). This global layer is used for "Standard Library" patterns—capabilities that are useful across all domains, such as git management, research summarization, or code linting.

When a project requires specific knowledge, SkillSet creates a local skills directory (./.claude/skills/). These local skills take precedence over global skills of the same name, allowing for "Project Overrides" where the agent follows repo-specific coding standards or deployment procedures.


### **Skill Interaction and Composition**

The SkillSet framework enables "Multi-Skill Coordination," where complex workflows span multiple specialized capabilities. This is achieved through two mechanisms:

* **Sequential Orchestration:** A skill's instructions can explicitly call for the invocation of another skill to handle a sub-task (e.g., a "Deployment" skill calling a "Testing" skill).
* **Parallel Execution:** Advanced agents can spawn sub-agents, each equipped with a different skill from the library, to work on independent parts of a project simultaneously.

## **Deep Insight: The Convergence of Connectivity and Knowledge**

The true power of the SkillSet framework lies in its synergy with the Model Context Protocol (MCP). While MCP provides the "professional kitchen"—access to tools, data sources, and real-time connectivity—the skills provide the "recipes"—the step-by-step instructions on how to combine those tools to create value.

| Feature | Model Context Protocol (MCP) | Agent Skills |
| :---- | :---- | :---- |
| **Core Goal** | Connectivity and Data Access | Knowledge and Workflow Guidance |
| **Primary Function** | What Claude *can* do (Tools) | How Claude *should* do it (Playbook) |
| **State** | Real-time, dynamic data | Persistent, procedural expertise |
| **Loading** | Server-side registration | Progressive disclosure (manifest-driven) |

Source: 3

The SkillSet framework serves as the "Orchestration Layer" that binds these two standards together. It ensures that whenever an MCP server is connected (e.g., a Linear or Notion integration), the corresponding "Skill Pack" is automatically loaded, providing the agent with the immediate expertise needed to navigate the service's API and conventions.

### **The Impact of Supply Chain Poisoning**

As SkillSet matures into a global management framework, the risk of "Supply Chain Poisoning" becomes a critical engineering challenge. Malicious skills uploaded to open marketplaces can embed adversarial instructions in SKILL.md to hijack agent context or execute unsigned code via the scripts/ directory. SkillSet mitigates this through:

* **Signature Validation:** Ensuring that only skills from "Trusted Sources" are allowed to execute shell commands.  
* **Provenance Tracking:** Maintaining a verifiable audit trail of where a skill originated and who has modified it.  
* **Runtime Sandboxing:** Enforcing OS-level and MicroVM isolation for all skill-driven code execution, ensuring that even a compromised skill cannot access host credentials.

## **PRD: SkillSet Meta-Skill Implementation Architecture**

This Project Requirements Document (PRD) outlines the technical specifications for the SkillSet meta-skill, designed to manage the lifecycle of agentic capabilities.

### **Functional Requirements**

The SkillSet skill must implement four primary command modules, accessible via both CLI and natural language prompts.

| Module | Input | Output | Mechanism |
| :---- | :---- | :---- | :---- |
| **Synthesizer** | Session Log / Description | New Skill Directory | Pattern extraction (What-How axes) and template initialization. |
| **Optimizer** | Correction Log / Skill Name | Updated SKILL.md | "Define-Create-Refine" feedback loop based on agent failure modes. |
| **Sandbox** | Skill Name / Test Cases | Execution Report | Deployment to Firecracker or bubblewrap for trigger/functional testing. |
| **Linter** | Skill Path | Compliance Score | Full-spectrum validation against agnix rule-set (229+ rules). |

### **Global vs. Local Configuration**

SkillSet maintains a dual-state configuration to handle local and global skills seamlessly.

* **Global Config (\~/.skillset/registry.json):** A manifest of all installed global skills, including their git source, local symlink path, and current SemVer. 
* **Local Config (./.skillset/project.json):** Tracks project-specific overrides and dependency mappings for the current workspace.

### **Security and Validation Gating**

Every skill managed by SkillSet must pass through a "Validation Gate" before activation.

* **Integrity Check:** Verifies the SKILL.md frontmatter against the Agent Skills spec.
* **Instruction Audit:** Scans for prompt injection keywords or instructions that attempt to bypass sandboxing (e.g., "ignore previous instructions").
* **Sandboxed Trial:** Executes any scripts in the scripts/ directory within a clean microVM to ensure they don't perform unauthorized filesystem or network operations.

## **Conclusion: The Future of Agentic Infrastructure**

The transition to a skill-based AI architecture represents a fundamental maturation of the field. By moving from monolithic "super-prompts" to modular, versioned, and validated "Expert Modes," developers can build AI systems that are both more capable and more reliable.3 The SkillSet framework established in this report provides the necessary orchestration layer to manage this modular expertise at scale.

As we move toward a "Hybrid Human-AI Product Workforce," the role of the engineer shifts from writing prescriptive code to defining "Goal Vectors" and managing the "Skill Lifecycle".35 The SkillSet meta-skill is the essential tool for this new paradigm, providing a deterministic path for the creation, optimization, and validation of agentic capabilities. Through rigorous sandboxing, global synchronization, and compliance-driven linting, SkillSet ensures that the future of AI is not just autonomous, but auditable and secure.7

#### **Works cited**

1. Agent Skills :Standard for Smarter AI | by Plaban Nayak | Jan, 2026 \- Medium, accessed on February 16, 2026, [https://medium.com/@nayakpplaban/agent-skills-standard-for-smarter-ai-bde76ea61c13](https://medium.com/@nayakpplaban/agent-skills-standard-for-smarter-ai-bde76ea61c13)  
2. Agent Skills: Overview, accessed on February 16, 2026, [https://agentskills.io/home](https://agentskills.io/home)  
3. The-Complete-Guide-to-Building-Skill-for-Claude.pdf  
4. GitHub \- muratcankoylan/Agent-Skills-for-Context-Engineering, accessed on February 16, 2026, [https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering](https://github.com/muratcankoylan/Agent-Skills-for-Context-Engineering)  
5. Skills in OpenAI API, accessed on February 16, 2026, [https://developers.openai.com/cookbook/examples/skills\_in\_api/](https://developers.openai.com/cookbook/examples/skills_in_api/)  
6. Claude Agent Skills: A First Principles Deep Dive \- Han Lee, accessed on February 16, 2026, [https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/](https://leehanchung.github.io/blogs/2025/10/26/claude-skills-deep-dive/)  
7. Agent Skills Are the New npm Packages — And Just as Vulnerable | PurpleBox Security, accessed on February 16, 2026, [https://www.prplbx.com/blog/agent-skills-supply-chain](https://www.prplbx.com/blog/agent-skills-supply-chain)  
8. Show HN: Agnix – lint your AI agent configs (Claude.md, skills, MCP, hooks) | Hacker News, accessed on February 16, 2026, [https://news.ycombinator.com/item?id=46983879](https://news.ycombinator.com/item?id=46983879)  
9. Use Agent Skills in VS Code, accessed on February 16, 2026, [https://code.visualstudio.com/docs/copilot/customization/agent-skills](https://code.visualstudio.com/docs/copilot/customization/agent-skills)  
10. Anthropic's Agent Skills \- by Dr. Nimrita Koul \- Medium, accessed on February 16, 2026, [https://medium.com/@nimritakoul01/anthropics-agent-skills-0ef767d72b0f](https://medium.com/@nimritakoul01/anthropics-agent-skills-0ef767d72b0f)  
11. quick\_validate.py should warn about unquoted descriptions with special YAML characters · Issue \#338 · anthropics/skills \- GitHub, accessed on February 16, 2026, [https://github.com/anthropics/skills/issues/338](https://github.com/anthropics/skills/issues/338)  
12. skill-creator: Generated skills fail validation due to missing frontmatter property documentation · Issue \#37 · anthropics/skills \- GitHub, accessed on February 16, 2026, [https://github.com/anthropics/skills/issues/37](https://github.com/anthropics/skills/issues/37)  
13. Using Agent Skills with the API \- Claude API Docs \- Claude Console, accessed on February 16, 2026, [https://platform.claude.com/docs/en/build-with-claude/skills-guide](https://platform.claude.com/docs/en/build-with-claude/skills-guide)  
14. About agent skills \- GitHub Docs, accessed on February 16, 2026, [https://docs.github.com/en/copilot/concepts/agents/about-agent-skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)  
15. Automatically Generating Agent Skills from Claude Code Session and CLI History \- Zenn, accessed on February 16, 2026, [https://zenn.dev/takiko/articles/claude-code-skill-from-logs?locale=en](https://zenn.dev/takiko/articles/claude-code-skill-from-logs?locale=en)  
16. danielmiessler/Personal\_AI\_Infrastructure: Agentic AI Infrastructure for magnifying HUMAN capabilities. \- GitHub, accessed on February 16, 2026, [https://github.com/danielmiessler/Personal\_AI\_Infrastructure](https://github.com/danielmiessler/Personal_AI_Infrastructure)  
17. Build Your First Claude Code Agent Skill: A Simple Project Memory System That Saves Hours | by Rick Hightower \- Medium, accessed on February 16, 2026, [https://medium.com/@richardhightower/build-your-first-claude-code-skill-a-simple-project-memory-system-that-saves-hours-1d13f21aff9e](https://medium.com/@richardhightower/build-your-first-claude-code-skill-a-simple-project-memory-system-that-saves-hours-1d13f21aff9e)  
18. Software Development with AI in 2025 \- Cahit Barkin Ozer \- Medium, accessed on February 16, 2026, [https://cbarkinozer.medium.com/software-development-with-ai-in-2025-238d3e8c0ac7](https://cbarkinozer.medium.com/software-development-with-ai-in-2025-238d3e8c0ac7)  
19. Packaging validator should warn (not error) on platform-specific extension fields · Issue \#394 · anthropics/skills \- GitHub, accessed on February 16, 2026, [https://github.com/anthropics/skills/issues/394](https://github.com/anthropics/skills/issues/394)  
20. Making Claude Code more secure and autonomous with sandboxing \- Anthropic, accessed on February 16, 2026, [https://www.anthropic.com/engineering/claude-code-sandboxing](https://www.anthropic.com/engineering/claude-code-sandboxing)  
21. Sandboxing \- Claude Code Docs, accessed on February 16, 2026, [https://code.claude.com/docs/en/sandboxing](https://code.claude.com/docs/en/sandboxing)  
22. Anthropic Adds Sandboxing and Web Access to Claude Code for Safer AI-Powered Coding, accessed on February 16, 2026, [https://www.infoq.com/news/2025/11/anthropic-claude-code-sandbox/](https://www.infoq.com/news/2025/11/anthropic-claude-code-sandbox/)  
23. Deno Sandbox | Claude Code Skill for Secure Code Isolation \- MCP Market, accessed on February 16, 2026, [https://mcpmarket.com/tools/skills/deno-sandbox](https://mcpmarket.com/tools/skills/deno-sandbox)  
24. avifenesh/agnix: The missing linter and lsp for AI coding ... \- GitHub, accessed on February 16, 2026, [https://github.com/avifenesh/agnix](https://github.com/avifenesh/agnix)  
25. agnix-cli 0.5.0 \- Docs.rs, accessed on February 16, 2026, [https://docs.rs/crate/agnix-cli/0.5.0](https://docs.rs/crate/agnix-cli/0.5.0)  
26. Creating skills | Tessl Docs, accessed on February 16, 2026, [https://docs.tessl.io/create/creating-skills](https://docs.tessl.io/create/creating-skills)  
27. Introducing HashiCorp Agent Skills, accessed on February 16, 2026, [https://www.hashicorp.com/en/blog/introducing-hashicorp-agent-skills](https://www.hashicorp.com/en/blog/introducing-hashicorp-agent-skills)  
28. Install agent skills from npm \- GitHub, accessed on February 16, 2026, [https://github.com/antfu/skills-npm](https://github.com/antfu/skills-npm)  
29. microsoft/skills: Skills, MCP servers, Custom Agents, Agents.md for SDKs to ground Coding Agents \- GitHub, accessed on February 16, 2026, [https://github.com/microsoft/skills](https://github.com/microsoft/skills)  
30. agent-skills · PyPI, accessed on February 16, 2026, [https://pypi.org/project/agent-skills/](https://pypi.org/project/agent-skills/)  
31. Personal\_AI\_Infrastructure/Bundles/Official/README.md at main \- GitHub, accessed on February 16, 2026, [https://github.com/danielmiessler/Personal\_AI\_Infrastructure/blob/main/Bundles/Official/README.md](https://github.com/danielmiessler/Personal_AI_Infrastructure/blob/main/Bundles/Official/README.md)  
32. npm-agentskills/README.md at main \- GitHub, accessed on February 16, 2026, [https://github.com/onmax/npm-agentskills/blob/main/README.md](https://github.com/onmax/npm-agentskills/blob/main/README.md)  
33. Build custom AI workflows with Manus Agent Skills | AI automation, accessed on February 16, 2026, [https://manus.im/features/agent-skills](https://manus.im/features/agent-skills)  
34. bobmatnyc/mcp-skillset: Dynamic RAG-powered skills service for code assistants via MCP \- Vector \+ Knowledge Graph hybrid search for intelligent skill discovery \- GitHub, accessed on February 16, 2026, [https://github.com/bobmatnyc/mcp-skillset](https://github.com/bobmatnyc/mcp-skillset)  
35. Manager of Robots: Agentic Product Management (2026) \- Product Leaders Day India, accessed on February 16, 2026, [https://productleadersdayindia.org/blogs/agentic-ai-product-management/agentic-ai-product-management.html](https://productleadersdayindia.org/blogs/agentic-ai-product-management/agentic-ai-product-management.html)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA0AAAAaCAYAAABsONZfAAAAz0lEQVR4Xu3Ruw4BQRTG8REKt8YlLomEQqMTOp2Ep/AGttNot1UIUWlVJAqdWq1QKTRKz8E3u9+sExuFKSQS/+TXHHs2Zkepn6tECzjQEnrUMQ+aKrCjqpjX4UQNMfeyWnJhTLI0zCjz8ptawYQiYh6HLoWyWnLhTjeYkj7r2xIwpIt6vuAMBQr10VKSonKImnSFNnnpAzukP62sTEfl309wR3nYUtEMWZ/mECMvqyX9P/e0gQGNYE1Z87ApBynSl9iimvLPKy85yGrp31d7AJGyLzNurK8iAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAiCAYAAADiWIUQAAAD/ElEQVR4Xu3cz6tUZRzH8W9YoZmVGKYUlCWEqAhqlEbmQvqhVBBu/IEuVHQh4ibFILpU/gGKJAQu7qJN5C4jLChyIbWQdkHQok3t+g8Cvx+e8zTf89wzc+bOPXdGh/cLvsw5Z86dec65mw/f5zljBgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4zz3mddHrR6/3vM55PVI7Y3we9PqioT72ejScNy5LvPZ53fD61ut1r+1e78aTxkD35YzV74n+T+vjSQAAYDqt8vrKa2u1r22Ft0l5wOuK1y2vF7zWWgpH33itCOeVlpYHOrDG63uvzy3dJ43tA69/vbaF80oPWQp6i+Fnr8ctXe/LXn/U3wYAANPotNUDmgLJuLtHpR+sPiZ11j60waHsVHmgAwpr6mIpqGVbLIXJJ8Ox0kFLQbNruv54XzSuL20ynUcAADBGs5a6auoKyWvWXdhQlymGHVF3qM3f1guNGyxN2R7rvd1omMDWbzz52iOd96ulzlqke/OJzf2caJjA1m8sgzxt9TD9lNfvNvdzAADAlFFYOeD1i9d/1r+7pum3/X1qczgve8XrSLW9vHpVsPi02h7kH69rXl973Sne66ctsMXx5ICTx3Oo2o/e93qpPDiktsA26r05b+mz1fX7zeu4EdYAAJh6WhMW11qpwzMT9hdCAUodIdGC/TxtFwOhwsYJr93hmALM5Wp7paVw0uRFS+vafqrqz7Ctyt+dxfHssPp4mtajKRyVoUvj1QMIOWRlekDjkvW+W+vKbof9N9Np/xvm3pQ0Hapzs3csXbO6bAAAYIppXVi5/ulksZ/Np8OmcBE/e6Z6VTdPQSjTOjA97RgD0PPWCy4Kk8M+rdrWYYvjydeYx9M0FakxaCyRnshs+x4Z1GEb9t6UFPAU0DJdw1/W/3sAAMCU+M7qHZrnvJ4J+9ETlsJBU5WhTwHsuterXuu8PqqOXbBeWFJYO+t10+rTegpKWrc2X21BKo5HT1qW49H+G5YeKtB4Vnsdrt7LdB1N4a40KLC13Rut19tlKSy+Vf2N7LEU0LLZal/fsywcBwAAU0ZdHXV8NnltrPa7lBf0q5qCjkLK2+XBEbUFNokPGMTxKKApHOk1dvvU4VOA3WkpsA5rUGDL+t0bbV+1FFofDsdLGqseiGBKFAAALBr9EGwOJl1Q8ByVOoR5+rPp6c35Uggb9XfY1HlU90zr9wAAACbqXgsm+tkQTTsetclOMerJ1M/KgwAAAOP2rNdeSwvuF9rN6oqmH7ueEh6F7seo3TkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwP3jLtwjcAOPBC/YAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAAwUlEQVR4Xu3RoQoCQRSF4SsWUbEbRLAZjAaLQQyaBKt2n8QsGAw+gtgthn0Mn8CgzyB4DnNmXZZZWJi2+MOXdu6yc9esEg3hBOcSpppJa8AEXrKBbkYfLrLWTFrUMFvCUwa5Z2wh8/wDtodE2lCTLXRgJiN3/FcL7nCUurlr0MHcSwqLGuYdedeb8Jc8ZJc5F4zLepv738RWMvaHiooa9pvmlok1hfcP5g8n5hZVOn7qVT7mlsPNUi9zLljU8L/q9wX2rTGapeqT3AAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAZCAYAAADuWXTMAAAA2ElEQVR4XmNgGDaAEYjNoXgZEB+H4v1AHArEClCcClGOANxAPB+I10OxIqo0QzAQf4NiPzQ58jSzQvEsKIbx0YE4A8IbmjDBDCh+AsQqMEEsgAeIW6AYxGYQAeKrUDyFARJguAAzEPNCMRhQpNmUAREIQTBBYoEvEH+FYmM0OXTgyAAJNBAGA4o0gzS8hGIbmCAWIAzEZUDMAsVgwAnEm6G4mQEzwGBxXg7E8mhyYCADxUeAeDkQR0BxMgMi4ajBVaMBijTDAMjJYkBsCcUgNkgM3SujYGgBAEfPLwKSwgc+AAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAYCAYAAAAlBadpAAAA2ElEQVR4Xu3SsQsBYRgG8M9GGQxSIsomi5LZYlFMFmW0miz+gMusDAar1Wox3WgwWGQyKJuZTXlenjfn7pTcRJ76Ld97b9339BnzE8nDGCY+RlCHCPkmAwdqQogSYMGa0rrgTBX2lHPNynCmhmt2S6DlPtgUfZoY04UjFVwzE4Y5DEjPhJS1hAp5koKdeSy3YUoLzl8m0LKWJUVpWXJvYUOPZ77RsnRBEqcN555oKVqWMyU6mfuyvrCsfvDxcg1mdIEVdEgiz1BsYQgtKnL+VuTPkhCjf74nV74CNjaE7DLyAAAAAElFTkSuQmCC>