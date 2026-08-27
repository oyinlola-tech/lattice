import { RuntimeState, assertRuntimeTransition, createRuntimeStateSnapshot } from "../runtimeState.state.js";
import { createRuntimeContext, createRuntimeIdentity } from "../runtimeContext/index.js";
import { createRuntimeEnvironment } from "../runtimeEnvironment/index.js";
import { resolveRuntimeOptions } from "../runtimeOptions/index.js";
import type { RuntimeManagerDependencies, RuntimeManager, RuntimeManagerState } from "./runtimeManager.type.js";
import type { RuntimeStateSnapshot } from "../runtimeState.state.js";
import type { RuntimeIdentity } from "../runtimeContext/index.js";
import type { RuntimeEnvironment } from "../runtimeEnvironment/index.js";
import type { RuntimeOptions, ResolvedRuntimeOptions } from "../runtimeOptions/index.js";
import type { RuntimeContext } from "../runtimeContext/index.js";
import { RuntimeManagerError } from "./runtimeManager.error.js";
import { performStart, performStop } from "./runtimeManager.lifecycle.js";

export class DefaultRuntimeManager implements RuntimeManager {
  private readonly _options: ResolvedRuntimeOptions;
  private readonly _identity: RuntimeIdentity;
  private readonly _context: ReturnType<typeof createRuntimeContext>;
  private readonly _environment: RuntimeEnvironment;
  private readonly _state: RuntimeManagerState;

  public constructor(dependencies: RuntimeManagerDependencies, options: RuntimeOptions = {}) {
    this._options = resolveRuntimeOptions(options);
    this._identity = createRuntimeIdentity({ name: this._options.name, mode: this._options.mode, role: this._options.role });
    this._environment = createRuntimeEnvironment({ mode: this._options.mode, role: this._options.role });
    this._context = createRuntimeContext(this._identity, { application: dependencies.application, configuration: dependencies.configuration, logger: dependencies.logger, moduleRegistry: dependencies.moduleRegistry, moduleLoader: dependencies.moduleLoader, moduleLifecycle: dependencies.moduleLifecycle }, this._options.metadata);
    this._state = { state: RuntimeState.CREATED };
  }

  public get context(): RuntimeContext { return this._context; }
  public get environment(): RuntimeEnvironment { return this._environment; }
  public get identity(): RuntimeIdentity { return this._identity; }
  public get options(): ResolvedRuntimeOptions { return this._options; }
  public get state(): RuntimeState { return this._state.state; }
  public get ready(): boolean { return this.state === RuntimeState.READY; }
  public get stopped(): boolean { return this.state === RuntimeState.STOPPED; }
  public get failed(): boolean { return this.state === RuntimeState.FAILED; }

  public async start(): Promise<void> {
    if (this.ready) { return; }
    if (this.failed) { throw new RuntimeManagerError("Cannot start a runtime that has failed.", "START_FAILED_RUNTIME"); }
    if (this.stopped) { throw new RuntimeManagerError("Cannot restart a stopped runtime.", "START_STOPPED_RUNTIME"); }
    if (this._state.startPromise) { return this._state.startPromise; }
    this._state.startPromise = performStart(undefined, (next, reason) => this.transitionTo(next, reason), this._state);
    try { await this._state.startPromise; } finally { this._state.startPromise = undefined; }
  }

  public async stop(): Promise<void> {
    if (this.stopped) { return; }
    if (this.failed) { throw new RuntimeManagerError("Cannot gracefully stop a runtime that has failed.", "STOP_FAILED_RUNTIME"); }
    if (this.state !== RuntimeState.READY) { throw new RuntimeManagerError(`Cannot stop runtime while it is "${this.state}".`, "STOP_INVALID_STATE"); }
    if (this._state.stopPromise) { return this._state.stopPromise; }
    this._state.stopPromise = performStop(undefined, (next, reason) => this.transitionTo(next, reason), this._state);
    try { await this._state.stopPromise; } finally { this._state.stopPromise = undefined; }
  }

  public fail(error?: unknown): void {
    if (this.state === RuntimeState.STOPPED || this.state === RuntimeState.FAILED) { return; }
    this._state.failureReason = error;
    this.transitionTo(RuntimeState.FAILED, "Runtime marked as failed.");
  }

  public getStateSnapshot(): RuntimeStateSnapshot { return createRuntimeStateSnapshot(this.state); }
  public getUptime(): number { return this._context.getUptime(); }

  private transitionTo(next: RuntimeState, reason?: string): void {
    const current = this._state.state;
    assertRuntimeTransition(current, next);
    this._state.state = next;
    this._context.setState(next);
    this.logStateTransition(current, next, reason);
  }

  private logStateTransition(from: RuntimeState, to: RuntimeState, reason?: string): void {
    try {
      this._context.logger.debug(`Runtime state changed from "${from}" to "${to}".`, { runtimeId: this._identity.id, runtimeName: this._identity.name, from, to, reason });
    } catch { /* Logging must never prevent a lifecycle transition. */ }
  }
}
