import { getDatabase } from "../databases/database.js";
import type { ArticleModel } from "../models/article.model.js";
import type { ArticleId, UserId, TopicId } from "../types/index.js";
import type { ArticleStatus } from "../enums/index.js";

export interface ArticleRepository {
  findById(id: ArticleId): Promise<ArticleModel | null>;
  findByAuthor(authorId: UserId): Promise<readonly ArticleModel[]>;
  findByTopic(topicId: TopicId): Promise<readonly ArticleModel[]>;
  findByStatus(status: ArticleStatus): Promise<readonly ArticleModel[]>;
  search(query: string): Promise<readonly ArticleModel[]>;
  exists(id: ArticleId): Promise<boolean>;
  save(article: ArticleModel): Promise<void>;
  update(id: ArticleId, data: Partial<Pick<ArticleModel, "title" | "content" | "status" | "viewCount">>): Promise<void>;
  delete(id: ArticleId): Promise<void>;
  incrementViewCount(id: ArticleId): Promise<void>;
}

export class SqliteArticleRepository implements ArticleRepository {
  public async findById(id: ArticleId): Promise<ArticleModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM articles WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToArticle(row) : null;
  }

  public async findByAuthor(authorId: UserId): Promise<readonly ArticleModel[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM articles WHERE author_id = ? ORDER BY created_at DESC").all(authorId) as Record<string, unknown>[];
    return rows.map(mapRowToArticle);
  }

  public async findByTopic(topicId: TopicId): Promise<readonly ArticleModel[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM articles WHERE topic_id = ? ORDER BY created_at DESC").all(topicId) as Record<string, unknown>[];
    return rows.map(mapRowToArticle);
  }

  public async findByStatus(status: ArticleStatus): Promise<readonly ArticleModel[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM articles WHERE status = ? ORDER BY created_at DESC").all(status) as Record<string, unknown>[];
    return rows.map(mapRowToArticle);
  }

  public async search(query: string): Promise<readonly ArticleModel[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM articles WHERE title LIKE ? OR content LIKE ? ORDER BY created_at DESC").all(`%${query}%`, `%${query}%`) as Record<string, unknown>[];
    return rows.map(mapRowToArticle);
  }

  public async exists(id: ArticleId): Promise<boolean> {
    const db = getDatabase();
    const row = db.prepare("SELECT 1 FROM articles WHERE id = ?").get(id);
    return row !== undefined;
  }

  public async save(article: ArticleModel): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO articles (id, author_id, topic_id, title, content, status, view_count, created_at, updated_at, published_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(article.id, article.authorId, article.topicId, article.title, article.content, article.status, article.viewCount, article.createdAt.toISOString(), article.updatedAt.toISOString(), article.publishedAt?.toISOString() ?? null);
  }

  public async update(id: ArticleId, data: Partial<Pick<ArticleModel, "title" | "content" | "status" | "viewCount">>): Promise<void> {
    const db = getDatabase();
    const sets: string[] = [];
    const values: unknown[] = [];

    if (data.title !== undefined) { sets.push("title = ?"); values.push(data.title); }
    if (data.content !== undefined) { sets.push("content = ?"); values.push(data.content); }
    if (data.status !== undefined) { sets.push("status = ?"); values.push(data.status); }
    if (data.viewCount !== undefined) { sets.push("view_count = ?"); values.push(data.viewCount); }

    if (sets.length === 0) return;

    sets.push("updated_at = datetime('now')");
    values.push(id);

    db.prepare(`UPDATE articles SET ${sets.join(", ")} WHERE id = ?`).run(...values);
  }

  public async delete(id: ArticleId): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM articles WHERE id = ?").run(id);
  }

  public async incrementViewCount(id: ArticleId): Promise<void> {
    const db = getDatabase();
    db.prepare("UPDATE articles SET view_count = view_count + 1 WHERE id = ?").run(id);
  }
}

function mapRowToArticle(row: Record<string, unknown>): ArticleModel {
  return {
    id: row["id"] as ArticleId,
    authorId: row["author_id"] as UserId,
    topicId: row["topic_id"] as TopicId,
    title: row["title"] as string,
    content: row["content"] as string,
    status: row["status"] as ArticleStatus,
    viewCount: row["view_count"] as number,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
    publishedAt: row["published_at"] ? new Date(row["published_at"] as string) : null,
  };
}
