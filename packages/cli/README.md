# @oyinlola141/lattice-cli

Command-line interface for the Lattice framework. Scaffolds new projects, generates code, adds features, and runs diagnostics.

## When to use

Install globally and use from any directory:

```bash
npm install -g @oyinlola141/lattice-cli
```

Or run locally during development:

```bash
pnpm --filter @oyinlola141/lattice-cli dev
```

## Commands

| Command                               | Description                                                                          |
| ------------------------------------- | ------------------------------------------------------------------------------------ |
| `lattice create <name>`               | Create a new Lattice project (monolith, modular-monolith, microservice)              |
| `lattice generate <schematic> <name>` | Generate service, module, command, query, controller, or repository                  |
| `lattice add <feature>`               | Add a feature package (database, queue, messaging, openapi, observability, security) |
| `lattice doctor`                      | Run diagnostics on a Lattice project                                                 |
| `lattice info`                        | Show Lattice CLI and project info                                                    |
| `lattice --version`                   | Show the Lattice CLI version                                                         |
| `lattice --help`                      | Show help                                                                            |

## Public API (programmatic use)

```typescript
import {
  createCLI,
  createCommand,
  type CLIContext,
  type CLIAppOptions,
} from "@oyinlola141/lattice-cli";

const app = createCLI({
  name: "MyTool",
  version: "1.0.0",
  description: "Custom Lattice tool",
});

app.register(
  createCommand({
    name: "hello",
    description: "Say hello",
    execute: (ctx) => ctx.logger.info("Hello, world!"),
  }),
);

await app.run(process.argv.slice(2));
```

## Architecture

The CLI is a thin orchestrator over the rest of the framework. It does not contain framework logic — only:

- a typed argument parser
- a command registry
- project, generator, and template modules
- dependency installer
- architecture resolver

## License

MIT
