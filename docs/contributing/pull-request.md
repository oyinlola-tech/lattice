# Pull Request Process

## Before Submitting

1. Ensure all checks pass:

   ```bash
   npm run typecheck
   npm run architect:check
   npm test
   ```

2. Run formatting:

   ```bash
   npm run format
   ```

3. Update documentation if the change affects public APIs.

## PR Template

- **Summary** — what changed and why.
- **Breaking Changes** — list any breaking changes.
- **Migration** — steps for consumers to upgrade.
- **Checklist** — tests added, docs updated, typecheck passes.

## Review

- At least one maintainer approval required.
- CI checks must pass (`architect:check`, `typecheck`, `tests`).
- Address review comments before merging.

## Merge

- Squash commits if requested.
- Delete the branch after merge.
