import { Command } from "@zudoliblib/cqrs";
import type { UpdateProfileDto } from "../../../../dtos/index.js";
import type { UserId } from "../../../../types/index.js";

export class UpdateProfileCommand extends Command<"identity.update-profile"> {
  public readonly userId: UserId;
  public readonly data: UpdateProfileDto;

  public constructor(userId: UserId, data: UpdateProfileDto) {
    super("identity.update-profile");
    this.userId = userId;
    this.data = data;
  }
}
