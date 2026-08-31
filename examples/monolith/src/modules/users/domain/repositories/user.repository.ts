import type { Repository } from "../../../../shared/application/repository.js";
import type { User } from "../entities/user.entity.js";
import type { UserId } from "../../../../shared/domain/ids.js";

export interface UserRepository extends Repository<User, UserId> {
  findByEmail(email: string): Promise<User | null>;
}
