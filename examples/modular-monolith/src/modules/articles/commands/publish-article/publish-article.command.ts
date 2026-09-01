import { Command } from "@oyinlola141/lattice-cqrs";
import type { ArticleId, UserId } from "../../../../types/index.js";

export class PublishArticleCommand extends Command<"articles.publish"> {
  public readonly articleId: ArticleId;
  public readonly userId: UserId;

  public constructor(articleId: ArticleId, userId: UserId) {
    super("articles.publish");
    this.articleId = articleId;
    this.userId = userId;
  }
}
