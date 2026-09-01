import { ErrorSeverity, ErrorCategory } from "@lattice/errors";

export class NotificationNotFoundError extends Error {
  readonly statusCode = 404;
  readonly isOperational = true;

  constructor(notificationId: string) {
    super(`Notification not found: ${notificationId}`);
    this.name = "NotificationNotFoundError";
  }
}

export class NotificationValidationError extends Error {
  readonly statusCode = 400;
  readonly isOperational = true;

  constructor(message: string) {
    super(message);
    this.name = "NotificationValidationError";
  }
}
