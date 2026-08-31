export abstract class AppCommand {
  public abstract readonly type: string;
  public readonly timestamp: Date = new Date();
}
