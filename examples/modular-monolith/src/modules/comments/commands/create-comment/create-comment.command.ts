import { Command } from "@zudoliblib/cqrs";
import type { CreateCommentDto } from "../../../../dtos/index.js";

export class CreateCommentCommand extends Command<"comments.create"> {
  public readonly data: CreateCommentDto;

  public constructor(data: CreateCommentDto) {
    super("comments.create");
    this.data = data;
  }
}
