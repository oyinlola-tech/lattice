import type { Plugin } from "../pluginTypes/plugin.type.js";
import type { PluginContext } from "../pluginTypes/pluginContext.type.js";
import type { PluginState } from "../pluginTypes/pluginState.type.js";
import type { RegisteredPlugin } from "../pluginRegistry/pluginRegistry.core.js";
import { VALID_STATE_TRANSITIONS } from "../pluginTypes/pluginState.type.js";
import { PluginStateError } from "@oyinlola141/lattice-errors";
import { PLUGIN_EVENTS, createPluginLifecycleEvent } from "../pluginEvents/pluginEvent.core.js";

/**
 * Emits a plugin lifecycle event if the context supports events.
 */
function emitLifecycleEvent(
  context: PluginContext,
  eventName: string,
  pluginName: string,
  state: PluginState,
  previousState?: PluginState,
  error?: unknown,
): void {
  if (!context.events?.emit) {
    return;
  }

  const event = createPluginLifecycleEvent(
    { name: pluginName },
    state,
    previousState,
    error,
  );
  context.events.emit(eventName, event);
}

/**
 * Executes plugin lifecycle phases with state management and event emission.
 */
export class LifecycleController {
  public async install<TPlugin extends Plugin>(
    registered: RegisteredPlugin<TPlugin>,
    context: PluginContext,
  ): Promise<void> {
    const name = registered.plugin.metadata.name;
    const from = registered.state;

    this.ensureTransition(registered, "installing");
    registered.setState("installing");
    emitLifecycleEvent(context, PLUGIN_EVENTS.INSTALLING, name, "installing", from);

    try {
      await registered.plugin.install?.(context, registered.options);
      this.ensureTransition(registered, "installed");
      registered.setState("installed");
      emitLifecycleEvent(context, PLUGIN_EVENTS.INSTALLED, name, "installed", "installing");
    } catch (error) {
      registered.setState("failed");
      emitLifecycleEvent(context, PLUGIN_EVENTS.FAILED, name, "failed", from, error);
      throw error;
    }
  }

  public async initialize<TPlugin extends Plugin>(
    registered: RegisteredPlugin<TPlugin>,
    context: PluginContext,
  ): Promise<void> {
    const name = registered.plugin.metadata.name;
    const from = registered.state;

    this.ensureTransition(registered, "initializing");
    registered.setState("initializing");
    emitLifecycleEvent(context, PLUGIN_EVENTS.INITIALIZING, name, "initializing", from);

    try {
      await registered.plugin.initialize?.(context);
      this.ensureTransition(registered, "initialized");
      registered.setState("initialized");
      emitLifecycleEvent(context, PLUGIN_EVENTS.INITIALIZED, name, "initialized", "initializing");
    } catch (error) {
      registered.setState("failed");
      emitLifecycleEvent(context, PLUGIN_EVENTS.FAILED, name, "failed", from, error);
      throw error;
    }
  }

  public async start<TPlugin extends Plugin>(
    registered: RegisteredPlugin<TPlugin>,
    context: PluginContext,
  ): Promise<void> {
    const name = registered.plugin.metadata.name;
    const from = registered.state;

    this.ensureTransition(registered, "starting");
    registered.setState("starting");
    emitLifecycleEvent(context, PLUGIN_EVENTS.STARTING, name, "starting", from);

    try {
      await registered.plugin.start?.(context);
      this.ensureTransition(registered, "started");
      registered.setState("started");
      emitLifecycleEvent(context, PLUGIN_EVENTS.STARTED, name, "started", "starting");
    } catch (error) {
      registered.setState("failed");
      emitLifecycleEvent(context, PLUGIN_EVENTS.FAILED, name, "failed", from, error);
      throw error;
    }
  }

  public async stop<TPlugin extends Plugin>(
    registered: RegisteredPlugin<TPlugin>,
    context: PluginContext,
  ): Promise<void> {
    const name = registered.plugin.metadata.name;
    const from = registered.state;

    this.ensureTransition(registered, "stopping");
    registered.setState("stopping");
    emitLifecycleEvent(context, PLUGIN_EVENTS.STOPPING, name, "stopping", from);

    try {
      await registered.plugin.stop?.(context);
      this.ensureTransition(registered, "stopped");
      registered.setState("stopped");
      emitLifecycleEvent(context, PLUGIN_EVENTS.STOPPED, name, "stopped", "stopping");
    } catch (error) {
      registered.setState("failed");
      emitLifecycleEvent(context, PLUGIN_EVENTS.FAILED, name, "failed", from, error);
      throw error;
    }
  }

  public async dispose<TPlugin extends Plugin>(
    registered: RegisteredPlugin<TPlugin>,
    context: PluginContext,
  ): Promise<void> {
    const name = registered.plugin.metadata.name;
    const from = registered.state;

    this.ensureTransition(registered, "disposing");
    registered.setState("disposing");
    emitLifecycleEvent(context, PLUGIN_EVENTS.DISPOSING, name, "disposing", from);

    const errors: unknown[] = [];

    for (const disposable of registered.disposables) {
      try {
        await disposable.dispose();
      } catch (error) {
        errors.push(error);
      }
    }

    try {
      await registered.plugin.dispose?.(context);
    } catch (error) {
      errors.push(error);
    }

    registered.setState("disposed");
    emitLifecycleEvent(context, PLUGIN_EVENTS.DISPOSED, name, "disposed", "disposing");

    if (errors.length > 0) {
      throw errors[0];
    }
  }

  private ensureTransition(registered: RegisteredPlugin, to: PluginState): void {
    const from = registered.state;
    if (from === to) {
      return;
    }

    const valid = VALID_STATE_TRANSITIONS[from]?.includes(to) ?? false;
    if (!valid) {
      throw new PluginStateError(registered.plugin.metadata.name, from, to);
    }
  }
}
