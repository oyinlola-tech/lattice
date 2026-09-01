import { AppCommand } from "../../../../../shared/application/command.js";
import type {
  OrderId,
  UserId,
  ProductId,
} from "../../../../../shared/domain/ids.js";

export interface CreateOrderItemData {
  readonly productId: ProductId;
  readonly quantity: number;
  readonly unitPriceAmount: number;
}

export class CreateOrderCommand extends AppCommand {
  public readonly type = "orders.create" as const;
  constructor(
    public readonly id: OrderId,
    public readonly userId: UserId,
    public readonly items: readonly CreateOrderItemData[],
  ) {
    super();
  }
}
