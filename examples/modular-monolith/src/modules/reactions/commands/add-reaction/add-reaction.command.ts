import { Command } from "@zudoliblib/cqrs";
import type { AddReactionDto } from "../../../../dtos/index.js";

export class AddReactionCommand extends Command<"reactions.add"> {
  public readonly data: AddReactionDto;

  public constructor(data: AddReactionDto) {
    super("reactions.add");
    this.data = data;
  }
}
