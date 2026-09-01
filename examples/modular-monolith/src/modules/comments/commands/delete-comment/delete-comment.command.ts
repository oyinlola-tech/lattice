import { Command } from "@lattice/cqrs";
import type { CommentId, UserId } from "../../../../types/index.js";

export class DeleteCommentCommand extends Command<"comments.delete"> {
  public readonly commentId: CommentId;
  public readonly userId: UserId;

  public constructor(commentId: CommentId, userId: UserId) {
    super("comments.delete");
    this.commentId = commentId;
    this.userId = userId;
  }
}
