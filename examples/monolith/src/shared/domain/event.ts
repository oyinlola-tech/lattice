export interface DomainEvent {
  readonly type: string;
  readonly aggregateId: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
}

export function createDomainEvent(
  type: string,
  aggregateId: string,
  data: Record<string, unknown> = {},
): DomainEvent {
  return Object.freeze({ type, aggregateId, timestamp: new Date(), data });
}
