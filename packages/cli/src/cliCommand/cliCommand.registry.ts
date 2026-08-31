/**
 * @lattice/cli — Command Registry
 *
 * Registry for managing CLI commands and their aliases.
 */

import type { CLICommand } from "../cliType/cliType.type.js";
import { DuplicateCommandError } from "../cliError/cliError.command.js";

/* -------------------------------------------------------------------------- */
/* Command Registry                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Manages registration, lookup, and unregistration of CLI commands.
 */
export class CLICommandRegistry {
  private readonly commands = new Map<string, CLICommand>();
  private readonly aliases = new Map<string, string>();

  /** Registers a single command. */
  public register(command: CLICommand): this {
    const name = command.name.trim();

    if (this.commands.has(name) || this.aliases.has(name)) {
      throw new DuplicateCommandError(name);
    }

    this.commands.set(name, command);

    for (const alias of command.aliases ?? []) {
      const normalizedAlias = alias.trim();
      if (!normalizedAlias) continue;

      if (
        this.commands.has(normalizedAlias) ||
        this.aliases.has(normalizedAlias)
      ) {
        this.commands.delete(name);
        throw new DuplicateCommandError(normalizedAlias);
      }

      this.aliases.set(normalizedAlias, name);
    }

    return this;
  }

  /** Registers multiple commands. */
  public registerMany(commands: readonly CLICommand[]): this {
    for (const command of commands) {
      this.register(command);
    }
    return this;
  }

  /** Unregisters a command by name or alias. */
  public unregister(name: string): boolean {
    const normalized = name.trim();
    const resolved = this.resolve(normalized);

    if (!resolved) return false;

    this.commands.delete(resolved.name);
    for (const alias of resolved.aliases ?? []) {
      this.aliases.delete(alias);
    }

    return true;
  }

  /** Resolves a name (or alias) to a command. */
  public resolve(name: string): CLICommand | undefined {
    const normalized = name.trim();
    const direct = this.commands.get(normalized);
    if (direct) return direct;

    const canonical = this.aliases.get(normalized);
    if (!canonical) return undefined;

    return this.commands.get(canonical);
  }

  /** Returns whether a command exists. */
  public has(name: string): boolean {
    return Boolean(this.resolve(name));
  }

  /** Returns all registered commands. */
  public list(): readonly CLICommand[] {
    return Array.from(this.commands.values());
  }

  /** Returns all registered command names. */
  public names(): readonly string[] {
    return Array.from(this.commands.keys());
  }

  /** Returns a copy of the alias map. */
  public aliasesMap(): ReadonlyMap<string, string> {
    return new Map(this.aliases);
  }

  /** Clears all registrations. */
  public clear(): void {
    this.commands.clear();
    this.aliases.clear();
  }

  /** Returns the number of registered commands. */
  public get size(): number {
    return this.commands.size;
  }
}
