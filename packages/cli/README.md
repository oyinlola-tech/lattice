# @oyinlola141/lattice-cli

Command-line interface for scaffolding, generating, and managing Lattice framework projects.

## Installation

### First time

```bash
npm install -g @oyinlola141/lattice-cli
```

### Upgrading from an old version?

If `lattice -v` doesn't match the latest npm version, clear the cache:

```bash
npm cache clean --force
npm install -g @oyinlola141/lattice-cli@latest
```

### Getting permission errors?

Don't use `sudo`. Set up a user-local npm prefix instead:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g @oyinlola141/lattice-cli@latest
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

| Command    | Description                                                              |
| ---------- | ------------------------------------------------------------------------ |
| `create`   | Scaffold a new project (backend, frontend, or fullstack)                 |
| `generate` | Generate files (service, module, command, query, controller, repository) |
| `add`      | Add feature packages (database, queue, messaging, etc.)                  |
| `dev`      | Start development servers                                                |
| `doctor`   | Run project diagnostics                                                  |
| `info`     | Show project information                                                 |

## Supported Frameworks

- **Backend:** Node.js, Express, Fastify
- **Frontend:** React, Next.js, Vue, Nuxt, Angular, Svelte, SvelteKit, Astro, Vanilla, Flutter, React Native
- **Architectures:** Monolith, Modular Monolith, Microservice

## Documentation

See the [Lattice README](https://github.com/oyinlola-tech/lattice) for full documentation.
