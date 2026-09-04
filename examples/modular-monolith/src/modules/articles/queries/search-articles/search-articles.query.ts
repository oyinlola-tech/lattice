import { Query } from "@zudojs/cqrs";

export class SearchArticlesQuery extends Query<"articles.search"> {
  public readonly searchTerm: string;

  public constructor(searchTerm: string) {
    super("articles.search");
    this.searchTerm = searchTerm;
  }
}
