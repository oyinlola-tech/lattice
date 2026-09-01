import type { Product } from "../../domain/entities/product.entity.js";
import type { ProductRepository } from "../../domain/repositories/product.repository.js";
import type { ProductId } from "../../../../shared/domain/ids.js";

class InMemoryProductStore {
  private readonly items = new Map<
    string,
    { data: Product; updatedAt: Date }
  >();

  public async findById(id: ProductId): Promise<Product | null> {
    const entry = this.items.get(id);
    return entry ? entry.data : null;
  }

  public async findAll(): Promise<readonly Product[]> {
    return [...this.items.values()].map((e) => e.data);
  }

  public async save(entity: Product): Promise<void> {
    this.items.set(entity.id, { data: entity, updatedAt: new Date() });
  }

  public async delete(id: ProductId): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryProductRepository implements ProductRepository {
  private readonly store = new InMemoryProductStore();

  public async findById(id: ProductId): Promise<Product | null> {
    return this.store.findById(id);
  }
  public async findAll(): Promise<readonly Product[]> {
    return this.store.findAll();
  }
  public async save(entity: Product): Promise<void> {
    await this.store.save(entity);
  }
  public async delete(id: ProductId): Promise<void> {
    await this.store.delete(id);
  }
}
