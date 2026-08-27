import type {
  ConfigValue,
} from "../configValue/configValue.core.js";

import type {
  ConfigEntry,
} from "../configEntry/configEntry.type.js";

import type {
  ConfigSourceType,
} from "../configSource/configSource.core.js";

/**
 * Event emitted when a configuration value changes.
 */
export interface ConfigChangeEvent {
  readonly key: string;
  readonly previous?: ConfigEntry;
  readonly current?: ConfigEntry;
  readonly timestamp: number;
}

/**
 * Listener called when configuration changes.
 */
export type ConfigChangeListener =
  (
    event: ConfigChangeEvent,
  ) => void;

/**
 * Options used to initialize a configuration store.
 */
export interface ConfigStoreOptions {
  readonly initialValues?:
    Readonly<
      Record<string, ConfigValue>
    >;

  readonly entries?:
    readonly ConfigEntry[];

  readonly freeze?:
    boolean;
}
