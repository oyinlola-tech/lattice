import { getDatabase } from "../databases/database.js";
import type { ReactionModel } from "../models/reaction.model.js";
import type { ReactionId, ArticleId, UserId } from "../types/index.js";
import type { ReactionType } from "../enums/index.js";

export interface ReactionRepository {
  findByArticle(articleId: ArticleId): Promise<readonly ReactionModel[]>;
  findByUserAndArticle(
    userId: UserId,
    articleId: ArticleId,
  ): Promise<ReactionModel | null>;
  save(reaction: ReactionModel): Promise<void>;
  delete(userId: UserId, articleId: ArticleId): Promise<void>;
  countByArticle(articleId: ArticleId): Promise<Record<ReactionType, number>>;
}

export class SqliteReactionRepository implements ReactionRepository {
  public async findByArticle(
    articleId: ArticleId,
  ): Promise<readonly ReactionModel[]> {
    const db = getDatabase();
    const rows = db
      .prepare("SELECT * FROM reactions WHERE article_id = ?")
      .all(articleId) as Record<string, unknown>[];
    return rows.map(mapRowToReaction);
  }

  public async findByUserAndArticle(
    userId: UserId,
    articleId: ArticleId,
  ): Promise<ReactionModel | null> {
    const db = getDatabase();
    const row = db
      .prepare("SELECT * FROM reactions WHERE user_id = ? AND article_id = ?")
      .get(userId, articleId) as Record<string, unknown> | undefined;
    return row ? mapRowToReaction(row) : null;
  }

  public async save(reaction: ReactionModel): Promise<void> {
    const db = getDatabase();
    db.prepare(
      `
      INSERT OR REPLACE INTO reactions (id, article_id, user_id, type, created_at)
      VALUES (?, ?, ?, ?, ?)
    `,
    ).run(
      reaction.id,
      reaction.articleId,
      reaction.userId,
      reaction.type,
      reaction.createdAt.toISOString(),
    );
  }

  public async delete(userId: UserId, articleId: ArticleId): Promise<void> {
    const db = getDatabase();
    db.prepare(
      "DELETE FROM reactions WHERE user_id = ? AND article_id = ?",
    ).run(userId, articleId);
  }

  public async countByArticle(
    articleId: ArticleId,
  ): Promise<Record<ReactionType, number>> {
    const db = getDatabase();
    const rows = db
      .prepare(
        "SELECT type, COUNT(*) as count FROM reactions WHERE article_id = ? GROUP BY type",
      )
      .all(articleId) as { type: string; count: number }[];
    const counts = {} as Record<ReactionType, number>;
    for (const row of rows) {
      counts[row.type as ReactionType] = row.count;
    }
    return counts;
  }
}

function mapRowToReaction(row: Record<string, unknown>): ReactionModel {
  return {
    id: row["id"] as ReactionId,
    articleId: row["article_id"] as ArticleId,
    userId: row["user_id"] as UserId,
    type: row["type"] as ReactionType,
    createdAt: new Date(row["created_at"] as string),
  };
}
