import { CommandHandler } from "@oyinlola141/lattice-cqrs";
import type { CreateTopicCommand } from "./create-topic.command.js";
import type { TopicRepository } from "../../../../repositories/topic.repository.js";
import type { TopicModel } from "../../../../models/topic.model.js";
import type { TopicId } from "../../../../types/index.js";
import { createTopicId } from "../../../../types/index.js";
import { randomUUID } from "node:crypto";
import { ConflictError } from "../../../../errors/index.js";

export class CreateTopicHandler extends CommandHandler<CreateTopicCommand, TopicModel> {
  public readonly commandType = "topics.create" as const;

  private readonly topics: TopicRepository;

  public constructor(topics: TopicRepository) {
    super();
    this.topics = topics;
  }

  public async execute(command: CreateTopicCommand): Promise<TopicModel> {
    const existing = await this.topics.findByName(command.data.name);
    if (existing) {
      throw new ConflictError(`A topic with name "${command.data.name}" already exists`);
    }

    const now = new Date();
    const topic: TopicModel = {
      id: createTopicId(randomUUID()),
      name: command.data.name,
      description: command.data.description ?? "",
      followerCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    await this.topics.save(topic);
    return topic;
  }
}
