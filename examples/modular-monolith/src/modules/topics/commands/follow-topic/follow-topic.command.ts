import { Command } from "@zudolib/cqrs";
import type { FollowTopicDto } from "../../../../dtos/index.js";

export class FollowTopicCommand extends Command<"topics.follow"> {
  public readonly data: FollowTopicDto;

  public constructor(data: FollowTopicDto) {
    super("topics.follow");
    this.data = data;
  }
}
