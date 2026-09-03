import { Command } from "@zudoliblib/cqrs";
import type { ArticleId, UserId } from "../../../../types/index.js";

export class DeleteArticleCommand extends Command<"articles.delete"> {
  public readonly articleId: ArticleId;
  public readonly userId: UserId;

  public constructor(articleId: ArticleId, userId: UserId) {
    super("articles.delete");
    this.articleId = articleId;
    this.userId = userId;
  }
}
