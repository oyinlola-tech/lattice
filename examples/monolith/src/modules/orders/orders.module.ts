import { CommandBus, QueryBus } from "@zudolib/cqrs";
import type { DomainEvent } from "../../shared/domain/event.js";
import type { OrderRepository } from "./domain/repositories/order.repository.js";
import { InMemoryOrderRepository } from "./infrastructure/repositories/in-memory-order.repository.js";
import { CreateOrderHandler } from "./application/commands/create-order/create-order.handler.js";
import { CancelOrderHandler } from "./application/commands/cancel-order/cancel-order.handler.js";
import { GetOrderHandler } from "./application/queries/get-order/get-order.handler.js";
import { ListUserOrdersHandler } from "./application/queries/list-user-orders/list-user-orders.handler.js";
import type { ProductRepository } from "../products/domain/repositories/product.repository.js";

export class OrdersModule {
  public readonly id = "orders";
  private readonly orders: OrderRepository;
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;
  private readonly eventHandlers: ((
    events: readonly DomainEvent[],
  ) => Promise<void>)[] = [];

  public constructor() {
    this.orders = new InMemoryOrderRepository();
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
  }

  public initialize(products: ProductRepository): void {
    const createHandler = new CreateOrderHandler(this.orders, products);
    const cancelHandler = new CancelOrderHandler(this.orders);
    const getHandler = new GetOrderHandler(this.orders);
    const listHandler = new ListUserOrdersHandler(this.orders);
    this.commandBus.register(
      "orders.create",
      createHandler.execute.bind(createHandler),
    );
    this.commandBus.register(
      "orders.cancel",
      cancelHandler.execute.bind(cancelHandler),
    );
    this.queryBus.register(
      "orders.getById",
      getHandler.execute.bind(getHandler),
    );
    this.queryBus.register(
      "orders.listByUser",
      listHandler.execute.bind(listHandler),
    );
  }

  public onEvents(
    handler: (events: readonly DomainEvent[]) => Promise<void>,
  ): void {
    this.eventHandlers.push(handler);
  }

  public async dispatchEvents(events: readonly DomainEvent[]): Promise<void> {
    for (const handler of this.eventHandlers) {
      await handler(events);
    }
  }

  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
  public getQueryBus(): QueryBus {
    return this.queryBus;
  }
  public getOrderRepository(): OrderRepository {
    return this.orders;
  }
}
