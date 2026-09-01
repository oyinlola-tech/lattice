import type { CommandBus, QueryBus } from "@oyinlola141/lattice-cqrs";
import type { ArticleId, CommentId, UserId } from "../types/index.js";
import { CreateCommentCommand } from "../modules/comments/commands/create-comment/create-comment.command.js";
import { UpdateCommentCommand } from "../modules/comments/commands/update-comment/update-comment.command.js";
import { DeleteCommentCommand } from "../modules/comments/commands/delete-comment/delete-comment.command.js";
import { ListCommentsQuery } from "../modules/comments/queries/list-comments/list-comments.query.js";

export class CommentController {
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }

  public async create(body: { articleId: string; authorId: string; content: string }) {
    return this.commandBus.execute(new CreateCommentCommand(body as any));
  }

  public async list(articleId: ArticleId) {
    return this.queryBus.execute(new ListCommentsQuery(articleId));
  }

  public async update(commentId: CommentId, userId: UserId, body: { content: string }) {
    await this.commandBus.execute(new UpdateCommentCommand(commentId, userId, body.content));
    return { success: true };
  }

  public async delete(commentId: CommentId, userId: UserId) {
    await this.commandBus.execute(new DeleteCommentCommand(commentId, userId));
    return { success: true };
  }
}
