import { Query } from "@oyinlola141/lattice-cqrs";

export class ListTopicsQuery extends Query<"topics.list"> {
  public readonly limit: number;
  public readonly offset: number;

  public constructor(options: { limit?: number; offset?: number } = {}) {
    super("topics.list");
    this.limit = options.limit ?? 20;
    this.offset = options.offset ?? 0;
  }
}
