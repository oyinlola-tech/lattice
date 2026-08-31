export abstract class ValueObject<T extends Record<string, unknown>> {
  protected readonly props: Readonly<T>;
  protected constructor(props: T) { this.props = Object.freeze({ ...props }); }
  public equals(other: ValueObject<T>): boolean {
    return JSON.stringify(this.props) === JSON.stringify(other.props);
  }
}
