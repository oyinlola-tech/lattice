import { CommandHandler } from "@lattice/cqrs";
import type { AddReactionCommand } from "./add-reaction.command.js";
import type { ReactionRepository } from "../../../../repositories/reaction.repository.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import type { EventBus } from "@lattice/events";
import type { ReactionModel } from "../../../../models/reaction.model.js";
import type { ReactionId } from "../../../../types/index.js";
import { ReactionType } from "../../../../enums/index.js";
import { createReactionId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";
import { NotFoundError } from "../../../../errors/index.js";
import { ReactionAddedEvent } from "../../../../events/index.js";

export class AddReactionHandler extends CommandHandler<AddReactionCommand, ReactionModel> {
  public readonly commandType = "reactions.add" as const;

  private readonly reactions: ReactionRepository;
  private readonly articles: ArticleRepository;
  private readonly events: EventBus;

  public constructor(reactions: ReactionRepository, articles: ArticleRepository, events: EventBus) {
    super();
    this.reactions = reactions;
    this.articles = articles;
    this.events = events;
  }

  public async execute(command: AddReactionCommand): Promise<ReactionModel> {
    const articleExists = await this.articles.exists(command.data.articleId);
    if (!articleExists) {
      throw new NotFoundError("Article", command.data.articleId);
    }

    const now = new Date();
    const reaction: ReactionModel = {
      id: createReactionId(randomUUID()),
      articleId: command.data.articleId,
      userId: command.data.userId,
      type: command.data.type as ReactionType,
      createdAt: now,
    };

    await this.reactions.save(reaction);

    const event = ReactionAddedEvent.create({
      articleId: reaction.articleId,
      userId: reaction.userId,
      reactionType: reaction.type,
    });

    await this.events.publish(event);

    return reaction;
  }
}
