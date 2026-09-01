export abstract class Entity<TId extends string> {
  public readonly id: TId;
  public readonly createdAt: Date;
  private _updatedAt: Date;

  protected constructor(id: TId, createdAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
    this._updatedAt = this.createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
  protected touch(): void {
    this._updatedAt = new Date();
  }
  public equals(other: Entity<TId>): boolean {
    return this.id === other.id;
  }
}
