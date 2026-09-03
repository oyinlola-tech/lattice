import { Command } from "@zudoliblib/cqrs";
import type { ArticleId, UserId } from "../../../../types/index.js";

export class RemoveReactionCommand extends Command<"reactions.remove"> {
  public readonly articleId: ArticleId;
  public readonly userId: UserId;

  public constructor(articleId: ArticleId, userId: UserId) {
    super("reactions.remove");
    this.articleId = articleId;
    this.userId = userId;
  }
}
