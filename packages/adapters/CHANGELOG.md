# @zudolib/adapters

## 1.0.0

### Major Changes

- [`16f14c3`](https://github.com/oyinlola-tech/zudo/commit/16f14c36d05f664d914bc6e1b9de70f67ff55860) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - BREAKING CHANGE: Rename all packages from `@zudolib/*` to `@zudolib/*` and `@zudolib/cli` to `zudolib-cli`.

  - Scoped packages: `@zudolib/adapters`, `@zudolib/api`, `@zudolib/auth`, etc.
  - CLI package: `zudolib-cli` (unscoped)
  - All internal imports, docs, CI, and examples updated

  Migration:

  ```bash
  # Old
  npm install @zudolib/cli
  npm install @zudolib/errors

  # New
  npm install zudolib-cli
  npm install @zudolib/errors
  ```

### Patch Changes

- Updated dependencies [[`16f14c3`](https://github.com/oyinlola-tech/zudo/commit/16f14c36d05f664d914bc6e1b9de70f67ff55860)]:
  - @zudolib/constants@1.0.0
  - @zudolib/errors@1.0.0
  - @zudolib/lifecycle@1.0.0
  - @zudolib/types@1.0.0

## 0.1.4

### Patch Changes

- [`5af5beb`](https://github.com/oyinlola-tech/zudo/commit/5af5bebfbf89d48424d8658a670598d348589fad) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Add fullstack project generation, 11 frontend adapters, and security hardening

  - Add `--type`, `--frontend`, `--api`, `--language` options to `zudolib create`
  - Add frontend adapters: React, Next, Vue, Nuxt, Angular, Svelte, SvelteKit, Astro, Vanilla, Flutter, React Native
  - Add `FullstackComposer` and `FrontendGenerator` for project composition
  - Fix shell injection: switch `exec()` to `execFile()` across CLI package
  - Fix `environmentValidator` `ExecResult` type errors
  - Add missing `module` field to 6 package.json files
  - Unify type system with `ProjectConfiguration` and `ScaffoldOptions`
  - Update prompts for frontend/fullstack project types
  - Add barrel exports for new directories

## 0.1.2

### Patch Changes

- [`8b4c2fe`](https://github.com/oyinlola-tech/zudo/commit/8b4c2febb0d91668bc23fd69f06fc94647abb908) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Fix changeset validation workflow and publish all packages to npm.
- Updated dependencies [[`8b4c2fe`](https://github.com/oyinlola-tech/zudo/commit/8b4c2febb0d91668bc23fd69f06fc94647abb908)]:
  - @zudolib/errors@0.1.2
  - @zudolib/types@0.1.2
  - @zudolib/constants@0.1.2
  - @zudolib/lifecycle@0.1.2

## 0.1.1

### Patch Changes

- [`35faf04`](https://github.com/oyinlola-tech/zudo/commit/35faf049b7ff9e300cf2030f48ac108813c912c4) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Initial publication of all Zudolib packages with namespace migration, new middleware, and fixes.
- Updated dependencies [[`35faf04`](https://github.com/oyinlola-tech/zudo/commit/35faf049b7ff9e300cf2030f48ac108813c912c4)]:
  - @zudolib/errors@0.1.1
  - @zudolib/types@0.1.1
  - @zudolib/constants@0.1.1
  - @zudolib/lifecycle@0.1.1
