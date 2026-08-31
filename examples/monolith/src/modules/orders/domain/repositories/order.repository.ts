import type { Repository } from "../../../../shared/application/repository.js";
import type { Order } from "../entities/order.entity.js";
import type { OrderId, UserId } from "../../../../shared/domain/ids.js";

export interface OrderRepository extends Repository<Order, OrderId> {
  findByUserId(userId: UserId): Promise<readonly Order[]>;
}
