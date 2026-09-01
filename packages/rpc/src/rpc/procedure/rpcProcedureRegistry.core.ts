import type { RPCProcedure } from "./rpcProcedure.type.js";

import {
  RPCDuplicateProcedureError,
  RPCProcedureNotFoundError,
} from "../errors/rpc.errors.js";

import { MAX_PROCEDURES } from "../constants/rpcConstants.core.js";

/**
 * Registry for RPC procedures.
 *
 * Enforces uniqueness and provides O(1) lookup by procedure name.
 */
export class RPCProcedureRegistry {
  private readonly procedures = new Map<string, RPCProcedure>();

  /**
   * Registers a procedure.
   *
   * @throws {RPCDuplicateProcedureError} if a procedure with the same name is already registered.
   */
  register(procedure: RPCProcedure): void {
    if (this.procedures.size >= MAX_PROCEDURES) {
      throw new Error(
        `Maximum number of procedures (${MAX_PROCEDURES}) exceeded.`,
      );
    }

    const existing = this.procedures.get(procedure.name);
    if (existing !== undefined) {
      throw new RPCDuplicateProcedureError(procedure.name);
    }

    this.procedures.set(procedure.name, Object.freeze(procedure));
  }

  /**
   * Retrieves a procedure by name.
   */
  get(name: string): RPCProcedure | undefined {
    return this.procedures.get(name);
  }

  /**
   * Determines whether a procedure is registered.
   */
  has(name: string): boolean {
    return this.procedures.has(name);
  }

  /**
   * Retrieves a procedure by name or throws.
   */
  require(name: string): RPCProcedure {
    const procedure = this.get(name);
    if (procedure === undefined) {
      throw new RPCProcedureNotFoundError(name);
    }
    return procedure;
  }

  /**
   * Returns all registered procedure names.
   */
  list(): readonly string[] {
    return Array.from(this.procedures.keys());
  }

  /**
   * Unregisters a procedure.
   */
  unregister(name: string): boolean {
    return this.procedures.delete(name);
  }

  /**
   * Clears all registered procedures.
   */
  clear(): void {
    this.procedures.clear();
  }
}
