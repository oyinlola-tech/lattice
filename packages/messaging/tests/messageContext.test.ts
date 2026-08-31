import { describe, it, expect } from "vitest";
import { createMessageContext } from "../src/messageContext/index.js";
import { createMessage } from "../src/message/index.js";

describe("messageContext", () => {
  describe("createMessageContext", () => {
    it("creates a context from a message", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message);

      expect(context.message).toBe(message);
      expect(context.correlationId).toBe(message.id);
      expect(context.causationId).toBe(message.id);
      expect(context.startedAt).toBeInstanceOf(Date);
    });

    it("uses message correlationId if available", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
        correlationId: "corr-123",
        causationId: "cause-456",
      });

      const context = createMessageContext(message);

      expect(context.correlationId).toBe("corr-123");
      expect(context.causationId).toBe("cause-456");
    });

    it("allows overriding correlation", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message, {
        correlationId: "custom-corr",
        causationId: "custom-cause",
      });

      expect(context.correlationId).toBe("custom-corr");
      expect(context.causationId).toBe("custom-cause");
    });

    it("freezes headers", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message, {
        headers: { "x-request-id": "req-123" },
      });

      expect(Object.isFrozen(context.headers)).toBe(true);
    });

    it("creates a default AbortSignal", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message);

      expect(context.signal).toBeInstanceOf(AbortSignal);
      expect(context.signal.aborted).toBe(false);
    });

    it("uses provided AbortSignal", () => {
      const controller = new AbortController();
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message, {
        signal: controller.signal,
      });

      expect(context.signal).toBe(controller.signal);
    });

    it("creates empty state map by default", () => {
      const message = createMessage({
        type: "test.message",
        payload: {},
      });

      const context = createMessageContext(message);

      expect(context.state).toBeInstanceOf(Map);
      expect(context.state.size).toBe(0);
    });
  });
});
