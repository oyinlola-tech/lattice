import { CommandBus, QueryBus } from "@lattice/cqrs";
import type { EventBus } from "@lattice/events";
import type { ReactionRepository } from "../../repositories/reaction.repository.js";
import type { ArticleRepository } from "../../repositories/article.repository.js";
import { AddReactionHandler } from "./commands/add-reaction/add-reaction.handler.js";
import { RemoveReactionHandler } from "./commands/remove-reaction/remove-reaction.handler.js";
import { GetReactionsHandler } from "./queries/get-reactions/get-reactions.handler.js";

export interface ReactionsModuleConfig {
  readonly reactions: ReactionRepository;
  readonly articles: ArticleRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
}

export function registerReactionsModule(config: ReactionsModuleConfig): void {
  const { reactions, articles, commandBus, queryBus, events } = config;

  const addHandler = new AddReactionHandler(reactions, articles, events);
  const removeHandler = new RemoveReactionHandler(reactions);
  const getHandler = new GetReactionsHandler(reactions);

  commandBus.register("reactions.add", addHandler);
  commandBus.register("reactions.remove", removeHandler);

  queryBus.register("reactions.get", getHandler);
}
