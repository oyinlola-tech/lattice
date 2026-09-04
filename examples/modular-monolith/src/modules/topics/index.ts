import { CommandBus, QueryBus } from "@zudojs/cqrs";
import type { EventBus } from "@zudojs/events";
import type {
  TopicRepository,
  TopicFollowerRepository,
} from "../../repositories/topic.repository.js";
import { CreateTopicHandler } from "./commands/create-topic/create-topic.handler.js";
import { FollowTopicHandler } from "./commands/follow-topic/follow-topic.handler.js";
import { GetTopicHandler } from "./queries/get-topic/get-topic.handler.js";
import { ListTopicsHandler } from "./queries/list-topics/list-topics.handler.js";

export interface TopicsModuleConfig {
  readonly topics: TopicRepository;
  readonly followers: TopicFollowerRepository;
  readonly commandBus: CommandBus;
  readonly queryBus: QueryBus;
  readonly events: EventBus;
}

export function registerTopicsModule(config: TopicsModuleConfig): void {
  const { topics, followers, commandBus, queryBus, events } = config;

  const createHandler = new CreateTopicHandler(topics);
  const followHandler = new FollowTopicHandler(topics, followers, events);
  const getHandler = new GetTopicHandler(topics);
  const listHandler = new ListTopicsHandler(topics);

  commandBus.register("topics.create", createHandler);
  commandBus.register("topics.follow", followHandler);

  queryBus.register("topics.get", getHandler);
  queryBus.register("topics.list", listHandler);
}
