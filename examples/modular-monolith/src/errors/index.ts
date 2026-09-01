export class ApplicationError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly expose: boolean;

  public constructor(
    message: string,
    options: {
      code?: string;
      statusCode?: number;
      expose?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message, { cause: options.cause });
    this.name = "ApplicationError";
    this.code = options.code ?? "APPLICATION_ERROR";
    this.statusCode = options.statusCode ?? 500;
    this.expose = options.expose ?? false;
  }
}

export class NotFoundError extends ApplicationError {
  public constructor(resource: string, id?: string) {
    const message = id
      ? `${resource} with id "${id}" not found`
      : `${resource} not found`;
    super(message, { code: "NOT_FOUND", statusCode: 404, expose: true });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends ApplicationError {
  public readonly issues: readonly { path: string; message: string }[];

  public constructor(
    message: string,
    issues: readonly { path: string; message: string }[] = [],
  ) {
    super(message, { code: "VALIDATION_ERROR", statusCode: 400, expose: true });
    this.name = "ValidationError";
    this.issues = issues;
  }
}

export class ConflictError extends ApplicationError {
  public constructor(message: string) {
    super(message, { code: "CONFLICT", statusCode: 409, expose: true });
    this.name = "ConflictError";
  }
}

export class UnauthorizedError extends ApplicationError {
  public constructor(message = "Unauthorized") {
    super(message, { code: "UNAUTHORIZED", statusCode: 401, expose: true });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends ApplicationError {
  public constructor(message = "Forbidden") {
    super(message, { code: "FORBIDDEN", statusCode: 403, expose: true });
    this.name = "ForbiddenError";
  }
}
