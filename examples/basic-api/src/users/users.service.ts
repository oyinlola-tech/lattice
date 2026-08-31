/**
 * Users service.
 *
 * Contains business logic for user management.
 * Controllers should delegate to this service rather than
 * implementing business logic directly.
 */

import type { User, CreateUserInput } from "./users.types.js";

export class UsersService {
  private readonly users = new Map<string, User>();

  public findAll(): readonly User[] {
    return [...this.users.values()];
  }

  public findById(id: string): User | undefined {
    return this.users.get(id);
  }

  public create(input: CreateUserInput): User {
    const user: User = {
      id: crypto.randomUUID(),
      name: input.name,
      email: input.email,
      createdAt: new Date().toISOString(),
    };

    this.users.set(user.id, user);

    return user;
  }

  public delete(id: string): boolean {
    return this.users.delete(id);
  }
}
