import type { CommentId, ArticleId, UserId } from "../types/index.js";

export interface CommentModel {
  readonly id: CommentId;
  readonly articleId: ArticleId;
  readonly authorId: UserId;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
