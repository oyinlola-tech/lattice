import type { ArticleId, UserId, TopicId } from "../types/index.js";
import type { ArticleStatus } from "../enums/index.js";

export interface ArticleModel {
  readonly id: ArticleId;
  readonly authorId: UserId;
  readonly topicId: TopicId;
  readonly title: string;
  readonly content: string;
  readonly status: ArticleStatus;
  readonly viewCount: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly publishedAt: Date | null;
}
