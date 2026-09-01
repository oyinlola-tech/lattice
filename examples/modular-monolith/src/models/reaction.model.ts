import type { ReactionId, ArticleId, UserId } from "../types/index.js";
import type { ReactionType } from "../enums/index.js";

export interface ReactionModel {
  readonly id: ReactionId;
  readonly articleId: ArticleId;
  readonly userId: UserId;
  readonly type: ReactionType;
  readonly createdAt: Date;
}
