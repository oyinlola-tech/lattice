import { Command } from "@lattice/cqrs";
import type { CreateNotificationDto } from "../../../../dtos/index.js";

export class CreateNotificationCommand extends Command<"notifications.create"> {
  public readonly data: CreateNotificationDto;

  public constructor(data: CreateNotificationDto) {
    super("notifications.create");
    this.data = data;
  }
}
