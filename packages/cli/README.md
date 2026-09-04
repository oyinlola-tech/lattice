# zudojs-cli

Command-line interface for scaffolding, generating, and managing Zudojs framework projects.

## Installation

### First time

```bash
npm install -g zudojs-cli
```

### Upgrading from an old version?

If `zudojs -v` doesn't match the latest npm version, clear the cache:

```bash
npm cache clean --force
npm install -g zudojs-cli@latest
```

### Getting permission errors?

Don't use `sudo`. Set up a user-local npm prefix instead:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g zudojs-cli@latest
```

## Quick Start

```bash
# Create a new backend project
zudojs create my-api

# Create a frontend project
zudojs create my-web --type frontend --frontend react

# Create a fullstack project
zudojs create my-system --type fullstack --frontend next --architecture monolith

# Start development servers
zudojs dev

# Generate a module
zudojs generate module users

# Add a feature
zudojs add database
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

See the [Zudojs README](https://github.com/oyinlola-tech/zudo) for full documentation.
