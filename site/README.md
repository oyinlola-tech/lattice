# Zudo Documentation Site

This directory contains the public-facing documentation website for the Zudo framework.

## Structure

```
site/
├── index.html          # Landing page
├── design.md           # Design system documentation
├── css/
│   └── styles.css      # Custom styles (Brutalist design system)
├── js/
│   ├── search.js       # Client-side search with keyboard navigation
│   ├── navigation.js   # Sidebar navigation, breadcrumbs, TOC
│   └── main.js         # Global interactions (copy code, scroll)
└── docs/               # Documentation pages (to be created)
```

## Design System

The site uses a **Brutalist** design system:

- Zero border-radius
- No transitions (instant state changes)
- Bold typography (700+)
- Pure primary colors (Red, Blue, Yellow, Black, White)
- Visible borders
- System fonts only
- SVG icons only

See `design.md` for the complete design system documentation.

## Development

To preview the site locally:

```bash
# Using Python
cd site
python3 -m http.server 8000

# Using Node.js
npx serve site

# Using PHP
cd site
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Deployment

The site is deployed to GitHub Pages from the `site/` directory.

### Automatic Deployment

Push changes to the `main` branch. GitHub Actions will automatically build and deploy.

### Manual Deployment

```bash
# Using GitHub CLI
gh api repos/:owner/:repo/pages -X POST -f build_type=legacy -f source.branch=main -f source.path=/site
```

## SEO

Each page includes:

- Unique `<title>` tag
- Meta description
- Open Graph tags
- Semantic HTML structure
- Proper heading hierarchy

## Accessibility

- Keyboard navigable
- Focus visible states
- Semantic HTML
- ARIA labels where needed
- High contrast (4.5:1 minimum)
