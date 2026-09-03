import type { CommandBus, QueryBus } from "@zudolib/cqrs";
import type { ArticleId, UserId, TopicId } from "../types/index.js";
import { CreateArticleCommand } from "../modules/articles/commands/create-article/create-article.command.js";
import { UpdateArticleCommand } from "../modules/articles/commands/update-article/update-article.command.js";
import { PublishArticleCommand } from "../modules/articles/commands/publish-article/publish-article.command.js";
import { DeleteArticleCommand } from "../modules/articles/commands/delete-article/delete-article.command.js";
import { GetArticleQuery } from "../modules/articles/queries/get-article/get-article.query.js";
import { ListArticlesQuery } from "../modules/articles/queries/list-articles/list-articles.query.js";
import { SearchArticlesQuery } from "../modules/articles/queries/search-articles/search-articles.query.js";

export class ArticleController {
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }

  public async create(body: {
    authorId: string;
    topicId: string;
    title: string;
    content: string;
  }) {
    return this.commandBus.execute(new CreateArticleCommand(body as any));
  }

  public async get(articleId: ArticleId) {
    return this.queryBus.execute(new GetArticleQuery(articleId));
  }

  public async list(options: {
    topicId?: TopicId;
    status?: string;
    limit?: number;
    offset?: number;
  }) {
    return this.queryBus.execute(new ListArticlesQuery(options as any));
  }

  public async search(searchTerm: string) {
    return this.queryBus.execute(new SearchArticlesQuery(searchTerm));
  }

  public async update(
    articleId: ArticleId,
    userId: UserId,
    body: { title?: string; content?: string },
  ) {
    await this.commandBus.execute(
      new UpdateArticleCommand(articleId, userId, body),
    );
    return { success: true };
  }

  public async publish(articleId: ArticleId, userId: UserId) {
    await this.commandBus.execute(new PublishArticleCommand(articleId, userId));
    return { success: true };
  }

  public async delete(articleId: ArticleId, userId: UserId) {
    await this.commandBus.execute(new DeleteArticleCommand(articleId, userId));
    return { success: true };
  }
}
