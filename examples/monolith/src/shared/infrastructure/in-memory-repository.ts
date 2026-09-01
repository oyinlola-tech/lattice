import type { Entity } from "../domain/entity.js";
import type { Repository } from "../application/repository.js";

export class InMemoryRepository<
  TEntity extends Entity<TId>,
  TId extends string,
> implements Repository<TEntity, TId> {
  private readonly store = new Map<TId, TEntity>();

  public async findById(id: TId): Promise<TEntity | null> {
    return this.store.get(id) ?? null;
  }
  public async save(entity: TEntity): Promise<void> {
    this.store.set(entity.id, entity);
  }
  public async delete(id: TId): Promise<void> {
    this.store.delete(id);
  }
  public async findAll(): Promise<readonly TEntity[]> {
    return [...this.store.values()];
  }
}
