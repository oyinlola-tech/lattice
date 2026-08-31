/**
 * Authorization engine — the main public API for permission checks.
 *
 * @module evaluator/authorizationEngine
 */

import type {
  PermissionActor,
  PermissionDecision,
  ExplainResult,
  PermissionRule,
  PermissionPolicyDefinition,
  AuthorizationOptions,
} from "../permissionTypes/index.js";
import type { RoleDefinition } from "../permissionTypes/index.js";
import { evaluate, evaluateWithExplain } from "./evaluator.core.js";
import type { EvaluatorOptions } from "./evaluator.pipeline.js";
import { createAbility, type Ability } from "../ability/ability.core.js";
import { PermissionDeniedError } from "../permissionErrors/index.js";

/** Configuration for the permission engine. */
export interface PermissionEngineOptions {
  /** Roles available to the engine. */
  readonly roles?: readonly RoleDefinition[];
  /** Policies to evaluate during authorization. */
  readonly policies?: readonly PermissionPolicyDefinition[];
  /** Default timeout for async policy evaluation (ms). */
  readonly policyTimeout?: number;
}

/**
 * The public permission engine API.
 */
export interface PermissionEngine {
  /**
   * Check if the actor can perform the action. Returns boolean.
   */
  can(
    actor: PermissionActor,
    permission: string,
    resource?: unknown,
    options?: AuthorizationOptions,
  ): Promise<boolean>;

  /**
   * Full authorization check with decision details.
   */
  check(
    actor: PermissionActor,
    permission: string,
    resource?: unknown,
    options?: AuthorizationOptions,
  ): Promise<PermissionDecision>;

  /**
   * Throw PermissionDeniedError if the actor is not authorized.
   */
  authorize(
    actor: PermissionActor,
    permission: string,
    resource?: unknown,
    options?: AuthorizationOptions,
  ): Promise<void>;

  /**
   * Explain the authorization decision with step-by-step trace.
   */
  explain(
    actor: PermissionActor,
    permission: string,
    resource?: unknown,
    options?: AuthorizationOptions,
  ): Promise<ExplainResult>;

  /**
   * Create a pre-resolved Ability for an actor.
   */
  createAbility(actor: PermissionActor): Ability;
}

/**
 * Create a permission engine.
 */
export function createPermissionEngine(
  options?: PermissionEngineOptions,
): PermissionEngine {
  const roleMap = new Map<string, RoleDefinition>();
  if (options?.roles) {
    for (const role of options.roles) {
      roleMap.set(role.name, role);
    }
  }

  const evaluatorOptions: EvaluatorOptions = {
    getRole: (name: string) => roleMap.get(name),
    policies: options?.policies,
    policyTimeout: options?.policyTimeout,
  };

  return {
    async can(
      actor: PermissionActor,
      permission: string,
      resource?: unknown,
      authOptions?: AuthorizationOptions,
    ): Promise<boolean> {
      const decision = await evaluate(actor, permission, resource, evaluatorOptions, authOptions);
      return decision.allowed;
    },

    async check(
      actor: PermissionActor,
      permission: string,
      resource?: unknown,
      authOptions?: AuthorizationOptions,
    ): Promise<PermissionDecision> {
      return evaluate(actor, permission, resource, evaluatorOptions, authOptions);
    },

    async authorize(
      actor: PermissionActor,
      permission: string,
      resource?: unknown,
      authOptions?: AuthorizationOptions,
    ): Promise<void> {
      const decision = await evaluate(actor, permission, resource, evaluatorOptions, authOptions);
      if (!decision.allowed) {
        throw new PermissionDeniedError(decision.reason ?? "Access denied", {
          actorId: actor.id,
          permission,
        });
      }
    },

    async explain(
      actor: PermissionActor,
      permission: string,
      resource?: unknown,
      authOptions?: AuthorizationOptions,
    ): Promise<ExplainResult> {
      return evaluateWithExplain(actor, permission, resource, evaluatorOptions, authOptions);
    },

    createAbility(actor: PermissionActor): Ability {
      return createAbility(actor, evaluatorOptions);
    },
  };
}
