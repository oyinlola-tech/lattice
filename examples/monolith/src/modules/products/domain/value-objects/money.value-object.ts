import { ValueObject } from "../../../../shared/domain/value-object.js";

type MoneyProps = { amount: number; currency: string; };

export class Money extends ValueObject<MoneyProps> {
  private constructor(amount: number, currency: string) { super({ amount, currency }); }

  public static create(amount: number, currency: string = "USD"): Money {
    if (amount < 0) throw new Error("Amount cannot be negative.");
    return new Money(amount, currency);
  }

  public get amount(): number { return this.props.amount; }
  public get currency(): string { return this.props.currency; }

  public add(other: Money): Money {
    if (this.props.currency !== other.props.currency) throw new Error("Cannot add different currencies.");
    return new Money(this.props.amount + other.props.amount, this.props.currency);
  }

  public multiply(factor: number): Money { return new Money(this.props.amount * factor, this.props.currency); }
  public format(): string { return `${this.props.currency} ${this.props.amount.toFixed(2)}`; }
}
