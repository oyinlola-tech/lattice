export interface Repository<TEntity, TId extends string> {
  findById(id: TId): Promise<TEntity | null>;
  save(entity: TEntity): Promise<void>;
  delete(id: TId): Promise<void>;
  findAll(): Promise<readonly TEntity[]>;
}
