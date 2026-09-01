import { getDatabase } from "../databases/database.js";
import type { CommentModel } from "../models/comment.model.js";
import type { CommentId, ArticleId, UserId } from "../types/index.js";

export interface CommentRepository {
  findById(id: CommentId): Promise<CommentModel | null>;
  findByArticle(articleId: ArticleId): Promise<readonly CommentModel[]>;
  save(comment: CommentModel): Promise<void>;
  update(id: CommentId, data: Partial<Pick<CommentModel, "content">>): Promise<void>;
  delete(id: CommentId): Promise<void>;
}

export class SqliteCommentRepository implements CommentRepository {
  public async findById(id: CommentId): Promise<CommentModel | null> {
    const db = getDatabase();
    const row = db.prepare("SELECT * FROM comments WHERE id = ?").get(id) as Record<string, unknown> | undefined;
    return row ? mapRowToComment(row) : null;
  }

  public async findByArticle(articleId: ArticleId): Promise<readonly CommentModel[]> {
    const db = getDatabase();
    const rows = db.prepare("SELECT * FROM comments WHERE article_id = ? ORDER BY created_at ASC").all(articleId) as Record<string, unknown>[];
    return rows.map(mapRowToComment);
  }

  public async save(comment: CommentModel): Promise<void> {
    const db = getDatabase();
    db.prepare(`
      INSERT INTO comments (id, article_id, author_id, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(comment.id, comment.articleId, comment.authorId, comment.content, comment.createdAt.toISOString(), comment.updatedAt.toISOString());
  }

  public async update(id: CommentId, data: Partial<Pick<CommentModel, "content">>): Promise<void> {
    const db = getDatabase();
    if (data.content !== undefined) {
      db.prepare("UPDATE comments SET content = ?, updated_at = datetime('now') WHERE id = ?").run(data.content, id);
    }
  }

  public async delete(id: CommentId): Promise<void> {
    const db = getDatabase();
    db.prepare("DELETE FROM comments WHERE id = ?").run(id);
  }
}

function mapRowToComment(row: Record<string, unknown>): CommentModel {
  return {
    id: row["id"] as CommentId,
    articleId: row["article_id"] as ArticleId,
    authorId: row["author_id"] as UserId,
    content: row["content"] as string,
    createdAt: new Date(row["created_at"] as string),
    updatedAt: new Date(row["updated_at"] as string),
  };
}
