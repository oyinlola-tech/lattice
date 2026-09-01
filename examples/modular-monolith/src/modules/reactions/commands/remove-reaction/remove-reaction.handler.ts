import { CommandHandler } from "@lattice/cqrs";
import type { RemoveReactionCommand } from "./remove-reaction.command.js";
import type { ReactionRepository } from "../../../../repositories/reaction.repository.js";

export class RemoveReactionHandler extends CommandHandler<RemoveReactionCommand, void> {
  public readonly commandType = "reactions.remove" as const;

  private readonly reactions: ReactionRepository;

  public constructor(reactions: ReactionRepository) {
    super();
    this.reactions = reactions;
  }

  public async execute(command: RemoveReactionCommand): Promise<void> {
    await this.reactions.delete(command.userId, command.articleId);
  }
}
