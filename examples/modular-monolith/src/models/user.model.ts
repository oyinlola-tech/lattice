import type { UserId } from "../types/index.js";
import type { UserRole } from "../enums/index.js";

export interface UserModel {
  readonly id: UserId;
  readonly email: string;
  readonly name: string;
  readonly bio: string;
  readonly avatar: string;
  readonly role: UserRole;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}
