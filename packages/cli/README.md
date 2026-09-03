# zudolib-cli

Command-line interface for scaffolding, generating, and managing Zudolib framework projects.

## Installation

### First time

```bash
npm install -g zudolib-cli
```

### Upgrading from an old version?

If `zudolib -v` doesn't match the latest npm version, clear the cache:

```bash
npm cache clean --force
npm install -g zudolib-cli@latest
```

### Getting permission errors?

Don't use `sudo`. Set up a user-local npm prefix instead:

```bash
mkdir -p ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
npm install -g zudolib-cli@latest
```

## Quick Start

```bash
# Create a new backend project
zudolib create my-api

# Create a frontend project
zudolib create my-web --type frontend --frontend react

# Create a fullstack project
zudolib create my-system --type fullstack --frontend next --architecture monolith

# Start development servers
zudolib dev

# Generate a module
zudolib generate module users

# Add a feature
zudolib add database
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

See the [Zudolib README](https://github.com/oyinlola-tech/zudo) for full documentation.
