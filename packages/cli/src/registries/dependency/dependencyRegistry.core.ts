/**
 * zudolib-cli — Dependency Registry
 *
 * Registry for tracking and managing project dependencies.
 */

export interface DependencyRecord {
  readonly name: string;
  readonly version: string;
  readonly type: "dependency" | "devDependency";
  readonly source: string;
}

export class DependencyRegistry {
  private readonly dependencies = new Map<string, DependencyRecord>();

  add(record: DependencyRecord): void {
    this.dependencies.set(record.name, record);
  }

  addMany(records: readonly DependencyRecord[]): void {
    for (const record of records) {
      this.add(record);
    }
  }

  get(name: string): DependencyRecord | undefined {
    return this.dependencies.get(name);
  }

  getAll(): readonly DependencyRecord[] {
    return Array.from(this.dependencies.values());
  }

  getByType(type: "dependency" | "devDependency"): readonly DependencyRecord[] {
    return this.getAll().filter((d) => d.type === type);
  }

  remove(name: string): boolean {
    return this.dependencies.delete(name);
  }

  clear(): void {
    this.dependencies.clear();
  }

  get names(): readonly string[] {
    return Array.from(this.dependencies.keys());
  }
}
