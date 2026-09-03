# Your First Zudolib App

## Scaffold a Project

Use the Zudolib CLI to create a new project:

```bash
npx zudolib create my-app
cd my-app
```

## Run the App

```bash
npm run dev
```

## Project Structure

```
my-app/
├── src/
│   ├── modules/
│   │   └── identity/
│   │       ├── identity.module.ts
│   │       └── identity.controller.ts
│   └── main.ts
├── package.json
├── tsconfig.json
└── zudolib.config.ts
```

## Add Features

```bash
npx zudolib add database
npx zudolib add events
npx zudolib add queue
```

## Next Steps

- Read the [Architecture Overview](../architecture/overview.md)
- Explore [Concepts](../concepts/application.md)
