import type { Module, ModuleId } from "../module.js";
import type { ModuleContext } from "../moduleContext.context.js";
import type { ModuleLifecycleHooks, ModuleLifecyclePhase, ModuleLifecycleState, LifecycleStateMap } from "./moduleLifecycle.type.js";
import { ModuleLifecycleError } from "./moduleLifecycle.type.js";
import type { ModuleRegistry } from "../moduleRegistry/index.js";
import type { ModuleLoader } from "../moduleLoader/index.js";

/** Ensures lifecycle state is synchronized with the registry. */
export function ensureStateSynchronized(registry: ModuleRegistry, states: LifecycleStateMap): void {
  for (const registration of registry.getAll()) {
    const moduleId = registration.definition.id;
    if (!states.has(moduleId)) states.set(moduleId, { moduleId, phase: "created" });
  }
}

export function getLifecycleState(moduleId: ModuleId, states: LifecycleStateMap): ModuleLifecycleState | undefined { return states.get(moduleId); }

export function requireLifecycleState(moduleId: ModuleId, states: LifecycleStateMap): ModuleLifecycleState {
  const state = getLifecycleState(moduleId, states);
  if (!state) throw new Error(`No lifecycle state exists for module "${moduleId}".`);
  return state;
}

export function getAllLifecycleStates(states: LifecycleStateMap): ReadonlyMap<ModuleId, ModuleLifecycleState> { return new Map(states); }

export function isModuleInitialized(moduleId: ModuleId, states: LifecycleStateMap): boolean {
  const phase = getLifecycleState(moduleId, states)?.phase;
  return phase === "initialized" || phase === "starting" || phase === "started";
}

export function isModuleStarted(moduleId: ModuleId, states: LifecycleStateMap): boolean { return getLifecycleState(moduleId, states)?.phase === "started"; }
export function isModuleDestroyed(moduleId: ModuleId, states: LifecycleStateMap): boolean { return getLifecycleState(moduleId, states)?.phase === "destroyed"; }

export async function invokeLifecycleHook(module: Module, hook: keyof ModuleLifecycleHooks, context: ModuleContext): Promise<void> {
  const lifecycleModule = module as Module & Partial<ModuleLifecycleHooks>;
  const handler = lifecycleModule[hook];
  if (typeof handler !== "function") return;
  await handler.call(module, context);
}

export function canModuleEnterPhase(moduleId: ModuleId, hook: keyof ModuleLifecycleHooks, states: LifecycleStateMap): boolean {
  const state = getLifecycleState(moduleId, states);
  if (!state) return false;
  switch (hook) {
    case "initialize": return state.phase === "created";
    case "start": return state.phase === "initialized";
    case "stop": return state.phase === "started";
    case "destroy": return state.phase === "stopped" || state.phase === "initialized" || state.phase === "created";
    default: return false;
  }
}

export function setLifecycleState(moduleId: ModuleId, phase: ModuleLifecyclePhase, states: LifecycleStateMap, error?: unknown): void {
  const previous = states.get(moduleId);
  const now = new Date();
  states.set(moduleId, Object.freeze({
    moduleId, phase, error,
    initializedAt: phase === "initialized" ? now : previous?.initializedAt,
    startedAt: phase === "started" ? now : previous?.startedAt,
    stoppedAt: phase === "stopped" ? now : previous?.stoppedAt,
    destroyedAt: phase === "destroyed" ? now : previous?.destroyedAt,
  }));
}

export async function executeLifecyclePhase(
  order: readonly ModuleId[], hook: keyof ModuleLifecycleHooks, activePhase: ModuleLifecyclePhase, completedPhase: ModuleLifecyclePhase,
  continueOnError: boolean, registry: ModuleRegistry, loader: ModuleLoader, states: LifecycleStateMap,
): Promise<{ readonly completed: readonly ModuleId[]; readonly failed: readonly ModuleId[] }> {
  const completed: ModuleId[] = [];
  const failed: ModuleId[] = [];

  for (const moduleId of order) {
    const registration = registry.get(moduleId);
    if (!registration?.instance) continue;
    const module = registration.instance;
    const context = loader.getContext(moduleId);

    if (!context) {
      failed.push(moduleId);
      setLifecycleState(moduleId, "failed", states);
      if (!continueOnError) throw new ModuleLifecycleError(moduleId, activePhase, new Error(`Module "${moduleId}" does not have a ModuleContext.`));
      continue;
    }

    if (!canModuleEnterPhase(moduleId, hook, states)) continue;

    setLifecycleState(moduleId, activePhase, states);
    try {
      await invokeLifecycleHook(module, hook, context);
      setLifecycleState(moduleId, completedPhase, states);
      completed.push(moduleId);
    } catch (error) {
      setLifecycleState(moduleId, "failed", states, error);
      failed.push(moduleId);
      if (!continueOnError) throw new ModuleLifecycleError(moduleId, activePhase, error);
    }
  }

  return { completed: Object.freeze([...completed]), failed: Object.freeze([...failed]) };
}
