# Your First Zudo App

## Scaffold a Project

Use the Zudo CLI to create a new project:

```bash
npx zudo create my-app
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
└── zudo.config.ts
```

## Add Features

```bash
npx zudo add database
npx zudo add events
npx zudo add queue
```

## Next Steps

- Read the [Architecture Overview](../architecture/overview.md)
- Explore [Concepts](../concepts/application.md)
