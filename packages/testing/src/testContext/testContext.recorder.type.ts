/**
 * @zudojs/testing — Test context recorder types.
 *
 * Types for log, event, and message recorders used in test contexts.
 */

/**
 * A captured log entry from a spy logger.
 */
export interface CapturedLogEntry {
  readonly level: string;
  readonly message: string;
  readonly metadata?: Record<string, unknown>;
  readonly timestamp: Date;
}

/**
 * A captured event from a test event bus.
 */
export interface CapturedEvent {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
}

/**
 * A captured message from a test message bus.
 */
export interface CapturedMessage {
  readonly type: string;
  readonly payload: unknown;
  readonly timestamp: Date;
}

/**
 * Records log entries for assertions.
 */
export interface LogRecorder {
  readonly entries: readonly CapturedLogEntry[];
  record: (
    level: string,
    message: string,
    metadata?: Record<string, unknown>,
  ) => void;
  clear: () => void;
  findByLevel: (level: string) => readonly CapturedLogEntry[];
  findByMessage: (substring: string) => readonly CapturedLogEntry[];
}

/**
 * Records events for assertions.
 */
export interface EventRecorder {
  readonly entries: readonly CapturedEvent[];
  record: (type: string, payload: unknown) => void;
  clear: () => void;
  findByType: (type: string) => readonly CapturedEvent[];
}

/**
 * Records messages for assertions.
 */
export interface MessageRecorder {
  readonly entries: readonly CapturedMessage[];
  record: (type: string, payload: unknown) => void;
  clear: () => void;
  findByType: (type: string) => readonly CapturedMessage[];
}
