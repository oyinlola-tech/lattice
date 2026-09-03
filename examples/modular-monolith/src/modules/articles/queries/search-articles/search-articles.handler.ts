import { QueryHandler } from "@zudoliblib/cqrs";
import type { SearchArticlesQuery } from "./search-articles.query.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { ArticleModel } from "../../../../models/article.model.js";

export class SearchArticlesHandler extends QueryHandler<
  SearchArticlesQuery,
  readonly ArticleModel[]
> {
  public readonly queryType = "articles.search" as const;

  private readonly articles: ArticleRepository;

  public constructor(articles: ArticleRepository) {
    super();
    this.articles = articles;
  }

  public async execute(
    query: SearchArticlesQuery,
  ): Promise<readonly ArticleModel[]> {
    return this.articles.search(query.searchTerm);
  }
}
