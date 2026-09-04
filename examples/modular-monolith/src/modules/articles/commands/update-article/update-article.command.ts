import { Command } from "@zudojs/cqrs";
import type { UpdateArticleDto } from "../../../../dtos/index.js";
import type { ArticleId, UserId } from "../../../../types/index.js";

export class UpdateArticleCommand extends Command<"articles.update"> {
  public readonly articleId: ArticleId;
  public readonly userId: UserId;
  public readonly data: UpdateArticleDto;

  public constructor(
    articleId: ArticleId,
    userId: UserId,
    data: UpdateArticleDto,
  ) {
    super("articles.update");
    this.articleId = articleId;
    this.userId = userId;
    this.data = data;
  }
}
