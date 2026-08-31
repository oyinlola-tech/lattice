/**
 * Ability — pre-resolved authorization context for a specific actor.
 *
 * @module ability/ability
 */

import type {
  PermissionActor,
  PermissionDecision,
  ExplainResult,
  AuthorizationOptions,
} from "../permissionTypes/index.js";
import { evaluate, evaluateWithExplain } from "../evaluator/evaluator.core.js";
import type { EvaluatorOptions } from "../evaluator/evaluator.pipeline.js";
import { PermissionDeniedError } from "../permissionErrors/index.js";

/**
 * An Ability provides fast permission checks for a pre-resolved actor.
 */
export interface Ability {
  /** Check if the actor can perform the action. Returns boolean. */
  can(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<boolean>;
  /** Check if the actor cannot perform the action. Returns boolean. */
  cannot(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<boolean>;
  /** Full authorization check with decision details. */
  check(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<PermissionDecision>;
  /** Explain the authorization decision with step-by-step trace. */
  explain(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<ExplainResult>;
  /** Throw PermissionDeniedError if not allowed. */
  authorize(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<void>;
  /** The actor this ability was created for. */
  readonly actor: PermissionActor;
}

/**
 * Create an Ability for an actor.
 */
export function createAbility(
  actor: PermissionActor,
  evaluatorOptions: EvaluatorOptions,
): Ability {
  return {
    actor,

    async can(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<boolean> {
      const decision = await evaluate(actor, permission, resource, evaluatorOptions, options);
      return decision.allowed;
    },

    async cannot(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<boolean> {
      return !(await this.can(permission, resource, options));
    },

    async check(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<PermissionDecision> {
      return evaluate(actor, permission, resource, evaluatorOptions, options);
    },

    async explain(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<ExplainResult> {
      return evaluateWithExplain(actor, permission, resource, evaluatorOptions, options);
    },

    async authorize(permission: string, resource?: unknown, options?: AuthorizationOptions): Promise<void> {
      const decision = await evaluate(actor, permission, resource, evaluatorOptions, options);
      if (!decision.allowed) {
        throw new PermissionDeniedError(decision.reason ?? "Access denied", {
          actorId: actor.id,
          permission,
        });
      }
    },
  };
}
