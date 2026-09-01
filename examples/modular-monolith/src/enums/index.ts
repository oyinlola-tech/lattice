export enum UserRole {
  USER = "user",
  ADMIN = "admin",
  MODERATOR = "moderator",
}

export enum ArticleStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ARCHIVED = "archived",
}

export enum ReactionType {
  LIKE = "like",
  LOVE = "love",
  INSIGHTFUL = "insightful",
  DISAGREE = "disagree",
}

export enum NotificationType {
  ARTICLE_CREATED = "article.created",
  COMMENT_CREATED = "comment.created",
  REACTION_ADDED = "reaction.added",
  TOPIC_FOLLOWED = "topic.followed",
  ARTICLE_PUBLISHED = "article.published",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
}
