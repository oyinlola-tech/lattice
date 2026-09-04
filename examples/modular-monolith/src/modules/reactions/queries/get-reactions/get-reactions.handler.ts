import { QueryHandler } from "@zudojs/cqrs";
import type { GetReactionsQuery } from "./get-reactions.query.js";
import type { ReactionRepository } from "../../../../repositories/reaction.repository.js";
import type { ReactionModel } from "../../../../models/reaction.model.js";
import type { ReactionType } from "../../../../enums/index.js";

export interface ReactionsByArticleResult {
  readonly reactions: readonly ReactionModel[];
  readonly counts: Record<ReactionType, number>;
}

export class GetReactionsHandler extends QueryHandler<
  GetReactionsQuery,
  ReactionsByArticleResult
> {
  public readonly queryType = "reactions.get" as const;

  private readonly reactions: ReactionRepository;

  public constructor(reactions: ReactionRepository) {
    super();
    this.reactions = reactions;
  }

  public async execute(
    query: GetReactionsQuery,
  ): Promise<ReactionsByArticleResult> {
    const reactions = await this.reactions.findByArticle(query.articleId);
    const counts = await this.reactions.countByArticle(query.articleId);

    return { reactions, counts };
  }
}
