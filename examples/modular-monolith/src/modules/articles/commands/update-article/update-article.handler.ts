import { CommandHandler } from "@oyinlola141/lattice-cqrs";
import type { UpdateArticleCommand } from "./update-article.command.js";
import type { ArticleRepository } from "../../../../repositories/article.repository.js";
import { NotFoundError, ForbiddenError } from "../../../../errors/index.js";

export class UpdateArticleHandler extends CommandHandler<
  UpdateArticleCommand,
  void
> {
  public readonly commandType = "articles.update" as const;

  private readonly articles: ArticleRepository;

  public constructor(articles: ArticleRepository) {
    super();
    this.articles = articles;
  }

  public async execute(command: UpdateArticleCommand): Promise<void> {
    const article = await this.articles.findById(command.articleId);
    if (!article) {
      throw new NotFoundError("Article", command.articleId);
    }

    if (article.authorId !== command.userId) {
      throw new ForbiddenError("You can only update your own articles");
    }

    await this.articles.update(command.articleId, {
      ...(command.data.title !== undefined && { title: command.data.title }),
      ...(command.data.content !== undefined && {
        content: command.data.content,
      }),
    });
  }
}
