import type { ProcessPaymentCommand } from "./process-payment.command.js";
import type { PaymentRepository } from "../../../domain/repositories/payment.repository.js";
import { Payment } from "../../../domain/entities/payment.entity.js";
import { Money } from "../../../../products/domain/value-objects/money.value-object.js";

export class ProcessPaymentHandler {
  constructor(private readonly payments: PaymentRepository) {}

  public async execute(command: ProcessPaymentCommand): Promise<void> {
    const amount = Money.create(command.amount, command.currency);
    const payment = Payment.create(command.id, command.orderId, amount);
    payment.complete();
    await this.payments.save(payment);
  }
}
