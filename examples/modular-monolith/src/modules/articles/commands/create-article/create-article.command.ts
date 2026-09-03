import { Command } from "@zudo/cqrs";
import type { CreateArticleDto } from "../../../../dtos/index.js";

export class CreateArticleCommand extends Command<"articles.create"> {
  public readonly data: CreateArticleDto;

  public constructor(data: CreateArticleDto) {
    super("articles.create");
    this.data = data;
  }
}
