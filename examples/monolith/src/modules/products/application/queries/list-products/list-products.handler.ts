import type { ListProductsQuery } from "./list-products.query.js";
import type { ProductRepository } from "../../../domain/repositories/product.repository.js";
import type { Product } from "../../../domain/entities/product.entity.js";

export class ListProductsHandler {
  constructor(private readonly products: ProductRepository) {}
  public async execute(_query: ListProductsQuery): Promise<Product[]> {
    return [...(await this.products.findAll())];
  }
}
