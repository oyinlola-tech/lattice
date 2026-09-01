import type {
  UserId,
  ArticleId,
  CommentId,
  ReactionId,
  TopicId,
  NotificationId,
} from "../types/index.js";

export interface CreateUserDto {
  readonly email: string;
  readonly name: string;
  readonly bio?: string;
}

export interface UpdateProfileDto {
  readonly name?: string;
  readonly bio?: string;
  readonly avatar?: string;
}

export interface CreateArticleDto {
  readonly authorId: UserId;
  readonly topicId: TopicId;
  readonly title: string;
  readonly content: string;
}

export interface UpdateArticleDto {
  readonly title?: string;
  readonly content?: string;
}

export interface CreateCommentDto {
  readonly articleId: ArticleId;
  readonly authorId: UserId;
  readonly content: string;
}

export interface UpdateCommentDto {
  readonly content: string;
}

export interface AddReactionDto {
  readonly articleId: ArticleId;
  readonly userId: UserId;
  readonly type: string;
}

export interface CreateTopicDto {
  readonly name: string;
  readonly description?: string;
}

export interface FollowTopicDto {
  readonly userId: UserId;
  readonly topicId: TopicId;
}

export interface CreateNotificationDto {
  readonly userId: UserId;
  readonly type: string;
  readonly title: string;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
}
