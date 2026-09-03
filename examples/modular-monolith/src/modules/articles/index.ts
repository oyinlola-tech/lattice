import { CommandBus, QueryBus } from "@zudoliblib/cqrs";
import type { EventBus } from "@zudoliblib/events";
import type { ArticleRepository } from "../../repositories/article.repository.js";
import { CreateArticleHandler } from "./commands/create-article/create-article.handler.js";
import { UpdateArticleHandler } from "./commands/update-article/update-article.handler.js";
import { PublishArticleHandler } from "./commands/publish-article/publish-article.handler.js";
import { DeleteArticleHandler } from "./commands/delete-article/delete-article.handler.js";
import { GetArticleHandler } from "./queries/get-article/get-article.handler.js";
import { ListArticlesHandler } from "./queries/list-articles/list-articles.handler.js";
import { SearchArticlesHandler } from "./queries/search-articles/search-articles.handler.js";

export interface ArticlesModuleConfig {
  readonly articles: ArticleRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
}

export function registerArticlesModule(config: ArticlesModuleConfig): void {
  const { articles, commandBus, queryBus, events } = config;

  const createHandler = new CreateArticleHandler(articles, events);
  const updateHandler = new UpdateArticleHandler(articles);
  const publishHandler = new PublishArticleHandler(articles, events);
  const deleteHandler = new DeleteArticleHandler(articles, events);
  const getHandler = new GetArticleHandler(articles);
  const listHandler = new ListArticlesHandler(articles);
  const searchHandler = new SearchArticlesHandler(articles);

  commandBus.register("articles.create", createHandler);
  commandBus.register("articles.update", updateHandler);
  commandBus.register("articles.publish", publishHandler);
  commandBus.register("articles.delete", deleteHandler);

  queryBus.register("articles.get", getHandler);
  queryBus.register("articles.list", listHandler);
  queryBus.register("articles.search", searchHandler);
}
