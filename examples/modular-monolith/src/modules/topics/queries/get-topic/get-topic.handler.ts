import { QueryHandler } from "@lattice/cqrs";
import type { GetTopicQuery } from "./get-topic.query.js";
import type { TopicRepository } from "../../../../repositories/topic.repository.js";
import type { TopicModel } from "../../../../models/topic.model.js";

export class GetTopicHandler extends QueryHandler<GetTopicQuery, TopicModel | null> {
  public readonly queryType = "topics.get" as const;

  private readonly topics: TopicRepository;

  public constructor(topics: TopicRepository) {
    super();
    this.topics = topics;
  }

  public async execute(query: GetTopicQuery): Promise<TopicModel | null> {
    return this.topics.findById(query.topicId);
  }
}
