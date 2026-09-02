---
"@oyinlola141/lattice-cli": patch
"@oyinlola141/lattice-adapters": patch
---

Add fullstack project generation, 11 frontend adapters, and security hardening

- Add `--type`, `--frontend`, `--api`, `--language` options to `lattice create`
- Add frontend adapters: React, Next, Vue, Nuxt, Angular, Svelte, SvelteKit, Astro, Vanilla, Flutter, React Native
- Add `FullstackComposer` and `FrontendGenerator` for project composition
- Fix shell injection: switch `exec()` to `execFile()` across CLI package
- Fix `environmentValidator` `ExecResult` type errors
- Add missing `module` field to 6 package.json files
- Unify type system with `ProjectConfiguration` and `ScaffoldOptions`
- Update prompts for frontend/fullstack project types
- Add barrel exports for new directories
