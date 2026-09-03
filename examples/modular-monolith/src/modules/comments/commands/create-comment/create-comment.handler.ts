import { CommandHandler } from "@zudo/cqrs";
import type { CreateCommentCommand } from "./create-comment.command.js";
import type { CommentRepository } from "../../../../repositories/comment.repository.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { EventBus } from "@zudo/events";
import type { CommentModel } from "../../../../models/comment.model.js";
import type { CommentId } from "../../../../types/index.js";
import { createCommentId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../../../errors/index.js";
import { CommentCreatedEvent } from "../../../../events/index.js";

export class CreateCommentHandler extends CommandHandler<
  CreateCommentCommand,
  CommentModel
> {
  public readonly commandType = "comments.create" as const;

  private readonly comments: CommentRepository;
  private readonly articles: ArticleRepository;
  private readonly events: EventBus;

  public constructor(
    comments: CommentRepository,
    articles: ArticleRepository,
    events: EventBus,
  ) {
    super();
    this.comments = comments;
    this.articles = articles;
    this.events = events;
  }

  public async execute(command: CreateCommentCommand): Promise<CommentModel> {
    const articleExists = await this.articles.exists(command.data.articleId);
    if (!articleExists) {
      throw new NotFoundError("Article", command.data.articleId);
    }

    const now = new Date();
    const comment: CommentModel = {
      id: createCommentId(randomUUID()),
      articleId: command.data.articleId,
      authorId: command.data.authorId,
      content: command.data.content,
      createdAt: now,
      updatedAt: now,
    };

    await this.comments.save(comment);

    const event = CommentCreatedEvent.create({
      commentId: comment.id,
      articleId: comment.articleId,
      authorId: comment.authorId,
      content: comment.content,
    });

    await this.events.publish(event);

    return comment;
  }
}
