import { createAppConfig, createHttpConfig } from "../config/index.js";
import { UsersModule } from "../modules/users/users.module.js";
import { ProductsModule } from "../modules/products/products.module.js";
import { OrdersModule } from "../modules/orders/orders.module.js";
import { PaymentsModule } from "../modules/payments/payments.module.js";
import { NotificationsModule } from "../modules/notifications/notifications.module.js";
import { IdentityModule } from "../modules/identity/identity.module.js";

export interface Application {
  readonly start: () => Promise<void>;
  readonly stop: () => Promise<void>;
  readonly modules: {
    readonly users: UsersModule;
    readonly products: ProductsModule;
    readonly orders: OrdersModule;
    readonly payments: PaymentsModule;
    readonly notifications: NotificationsModule;
    readonly identity: IdentityModule;
  };
}

export async function bootstrapApplication(): Promise<Application> {
  const appConfig = createAppConfig();
  const httpConfig = createHttpConfig();

  console.log("=".repeat(60));
  console.log(`  ${appConfig.name} v${appConfig.version}`);
  console.log(`  Environment: ${appConfig.env}`);
  console.log("=".repeat(60));
  console.log();

  const usersModule = new UsersModule();
  const productsModule = new ProductsModule();
  const ordersModule = new OrdersModule();
  const paymentsModule = new PaymentsModule();
  const notificationsModule = new NotificationsModule();
  const identityModule = new IdentityModule();

  usersModule.initialize();
  productsModule.initialize();
  ordersModule.initialize(productsModule.getProductRepository());
  paymentsModule.initialize();
  identityModule.initialize(usersModule.getUserRepository());

  ordersModule.onEvents((events) => notificationsModule.handleEvents(events));

  console.log("[Bootstrap] Modules initialized:");
  console.log(`  - ${usersModule.id}`);
  console.log(`  - ${productsModule.id}`);
  console.log(`  - ${ordersModule.id}`);
  console.log(`  - ${paymentsModule.id}`);
  console.log(`  - ${notificationsModule.id}`);
  console.log(`  - ${identityModule.id}`);
  console.log();

  return {
    modules: {
      users: usersModule,
      products: productsModule,
      orders: ordersModule,
      payments: paymentsModule,
      notifications: notificationsModule,
      identity: identityModule,
    },
    start: async () => {
      console.log(
        `[App] Server listening on ${httpConfig.host}:${httpConfig.port}`,
      );
    },
    stop: async () => {
      console.log("[App] Shutting down gracefully...");
    },
  };
}
