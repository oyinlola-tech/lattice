import { Command } from "@zudo/cqrs";
import type { CreateTopicDto } from "../../../../dtos/index.js";

export class CreateTopicCommand extends Command<"topics.create"> {
  public readonly data: CreateTopicDto;

  public constructor(data: CreateTopicDto) {
    super("topics.create");
    this.data = data;
  }
}
