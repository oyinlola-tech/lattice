import type { CreateOrderCommand } from "./create-order.command.js";
import type { OrderRepository } from "../../../domain/repositories/order.repository.js";
import { Order } from "../../../domain/entities/order.entity.js";
import { Money } from "../../../../products/domain/value-objects/money.value-object.js";
import type { ProductRepository } from "../../../../products/domain/repositories/product.repository.js";
import type { DomainEvent } from "../../../../../shared/domain/event.js";

export interface CreateOrderResult {
  readonly order: Order;
  readonly events: readonly DomainEvent[];
}

export class CreateOrderHandler {
  constructor(
    private readonly orders: OrderRepository,
    private readonly products: ProductRepository,
  ) {}

  public async execute(
    command: CreateOrderCommand,
  ): Promise<CreateOrderResult> {
    const items = await Promise.all(
      command.items.map(async (item) => {
        const product = await this.products.findById(item.productId);
        if (!product) throw new Error(`Product "${item.productId}" not found.`);
        if (!product.inStock)
          throw new Error(`Product "${product.name}" is out of stock.`);
        product.reserveStock(item.quantity);
        await this.products.save(product);
        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: Money.create(item.unitPriceAmount),
        };
      }),
    );
    const order = Order.create(command.id, command.userId, items);
    order.confirm();
    await this.orders.save(order);
    const events = [...order.domainEvents];
    order.clearEvents();
    return { order, events };
  }
}
