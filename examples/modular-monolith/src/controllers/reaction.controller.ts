import type { CommandBus, QueryBus } from "@zudolib/cqrs";
import type { ArticleId, UserId } from "../types/index.js";
import { AddReactionCommand } from "../modules/reactions/commands/add-reaction/add-reaction.command.js";
import { RemoveReactionCommand } from "../modules/reactions/commands/remove-reaction/remove-reaction.command.js";
import { GetReactionsQuery } from "../modules/reactions/queries/get-reactions/get-reactions.query.js";

export class ReactionController {
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }

  public async add(body: { articleId: string; userId: string; type: string }) {
    return this.commandBus.execute(new AddReactionCommand(body as any));
  }

  public async remove(articleId: ArticleId, userId: UserId) {
    await this.commandBus.execute(new RemoveReactionCommand(articleId, userId));
    return { success: true };
  }

  public async get(articleId: ArticleId) {
    return this.queryBus.execute(new GetReactionsQuery(articleId));
  }
}
