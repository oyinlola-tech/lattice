import { bootstrapApplication } from "./bootstrap/application.js";
import {
  createUserId,
  createProductId,
  createOrderId,
} from "./shared/domain/ids.js";
import { UserRole } from "./modules/users/domain/entities/user.entity.js";

async function main(): Promise<void> {
  const app = await bootstrapApplication();
  await app.start();

  const { users, products, orders } = app.modules;

  console.log("[Seed] Creating demo data...");
  console.log();

  const { CreateUserCommand } =
    await import("./modules/users/application/commands/create-user/create-user.command.js");
  const { CreateProductCommand } =
    await import("./modules/products/application/commands/create-product/create-product.command.js");
  const { CreateOrderCommand } =
    await import("./modules/orders/application/commands/create-order/create-order.command.js");
  const { GetOrderQuery } =
    await import("./modules/orders/application/queries/get-order/get-order.query.js");
  const { ListUserOrdersQuery } =
    await import("./modules/orders/application/queries/list-user-orders/list-user-orders.query.js");

  const userId = createUserId("user-001");
  const laptopId = createProductId("prod-laptop");
  const phoneId = createProductId("prod-phone");
  const headphoneId = createProductId("prod-headphones");

  await users
    .getCommandBus()
    .execute(
      new CreateUserCommand(
        userId,
        "alice@example.com",
        "Alice Johnson",
        "hashed-pw",
        UserRole.ADMIN,
      ),
    );

  await products
    .getCommandBus()
    .execute(
      new CreateProductCommand(
        laptopId,
        "Laptop Pro 16",
        "High-performance laptop",
        2499.99,
        "USD",
        10,
      ),
    );
  await products
    .getCommandBus()
    .execute(
      new CreateProductCommand(
        phoneId,
        "Phone Ultra",
        "Latest smartphone",
        999.99,
        "USD",
        25,
      ),
    );
  await products
    .getCommandBus()
    .execute(
      new CreateProductCommand(
        headphoneId,
        "Wireless Headphones",
        "Noise-cancelling",
        349.99,
        "USD",
        50,
      ),
    );

  console.log("[Seed] Created 1 user and 3 products");
  console.log();

  console.log("─".repeat(60));
  console.log("  CQRS Flow: Create Order");
  console.log("─".repeat(60));
  console.log();

  const orderId = createOrderId("order-001");
  const result = (await orders.getCommandBus().execute(
    new CreateOrderCommand(orderId, userId, [
      { productId: laptopId, quantity: 1, unitPriceAmount: 2499.99 },
      { productId: headphoneId, quantity: 2, unitPriceAmount: 349.99 },
    ]),
  )) as {
    order: {
      id: string;
      status: string;
      totalAmount: { format(): string };
      items: readonly unknown[];
    };
    events: readonly { type: string; aggregateId: string }[];
  };

  console.log(`[Result] Order created: ${result.order.id}`);
  console.log(`  Status: ${result.order.status}`);
  console.log(`  Items: ${result.order.items.length}`);
  console.log(`  Total: ${result.order.totalAmount.format()}`);
  console.log();

  console.log("─".repeat(60));
  console.log("  Domain Events Dispatched");
  console.log("─".repeat(60));
  console.log();
  for (const event of result.events) {
    console.log(`  - ${event.type} (${event.aggregateId})`);
  }
  console.log();

  console.log("─".repeat(60));
  console.log("  CQRS Flow: Query Order");
  console.log("─".repeat(60));
  console.log();

  const queriedOrder = (await orders
    .getQueryBus()
    .execute(new GetOrderQuery(orderId))) as {
    id: string;
    userId: string;
    status: string;
    totalAmount: { format(): string };
    items: readonly {
      productId: string;
      quantity: number;
      unitPrice: { amount: number };
    }[];
  } | null;

  if (queriedOrder) {
    console.log(`[Query] Found order: ${queriedOrder.id}`);
    console.log(`  User: ${queriedOrder.userId}`);
    console.log(`  Status: ${queriedOrder.status}`);
    console.log(`  Total: ${queriedOrder.totalAmount.format()}`);
    console.log(`  Items:`);
    for (const item of queriedOrder.items) {
      console.log(
        `    - ${item.productId}: ${item.quantity}x $${item.unitPrice.amount}`,
      );
    }
  }
  console.log();

  const userOrders = (await orders
    .getQueryBus()
    .execute(new ListUserOrdersQuery(userId))) as unknown[];
  console.log(`[Query] User ${userId} has ${userOrders.length} order(s)`);
  console.log();

  console.log("=".repeat(60));
  console.log("  Architecture Summary");
  console.log("=".repeat(60));
  console.log();
  console.log("Layers:");
  console.log("  Presentation  → Thin controllers (HTTP/CLI)");
  console.log("  Application   → CQRS commands/queries + handlers");
  console.log(
    "  Domain        → Entities, value objects, events, business rules",
  );
  console.log("  Infrastructure → Repositories, messaging, queue");
  console.log();
  console.log("Key patterns demonstrated:");
  console.log("  ✓ Feature-first module structure");
  console.log("  ✓ CQRS (commands write, queries read)");
  console.log("  ✓ Domain events for cross-module communication");
  console.log("  ✓ Aggregate roots with business rules");
  console.log("  ✓ Repository pattern (domain contract → infrastructure impl)");
  console.log(
    "  ✓ Dependency inversion (domain doesn't know about infrastructure)",
  );
  console.log("  ✓ Module boundaries (each module owns its own code)");
  console.log("  ✓ Event-driven notifications without tight coupling");
  console.log();
  console.log("Modules:");
  console.log("  identity       → Registration and authentication");
  console.log("  users          → User management");
  console.log("  products       → Product catalog");
  console.log("  orders         → Order processing (CQRS + events)");
  console.log("  payments       → Payment processing");
  console.log("  notifications  → Event-driven notifications");
  console.log();
  console.log("=".repeat(60));
}

main().catch(console.error);
