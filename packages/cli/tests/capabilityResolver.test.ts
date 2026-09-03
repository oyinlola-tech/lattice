/**
 * zudolib-cli — Capability Resolver Tests
 *
 * Tests for CapabilityResolver.
 */

import { describe, it, expect } from "vitest";
import { CapabilityResolver } from "../src/resolvers/capability/capabilityResolver.core.js";

describe("CapabilityResolver", () => {
  const resolver = new CapabilityResolver();

  it("resolves capability dependencies", () => {
    const result = resolver.resolve(["queue"]);

    expect(result.capabilities).toEqual(["queue"]);
    expect(result.dependencies).toEqual(
      expect.arrayContaining(["messaging", "serialization", "events"]),
    );
  });

  it("resolves multiple capabilities", () => {
    const result = resolver.resolve(["observability", "cqrs"]);

    expect(result.capabilities).toEqual(
      expect.arrayContaining(["observability", "cqrs"]),
    );
    expect(result.dependencies).toEqual(
      expect.arrayContaining(["logger", "events", "messaging"]),
    );
  });

  it("returns all known capabilities", () => {
    const capabilities = resolver.getCapabilities();
    expect(capabilities).toEqual(
      expect.arrayContaining([
        "observability",
        "queue",
        "cqrs",
        "messaging",
        "openapi",
        "database",
        "security",
      ]),
    );
  });
});
