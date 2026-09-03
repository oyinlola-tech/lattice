import { CommandHandler } from "@zudo/cqrs";
import type { FollowTopicCommand } from "./follow-topic.command.js";
import type {
  TopicRepository,
  TopicFollowerRepository,
} from "../../../../repositories/topic.repository.js";
import type { EventBus } from "@zudo/events";
import { NotFoundError } from "../../../../errors/index.js";
import { TopicFollowedEvent } from "../../../../events/index.js";

export class FollowTopicHandler extends CommandHandler<
  FollowTopicCommand,
  void
> {
  public readonly commandType = "topics.follow" as const;

  private readonly topics: TopicRepository;
  private readonly followers: TopicFollowerRepository;
  private readonly events: EventBus;

  public constructor(
    topics: TopicRepository,
    followers: TopicFollowerRepository,
    events: EventBus,
  ) {
    super();
    this.topics = topics;
    this.followers = followers;
    this.events = events;
  }

  public async execute(command: FollowTopicCommand): Promise<void> {
    const topic = await this.topics.findById(command.data.topicId);
    if (!topic) {
      throw new NotFoundError("Topic", command.data.topicId);
    }

    const alreadyFollowing = await this.followers.isFollowing(
      command.data.userId,
      command.data.topicId,
    );
    if (!alreadyFollowing) {
      await this.followers.follow(command.data.userId, command.data.topicId);
      await this.topics.incrementFollowerCount(command.data.topicId);

      const event = TopicFollowedEvent.create({
        topicId: command.data.topicId,
        userId: command.data.userId,
        topicName: topic.name,
      });

      await this.events.publish(event);
    }
  }
}
