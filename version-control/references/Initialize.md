# Initialize Version Control

Initialize git repository for PAI framework.

## Steps

1. Check if git repository already exists
2. Initialize git repository if needed
3. Configure git user (from environment or defaults)
4. Verify .gitignore exists
5. Create initial commit with current state

## Usage

```bash
bun run $PAI_DIR/skills/version-control/scripts/InitializeGit.ts
```

## Environment Variables

- `GIT_USER_NAME` - Git user name (default: "PAI System")
- `GIT_USER_EMAIL` - Git user email (default: "pai@local")

## Output

- Creates `.git` directory in PAI_DIR
- Configures git user
- Creates initial commit if files exist

**Done when:** `.git` exists, `.gitignore` is in place, and initial commit is created (or repo was already initialized).
