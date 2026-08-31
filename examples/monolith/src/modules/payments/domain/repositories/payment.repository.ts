import type { Repository } from "../../../../shared/application/repository.js";
import type { Payment } from "../entities/payment.entity.js";
import type { PaymentId } from "../../../../shared/domain/ids.js";

export interface PaymentRepository extends Repository<Payment, PaymentId> {}
