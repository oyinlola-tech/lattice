export type UserId = string & { readonly __brand: "UserId" };
export type ProductId = string & { readonly __brand: "ProductId" };
export type OrderId = string & { readonly __brand: "OrderId" };
export type PaymentId = string & { readonly __brand: "PaymentId" };

export function createUserId(id: string): UserId {
  return id as UserId;
}
export function createProductId(id: string): ProductId {
  return id as ProductId;
}
export function createOrderId(id: string): OrderId {
  return id as OrderId;
}
export function createPaymentId(id: string): PaymentId {
  return id as PaymentId;
}
