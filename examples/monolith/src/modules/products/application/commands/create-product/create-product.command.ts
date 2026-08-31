import { AppCommand } from "../../../../../shared/application/command.js";
import type { ProductId } from "../../../../../shared/domain/ids.js";

export class CreateProductCommand extends AppCommand {
  public readonly type = "products.create" as const;
  constructor(
    public readonly id: ProductId,
    public readonly name: string,
    public readonly description: string,
    public readonly priceAmount: number,
    public readonly priceCurrency: string,
    public readonly stock: number,
  ) { super(); }
}
