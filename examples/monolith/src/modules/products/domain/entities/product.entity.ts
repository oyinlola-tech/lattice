import { Entity } from "../../../../shared/domain/entity.js";
import type { ProductId } from "../../../../shared/domain/ids.js";
import { Money } from "../value-objects/money.value-object.js";

export class Product extends Entity<ProductId> {
  private _name: string;
  private _description: string;
  private _price: Money;
  private _stock: number;

  private constructor(
    id: ProductId,
    name: string,
    description: string,
    price: Money,
    stock: number,
    createdAt?: Date,
  ) {
    super(id, createdAt);
    this._name = name;
    this._description = description;
    this._price = price;
    this._stock = stock;
  }

  public static create(
    id: ProductId,
    name: string,
    description: string,
    price: Money,
    stock: number,
  ): Product {
    if (name.trim().length === 0)
      throw new Error("Product name cannot be empty.");
    if (stock < 0) throw new Error("Stock cannot be negative.");
    return new Product(id, name, description, price, stock);
  }

  public get name(): string {
    return this._name;
  }
  public get description(): string {
    return this._description;
  }
  public get price(): Money {
    return this._price;
  }
  public get stock(): number {
    return this._stock;
  }
  public get inStock(): boolean {
    return this._stock > 0;
  }

  public reserveStock(quantity: number): void {
    if (quantity <= 0) throw new Error("Quantity must be positive.");
    if (this._stock < quantity)
      throw new Error(`Insufficient stock for "${this._name}".`);
    this._stock -= quantity;
    this.touch();
  }
}
