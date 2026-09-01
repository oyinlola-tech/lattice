import { getDatabase } from "../databases/database.js";
import type { TopicModel } from "../models/topic.model.js";
import type { TopicId, UserId } from "../types/index.js";

export interface TopicRepository {
  findById(id: TopicId): Promise<TopicModel | null>;
  findByName(name: string): Promise<TopicModel | null>;
  findAll(): Promise<readonly TopicModel[]>;
  save(topic: TopicModel): Promise<void>;
  incrementFollowerCount(id: TopicId): Promise<void>;
  decrementFollowerCount(id: TopicId): Promise<void>;
}

export class SqliteTopicRepository implements TopicRepository {
  public async findById(id: TopicId): Promise<TopicModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM topics WHERE id = ?").get(id) as
      Record<string, unknown> | undefined;
    return row ? mapRowToTopic(row) : null;
  }

  public async findByName(name: string): Promise<TopicModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM topics WHERE name = ?").get(name) as
      Record<string, unknown> | undefined;
    return row ? mapRowToTopic(row) : null;
  }

  public async findAll(): Promise<readonly TopicModel[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM topics ORDER BY follower_count DESC")
      .all() as Record<string, unknown>[];
    return rows.map(mapRowToTopic);
  }

  public async save(topic: TopicModel): Promise<void> {
    const db = getDatabase();
    db.prepare(
      `
      INSERT INTO topics (id, name, description, follower_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    ).run(
      topic.id,
      topic.name,
      topic.description,
      topic.followerCount,
      topic.createdAt.toISOString(),
      topic.updatedAt.toISOString(),
    );
  }

  public async incrementFollowerCount(id: TopicId): Promise<void> {
    const db = getDatabase();
    db.prepare(
      "UPDATE topics SET follower_count = follower_count + 1, updated_at = datetime('now') WHERE id = ?",
    ).run(id);
  }

  public async decrementFollowerCount(id: TopicId): Promise<void> {
    const db = getDatabase();
    db.prepare(
      "UPDATE topics SET follower_count = MAX(0, follower_count - 1), updated_at = datetime('now') WHERE id = ?",
    ).run(id);
  }
}

export interface TopicFollowerRepository {
  isFollowing(userId: UserId, topicId: TopicId): Promise<boolean>;
  follow(userId: UserId, topicId: TopicId): Promise<void>;
  unfollow(userId: UserId, topicId: TopicId): Promise<void>;
}

export class SqliteTopicFollowerRepository implements TopicFollowerRepository {
  public async isFollowing(userId: UserId, topicId: TopicId): Promise<boolean> {
    const db = getDatabase();
    const row = db
      .prepare(
        "SELECT 1 FROM topic_followers WHERE user_id = ? AND topic_id = ?",
      )
      .get(userId, topicId);
    return row !== undefined;
  }

  public async follow(userId: UserId, topicId: TopicId): Promise<void> {
    const db = getDatabase();
    db.prepare(
      "INSERT OR IGNORE INTO topic_followers (topic_id, user_id, created_at) VALUES (?, ?, datetime('now'))",
    ).run(topicId, userId);
  }

  public async unfollow(userId: UserId, topicId: TopicId): Promise<void> {
    const db = getDatabase();
    db.prepare(
      "DELETE FROM topic_followers WHERE user_id = ? AND topic_id = ?",
    ).run(userId, topicId);
  }
}

function mapRowToTopic(row: Record<string, unknown>): TopicModel {
  return {
    id: row["id"] as TopicId,
    name: row["name"] as string,
    description: row["description"] as string,
    followerCount: row["follower_count"] as number,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  };
}
