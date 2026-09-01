import type { CancelOrderCommand } from "./cancel-order.command.js";
import type { OrderRepository } from "../../../domain/repositories/order.repository.js";
import type { DomainEvent } from "../../../../../shared/domain/event.js";

export interface CancelOrderResult {
  readonly success: boolean;
  readonly events: readonly DomainEvent[];
}

export class CancelOrderHandler {
  constructor(private readonly orders: OrderRepository) {}

  public async execute(
    command: CancelOrderCommand,
  ): Promise<CancelOrderResult> {
    const order = await this.orders.findById(command.orderId);
    if (!order) throw new Error(`Order "${command.orderId}" not found.`);
    order.cancel();
    await this.orders.save(order);
    const events = [...order.domainEvents];
    order.clearEvents();
    return { success: true, events };
  }
}
