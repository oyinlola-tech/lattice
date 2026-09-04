import { CommandHandler } from "@zudojs/cqrs";
import type { DeleteCommentCommand } from "./delete-comment.command.js";
import type { CommentRepository } from "../../../../repositories/comment.repository.js";
import { NotFoundError, ForbiddenError } from "../../../../errors/index.js";

export class DeleteCommentHandler extends CommandHandler<
  DeleteCommentCommand,
  void
> {
  public readonly commandType = "comments.delete" as const;

  private readonly comments: CommentRepository;

  public constructor(comments: CommentRepository) {
    super();
    this.comments = comments;
  }

  public async execute(command: DeleteCommentCommand): Promise<void> {
    const comment = await this.comments.findById(command.commentId);
    if (!comment) {
      throw new NotFoundError("Comment", command.commentId);
    }

    if (comment.authorId !== command.userId) {
      throw new ForbiddenError("You can only delete your own comments");
    }

    await this.comments.delete(command.commentId);
  }
}
