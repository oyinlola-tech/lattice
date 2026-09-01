import { describe, it, expect } from "vitest";
import { HandlerRegistryStore } from "../src/handlerRegistry/index.js";
import { DuplicateMessageHandlerError } from "@oyinlola141/lattice-errors";
import type { NamedMessageHandler } from "../src/messageHandler/index.js";

describe("HandlerRegistryStore", () => {
  const createTestHandler = (
    id: string,
    messageType: string,
  ): NamedMessageHandler => ({
    id,
    name: id,
    handler: async () => ({ success: true }),
    messageTypes: [messageType],
    priority: 100,
    enabled: true,
  });

  describe("register", () => {
    it("registers a handler", () => {
      const registry = new HandlerRegistryStore();
      const handler = createTestHandler("h1", "test.message");

      registry.register(handler);

      expect(registry.size).toBe(1);
      expect(registry.has("h1")).toBe(true);
    });

    it("throws on duplicate handler ID", () => {
      const registry = new HandlerRegistryStore();
      const handler1 = createTestHandler("h1", "test.message");
      const handler2 = createTestHandler("h1", "test.other");

      registry.register(handler1);

      expect(() => registry.register(handler2)).toThrow(
        DuplicateMessageHandlerError,
      );
    });

    it("allows duplicate handler IDs when configured", () => {
      const registry = new HandlerRegistryStore({
        allowDuplicateHandlerIds: true,
      });
      const handler1 = createTestHandler("h1", "test.message");
      const handler2 = createTestHandler("h2", "test.other");

      registry.register(handler1);
      registry.register(handler2);

      expect(registry.size).toBe(2);
    });
  });

  describe("unregister", () => {
    it("removes a handler", () => {
      const registry = new HandlerRegistryStore();
      const handler = createTestHandler("h1", "test.message");

      registry.register(handler);
      const removed = registry.unregister("h1");

      expect(removed).toBe(true);
      expect(registry.size).toBe(0);
      expect(registry.has("h1")).toBe(false);
    });

    it("returns false for non-existent handler", () => {
      const registry = new HandlerRegistryStore();
      const removed = registry.unregister("non-existent");
      expect(removed).toBe(false);
    });
  });

  describe("resolve", () => {
    it("resolves handlers for a message type", () => {
      const registry = new HandlerRegistryStore();
      const handler1 = createTestHandler("h1", "test.message");
      const handler2 = createTestHandler("h2", "test.other");

      registry.register(handler1);
      registry.register(handler2);

      const resolved = registry.resolve("test.message");
      expect(resolved).toHaveLength(1);
      expect(resolved[0]!.id).toBe("h1");
    });

    it("returns empty array for unregistered type", () => {
      const registry = new HandlerRegistryStore();
      const resolved = registry.resolve("non-existent");
      expect(resolved).toHaveLength(0);
    });

    it("filters by priority", () => {
      const registry = new HandlerRegistryStore();
      const handler1 = createTestHandler("h1", "test.message");
      const handler2 = { ...createTestHandler("h2", "test.message"), priority: 50 };
      const handler3 = { ...createTestHandler("h3", "test.message"), priority: 150 };

      registry.register(handler1);
      registry.register(handler2);
      registry.register(handler3);

      const resolved = registry.resolve("test.message", { maxPriority: 100 });
      expect(resolved).toHaveLength(2);
      expect(resolved[0]!.id).toBe("h2");
      expect(resolved[1]!.id).toBe("h1");
    });

    it("excludes disabled handlers by default", () => {
      const registry = new HandlerRegistryStore();
      const handler = { ...createTestHandler("h1", "test.message"), enabled: false };

      registry.register(handler);

      const resolved = registry.resolve("test.message");
      expect(resolved).toHaveLength(0);
    });

    it("includes disabled handlers when requested", () => {
      const registry = new HandlerRegistryStore();
      const handler = { ...createTestHandler("h1", "test.message"), enabled: false };

      registry.register(handler);

      const resolved = registry.resolve("test.message", { includeDisabled: true });
      expect(resolved).toHaveLength(1);
    });
  });

  describe("getRegisteredTypes", () => {
    it("returns all registered message types", () => {
      const registry = new HandlerRegistryStore();
      registry.register(createTestHandler("h1", "type.a"));
      registry.register(createTestHandler("h2", "type.b"));
      registry.register(createTestHandler("h3", "type.a"));

      const types = registry.getRegisteredTypes();
      expect(types).toContain("type.a");
      expect(types).toContain("type.b");
    });
  });
});
