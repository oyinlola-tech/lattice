import { AggregateRoot } from "../../../../shared/domain/aggregate-root.js";
import { createDomainEvent } from "../../../../shared/domain/event.js";
import type { OrderId, UserId, ProductId } from "../../../../shared/domain/ids.js";
import { Money } from "../../../products/domain/value-objects/money.value-object.js";

export enum OrderStatus { PENDING = "pending", CONFIRMED = "confirmed", SHIPPED = "shipped", DELIVERED = "delivered", CANCELLED = "cancelled" }

export interface OrderItem { readonly productId: ProductId; readonly quantity: number; readonly unitPrice: Money; }

export class Order extends AggregateRoot<OrderId> {
  private readonly _userId: UserId;
  private readonly _items: OrderItem[];
  private _status: OrderStatus;

  private constructor(id: OrderId, userId: UserId, items: OrderItem[], status: OrderStatus, createdAt?: Date) {
    super(id, createdAt);
    this._userId = userId;
    this._items = [...items];
    this._status = status;
  }

  public static create(id: OrderId, userId: UserId, items: readonly OrderItem[]): Order {
    if (items.length === 0) throw new Error("An order must have at least one item.");
    for (const item of items) { if (item.quantity <= 0) throw new Error("Item quantity must be positive."); }
    const order = new Order(id, userId, [...items], OrderStatus.PENDING);
    order.addEvent(createDomainEvent("order.created", id, {
      userId, items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice.amount })),
      totalAmount: order.totalAmount.amount,
    }));
    return order;
  }

  public get userId(): UserId { return this._userId; }
  public get items(): readonly OrderItem[] { return [...this._items]; }
  public get status(): OrderStatus { return this._status; }
  public get totalAmount(): Money {
    return this._items.reduce((t, i) => t.add(i.unitPrice.multiply(i.quantity)), Money.create(0));
  }

  public confirm(): void {
    if (this._status !== OrderStatus.PENDING) throw new Error(`Cannot confirm order in "${this._status}" status.`);
    this._status = OrderStatus.CONFIRMED;
    this.touch();
    this.addEvent(createDomainEvent("order.confirmed", this.id, { userId: this._userId, totalAmount: this.totalAmount.amount }));
  }

  public cancel(): void {
    if (this._status === OrderStatus.DELIVERED) throw new Error("Cannot cancel a delivered order.");
    if (this._status === OrderStatus.CANCELLED) throw new Error("Order is already cancelled.");
    const prev = this._status;
    this._status = OrderStatus.CANCELLED;
    this.touch();
    this.addEvent(createDomainEvent("order.cancelled", this.id, { userId: this._userId, previousStatus: prev }));
  }
}
