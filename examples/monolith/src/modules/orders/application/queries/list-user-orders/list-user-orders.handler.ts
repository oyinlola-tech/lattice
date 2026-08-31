import type { ListUserOrdersQuery } from "./list-user-orders.query.js";
import type { OrderRepository } from "../../../domain/repositories/order.repository.js";
import type { Order } from "../../../domain/entities/order.entity.js";

export class ListUserOrdersHandler {
  constructor(private readonly orders: OrderRepository) {}
  public async execute(query: ListUserOrdersQuery): Promise<Order[]> {
    return [...(await this.orders.findByUserId(query.userId))];
  }
}
