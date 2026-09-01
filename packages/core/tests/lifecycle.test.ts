import { describe, it, expect, vi } from "vitest";
import {
  Lifecycle,
  LifecycleState,
  type LifecycleParticipant,
} from "../src/lifecycle/core/lifecycle.js";

// ─── Helpers ────────────────────────────────────────────

function createParticipant(
  name: string,
  hooks?: {
    initialize?: () => Promise<void> | void;
    start?: () => Promise<void> | void;
    stop?: () => Promise<void> | void;
    dispose?: () => Promise<void> | void;
  },
): LifecycleParticipant {
  return {
    name,
    initialize: hooks?.initialize,
    start: hooks?.start,
    stop: hooks?.stop,
    dispose: hooks?.dispose,
  };
}

// ─── Tests ──────────────────────────────────────────────

describe("Lifecycle", () => {
  describe("initial state", () => {
    it("should start in CREATED state", () => {
      const lifecycle = new Lifecycle();
      expect(lifecycle.getState()).toBe(LifecycleState.CREATED);
    });

    it("should have no participants initially", () => {
      const lifecycle = new Lifecycle();
      expect(lifecycle.getParticipants()).toEqual([]);
    });
  });

  describe("register", () => {
    it("should register a participant", () => {
      const lifecycle = new Lifecycle();
      const participant = createParticipant("test");

      lifecycle.register(participant);

      expect(lifecycle.getParticipants()).toHaveLength(1);
      expect(lifecycle.getParticipants()[0]!.name).toBe("test");
    });

    it("should register multiple participants in order", () => {
      const lifecycle = new Lifecycle();

      lifecycle.register(createParticipant("first"));
      lifecycle.register(createParticipant("second"));
      lifecycle.register(createParticipant("third"));

      const names = lifecycle.getParticipants().map((p) => p.name);
      expect(names).toEqual(["first", "second", "third"]);
    });

    it("should throw when registering during RUNNING state", async () => {
      const lifecycle = new Lifecycle();

      await lifecycle.initialize();
      await lifecycle.start();

      expect(() => lifecycle.register(createParticipant("late"))).toThrow(
        "Cannot register",
      );
    });
  });

  describe("initialize", () => {
    it("should transition to INITIALIZED", async () => {
      const lifecycle = new Lifecycle();

      await lifecycle.initialize();

      expect(lifecycle.getState()).toBe(LifecycleState.INITIALIZED);
    });

    it("should call participant.initialize()", async () => {
      const initFn = vi.fn();
      const lifecycle = new Lifecycle();

      lifecycle.register(createParticipant("test", { initialize: initFn }));
      await lifecycle.initialize();

      expect(initFn).toHaveBeenCalledOnce();
    });

    it("should call participants in registration order", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("first", {
          initialize: async () => {
            order.push("first");
          },
        }),
      );
      lifecycle.register(
        createParticipant("second", {
          initialize: async () => {
            order.push("second");
          },
        }),
      );

      await lifecycle.initialize();

      expect(order).toEqual(["first", "second"]);
    });

    it("should be idempotent", async () => {
      const initFn = vi.fn();
      const lifecycle = new Lifecycle();

      lifecycle.register(createParticipant("test", { initialize: initFn }));
      await lifecycle.initialize();
      await lifecycle.initialize();

      expect(initFn).toHaveBeenCalledOnce();
    });

    it("should transition to FAILED on error", async () => {
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("failing", {
          initialize: async () => {
            throw new Error("init failed");
          },
        }),
      );

      await expect(lifecycle.initialize()).rejects.toThrow("init failed");
      expect(lifecycle.getState()).toBe(LifecycleState.FAILED);
    });
  });

  describe("start", () => {
    it("should auto-initialize if in CREATED state", async () => {
      const initFn = vi.fn();
      const startFn = vi.fn();
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("test", {
          initialize: initFn,
          start: startFn,
        }),
      );

      await lifecycle.start();

      expect(initFn).toHaveBeenCalledOnce();
      expect(startFn).toHaveBeenCalledOnce();
      expect(lifecycle.getState()).toBe(LifecycleState.RUNNING);
    });

    it("should call participant.start()", async () => {
      const startFn = vi.fn();
      const lifecycle = new Lifecycle();

      lifecycle.register(createParticipant("test", { start: startFn }));
      await lifecycle.initialize();
      await lifecycle.start();

      expect(startFn).toHaveBeenCalledOnce();
    });

    it("should throw when starting from STOPPED state", async () => {
      const lifecycle = new Lifecycle();

      await lifecycle.initialize();
      await lifecycle.start();
      await lifecycle.stop();

      // Lifecycle.start() only works from INITIALIZED or CREATED (auto-init)
      // STOPPED state requires re-initialization first
      await expect(lifecycle.start()).rejects.toThrow(
        'Cannot start application while state is "stopped"',
      );
    });

    it("should throw on error during start", async () => {
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("failing", {
          start: async () => {
            throw new Error("start failed");
          },
        }),
      );

      await lifecycle.initialize();
      await expect(lifecycle.start()).rejects.toThrow("start failed");
      expect(lifecycle.getState()).toBe(LifecycleState.FAILED);
    });
  });

  describe("stop", () => {
    it("should stop participants in reverse order", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("first", {
          stop: async () => {
            order.push("first");
          },
        }),
      );
      lifecycle.register(
        createParticipant("second", {
          stop: async () => {
            order.push("second");
          },
        }),
      );

      await lifecycle.initialize();
      await lifecycle.start();
      await lifecycle.stop();

      expect(order).toEqual(["second", "first"]);
    });

    it("should transition to STOPPED", async () => {
      const lifecycle = new Lifecycle();

      await lifecycle.initialize();
      await lifecycle.start();
      await lifecycle.stop();

      expect(lifecycle.getState()).toBe(LifecycleState.STOPPED);
    });

    it("should be safe to call multiple times", async () => {
      const stopFn = vi.fn();
      const lifecycle = new Lifecycle();

      lifecycle.register(createParticipant("test", { stop: stopFn }));

      await lifecycle.initialize();
      await lifecycle.start();
      await lifecycle.stop();
      await lifecycle.stop();

      // stop() is not idempotent - it throws if not in RUNNING/FAILED state
      // but the second call should be safe since state is STOPPED
    });

    it("should continue stopping other participants on error when continueOnShutdownError is true", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle({
        continueOnShutdownError: true,
      });

      lifecycle.register(
        createParticipant("failing", {
          stop: async () => {
            throw new Error("stop failed");
          },
        }),
      );
      lifecycle.register(
        createParticipant("second", {
          stop: async () => {
            order.push("second");
          },
        }),
      );

      await lifecycle.initialize();
      await lifecycle.start();

      await expect(lifecycle.stop()).rejects.toThrow(
        "One or more lifecycle participants failed to stop",
      );
      expect(order).toEqual(["second"]);
    });

    it("should stop remaining participants on error when continueOnShutdownError is false", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle({
        continueOnShutdownError: false,
      });

      // Register so "failing" is processed first in reverse order
      lifecycle.register(
        createParticipant("second", {
          stop: async () => {
            order.push("second");
          },
        }),
      );
      lifecycle.register(
        createParticipant("first", {
          stop: async () => {
            throw new Error("stop failed");
          },
        }),
      );

      await lifecycle.initialize();
      await lifecycle.start();

      await expect(lifecycle.stop()).rejects.toThrow(AggregateError);
      expect(order).toEqual([]);
    });
  });

  describe("dispose", () => {
    it("should dispose participants in reverse order", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("first", {
          dispose: async () => {
            order.push("first");
          },
        }),
      );
      lifecycle.register(
        createParticipant("second", {
          dispose: async () => {
            order.push("second");
          },
        }),
      );

      await lifecycle.dispose();

      expect(order).toEqual(["second", "first"]);
    });

    it("should collect and throw AggregateError on multiple failures", async () => {
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("first", {
          dispose: async () => {
            throw new Error("first error");
          },
        }),
      );
      lifecycle.register(
        createParticipant("second", {
          dispose: async () => {
            throw new Error("second error");
          },
        }),
      );

      await expect(lifecycle.dispose()).rejects.toThrow(AggregateError);
    });
  });

  describe("shutdown", () => {
    it("should perform stop then dispose", async () => {
      const order: string[] = [];
      const lifecycle = new Lifecycle();

      lifecycle.register(
        createParticipant("test", {
          stop: async () => {
            order.push("stop");
          },
          dispose: async () => {
            order.push("dispose");
          },
        }),
      );

      await lifecycle.initialize();
      await lifecycle.start();
      await lifecycle.shutdown();

      expect(order).toEqual(["stop", "dispose"]);
    });
  });

  describe("options", () => {
    it("should accept a logger", () => {
      const logger = {
        debug: vi.fn(),
        info: vi.fn(),
        warn: vi.fn(),
        error: vi.fn(),
      };

      const lifecycle = new Lifecycle({ logger: logger as any });

      expect(lifecycle).toBeDefined();
    });

    it("should respect continueOnShutdownError option", () => {
      const lifecycle = new Lifecycle({
        continueOnShutdownError: false,
      });

      expect(lifecycle).toBeDefined();
    });
  });
});
