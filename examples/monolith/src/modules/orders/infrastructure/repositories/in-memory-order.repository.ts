import { Entity } from "../../../../shared/domain/entity.js";
import type { Order } from "../../domain/entities/order.entity.js";
import type { OrderRepository } from "../../domain/repositories/order.repository.js";
import type { OrderId, UserId } from "../../../../shared/domain/ids.js";

class InMemoryOrderStore {
  private readonly items = new Map<string, { data: Order; updatedAt: Date }>();

  public async findById(id: OrderId): Promise<Order | null> {
    const entry = this.items.get(id);
    return entry ? entry.data : null;
  }

  public async findAll(): Promise<readonly Order[]> {
    return [...this.items.values()].map((e) => e.data);
  }

  public async save(entity: Order): Promise<void> {
    this.items.set(entity.id, { data: entity, updatedAt: new Date() });
  }

  public async delete(id: OrderId): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryOrderRepository implements OrderRepository {
  private readonly store = new InMemoryOrderStore();

  public async findById(id: OrderId): Promise<Order | null> { return this.store.findById(id); }
  public async findAll(): Promise<readonly Order[]> { return this.store.findAll(); }
  public async save(entity: Order): Promise<void> { await this.store.save(entity); }
  public async delete(id: OrderId): Promise<void> { await this.store.delete(id); }

  public async findByUserId(userId: UserId): Promise<readonly Order[]> {
    const all = await this.findAll();
    return all.filter((o) => o.userId === userId);
  }
}
