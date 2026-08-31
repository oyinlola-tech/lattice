import type { GetOrderQuery } from "./get-order.query.js";
import type { OrderRepository } from "../../../domain/repositories/order.repository.js";
import type { Order } from "../../../domain/entities/order.entity.js";

export class GetOrderHandler {
  constructor(private readonly orders: OrderRepository) {}
  public async execute(query: GetOrderQuery): Promise<Order | null> {
    return this.orders.findById(query.id);
  }
}
