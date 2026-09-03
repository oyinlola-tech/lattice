import { Query } from "@zudoliblib/cqrs";
import type { TopicId } from "../../../../types/index.js";
import type { ArticleStatus } from "../../../../enums/index.js";

export class ListArticlesQuery extends Query<"articles.list"> {
  public readonly topicId?: TopicId;
  public readonly status?: ArticleStatus;
  public readonly limit: number;
  public readonly offset: number;

  public constructor(
    options: {
      topicId?: TopicId;
      status?: ArticleStatus;
      limit?: number;
      offset?: number;
    } = {},
  ) {
    super("articles.list");
    this.topicId = options.topicId;
    this.status = options.status;
    this.limit = options.limit ?? 20;
    this.offset = options.offset ?? 0;
  }
}
