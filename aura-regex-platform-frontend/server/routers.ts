import { z } from "zod";
import { eq } from "drizzle-orm";
import * as dbHelpers from "./db";
import { rules, folders, testCases, generationLogs } from "../drizzle/schema";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  rules: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return [];
      return dbHelpers.getUserRules(ctx.user.id);
    }),
    getById: publicProcedure.input(z.number()).query(({ input }) => {
      return dbHelpers.getRuleById(input);
    }),
    create: publicProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional(),
      pattern: z.string(),
      naturalLanguageInput: z.string().optional(),
      flags: z.string().optional(),
      folderId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(rules).values({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),
    update: publicProcedure.input(z.object({
      id: z.number(),
      name: z.string().optional(),
      description: z.string().optional(),
      pattern: z.string().optional(),
      flags: z.string().optional(),
      folderId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const { id, ...updates } = input;
      const result = await dbInstance.update(rules).set(updates).where(eq(rules.id, id));
      return result;
    }),
    delete: publicProcedure.input(z.number()).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.delete(rules).where(eq(rules.id, input));
      return result;
    }),
  }),

  folders: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return [];
      return dbHelpers.getUserFolders(ctx.user.id);
    }),
    create: publicProcedure.input(z.object({
      name: z.string(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(folders).values({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),
  }),

  testCases: router({
    listByRule: publicProcedure.input(z.number()).query(({ input }) => {
      return dbHelpers.getTestCasesByRuleId(input);
    }),
    create: publicProcedure.input(z.object({
      ruleId: z.number(),
      input: z.string(),
      expectedMatches: z.number().optional(),
      description: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(testCases).values({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),
  }),

  generationLogs: router({
    list: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) return [];
      return dbHelpers.getUserGenerationLogs(ctx.user.id);
    }),
    create: publicProcedure.input(z.object({
      input: z.string(),
      output: z.string().optional(),
      userFeedback: z.string().optional(),
      ruleId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new Error("Not authenticated");
      const dbInstance = await dbHelpers.getDb();
      if (!dbInstance) throw new Error("Database not available");
      const result = await dbInstance.insert(generationLogs).values({
        userId: ctx.user.id,
        ...input,
      });
      return result;
    }),
  }),
});

export type AppRouter = typeof appRouter;
