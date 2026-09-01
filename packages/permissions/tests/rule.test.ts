import { describe, it, expect } from "vitest";
import {
  ruleMatches,
  evaluateRules,
  compileRules,
  findMatchingRules,
} from "../src/index.js";

describe("ruleMatches", () => {
  it("matches exact rules", () => {
    const rule = { effect: "allow" as const, action: "read", resource: "post" };
    expect(ruleMatches(rule, { resource: "post", action: "read" })).toBe(true);
  });

  it("does not match different action", () => {
    const rule = { effect: "allow" as const, action: "read", resource: "post" };
    expect(ruleMatches(rule, { resource: "post", action: "update" })).toBe(
      false,
    );
  });

  it("matches wildcard action", () => {
    const rule = { effect: "allow" as const, action: "*", resource: "post" };
    expect(ruleMatches(rule, { resource: "post", action: "update" })).toBe(
      true,
    );
  });

  it("matches wildcard resource", () => {
    const rule = { effect: "allow" as const, action: "read", resource: "*" };
    expect(ruleMatches(rule, { resource: "post", action: "read" })).toBe(true);
  });

  it("matches array actions", () => {
    const rule = {
      effect: "allow" as const,
      action: ["read", "update"] as readonly string[],
      resource: "post",
    };
    expect(ruleMatches(rule, { resource: "post", action: "read" })).toBe(true);
    expect(ruleMatches(rule, { resource: "post", action: "update" })).toBe(
      true,
    );
    expect(ruleMatches(rule, { resource: "post", action: "delete" })).toBe(
      false,
    );
  });

  it("matches array resources", () => {
    const rule = {
      effect: "allow" as const,
      action: "read",
      resource: ["post", "user"] as readonly string[],
    };
    expect(ruleMatches(rule, { resource: "post", action: "read" })).toBe(true);
    expect(ruleMatches(rule, { resource: "user", action: "read" })).toBe(true);
    expect(ruleMatches(rule, { resource: "comment", action: "read" })).toBe(
      false,
    );
  });

  it("matches namespace wildcard", () => {
    const rule = {
      effect: "allow" as const,
      action: "read",
      resource: "billing.*",
    };
    expect(
      ruleMatches(rule, { resource: "billing.invoice", action: "read" }),
    ).toBe(true);
    expect(ruleMatches(rule, { resource: "billing", action: "read" })).toBe(
      true,
    );
    expect(ruleMatches(rule, { resource: "user", action: "read" })).toBe(false);
  });
});

describe("evaluateRules", () => {
  it("returns deny when no rules match", () => {
    const rules = [
      { effect: "allow" as const, action: "read", resource: "post" },
    ];
    const result = evaluateRules(rules, { resource: "post", action: "update" });
    expect(result.allowed).toBe(false);
  });

  it("returns allow when a rule matches", () => {
    const rules = [
      { effect: "allow" as const, action: "read", resource: "post" },
    ];
    const result = evaluateRules(rules, { resource: "post", action: "read" });
    expect(result.allowed).toBe(true);
  });

  it("deny overrides allow at same priority", () => {
    const rules = [
      { effect: "allow" as const, action: "read", resource: "post" },
      { effect: "deny" as const, action: "read", resource: "post" },
    ];
    const result = evaluateRules(rules, { resource: "post", action: "read" });
    expect(result.allowed).toBe(false);
  });

  it("higher priority wins", () => {
    const rules = [
      {
        effect: "allow" as const,
        action: "read",
        resource: "post",
        priority: 1,
      },
      {
        effect: "deny" as const,
        action: "read",
        resource: "post",
        priority: 10,
      },
    ];
    const result = evaluateRules(rules, { resource: "post", action: "read" });
    expect(result.allowed).toBe(false);
  });

  it("higher priority allow wins over lower deny", () => {
    const rules = [
      {
        effect: "deny" as const,
        action: "read",
        resource: "post",
        priority: 1,
      },
      {
        effect: "allow" as const,
        action: "read",
        resource: "post",
        priority: 10,
      },
    ];
    const result = evaluateRules(rules, { resource: "post", action: "read" });
    expect(result.allowed).toBe(true);
  });
});

describe("compileRules and findMatchingRules", () => {
  it("compiles and finds exact matches", () => {
    const rules = [
      { effect: "allow" as const, action: "read", resource: "post" },
    ];
    const compiled = compileRules(rules);
    const matching = findMatchingRules(compiled, {
      resource: "post",
      action: "read",
    });
    expect(matching).toHaveLength(1);
  });

  it("finds resource wildcard matches", () => {
    const rules = [{ effect: "allow" as const, action: "*", resource: "post" }];
    const compiled = compileRules(rules);
    const matching = findMatchingRules(compiled, {
      resource: "post",
      action: "update",
    });
    expect(matching).toHaveLength(1);
  });

  it("finds action wildcard matches", () => {
    const rules = [{ effect: "allow" as const, action: "read", resource: "*" }];
    const compiled = compileRules(rules);
    const matching = findMatchingRules(compiled, {
      resource: "post",
      action: "read",
    });
    expect(matching).toHaveLength(1);
  });

  it("finds global wildcard matches", () => {
    const rules = [{ effect: "allow" as const, action: "*", resource: "*" }];
    const compiled = compileRules(rules);
    const matching = findMatchingRules(compiled, {
      resource: "anything",
      action: "goes",
    });
    expect(matching).toHaveLength(1);
  });

  it("returns empty for no matches", () => {
    const rules = [
      { effect: "allow" as const, action: "read", resource: "post" },
    ];
    const compiled = compileRules(rules);
    const matching = findMatchingRules(compiled, {
      resource: "user",
      action: "read",
    });
    expect(matching).toHaveLength(0);
  });
});
