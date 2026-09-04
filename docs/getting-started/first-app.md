# Your First Zudojs App

## Scaffold a Project

Use the Zudojs CLI to create a new project:

```bash
npx zudojs create my-app
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
└── zudojs.config.ts
```

## Add Features

```bash
npx zudojs add database
npx zudojs add events
npx zudojs add queue
```

## Next Steps

- Read the [Architecture Overview](../architecture/overview.md)
- Explore [Concepts](../concepts/application.md)
