import { AppQuery } from "../../../../../shared/application/query.js";
import type { OrderId } from "../../../../../shared/domain/ids.js";
import type { Order } from "../../../domain/entities/order.entity.js";

export class GetOrderQuery extends AppQuery<Order | null> {
  public readonly type = "orders.getById" as const;
  constructor(public readonly id: OrderId) {
    super();
  }
}
