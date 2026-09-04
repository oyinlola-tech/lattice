import {
  BaseError,
  ErrorCategory,
  ErrorCode,
  ErrorSeverity,
} from "@zudojs/errors";

import type {
  Command,
  CommandBus as CommandBusContract,
  CommandHandlerLike,
  CqrsContext,
  CqrsMiddleware,
} from "../cqrsTypes/cqrsTypes.type.js";

import {
  CommandHandler,
  executeCommandHandler,
} from "../command/commandHandler.core.js";

/**
 * Options for constructing a command bus.
 */
export interface CommandBusOptions {
  readonly middleware?: readonly CqrsMiddleware[];

  /**
   * Creates a default execution context when one is not supplied.
   */
  readonly contextFactory?: () => CqrsContext | Promise<CqrsContext>;
}

/**
 * Registered command handler.
 */
export interface CommandRegistration<
  TCommand extends Command = Command,
  TResult = void,
> {
  readonly commandType: TCommand["type"];

  readonly handler: CommandHandlerLike<TCommand, TResult>;
}

/**
 * Command bus implementation.
 *
 * The command bus resolves a handler by command type and executes it
 * through the registered middleware pipeline.
 */
export class CommandBus implements CommandBusContract {
  private readonly handlers = new Map<string, CommandHandlerLike>();

  private readonly middleware: CqrsMiddleware[];

  private readonly contextFactory?: () => CqrsContext | Promise<CqrsContext>;

  constructor(options: CommandBusOptions = {}) {
    this.middleware = [...(options.middleware ?? [])];

    this.contextFactory = options.contextFactory;
  }

  /**
   * Registers a command handler.
   */
  public register<TCommand extends Command, TResult = void>(
    commandType: TCommand["type"],
    handler: CommandHandlerLike<TCommand, TResult>,
  ): this {
    if (!commandType.trim()) {
      throw new TypeError("Command type cannot be empty.");
    }

    if (!handler) {
      throw new TypeError(
        `A handler is required for command "${commandType}".`,
      );
    }

    if (this.handlers.has(commandType)) {
      throw new Error(
        `A handler is already registered for command "${commandType}".`,
      );
    }

    this.handlers.set(commandType, handler as CommandHandlerLike);

    return this;
  }

  /**
   * Registers multiple command handlers.
   */
  public registerMany(registrations: readonly CommandRegistration[]): this {
    for (const registration of registrations) {
      this.register(registration.commandType, registration.handler);
    }

    return this;
  }

  /**
   * Replaces an existing command handler.
   */
  public replace<TCommand extends Command, TResult = void>(
    commandType: TCommand["type"],
    handler: CommandHandlerLike<TCommand, TResult>,
  ): this {
    if (!commandType.trim()) {
      throw new TypeError("Command type cannot be empty.");
    }

    this.handlers.set(commandType, handler as CommandHandlerLike);

    return this;
  }

  /**
   * Removes a command handler.
   */
  public unregister(commandType: string): boolean {
    return this.handlers.delete(commandType);
  }

  /**
   * Determines whether a command handler is registered.
   */
  public has(commandType: string): boolean {
    return this.handlers.has(commandType);
  }

  /**
   * Returns the registered handler for a command type.
   */
  public getHandler<TCommand extends Command, TResult = void>(
    commandType: TCommand["type"],
  ): CommandHandlerLike<TCommand, TResult> | undefined {
    return this.handlers.get(commandType) as
      CommandHandlerLike<TCommand, TResult> | undefined;
  }

  /**
   * Executes a command.
   */
  public async execute<TCommand extends Command, TResult = void>(
    command: TCommand,
    context?: CqrsContext,
  ): Promise<TResult> {
    this.validateCommand(command);

    const handler = this.getHandler<TCommand, TResult>(command.type);

    if (!handler) {
      throw new BaseError(
        `No handler is registered for command "${command.type}".`,
        {
          code: ErrorCode.COMMAND_HANDLER_NOT_FOUND,
          category: ErrorCategory.SYSTEM,
          severity: ErrorSeverity.ERROR,
          statusCode: 500,
          expose: false,
          isOperational: true,
          metadata: {
            commandType: command.type,
          },
        },
      );
    }

    const executionContext = await this.resolveContext(context);

    const pipeline = this.buildPipeline<TCommand, TResult>(handler);

    return pipeline(command, executionContext);
  }

  /**
   * Adds middleware to the end of the pipeline.
   */
  public use(middleware: CqrsMiddleware): this {
    if (typeof middleware !== "function") {
      throw new TypeError("Command middleware must be a function.");
    }

    this.middleware.push(middleware);

    return this;
  }

  /**
   * Returns the number of registered handlers.
   */
  public size(): number {
    return this.handlers.size;
  }

  /**
   * Removes all registered handlers.
   */
  public clear(): void {
    this.handlers.clear();
  }

  /**
   * Returns all registered command types.
   */
  public getCommandTypes(): readonly string[] {
    return [...this.handlers.keys()];
  }

  /**
   * Builds the command execution pipeline.
   */
  private buildPipeline<TCommand extends Command, TResult>(
    handler: CommandHandlerLike<TCommand, TResult>,
  ): (command: TCommand, context?: CqrsContext) => Promise<TResult> {
    let next = async (
      command: TCommand,
      context?: CqrsContext,
    ): Promise<TResult> =>
      executeCommandHandler(
        handler as
          | CommandHandler<TCommand, TResult>
          | ((
              command: TCommand,
              context?: CqrsContext,
            ) => TResult | Promise<TResult>),
        command,
        context,
      );

    for (let index = this.middleware.length - 1; index >= 0; index--) {
      const middleware = this.middleware[index]!;

      const current = next;

      next = async (command, context) =>
        middleware(
          command,
          context,
          current as (
            request: Command | import("../cqrsTypes/cqrsTypes.type.js").Query,
            context?: CqrsContext,
          ) => Promise<unknown>,
        ) as Promise<TResult>;
    }

    return next;
  }

  /**
   * Resolves the execution context.
   */
  private async resolveContext(context?: CqrsContext): Promise<CqrsContext> {
    if (context) {
      return context;
    }

    if (this.contextFactory) {
      return await this.contextFactory();
    }

    return {};
  }

  /**
   * Validates a command before execution.
   */
  private validateCommand(command: Command): void {
    if (!command || typeof command !== "object") {
      throw new BaseError("A valid command is required.", {
        code: ErrorCode.INVALID_COMMAND,
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        statusCode: 400,
        expose: true,
        isOperational: true,
      });
    }

    if (typeof command.type !== "string" || command.type.trim().length === 0) {
      throw new BaseError("Command type is required.", {
        code: ErrorCode.INVALID_COMMAND,
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.WARNING,
        statusCode: 400,
        expose: true,
        isOperational: true,
      });
    }
  }
}

/**
 * Creates a command bus.
 */
export function createCommandBus(options: CommandBusOptions = {}): CommandBus {
  return new CommandBus(options);
}
