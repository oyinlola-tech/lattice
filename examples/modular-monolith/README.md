# Modular Monolith Example

A **Community Knowledge Platform** demonstrating Zudolib's modular monolith architecture.

## What this example demonstrates

- **One application** with a single deployment unit
- **Multiple independent modules** with clear domain boundaries
- **CQRS per module** (commands write, queries read)
- **Event-driven cross-module communication**
- **Shared infrastructure** (repositories, config, validation)
- **Module registration with lifecycle**
- **Type-safe commands and queries**

## Architecture

```
src/
├── config/          # Application configuration
├── constants/       # Shared constants
├── controllers/     # Thin HTTP controllers
├── databases/       # SQLite database layer
├── dtos/            # Data transfer objects
├── enums/           # Shared enumerations
├── errors/          # Application error types
├── events/          # Event definitions
├── interfaces/      # Shared interfaces
├── jobs/            # Background jobs
├── loaders/         # Application bootstrapping
├── loggers/         # Logger setup
├── middlewares/      # HTTP middleware
├── models/          # Domain models
├── modules/         # Business modules (CQRS)
│   ├── identity/    # User management
│   ├── articles/    # Article CRUD
│   ├── comments/    # Comment system
│   ├── reactions/   # Article reactions
│   ├── topics/      # Topic management
│   └── notifications/ # Event-driven notifications
├── repositories/    # Data access layer
├── routes/          # HTTP routes
├── types/           # Shared types
├── utils/           # Utility functions
└── validators/      # Validation schemas
```

## Modules

### Identity

- Register users
- Update profiles
- Get user information

### Articles

- Create, update, delete articles
- Publish articles (draft → published workflow)
- Search and list articles

### Comments

- Add comments to articles
- Update and delete comments

### Reactions

- React to articles (like, love, insightful, disagree)
- Remove reactions

### Topics

- Create topics
- Follow/unfollow topics

### Notifications

- Event-driven notifications
- Mark notifications as read

## Running

```bash
# Install dependencies
pnpm install

# Run the example
pnpm dev

# Or run directly
pnpm start
```

## Key patterns

### CQRS

Commands and queries are separated for clarity:

```typescript
// Command (write)
const command = new CreateArticleCommand({ title, content, authorId });
const article = await commandBus.execute(command);

// Query (read)
const query = new GetArticleQuery(articleId);
const article = await queryBus.execute(query);
```

### Event-driven communication

Modules communicate through events, not direct imports:

```typescript
// Articles module publishes event
await events.publish(ArticleCreatedEvent.create({ articleId, authorId }));

// Notifications module listens (no direct dependency on articles)
events.on("article.created", async (event) => {
  await createNotification(event.payload.authorId, "Article created");
});
```

### Module registration

Each module registers its commands and queries:

```typescript
export function registerArticlesModule(config: ArticlesModuleConfig): void {
  config.commandBus.register(
    "articles.create",
    new CreateArticleHandler(config.articles),
  );
  config.queryBus.register(
    "articles.get",
    new GetArticleHandler(config.articles),
  );
}
```

## Differences from `examples/monolith`

| Aspect            | Monolith            | Modular Monolith      |
| ----------------- | ------------------- | --------------------- |
| Structure         | Traditional layered | Module-focused        |
| Module boundaries | Loose               | Explicit registration |
| CQRS              | Per module          | Per module            |
| Events            | Manual wiring       | EventBus integration  |
| Infrastructure    | Mixed in modules    | Shared in `src/`      |
| Complexity        | Simpler             | More structured       |
