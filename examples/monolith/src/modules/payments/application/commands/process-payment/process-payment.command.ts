import { AppCommand } from "../../../../../shared/application/command.js";
import type { PaymentId, OrderId } from "../../../../../shared/domain/ids.js";

export class ProcessPaymentCommand extends AppCommand {
  public readonly type = "payments.process" as const;
  constructor(
    public readonly id: PaymentId,
    public readonly orderId: OrderId,
    public readonly amount: number,
    public readonly currency: string,
  ) {
    super();
  }
}
