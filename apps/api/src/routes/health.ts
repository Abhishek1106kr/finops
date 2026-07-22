import type { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { prisma } from "@pazy-pro/database";
import { getRedis } from "@pazy-pro/events";

/** Liveness/readiness probes for orchestration and uptime monitors. */
export const healthRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();

  server.get(
    "/healthz",
    { schema: { response: { 200: z.object({ status: z.literal("ok") }) } } },
    async () => ({ status: "ok" as const }),
  );

  server.get(
    "/readyz",
    {
      schema: {
        response: {
          200: z.object({ status: z.literal("ready"), db: z.boolean(), redis: z.boolean() }),
          503: z.object({ status: z.literal("ready"), db: z.boolean(), redis: z.boolean() }),
        },
      },
    },
    async (_req, reply) => {
      const [db, redis] = await Promise.all([
        prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
        getRedis().ping().then(() => true).catch(() => false),
      ]);
      const ready = db && redis;
      reply.status(ready ? 200 : 503);
      return { status: "ready" as const, db, redis };
    },
  );
};
