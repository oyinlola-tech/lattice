import { CommandBus, QueryBus } from "@zudoliblib/cqrs";
import type { ProductRepository } from "./domain/repositories/product.repository.js";
import { InMemoryProductRepository } from "./infrastructure/repositories/in-memory-product.repository.js";
import { CreateProductHandler } from "./application/commands/create-product/create-product.handler.js";
import { ListProductsHandler } from "./application/queries/list-products/list-products.handler.js";

export class ProductsModule {
  public readonly id = "products";
  private readonly products: ProductRepository;
  private readonly commandBus: CommandBus;
  private readonly queryBus: QueryBus;

  public constructor() {
    this.products = new InMemoryProductRepository();
    this.commandBus = new CommandBus();
    this.queryBus = new QueryBus();
  }

  public initialize(): void {
    const createHandler = new CreateProductHandler(this.products);
    const listHandler = new ListProductsHandler(this.products);
    this.commandBus.register(
      "products.create",
      createHandler.execute.bind(createHandler),
    );
    this.queryBus.register(
      "products.list",
      listHandler.execute.bind(listHandler),
    );
  }

  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
  public getQueryBus(): QueryBus {
    return this.queryBus;
  }
  public getProductRepository(): ProductRepository {
    return this.products;
  }
}
