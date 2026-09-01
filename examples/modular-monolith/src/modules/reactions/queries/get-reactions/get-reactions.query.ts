import { Query } from "@oyinlola141/lattice-cqrs";
import type { ArticleId } from "../../../../types/index.js";

export class GetReactionsQuery extends Query<"reactions.get"> {
  public readonly articleId: ArticleId;

  public constructor(articleId: ArticleId) {
    super("reactions.get");
    this.articleId = articleId;
  }
}
