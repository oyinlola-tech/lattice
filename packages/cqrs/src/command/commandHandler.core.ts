import type {
  CommandHandler as CommandHandlerContract,
  Command,
  CqrsContext,
} from "../cqrsTypes/cqrsTypes.type.js";

/**
 * Abstract base class for command handlers.
 *
 * A command handler contains the application logic required to execute
 * one specific command.
 */
export abstract class CommandHandler<
  TCommand extends Command = Command,
  TResult = void,
> implements CommandHandlerContract<
  TCommand,
  TResult
> {
  /**
   * Command type handled by this handler.
   */
  public abstract readonly commandType: TCommand["type"];

  /**
   * Executes the command.
   */
  public abstract execute(
    command: TCommand,
    context?: CqrsContext,
  ): Promise<TResult> | TResult;
}

/**
 * Function-based command handler implementation.
 */
export class FunctionCommandHandler<
  TCommand extends Command = Command,
  TResult = void,
> extends CommandHandler<
  TCommand,
  TResult
> {
  public readonly commandType: TCommand["type"];

  private readonly handler: (
    command: TCommand,
    context?: CqrsContext,
  ) =>
    | TResult
    | Promise<TResult>;

  constructor(
    commandType: TCommand["type"],
    handler: (
      command: TCommand,
      context?: CqrsContext,
    ) =>
      | TResult
      | Promise<TResult>,
  ) {
    super();

    if (
      typeof handler !==
      "function"
    ) {
      throw new TypeError(
        "Command handler must be a function.",
      );
    }

    this.commandType =
      commandType;

    this.handler =
      handler;
  }

  public execute(
    command: TCommand,
    context?: CqrsContext,
  ):
    | TResult
    | Promise<TResult> {
    return this.handler(
      command,
      context,
    );
  }
}

/**
 * Creates a function-based command handler.
 */
export function createCommandHandler<
  TCommand extends Command,
  TResult = void,
>(
  commandType: TCommand["type"],
  handler: (
    command: TCommand,
    context?: CqrsContext,
  ) =>
    | TResult
    | Promise<TResult>,
): FunctionCommandHandler<
  TCommand,
  TResult
> {
  return new FunctionCommandHandler(
    commandType,
    handler,
  );
}

/**
 * Determines whether a value is a command handler instance.
 */
export function isCommandHandler(
  value: unknown,
): value is CommandHandler {
  return (
    value instanceof
    CommandHandler
  );
}

/**
 * Determines whether a value can be used as a command handler.
 */
export function isCommandHandlerLike(
  value: unknown,
): value is CommandHandler | ((
  command: Command,
  context?: CqrsContext,
) => unknown) {
  return (
    value instanceof
      CommandHandler ||
    typeof value ===
      "function"
  );
}

/**
 * Executes either an object-based or function-based command handler.
 */
export async function executeCommandHandler<
  TCommand extends Command,
  TResult = void,
>(
  handler:
    | CommandHandler<TCommand, TResult>
    | ((
        command: TCommand,
        context?: CqrsContext,
      ) =>
        | TResult
        | Promise<TResult>),
  command: TCommand,
  context?: CqrsContext,
): Promise<TResult> {
  if (
    handler instanceof
    CommandHandler
  ) {
    return await handler.execute(
      command,
      context,
    );
  }

  if (
    typeof handler ===
    "function"
  ) {
    return await handler(
      command,
      context,
    );
  }

  throw new TypeError(
    `Invalid command handler for "${command.type}".`,
  );
}