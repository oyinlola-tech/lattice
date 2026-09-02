import { describe, it, expect } from "vitest";
import {
  oneToOne,
  oneToMany,
  manyToOne,
  manyToMany,
  createRelationRegistry,
  validateRelation,
  isRelationType,
  isCollectionRelation,
  isSingleRelation,
  includeRelation,
  includeRelations,
} from "../src/index.js";

describe("Relation definitions", () => {
  it("should create a one-to-one relation", () => {
    const rel = oneToOne({
      name: "userProfile",
      parent: "User",
      child: "Profile",
      foreignKey: "userId",
      referencedKey: "id",
    });
    expect(rel.type).toBe("one-to-one");
  });

  it("should create a one-to-many relation", () => {
    const rel = oneToMany({
      name: "userPosts",
      parent: "User",
      child: "Post",
      foreignKey: "authorId",
      referencedKey: "id",
    });
    expect(rel.type).toBe("one-to-many");
  });

  it("should create a many-to-one relation", () => {
    const rel = manyToOne({
      name: "postAuthor",
      parent: "Post",
      child: "User",
      foreignKey: "authorId",
      referencedKey: "id",
    });
    expect(rel.type).toBe("many-to-one");
  });

  it("should create a many-to-many relation", () => {
    const rel = manyToMany({
      name: "userRoles",
      parent: "User",
      child: "Role",
      foreignKey: "userId",
      referencedKey: "roleId",
    });
    expect(rel.type).toBe("many-to-many");
  });
});

describe("RelationRegistry", () => {
  it("should register and retrieve relations", () => {
    const registry = createRelationRegistry();
    const rel = oneToOne({
      name: "userProfile",
      parent: "User",
      child: "Profile",
      foreignKey: "userId",
      referencedKey: "id",
    });

    registry.register(rel);

    expect(registry.has("userProfile")).toBe(true);
    const retrieved = registry.get("userProfile");
    expect(retrieved).toBeDefined();
    expect(retrieved?.name).toBe("userProfile");
  });

  it("should return all relations", () => {
    const registry = createRelationRegistry();
    registry.register(
      oneToOne({
        name: "a",
        parent: "A",
        child: "B",
        foreignKey: "aId",
        referencedKey: "id",
      }),
    );
    registry.register(
      oneToMany({
        name: "b",
        parent: "B",
        child: "C",
        foreignKey: "bId",
        referencedKey: "id",
      }),
    );

    expect(registry.all()).toHaveLength(2);
  });

  it("should remove relations", () => {
    const registry = createRelationRegistry();
    registry.register(
      oneToOne({
        name: "userProfile",
        parent: "User",
        child: "Profile",
        foreignKey: "userId",
        referencedKey: "id",
      }),
    );

    expect(registry.remove("userProfile")).toBe(true);
    expect(registry.has("userProfile")).toBe(false);
  });

  it("should clear all relations", () => {
    const registry = createRelationRegistry();
    registry.register(
      oneToOne({
        name: "a",
        parent: "A",
        child: "B",
        foreignKey: "aId",
        referencedKey: "id",
      }),
    );

    registry.clear();
    expect(registry.size).toBe(0);
  });

  it("should filter by parent", () => {
    const registry = createRelationRegistry();
    const rel1 = oneToOne({
      name: "userProfile",
      parent: "User",
      child: "Profile",
      foreignKey: "userId",
      referencedKey: "id",
    });
    const rel2 = oneToMany({
      name: "userPosts",
      parent: "User",
      child: "Post",
      foreignKey: "authorId",
      referencedKey: "id",
    });
    registry.register(rel1);
    registry.register(rel2);

    expect(registry.forParent("User")).toHaveLength(2);
    expect(registry.forParent("Other")).toHaveLength(0);
  });

  it("should register multiple relations at once", () => {
    const registry = createRelationRegistry();
    registry.registerMany([
      oneToOne({
        name: "a",
        parent: "A",
        child: "B",
        foreignKey: "aId",
        referencedKey: "id",
      }),
      oneToMany({
        name: "b",
        parent: "B",
        child: "C",
        foreignKey: "bId",
        referencedKey: "id",
      }),
    ]);

    expect(registry.size).toBe(2);
  });
});

describe("Relation type guards", () => {
  it("isRelationType should validate relation types", () => {
    expect(isRelationType("one-to-one")).toBe(true);
    expect(isRelationType("one-to-many")).toBe(true);
    expect(isRelationType("many-to-one")).toBe(true);
    expect(isRelationType("many-to-many")).toBe(true);
    expect(isRelationType("invalid")).toBe(false);
  });

  it("isCollectionRelation should identify collection relations", () => {
    const oneToManyRel = oneToMany({
      name: "a",
      parent: "A",
      child: "B",
      foreignKey: "aId",
      referencedKey: "id",
    });
    const manyToManyRel = manyToMany({
      name: "b",
      parent: "B",
      child: "C",
      foreignKey: "bId",
      referencedKey: "id",
    });
    const oneToOneRel = oneToOne({
      name: "c",
      parent: "C",
      child: "D",
      foreignKey: "cId",
      referencedKey: "id",
    });

    expect(isCollectionRelation(oneToManyRel)).toBe(true);
    expect(isCollectionRelation(manyToManyRel)).toBe(true);
    expect(isCollectionRelation(oneToOneRel)).toBe(false);
  });

  it("isSingleRelation should identify single relations", () => {
    const oneToOneRel = oneToOne({
      name: "a",
      parent: "A",
      child: "B",
      foreignKey: "aId",
      referencedKey: "id",
    });
    const manyToOneRel = manyToOne({
      name: "b",
      parent: "B",
      child: "C",
      foreignKey: "bId",
      referencedKey: "id",
    });
    const oneToManyRel = oneToMany({
      name: "c",
      parent: "C",
      child: "D",
      foreignKey: "cId",
      referencedKey: "id",
    });

    expect(isSingleRelation(oneToOneRel)).toBe(true);
    expect(isSingleRelation(manyToOneRel)).toBe(true);
    expect(isSingleRelation(oneToManyRel)).toBe(false);
  });
});

describe("validateRelation", () => {
  it("should validate a correct relation", () => {
    const rel = oneToOne({
      name: "userProfile",
      parent: "User",
      child: "Profile",
      foreignKey: "userId",
      referencedKey: "id",
    });
    expect(() => validateRelation(rel)).not.toThrow();
  });
});

describe("includeRelation / includeRelations", () => {
  it("should create a relation include", () => {
    const include = includeRelation("userProfile");
    expect(include.relation).toBe("userProfile");
  });

  it("should create multiple relation includes", () => {
    const includes = includeRelations(
      includeRelation("profile"),
      includeRelation("posts"),
    );
    expect(includes).toHaveLength(2);
  });

  it("should create include with select", () => {
    const include = includeRelation("profile", { select: ["avatar", "bio"] });
    expect(include.select).toEqual(["avatar", "bio"]);
  });
});
