import { QueryHandler } from "@oyinlola141/lattice-cqrs";
import type { ListTopicsQuery } from "./list-topics.query.js";
import type { TopicRepository } from "../../../../repositories/topic.repository.js";
import type { TopicModel } from "../../../../models/topic.model.js";

export class ListTopicsHandler extends QueryHandler<ListTopicsQuery, readonly TopicModel[]> {
  public readonly queryType = "topics.list" as const;

  private readonly topics: TopicRepository;

  public constructor(topics: TopicRepository) {
    super();
    this.topics = topics;
  }

  public async execute(_query: ListTopicsQuery): Promise<readonly TopicModel[]> {
    return this.topics.findAll();
  }
}
