import { getDatabase } from "../databases/database.js";
import type { UserModel } from "../models/user.model.js";
import type { UserId } from "../types/index.js";
import type { UserRole } from "../enums/index.js";

export interface UserRepository {
  findById(id: UserId): Promise<UserModel | null>;
  findByEmail(email: string): Promise<UserModel | null>;
  save(user: UserModel): Promise<void>;
  update(
    id: UserId,
    data: Partial<Pick<UserModel, "name" | "bio" | "avatar">>,
  ): Promise<void>;
  deleteAll(): Promise<void>;
}

export class SqliteUserRepository implements UserRepository {
  public async findById(id: UserId): Promise<UserModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      Record<string, unknown> | undefined;
    return row ? mapRowToUser(row) : null;
  }

  public async findByEmail(email: string): Promise<UserModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as
      Record<string, unknown> | undefined;
    return row ? mapRowToUser(row) : null;
  }

  public async save(user: UserModel): Promise<void> {
    const db = getDatabase();
    db.prepare(
      `
      INSERT INTO users (id, email, name, bio, avatar, role, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    ).run(
      user.id,
      user.email,
      user.name,
      user.bio,
      user.avatar,
      user.role,
      user.createdAt.toISOString(),
      user.updatedAt.toISOString(),
    );
  }

  public async update(
    id: UserId,
    data: Partial<Pick<UserModel, "name" | "bio" | "avatar">>,
  ): Promise<void> {
    const db = getDatabase();
    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) {
      sets.push("name = ?");
      values.push(data.name);
    }
    if (data.bio !== undefined) {
      sets.push("bio = ?");
      values.push(data.bio);
    }
    if (data.avatar !== undefined) {
      sets.push("avatar = ?");
      values.push(data.avatar);
    }

    if (sets.length === 0) return;

    sets.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`).run(
      ...values,
    );
  }

  public async deleteAll(): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM users").run();
  }
}

function mapRowToUser(row: Record<string, unknown>): UserModel {
  return {
    id: row["id"] as UserId,
    email: row["email"] as string,
    name: row["name"] as string,
    bio: row["bio"] as string,
    avatar: row["avatar"] as string,
    role: row["role"] as UserRole,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  };
}
