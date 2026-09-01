export type UserId = string & { readonly __brand: "UserId" };
export type ArticleId = string & { readonly __brand: "ArticleId" };
export type CommentId = string & { readonly __brand: "CommentId" };
export type ReactionId = string & { readonly __brand: "ReactionId" };
export type TopicId = string & { readonly __brand: "TopicId" };
export type NotificationId = string & { readonly __brand: "NotificationId" };

export function createUserId(id: string): UserId {
  return id as UserId;
}
export function createArticleId(id: string): ArticleId {
  return id as ArticleId;
}
export function createCommentId(id: string): CommentId {
  return id as CommentId;
}
export function createReactionId(id: string): ReactionId {
  return id as ReactionId;
}
export function createTopicId(id: string): TopicId {
  return id as TopicId;
}
export function createNotificationId(id: string): NotificationId {
  return id as NotificationId;
}
