import type {
  Logger,
} from "@lattice/logger";

/**
 * Signal handler for process lifecycle events.
 */
export class SignalHandler {
  private readonly logger: Logger;
  private readonly handleSignals: boolean;
  private readonly handleFatalErrors: boolean;
  private shutdownHandler: (() => void) | null = null;
  private isShuttingDown = false;

  public constructor(
    logger: Logger,
    options: {
      readonly handleSignals: boolean;
      readonly handleFatalErrors: boolean;
    },
  ) {
    this.logger = logger;
    this.handleSignals = options.handleSignals;
    this.handleFatalErrors = options.handleFatalErrors;
  }

  /**
   * Registers signal handlers.
   */
  public register(
    shutdownHandler: () => void,
  ): void {
    this.shutdownHandler = shutdownHandler;

    if (this.handleSignals) {
      process.on("SIGTERM", this.handleTermination);
      process.on("SIGINT", this.handleInterruption);
    }

    if (this.handleFatalErrors) {
      process.on("uncaughtException", this.handleUncaughtException);
      process.on("unhandledRejection", this.handleUnhandledRejection);
    }
  }

  /**
   * Removes all signal handlers.
   */
  public unregister(): void {
    if (this.handleSignals) {
      process.off("SIGTERM", this.handleTermination);
      process.off("SIGINT", this.handleInterruption);
    }

    if (this.handleFatalErrors) {
      process.off("uncaughtException", this.handleUncaughtException);
      process.off("unhandledRejection", this.handleUnhandledRejection);
    }

    this.shutdownHandler = null;
  }

  /**
   * Handles SIGTERM signal.
   */
  private handleTermination = (): void => {
    this.logger.info("Received SIGTERM signal.");
    this.initiateShutdown();
  };

  /**
   * Handles SIGINT signal.
   */
  private handleInterruption = (): void => {
    this.logger.info("Received SIGINT signal.");
    this.initiateShutdown();
  };

  /**
   * Handles uncaught exceptions.
   */
  private handleUncaughtException = (error: Error): void => {
    this.logger.error("Uncaught exception.", { errorMessage: error.message });

    if (this.handleFatalErrors) {
      this.initiateShutdown();
    }
  };

  /**
   * Handles unhandled promise rejections.
   */
  private handleUnhandledRejection = (reason: unknown): void => {
    const message = reason instanceof Error ? reason.message : String(reason);
    this.logger.error("Unhandled rejection.", { reason: message });

    if (this.handleFatalErrors) {
      this.initiateShutdown();
    }
  };

  /**
   * Initiates graceful shutdown.
   */
  private initiateShutdown(): void {
    if (this.isShuttingDown) {
      this.logger.warn("Shutdown already in progress, ignoring signal.");
      return;
    }

    this.isShuttingDown = true;

    if (this.shutdownHandler) {
      this.shutdownHandler();
    }
  }
}
