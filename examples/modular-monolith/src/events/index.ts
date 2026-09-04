import { defineEvent } from "@zudojs/events";
import type { UserId, ArticleId, TopicId } from "../types/index.js";

export const ArticleCreatedEvent = defineEvent<
  "article.created",
  {
    readonly articleId: ArticleId;
    readonly authorId: UserId;
    readonly topicId: TopicId;
    readonly title: string;
  }
>("article.created");

export const ArticlePublishedEvent = defineEvent<
  "article.published",
  {
    readonly articleId: ArticleId;
    readonly authorId: UserId;
    readonly topicId: TopicId;
    readonly title: string;
  }
>("article.published");

export const ArticleDeletedEvent = defineEvent<
  "article.deleted",
  {
    readonly articleId: ArticleId;
    readonly authorId: UserId;
  }
>("article.deleted");

export const CommentCreatedEvent = defineEvent<
  "comment.created",
  {
    readonly commentId: string;
    readonly articleId: ArticleId;
    readonly authorId: UserId;
    readonly content: string;
  }
>("comment.created");

export const TopicFollowedEvent = defineEvent<
  "topic.followed",
  {
    readonly topicId: TopicId;
    readonly userId: UserId;
    readonly topicName: string;
  }
>("topic.followed");

export const ReactionAddedEvent = defineEvent<
  "reaction.added",
  {
    readonly articleId: ArticleId;
    readonly userId: UserId;
    readonly reactionType: string;
  }
>("reaction.added");
