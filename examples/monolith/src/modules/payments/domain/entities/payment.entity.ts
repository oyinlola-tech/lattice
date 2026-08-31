import { Entity } from "../../../../shared/domain/entity.js";
import type { PaymentId, OrderId } from "../../../../shared/domain/ids.js";
import { Money } from "../../../products/domain/value-objects/money.value-object.js";

export enum PaymentStatus { PENDING = "pending", COMPLETED = "completed", FAILED = "failed" }

export class Payment extends Entity<PaymentId> {
  private readonly _orderId: OrderId;
  private readonly _amount: Money;
  private _status: PaymentStatus;

  private constructor(id: PaymentId, orderId: OrderId, amount: Money, status: PaymentStatus, createdAt?: Date) {
    super(id, createdAt);
    this._orderId = orderId;
    this._amount = amount;
    this._status = status;
  }

  public static create(id: PaymentId, orderId: OrderId, amount: Money): Payment {
    return new Payment(id, orderId, amount, PaymentStatus.PENDING);
  }

  public get orderId(): OrderId { return this._orderId; }
  public get amount(): Money { return this._amount; }
  public get status(): PaymentStatus { return this._status; }

  public complete(): void {
    if (this._status !== PaymentStatus.PENDING) throw new Error(`Cannot complete payment in "${this._status}" status.`);
    this._status = PaymentStatus.COMPLETED;
    this.touch();
  }
}
