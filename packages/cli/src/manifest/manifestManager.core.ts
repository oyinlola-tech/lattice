/**
 * zudo-cli — Manifest System
 *
 * Machine-managed project manifest for Lattice projects.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export interface LatticeManifest {
  readonly version: string;
  readonly architecture: string;
  readonly backend?: {
    readonly architecture: string;
    readonly api: string;
  };
  readonly frontend?: {
    readonly framework: string;
    readonly architecture: string;
  };
  readonly database?: {
    readonly provider: string;
  };
  readonly workspace?: {
    readonly packageManager: string;
  };
  readonly capabilities: readonly string[];
  readonly generatedAt: string;
  readonly updatedAt: string;
}

export class ManifestManager {
  private readonly manifestPath: string;

  constructor(cwd: string) {
    this.manifestPath = join(cwd, ".lattice", "manifest.json");
  }

  async create(
    manifest: Omit<LatticeManifest, "generatedAt" | "updatedAt">,
  ): Promise<void> {
    const now = new Date().toISOString();
    const fullManifest: LatticeManifest = {
      ...manifest,
      generatedAt: now,
      updatedAt: now,
    };

    await this.write(fullManifest);
  }

  async read(): Promise<LatticeManifest | null> {
    if (!existsSync(this.manifestPath)) {
      return null;
    }

    try {
      const content = readFileSync(this.manifestPath, "utf-8");
      return JSON.parse(content) as LatticeManifest;
    } catch {
      return null;
    }
  }

  async update(updates: Partial<LatticeManifest>): Promise<void> {
    const existing = await this.read();

    if (!existing) {
      return;
    }

    const updated: LatticeManifest = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await this.write(updated);
  }

  async addCapability(capability: string): Promise<void> {
    const existing = await this.read();

    if (!existing) {
      return;
    }

    const capabilities = existing.capabilities.includes(capability)
      ? existing.capabilities
      : [...existing.capabilities, capability];

    await this.update({ capabilities });
  }

  private async write(manifest: LatticeManifest): Promise<void> {
    const dir = join(this.manifestPath, "..");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(dir, { recursive: true });
    writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2));
  }
}
