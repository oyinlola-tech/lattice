import { Query } from "@oyinlola141/lattice-cqrs";
import type { ArticleId } from "../../../../types/index.js";

export class ListCommentsQuery extends Query<"comments.list"> {
  public readonly articleId: ArticleId;

  public constructor(articleId: ArticleId) {
    super("comments.list");
    this.articleId = articleId;
  }
}
