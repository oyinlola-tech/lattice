import { CommandHandler } from "@oyinlola141/lattice-cqrs";
import type { UpdateCommentCommand } from "./update-comment.command.js";
import type { CommentRepository } from "../../../../repositories/comment.repository.js";
import { NotFoundError, ForbiddenError } from "../../../../errors/index.js";

export class UpdateCommentHandler extends CommandHandler<UpdateCommentCommand, void> {
  public readonly commandType = "comments.update" as const;

  private readonly comments: CommentRepository;

  public constructor(comments: CommentRepository) {
    super();
    this.comments = comments;
  }

  public async execute(command: UpdateCommentCommand): Promise<void> {
    const comment = await this.comments.findById(command.commentId);
    if (!comment) {
      throw new NotFoundError("Comment", command.commentId);
    }

    if (comment.authorId !== command.userId) {
      throw new ForbiddenError("You can only update your own comments");
    }

    await this.comments.update(command.commentId, { content: command.content });
  }
}
