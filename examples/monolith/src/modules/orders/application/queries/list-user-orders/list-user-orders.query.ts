import { AppQuery } from "../../../../../shared/application/query.js";
import type { UserId } from "../../../../../shared/domain/ids.js";
import type { Order } from "../../../domain/entities/order.entity.js";

export class ListUserOrdersQuery extends AppQuery<Order[]> {
  public readonly type = "orders.listByUser" as const;
  constructor(public readonly userId: UserId) { super(); }
}
