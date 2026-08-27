/**
 * Runtime manager error.
 */
export class RuntimeManagerError
  extends Error {
  public readonly code: string;

  public constructor(
    message: string,
    code: string,
  ) {
    super(message);

    this.name = "RuntimeManagerError";
    this.code = code;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}
