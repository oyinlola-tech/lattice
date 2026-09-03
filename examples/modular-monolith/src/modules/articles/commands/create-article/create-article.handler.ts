import { CommandHandler } from "@zudo/cqrs";
import type { CreateArticleCommand } from "./create-article.command.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { EventBus } from "@zudo/events";
import type { ArticleModel } from "../../../../models/article.model.js";
import type { ArticleId } from "../../../../types/index.js";
import { ArticleStatus } from "../../../../enums/index.js";
import { createArticleId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";
import { ArticleCreatedEvent } from "../../../../events/index.js";

export class CreateArticleHandler extends CommandHandler<
  CreateArticleCommand,
  ArticleModel
> {
  public readonly commandType = "articles.create" as const;

  private readonly articles: ArticleRepository;
  private readonly events: EventBus;

  public constructor(articles: ArticleRepository, events: EventBus) {
    super();
    this.articles = articles;
    this.events = events;
  }

  public async execute(command: CreateArticleCommand): Promise<ArticleModel> {
    const now = new Date();
    const article: ArticleModel = {
      id: createArticleId(randomUUID()),
      authorId: command.data.authorId,
      topicId: command.data.topicId,
      title: command.data.title,
      content: command.data.content,
      status: ArticleStatus.DRAFT,
      viewCount: 0,
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
    };

    await this.articles.save(article);

    const event = ArticleCreatedEvent.create({
      articleId: article.id,
      authorId: article.authorId,
      topicId: article.topicId,
      title: article.title,
    });

    await this.events.publish(event);

    return article;
  }
}
