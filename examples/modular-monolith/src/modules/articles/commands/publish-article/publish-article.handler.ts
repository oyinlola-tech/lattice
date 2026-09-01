import { CommandHandler } from "@oyinlola141/lattice-cqrs";
import type { PublishArticleCommand } from "./publish-article.command.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { EventBus } from "@oyinlola141/lattice-events";
import { NotFoundError, ForbiddenError } from "../../../../errors/index.js";
import { ArticleStatus } from "../../../../enums/index.js";
import { ArticlePublishedEvent } from "../../../../events/index.js";

export class PublishArticleHandler extends CommandHandler<
  PublishArticleCommand,
  void
> {
  public readonly commandType = "articles.publish" as const;

  private readonly articles: ArticleRepository;
  private readonly events: EventBus;

  public constructor(articles: ArticleRepository, events: EventBus) {
    super();
    this.articles = articles;
    this.events = events;
  }

  public async execute(command: PublishArticleCommand): Promise<void> {
    const article = await this.articles.findById(command.articleId);
    if (!article) {
      throw new NotFoundError("Article", command.articleId);
    }

    if (article.authorId !== command.userId) {
      throw new ForbiddenError("You can only publish your own articles");
    }

    await this.articles.update(command.articleId, {
      status: ArticleStatus.PUBLISHED,
    });

    const event = ArticlePublishedEvent.create({
      articleId: article.id,
      authorId: article.authorId,
      topicId: article.topicId,
      title: article.title,
    });

    await this.events.publish(event);
  }
}
