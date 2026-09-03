# zudolib-cli

## 0.2.1

### Patch Changes

- - Convert postinstall script to CommonJS for Node.js v24 compatibility
  - Restore postinstall hook pointing to src/scripts/postinstall.cjs
  - Add --provenance flag to npm publish for better CDN cache invalidation
  - Fix Prettier formatting in release.yml and packages/cli/README.md

## 0.2.0

### Minor Changes

- - Replace number-based prompts with @clack/prompts (arrow-key selects, spinners, intro/outro)
  - Restructure prompts into modular folders (project/, backend/, frontend/, workspace/, capabilities/)
  - Add conditional interactive flow for Backend / Frontend / Full Stack project types
  - Wire .zudolib manifest into dev, add, generate, and create commands
  - Expand infrastructure generator with per-service Dockerfiles and migrations placeholder
  - Add microservice support to `zudolib dev` command
  - Expand `zudolib generate` from 6 to 13 schematics (middleware, event, job, route, model, dto, validator)
  - Expand `zudolib add` from 6 to 10 features (cache, storage, scheduler, docs)
  - Add tests for build command, manifest manager, rollback manager, capability resolver, infrastructure generator, and compatibility validator (247 tests total)

## 0.1.5

### Patch Changes

- [`5af5beb`](https://github.com/oyinlola-tech/zudolib/commit/5af5bebfbf89d48424d8658a670598d348589fad) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Add fullstack project generation, 11 frontend adapters, and security hardening

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

- [`8b4c2fe`](https://github.com/oyinlola-tech/zudolib/commit/8b4c2febb0d91668bc23fd69f06fc94647abb908) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Fix changeset validation workflow and publish all packages to npm.
- Updated dependencies [[`8b4c2fe`](https://github.com/oyinlola-tech/zudolib/commit/8b4c2febb0d91668bc23fd69f06fc94647abb908)]:
  - @zudolib/core@0.1.3
  - @zudolib/errors@0.1.2
  - @zudolib/config@0.1.2
  - @zudolib/logger@0.1.2

## 0.1.1

### Patch Changes

- [`35faf04`](https://github.com/oyinlola-tech/zudolib/commit/35faf049b7ff9e300cf2030f48ac108813c912c4) Thanks [@oyinlola-tech](https://github.com/oyinlola-tech)! - Initial publication of all Zudolib packages with namespace migration, new middleware, and fixes.
- Updated dependencies [[`35faf04`](https://github.com/oyinlola-tech/zudolib/commit/35faf049b7ff9e300cf2030f48ac108813c912c4)]:
  - @zudolib/core@0.1.2
  - @zudolib/errors@0.1.1
  - @zudolib/config@0.1.1
  - @zudolib/logger@0.1.1
