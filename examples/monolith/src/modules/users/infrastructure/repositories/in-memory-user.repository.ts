import type { User } from "../../domain/entities/user.entity.js";
import type { UserRepository } from "../../domain/repositories/user.repository.js";
import type { UserId } from "../../../../shared/domain/ids.js";

class InMemoryUserStore {
  private readonly items = new Map<string, { data: User; updatedAt: Date }>();

  public async findById(id: UserId): Promise<User | null> {
    const entry = this.items.get(id);
    return entry ? entry.data : null;
  }

  public async findAll(): Promise<readonly User[]> {
    return [...this.items.values()].map((e) => e.data);
  }

  public async save(entity: User): Promise<void> {
    this.items.set(entity.id, { data: entity, updatedAt: new Date() });
  }

  public async delete(id: UserId): Promise<void> {
    this.items.delete(id);
  }
}

export class InMemoryUserRepository implements UserRepository {
  private readonly store = new InMemoryUserStore();

  public async findById(id: UserId): Promise<User | null> { return this.store.findById(id); }
  public async findAll(): Promise<readonly User[]> { return this.store.findAll(); }
  public async save(entity: User): Promise<void> { await this.store.save(entity); }
  public async delete(id: UserId): Promise<void> { await this.store.delete(id); }
  public async findByEmail(email: string): Promise<User | null> {
    const all = await this.findAll();
    return all.find((u) => u.email === email) ?? null;
  }
}
