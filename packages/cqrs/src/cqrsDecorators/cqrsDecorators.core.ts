import type { Command, Query } from "../cqrsTypes/cqrsTypes.type.js";

/**
 * Metadata key used to identify CQRS handler configuration.
 */
const CQRS_HANDLER_METADATA = Symbol.for("zudolib.cqrs.handler");

/**
 * Metadata key used to identify command handler configuration.
 */
const COMMAND_HANDLER_METADATA = Symbol.for("zudolib.cqrs.command-handler");

/**
 * Metadata key used to identify query handler configuration.
 */
const QUERY_HANDLER_METADATA = Symbol.for("zudolib.cqrs.query-handler");

/**
 * Metadata key used to identify command/query type information.
 */
const CQRS_TYPE_METADATA = Symbol.for("zudolib.cqrs.type");

/**
 * Supported CQRS handler kinds.
 */
export type CqrsHandlerKind = "command" | "query";

/**
 * Metadata attached to a CQRS handler class.
 */
export interface CqrsHandlerMetadata {
  readonly kind: CqrsHandlerKind;
  readonly type: string;
}

/**
 * Metadata attached to a command handler.
 */
export interface CommandHandlerMetadata<
  TCommand extends Command = Command,
> extends CqrsHandlerMetadata {
  readonly kind: "command";
  readonly type: TCommand["type"];
}

/**
 * Metadata attached to a query handler.
 */
export interface QueryHandlerMetadata<
  TQuery extends Query = Query,
> extends CqrsHandlerMetadata {
  readonly kind: "query";
  readonly type: TQuery["type"];
}

/**
 * Generic constructor type used by decorators.
 */
export type CqrsClass<TInstance = object> = new (
  ...args: unknown[]
) => TInstance;

/**
 * Constructor decorated with CQRS metadata.
 */
export type DecoratedCqrsClass<TInstance = object> = CqrsClass<TInstance> & {
  readonly [CQRS_HANDLER_METADATA]?: CqrsHandlerMetadata;
  readonly [COMMAND_HANDLER_METADATA]?: CommandHandlerMetadata;
  readonly [QUERY_HANDLER_METADATA]?: QueryHandlerMetadata;
  readonly [CQRS_TYPE_METADATA]?: string;
};

/**
 * Marks a class as a CQRS handler.
 *
 * This decorator is useful when a framework or dependency injection
 * container needs to discover handlers automatically.
 */
export function CqrsHandler<TType extends string>(
  kind: CqrsHandlerKind,
  type: TType,
): ClassDecorator {
  validateHandlerMetadata(kind, type);

  return (target) => {
    const constructor = target as unknown as DecoratedCqrsClass;

    const metadata: CqrsHandlerMetadata = Object.freeze({
      kind,
      type,
    });

    Object.defineProperty(constructor, CQRS_HANDLER_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: metadata,
    });

    Object.defineProperty(constructor, CQRS_TYPE_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: type,
    });
  };
}

/**
 * Marks a class as a command handler.
 */
export function CommandHandler(type: string): ClassDecorator {
  validateHandlerMetadata("command", type);

  return (target) => {
    const constructor = target as unknown as DecoratedCqrsClass;

    const metadata: CommandHandlerMetadata = Object.freeze({
      kind: "command",
      type,
    });

    Object.defineProperty(constructor, COMMAND_HANDLER_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: metadata,
    });

    Object.defineProperty(constructor, CQRS_HANDLER_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: metadata,
    });

    Object.defineProperty(constructor, CQRS_TYPE_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: type,
    });
  };
}

/**
 * Marks a class as a query handler.
 */
export function QueryHandler(type: string): ClassDecorator {
  validateHandlerMetadata("query", type);

  return (target) => {
    const constructor = target as unknown as DecoratedCqrsClass;

    const metadata: QueryHandlerMetadata = Object.freeze({
      kind: "query",
      type,
    });

    Object.defineProperty(constructor, QUERY_HANDLER_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: metadata,
    });

    Object.defineProperty(constructor, CQRS_HANDLER_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: metadata,
    });

    Object.defineProperty(constructor, CQRS_TYPE_METADATA, {
      configurable: false,
      enumerable: false,
      writable: false,
      value: type,
    });
  };
}

/**
 * Reads generic CQRS handler metadata from a class.
 */
export function getCqrsHandlerMetadata(
  target: unknown,
): CqrsHandlerMetadata | undefined {
  if (typeof target !== "function") {
    return undefined;
  }

  return (target as DecoratedCqrsClass)[CQRS_HANDLER_METADATA] ?? undefined;
}

/**
 * Reads command handler metadata from a class.
 */
export function getCommandHandlerMetadata(
  target: unknown,
): CommandHandlerMetadata | undefined {
  if (typeof target !== "function") {
    return undefined;
  }

  return (target as DecoratedCqrsClass)[COMMAND_HANDLER_METADATA] ?? undefined;
}

/**
 * Reads query handler metadata from a class.
 */
export function getQueryHandlerMetadata(
  target: unknown,
): QueryHandlerMetadata | undefined {
  if (typeof target !== "function") {
    return undefined;
  }

  return (target as DecoratedCqrsClass)[QUERY_HANDLER_METADATA] ?? undefined;
}

/**
 * Reads the CQRS type discriminator from a class.
 */
export function getCqrsType(target: unknown): string | undefined {
  if (typeof target !== "function") {
    return undefined;
  }

  return (target as DecoratedCqrsClass)[CQRS_TYPE_METADATA] ?? undefined;
}

/**
 * Determines whether a class is decorated as a CQRS handler.
 */
export function isCqrsHandler(target: unknown): boolean {
  return getCqrsHandlerMetadata(target) !== undefined;
}

/**
 * Determines whether a class is decorated as a command handler.
 */
export function isCommandHandler(target: unknown): boolean {
  return getCommandHandlerMetadata(target) !== undefined;
}

/**
 * Determines whether a class is decorated as a query handler.
 */
export function isQueryHandler(target: unknown): boolean {
  return getQueryHandlerMetadata(target) !== undefined;
}

/**
 * Creates a reusable command handler decorator.
 */
export function createCommandHandlerDecorator(type: string): ClassDecorator {
  return CommandHandler(type);
}

/**
 * Creates a reusable query handler decorator.
 */
export function createQueryHandlerDecorator(type: string): ClassDecorator {
  return QueryHandler(type);
}

/**
 * Validates decorator arguments.
 */
function validateHandlerMetadata(kind: CqrsHandlerKind, type: string): void {
  if (typeof type !== "string" || type.trim().length === 0) {
    throw new TypeError(`${kind} handler type cannot be empty.`);
  }
}
