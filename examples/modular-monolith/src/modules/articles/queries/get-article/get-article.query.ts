import { Query } from "@oyinlola141/lattice-cqrs";
import type { ArticleId } from "../../../../types/index.js";

export class GetArticleQuery extends Query<"articles.get"> {
  public readonly articleId: ArticleId;

  public constructor(articleId: ArticleId) {
    super("articles.get");
    this.articleId = articleId;
  }
}
