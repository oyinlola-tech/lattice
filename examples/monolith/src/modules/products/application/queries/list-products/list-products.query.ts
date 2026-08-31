import { AppQuery } from "../../../../../shared/application/query.js";
import type { Product } from "../../../domain/entities/product.entity.js";

export class ListProductsQuery extends AppQuery<Product[]> {
  public readonly type = "products.list" as const;
}
