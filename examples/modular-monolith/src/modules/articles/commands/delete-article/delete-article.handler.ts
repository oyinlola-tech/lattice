import { CommandHandler } from "@oyinlola141/lattice-cqrs";
import type { DeleteArticleCommand } from "./delete-article.command.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { EventBus } from "@oyinlola141/lattice-events";
import { NotFoundError, ForbiddenError } from "../../../../errors/index.js";
import { ArticleDeletedEvent } from "../../../../events/index.js";

export class DeleteArticleHandler extends CommandHandler<DeleteArticleCommand, void> {
  public readonly commandType = "articles.delete" as const;

  private readonly articles: ArticleRepository;
  private readonly events: EventBus;

  public constructor(articles: ArticleRepository, events: EventBus) {
    super();
    this.articles = articles;
    this.events = events;
  }

  public async execute(command: DeleteArticleCommand): Promise<void> {
    const article = await this.articles.findById(command.articleId);
    if (!article) {
      throw new NotFoundError("Article", command.articleId);
    }

    if (article.authorId !== command.userId) {
      throw new ForbiddenError("You can only delete your own articles");
    }

    await this.articles.delete(command.articleId);

    const event = ArticleDeletedEvent.create({
      articleId: article.id,
      authorId: article.authorId,
    });

    await this.events.publish(event);
  }
}
