export abstract class AppQuery<TResult = unknown> {
  public abstract readonly type: string;
  public readonly timestamp: Date = new Date();
}
