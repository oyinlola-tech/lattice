import type { Repository } from "../../../../shared/application/repository.js";
import type { Product } from "../entities/product.entity.js";
import type { ProductId } from "../../../../shared/domain/ids.js";

export interface ProductRepository extends Repository<Product, ProductId> {}
