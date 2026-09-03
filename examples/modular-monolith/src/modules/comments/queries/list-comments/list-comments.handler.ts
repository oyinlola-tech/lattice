import { QueryHandler } from "@zudoliblib/cqrs";
import type { ListCommentsQuery } from "./list-comments.query.js";
import type { CommentRepository } from "../../../../repositories/comment.repository.js";
import type { CommentModel } from "../../../../models/comment.model.js";

export class ListCommentsHandler extends QueryHandler<
  ListCommentsQuery,
  readonly CommentModel[]
> {
  public readonly queryType = "comments.list" as const;

  private readonly comments: CommentRepository;

  public constructor(comments: CommentRepository) {
    super();
    this.comments = comments;
  }

  public async execute(
    query: ListCommentsQuery,
  ): Promise<readonly CommentModel[]> {
    return this.comments.findByArticle(query.articleId);
  }
}
