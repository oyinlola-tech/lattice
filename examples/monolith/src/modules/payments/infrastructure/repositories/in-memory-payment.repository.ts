import { Entity } from "../../../../shared/domain/entity.js";
import type { Payment } from "../../domain/entities/payment.entity.js";
import type { PaymentRepository } from "../../domain/repositories/payment.repository.js";
import type { PaymentId } from "../../../../shared/domain/ids.js";

class InMemoryPaymentStore {
  private readonly items = new Map<string, { data: Payment; updatedAt: Date }>();

  public async findById(id: PaymentId): Promise<Payment | null> {
    const entry = this.items.get(id);
    return entry ? entry.data : null;
  }

  public async findAll(): Promise<readonly Payment[]> {
    return [...this.items.values()].map((e) => e.data);
  }

  public async save(entity: Payment): Promise<void> {
    this.items.set(entity.id, { data: entity, updatedAt: new Date() });
  }

  public async delete(id: PaymentId): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryPaymentRepository implements PaymentRepository {
  private readonly store = new InMemoryPaymentStore();

  public async findById(id: PaymentId): Promise<Payment | null> { return this.store.findById(id); }
  public async findAll(): Promise<readonly Payment[]> { return this.store.findAll(); }
  public async save(entity: Payment): Promise<void> { await this.store.save(entity); }
  public async delete(id: PaymentId): Promise<void> { await this.store.delete(id); }
}
