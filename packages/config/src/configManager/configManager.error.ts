/**
 * Error thrown when complete configuration validation fails.
 */
export class ConfigManagerValidationError
  extends Error {
  readonly issues:
    readonly unknown[];

  constructor(
    issues: readonly unknown[],
  ) {
    super(
      `Configuration validation failed with ${issues.length} issue${
        issues.length === 1
          ? ""
          : "s"
      }.`,
    );

    this.name =
      "ConfigManagerValidationError";

    this.issues =
      Object.freeze([
        ...issues,
      ]);

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}
