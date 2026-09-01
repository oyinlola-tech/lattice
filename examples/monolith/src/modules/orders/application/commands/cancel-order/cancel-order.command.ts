import { AppCommand } from "../../../../../shared/application/command.js";
import type { OrderId } from "../../../../../shared/domain/ids.js";

export class CancelOrderCommand extends AppCommand {
  public readonly type = "orders.cancel" as const;
  constructor(public readonly orderId: OrderId) {
    super();
  }
}
