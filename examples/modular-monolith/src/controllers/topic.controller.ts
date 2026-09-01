import type { CommandBus, QueryBus } from "@lattice/cqrs";
import type { TopicId, UserId } from "../types/index.js";
import { CreateTopicCommand } from "../modules/topics/commands/create-topic/create-topic.command.js";
import { FollowTopicCommand } from "../modules/topics/commands/follow-topic/follow-topic.command.js";
import { GetTopicQuery } from "../modules/topics/queries/get-topic/get-topic.query.js";
import { ListTopicsQuery } from "../modules/topics/queries/list-topics/list-topics.query.js";

export class TopicController {
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor(commandBus: CommandBus, queryBus: QueryBus) {
    this.commandBus = commandBus;
    this.queryBus = queryBus;
  }

  public async create(body: { name: string; description?: string }) {
    return this.commandBus.execute(new CreateTopicCommand(body));
  }

  public async get(topicId: TopicId) {
    return this.queryBus.execute(new GetTopicQuery(topicId));
  }

  public async list() {
    return this.queryBus.execute(new ListTopicsQuery());
  }

  public async follow(body: { userId: string; topicId: string }) {
    await this.commandBus.execute(new FollowTopicCommand(body as any));
    return { success: true };
  }
}
