import type { CreateProductCommand } from "./create-product.command.js";
import type { ProductRepository } from "../../../domain/repositories/product.repository.js";
import { Product } from "../../../domain/entities/product.entity.js";
import { Money } from "../../../domain/value-objects/money.value-object.js";

export class CreateProductHandler {
  constructor(private readonly products: ProductRepository) {}

  public async execute(command: CreateProductCommand): Promise<void> {
    const price = Money.create(command.priceAmount, command.priceCurrency);
    const product = Product.create(command.id, command.name, command.description, price, command.stock);
    await this.products.save(product);
  }
}
