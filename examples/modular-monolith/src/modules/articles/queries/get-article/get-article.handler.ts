import { QueryHandler } from "@oyinlola141/lattice-cqrs";
import type { GetArticleQuery } from "./get-article.query.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { ArticleModel } from "../../../../models/article.model.js";

export class GetArticleHandler extends QueryHandler<
  GetArticleQuery,
  ArticleModel | null
> {
  public readonly queryType = "articles.get" as const;

  private readonly articles: ArticleRepository;

  public constructor(articles: ArticleRepository) {
    super();
    this.articles = articles;
  }

  public async execute(query: GetArticleQuery): Promise<ArticleModel | null> {
    const article = await this.articles.findById(query.articleId);
    if (article) {
      await this.articles.incrementViewCount(query.articleId);
    }
    return article;
  }
}
