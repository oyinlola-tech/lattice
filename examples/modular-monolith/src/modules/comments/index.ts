import { CommandBus, QueryBus } from "@lattice/cqrs";
import type { EventBus } from "@lattice/events";
import type { CommentRepository } from "../../repositories/comment.repository.js";
import type { ArticleRepository } from "../../repositories/article.repository.js";
import { CreateCommentHandler } from "./commands/create-comment/create-comment.handler.js";
import { UpdateCommentHandler } from "./commands/update-comment/update-comment.handler.js";
import { DeleteCommentHandler } from "./commands/delete-comment/delete-comment.handler.js";
import { ListCommentsHandler } from "./queries/list-comments/list-comments.handler.js";

export interface CommentsModuleConfig {
  readonly comments: CommentRepository;
  readonly articles: ArticleRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
}

export function registerCommentsModule(config: CommentsModuleConfig): void {
  const { comments, articles, commandBus, queryBus, events } = config;

  const createHandler = new CreateCommentHandler(comments, articles, events);
  const updateHandler = new UpdateCommentHandler(comments);
  const deleteHandler = new DeleteCommentHandler(comments);
  const listHandler = new ListCommentsHandler(comments);

  commandBus.register("comments.create", createHandler);
  commandBus.register("comments.update", updateHandler);
  commandBus.register("comments.delete", deleteHandler);

  queryBus.register("comments.list", listHandler);
}
