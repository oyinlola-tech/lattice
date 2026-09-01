import type { DomainEvent } from "./event.js";

export abstract class AggregateRoot<TId extends string> {
  public readonly id: TId;
  public readonly createdAt: Date;
  private _updatedAt: Date;
  private readonly _domainEvents: DomainEvent[] = [];

  protected constructor(id: TId, createdAt?: Date) {
    this.id = id;
    this.createdAt = createdAt ?? new Date();
    this._updatedAt = this.createdAt;
  }

  public get updatedAt(): Date {
    return this._updatedAt;
  }
  public get domainEvents(): readonly DomainEvent[] {
    return [...this._domainEvents];
  }
  protected addEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }
  public clearEvents(): void {
    this._domainEvents.length = 0;
  }
  protected touch(): void {
    this._updatedAt = new Date();
  }
  public equals(other: AggregateRoot<TId>): boolean {
    return this.id === other.id;
  }
}
