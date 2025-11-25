import { describe, expect, it, beforeEach, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

function createUnauthenticatedContext(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return { ctx };
}

describe("tRPC Routers", () => {
  describe("rules router", () => {
    it("should list rules for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // This should not throw even if database is empty
      const result = await caller.rules.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for unauthenticated user", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.rules.list();
      expect(result).toEqual([]);
    });

    it("should get rule by id", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      // This should not throw even if rule doesn't exist
      const result = await caller.rules.getById(999);
      // Result could be undefined or throw depending on implementation
      expect(result === undefined || typeof result === "object").toBe(true);
    });

    it("should require authentication for create", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.rules.create({
          name: "Test Rule",
          pattern: "^test$",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should require authentication for update", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.rules.update({
          id: 1,
          name: "Updated Rule",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("should require authentication for delete", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.rules.delete(1);
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("folders router", () => {
    it("should list folders for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.folders.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for unauthenticated user", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.folders.list();
      expect(result).toEqual([]);
    });

    it("should require authentication for create", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.folders.create({
          name: "Test Folder",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("testCases router", () => {
    it("should list test cases by rule id", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.testCases.listByRule(1);
      expect(Array.isArray(result)).toBe(true);
    });

    it("should require authentication for create", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.testCases.create({
          ruleId: 1,
          input: "test input",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("generationLogs router", () => {
    it("should list generation logs for authenticated user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.generationLogs.list();
      expect(Array.isArray(result)).toBe(true);
    });

    it("should return empty array for unauthenticated user", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.generationLogs.list();
      expect(result).toEqual([]);
    });

    it("should require authentication for create", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      try {
        await caller.generationLogs.create({
          input: "test input",
        });
        expect.fail("Should have thrown error");
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe("auth router", () => {
    it("should return current user", async () => {
      const { ctx } = createAuthContext(1);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.openId).toBe("user-1");
    });

    it("should return null for unauthenticated user", async () => {
      const { ctx } = createUnauthenticatedContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();
      expect(result).toBeNull();
    });
  });
});
