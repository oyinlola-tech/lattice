# Zudo Documentation Site

Public-facing documentation website for the Zudo framework.

## Structure

```
site/
├── index.html              # Landing page
├── design.md               # Design system documentation
├── css/
│   ├── docs.css            # Documentation pages
│   ├── home.css            # Landing page
│   ├── errors.css          # Error pages (404, 401, 403, 500, 503)
│   ├── packages.css        # Package filter buttons
│   └── playground.css      # Floating code playground
├── js/
│   ├── tailwind-config.js  # Shared Tailwind config
│   ├── components.js       # Reusable nav/footer injection
│   ├── playground.js       # Floating code playground
│   ├── router.js           # Client-side navigation
│   ├── toc.js              # TOC IntersectionObserver
│   ├── docs.js             # Docs sidebar/TOC/search/code-copy
│   ├── home.js             # Homepage search/menu
│   ├── error-pages.js      # Error page scripts
│   └── packages.js         # Package filter scripts
├── docs/                   # 31 documentation pages
├── error/                  # 5 error pages
└── assets/                 # SVG icons (favicon, logo, icon)
```

## Deployment

Vercel config is at the repo root (`vercel.json`), not in this directory.

- `outputDirectory: "site"` — Vercel serves files from this folder
- `installCommand: "echo noop"` — skips monorepo install (static site, no build)
- Clean URLs enabled — `/docs/packages/auth` serves `packages-auth.html`

### Deploy

```bash
# From repo root
vercel --prod

# Or push to main — Vercel auto-deploys
```

## Local Development

```bash
cd site
npx serve .
```

## Design

Softened brutalist system — zero border-radius, visible borders, muted palette.
See `design.md` for full documentation.
