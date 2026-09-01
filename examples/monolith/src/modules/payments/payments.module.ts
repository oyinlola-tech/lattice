import { CommandBus } from "@oyinlola141/lattice-cqrs";
import type { PaymentRepository } from "./domain/repositories/payment.repository.js";
import { InMemoryPaymentRepository } from "./infrastructure/repositories/in-memory-payment.repository.js";
import { ProcessPaymentHandler } from "./application/commands/process-payment/process-payment.handler.js";

export class PaymentsModule {
  public readonly id = "payments";
  private readonly payments: PaymentRepository;
  private readonly commandBus: CommandBus;

  public constructor() {
    this.payments = new InMemoryPaymentRepository();
    this.commandBus = new CommandBus();
  }

  public initialize(): void {
    const handler = new ProcessPaymentHandler(this.payments);
    this.commandBus.register("payments.process", handler.execute.bind(handler));
  }

  public getCommandBus(): CommandBus {
    return this.commandBus;
  }
  public getPaymentRepository(): PaymentRepository {
    return this.payments;
  }
}
