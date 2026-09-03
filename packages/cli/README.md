# @oyinlola141/lattice-cli

Command-line interface for scaffolding, generating, and managing Lattice framework projects.

## Installation

```bash
npm install -g @oyinlola141/lattice-cli
```

## Quick Start

```bash
# Create a new backend project
lattice create my-api

# Create a frontend project
lattice create my-web --type frontend --frontend react

# Create a fullstack project
lattice create my-system --type fullstack --frontend next --architecture monolith

# Start development servers
lattice dev

# Generate a module
lattice generate module users

# Add a feature
lattice add database
```

## Commands

| Command | Description |
|---------|-------------|
| `create` | Scaffold a new project (backend, frontend, or fullstack) |
| `generate` | Generate files (service, module, command, query, controller, repository) |
| `add` | Add feature packages (database, queue, messaging, etc.) |
| `dev` | Start development servers |
| `doctor` | Run project diagnostics |
| `info` | Show project information |

## Supported Frameworks

- **Backend:** Node.js, Express, Fastify
- **Frontend:** React, Next.js, Vue, Nuxt, Angular, Svelte, SvelteKit, Astro, Vanilla, Flutter, React Native
- **Architectures:** Monolith, Modular Monolith, Microservice

## Documentation

See the [Lattice README](https://github.com/oyinlola-tech/lattice) for full documentation.
