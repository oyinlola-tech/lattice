import type {
  Command as CommandContract,
} from "../cqrsTypes/cqrsTypes.type.js";

/**
 * Base abstract command.
 *
 * Commands represent requests to change application state.
 * Each concrete command should define a unique static type and
 * immutable command data.
 */
export abstract class Command<
  TType extends string = string,
> implements CommandContract<TType> {
  public readonly type: TType;

  protected constructor(
    type: TType,
  ) {
    this.type = type;
  }
}

/**
 * Options used when constructing a concrete command.
 */
export interface CommandOptions {
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Command containing immutable metadata.
 */
export abstract class MetadataCommand<
  TType extends string = string,
> extends Command<TType> {
  public readonly metadata?: Readonly<
    Record<string, unknown>
  >;

  protected constructor(
    type: TType,
    options: CommandOptions = {},
  ) {
    super(type);

    this.metadata =
      options.metadata;
  }
}

/**
 * Creates a simple immutable command object.
 */
export function createCommand<
  TType extends string,
  TPayload extends Record<
    string,
    unknown
  > = Record<string, never>,
>(
  type: TType,
  payload?: TPayload,
): Readonly<
  {
    readonly type: TType;
  } & TPayload
> {
  return Object.freeze({
    type,
    ...(payload ?? ({} as TPayload)),
  }) as Readonly<
    {
      readonly type: TType;
    } & TPayload
  >;
}

/**
 * Returns the command type discriminator.
 */
export function getCommandType(
  command: CommandContract,
): string {
  return command.type;
}

/**
 * Determines whether a value is a command.
 */
export function isCommand(
  value: unknown,
): value is CommandContract {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    typeof (
      value as {
        type?: unknown;
      }
    ).type === "string" &&
    (
      value as {
        type: string;
      }
    ).type.length > 0
  );
}

/**
 * Creates a command type factory.
 *
 * This is useful when defining a family of related commands while
 * keeping their discriminator values consistent.
 */
export function commandType<
  TType extends string,
>(
  type: TType,
): () => TType {
  return () => type;
}