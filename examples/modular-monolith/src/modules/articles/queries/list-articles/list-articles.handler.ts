import { QueryHandler } from "@zudolib/cqrs";
import type { ListArticlesQuery } from "./list-articles.query.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { ArticleModel } from "../../../../models/article.model.js";
import { ArticleStatus } from "../../../../enums/index.js";

export class ListArticlesHandler extends QueryHandler<
  ListArticlesQuery,
  readonly ArticleModel[]
> {
  public readonly queryType = "articles.list" as const;

  private readonly articles: ArticleRepository;

  public constructor(articles: ArticleRepository) {
    super();
    this.articles = articles;
  }

  public async execute(
    query: ListArticlesQuery,
  ): Promise<readonly ArticleModel[]> {
    if (query.topicId) {
      return this.articles.findByTopic(query.topicId);
    }

    if (query.status) {
      return this.articles.findByStatus(query.status);
    }

    return this.articles.findByStatus(ArticleStatus.PUBLISHED);
  }
}
