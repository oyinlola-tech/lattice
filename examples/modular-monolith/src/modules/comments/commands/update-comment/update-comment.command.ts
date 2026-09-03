import { Command } from "@zudoliblib/cqrs";
import type { CommentId, UserId } from "../../../../types/index.js";

export class UpdateCommentCommand extends Command<"comments.update"> {
  public readonly commentId: CommentId;
  public readonly userId: UserId;
  public readonly content: string;

  public constructor(commentId: CommentId, userId: UserId, content: string) {
    super("comments.update");
    this.commentId = commentId;
    this.userId = userId;
    this.content = content;
  }
}
