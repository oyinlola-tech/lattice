import { createApp } from "./app.js";
import { createUserId, createTopicId, createArticleId } from "./types/index.js";
import { ReactionType } from "./enums/index.js";

async function bootstrap(): Promise<void> {
  const app = await createApp();
  await app.start();

  const { commandBus, queryBus } = app;

  console.log();
  console.log("─".repeat(60));
  console.log("  Seeding demo data");
  console.log("─".repeat(60));
  console.log();

  const { RegisterUserCommand } =
    await import("./modules/identity/commands/register-user/register-user.command.js");
  const { CreateTopicCommand } =
    await import("./modules/topics/commands/create-topic/create-topic.command.js");
  const { CreateArticleCommand } =
    await import("./modules/articles/commands/create-article/create-article.command.js");
  const { PublishArticleCommand } =
    await import("./modules/articles/commands/publish-article/publish-article.command.js");
  const { CreateCommentCommand } =
    await import("./modules/comments/commands/create-comment/create-comment.command.js");
  const { AddReactionCommand } =
    await import("./modules/reactions/commands/add-reaction/add-reaction.command.js");
  const { FollowTopicCommand } =
    await import("./modules/topics/commands/follow-topic/follow-topic.command.js");

  const user1 = (await commandBus.execute(
    new RegisterUserCommand({
      email: "alice@example.com",
      name: "Alice Johnson",
      bio: "Full-stack developer passionate about TypeScript",
    }),
  )) as { id: string };

  const user2 = (await commandBus.execute(
    new RegisterUserCommand({
      email: "bob@example.com",
      name: "Bob Smith",
      bio: "DevOps engineer and open source contributor",
    }),
  )) as { id: string };

  console.log(`[Seed] Created users: ${user1.id}, ${user2.id}`);

  const topic1 = (await commandBus.execute(
    new CreateTopicCommand({
      name: "TypeScript",
      description: "TypeScript programming language and ecosystem",
    }),
  )) as { id: string };

  const topic2 = (await commandBus.execute(
    new CreateTopicCommand({
      name: "Architecture",
      description: "Software architecture patterns and best practices",
    }),
  )) as { id: string };

  console.log(`[Seed] Created topics: ${topic1.id}, ${topic2.id}`);

  await commandBus.execute(
    new FollowTopicCommand({
      userId: createUserId(user1.id),
      topicId: createTopicId(topic1.id),
    }),
  );

  await commandBus.execute(
    new FollowTopicCommand({
      userId: createUserId(user2.id),
      topicId: createTopicId(topic2.id),
    }),
  );

  console.log("[Seed] Users followed topics");

  const article1 = (await commandBus.execute(
    new CreateArticleCommand({
      authorId: createUserId(user1.id),
      topicId: createTopicId(topic1.id),
      title: "Getting Started with TypeScript 5.0",
      content:
        "TypeScript 5.0 introduces several exciting features that make the language even more powerful. In this article, we explore the key new features and how they can improve your development workflow. The new decorators implementation, const type parameters, and multiple config extensions are just a few of the highlights that developers have been waiting for.",
    }),
  )) as { id: string };

  const article2 = (await commandBus.execute(
    new CreateArticleCommand({
      authorId: createUserId(user2.id),
      topicId: createTopicId(topic2.id),
      title: "Modular Monolith Architecture Patterns",
      content:
        "Building a modular monolith allows you to have the simplicity of a single deployment while maintaining clear module boundaries. This architecture style is gaining popularity as it provides a middle ground between a traditional monolith and microservices. By organizing code into distinct modules with well-defined interfaces, you can achieve better separation of concerns without the operational complexity of distributed systems.",
    }),
  )) as { id: string };

  console.log(`[Seed] Created articles: ${article1.id}, ${article2.id}`);

  await commandBus.execute(
    new PublishArticleCommand(
      createArticleId(article1.id),
      createUserId(user1.id),
    ),
  );
  await commandBus.execute(
    new PublishArticleCommand(
      createArticleId(article2.id),
      createUserId(user2.id),
    ),
  );

  console.log("[Seed] Published articles");

  const comment1 = (await commandBus.execute(
    new CreateCommentCommand({
      articleId: createArticleId(article1.id),
      authorId: createUserId(user2.id),
      content:
        "Great article! The const type parameters feature is exactly what I've been waiting for.",
    }),
  )) as { id: string };

  const comment2 = (await commandBus.execute(
    new CreateCommentCommand({
      articleId: createArticleId(article2.id),
      authorId: createUserId(user1.id),
      content:
        "This is a great overview of modular monolith patterns. I've been using this approach in my current project and it works really well.",
    }),
  )) as { id: string };

  console.log(`[Seed] Created comments: ${comment1.id}, ${comment2.id}`);

  await commandBus.execute(
    new AddReactionCommand({
      articleId: createArticleId(article1.id),
      userId: createUserId(user2.id),
      type: ReactionType.LIKE,
    }),
  );

  await commandBus.execute(
    new AddReactionCommand({
      articleId: createArticleId(article2.id),
      userId: createUserId(user1.id),
      type: ReactionType.INSIGHTFUL,
    }),
  );

  console.log("[Seed] Added reactions");

  console.log();
  console.log("─".repeat(60));
  console.log("  Querying data");
  console.log("─".repeat(60));
  console.log();

  const { ListArticlesQuery } =
    await import("./modules/articles/queries/list-articles/list-articles.query.js");
  const { ListCommentsQuery } =
    await import("./modules/comments/queries/list-comments/list-comments.query.js");
  const { GetReactionsQuery } =
    await import("./modules/reactions/queries/get-reactions/get-reactions.query.js");
  const { ListTopicsQuery } =
    await import("./modules/topics/queries/list-topics/list-topics.query.js");

  const articlesList = (await queryBus.execute(
    new ListArticlesQuery(),
  )) as readonly { id: string; title: string; status: string }[];
  console.log(`[Query] Published articles: ${articlesList.length}`);
  for (const a of articlesList) {
    console.log(`  - ${a.title} (${a.status})`);
  }

  const topicsList = (await queryBus.execute(
    new ListTopicsQuery(),
  )) as readonly { name: string; followerCount: number }[];
  console.log(`[Query] Topics: ${topicsList.length}`);
  for (const t of topicsList) {
    console.log(`  - ${t.name} (${t.followerCount} followers)`);
  }

  const commentsList = (await queryBus.execute(
    new ListCommentsQuery(createArticleId(article1.id)),
  )) as readonly { content: string }[];
  console.log(`[Query] Comments on article 1: ${commentsList.length}`);
  for (const c of commentsList) {
    console.log(`  - "${c.content.slice(0, 60)}..."`);
  }

  const reactionsResult = (await queryBus.execute(
    new GetReactionsQuery(createArticleId(article1.id)),
  )) as { counts: Record<string, number> };
  console.log(`[Query] Reactions on article 1:`, reactionsResult.counts);

  console.log();
  console.log("=".repeat(60));
  console.log("  Modular Monolith Architecture Summary");
  console.log("=".repeat(60));
  console.log();
  console.log("Architecture:");
  console.log("  One application  → Single deployment unit");
  console.log("  One runtime      → Single Node.js process");
  console.log("  One database     → SQLite for simplicity");
  console.log("  Shared infra     → Config, repositories, events, validation");
  console.log("  Independent modules → CQRS per domain boundary");
  console.log();
  console.log("Modules:");
  console.log("  identity         → User registration and profiles");
  console.log("  articles         → Article CRUD with publish workflow");
  console.log("  comments         → Comment on articles");
  console.log("  reactions        → React to articles");
  console.log("  topics           → Topic management and following");
  console.log("  notifications    → Event-driven notifications");
  console.log();
  console.log("Key patterns:");
  console.log("  ✓ CQRS (commands write, queries read)");
  console.log("  ✓ Event-driven cross-module communication");
  console.log("  ✓ Module registration with lifecycle");
  console.log("  ✓ Shared infrastructure (repositories, config)");
  console.log("  ✓ Clear domain boundaries");
  console.log("  ✓ Dependency injection via constructor");
  console.log("  ✓ Type-safe commands and queries");
  console.log();
  console.log("=".repeat(60));
}

bootstrap().catch(console.error);
