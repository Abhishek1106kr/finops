import type { FastifyPluginAsync } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import Groq from "groq-sdk";
import { prisma } from "@pazy-pro/database";
import { createLogger } from "@pazy-pro/logging";

const logger = createLogger("ai-copilot");

const ChatMessage = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

const GROQ_MODEL = "llama-3.3-70b-versatile";

const SYSTEM_PROMPT = `You are the Finance Brain — PazyPro's autonomous finance copilot.
Core philosophy: don't just report numbers, explain what they mean for the business and what
needs attention. Be concise (a few sentences unless asked for detail). You have a live JSON
snapshot of the company's current financial state below — ground every answer in it, and say
plainly when the snapshot doesn't have what you'd need rather than inventing a number.`;

/**
 * Lightweight grounding context for the copilot — not RAG, just the handful
 * of numbers a finance operator would want the assistant to already know.
 */
async function buildContextSnapshot(companyId: string) {
  const [pendingApprovals, flaggedInvoices, scheduled, vendorCount] = await Promise.all([
    prisma.approval.count({ where: { status: "pending" } }),
    prisma.invoice.count({ where: { companyId, status: "flagged", deletedAt: null } }),
    prisma.payment.aggregate({
      where: { companyId, status: { in: ["scheduled", "processing"] } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.vendor.count({ where: { companyId, deletedAt: null } }),
  ]);

  return {
    pendingApprovals,
    flaggedInvoices,
    scheduledOutflow: Number(scheduled._sum.amount ?? 0),
    scheduledPaymentCount: scheduled._count,
    vendorCount,
  };
}

/**
 * Finance Brain chat endpoint. Streams over Server-Sent Events rather than
 * the JSON envelope the rest of the API uses, since token-by-token delivery
 * is the point — the route hijacks the reply and writes `event:`/`data:`
 * frames directly. Calls Groq's OpenAI-compatible chat-completions API via
 * the official `groq-sdk`; requires `GROQ_API_KEY` (apps/api/.env) — with no
 * key set it degrades to a clear SSE error frame instead of a 500.
 */
export const aiRoutes: FastifyPluginAsync = async (app) => {
  const server = app.withTypeProvider<ZodTypeProvider>();
  const DEMO_COMPANY_ID = "00000000-0000-0000-0000-000000000001";

  server.post(
    "/ai/chat",
    {
      schema: {
        body: z.object({
          message: z.string().min(1).max(4000),
          history: z.array(ChatMessage).max(20).default([]),
        }),
      },
    },
    async (req, reply) => {
      reply.raw.setHeader("Content-Type", "text/event-stream");
      reply.raw.setHeader("Cache-Control", "no-cache");
      reply.raw.setHeader("Connection", "keep-alive");
      reply.hijack();

      const send = (event: string, data: unknown) => {
        reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
      };

      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) {
        send("error", {
          message: "GROQ_API_KEY is not configured. Set it in apps/api/.env to enable the Finance Brain copilot.",
        });
        reply.raw.end();
        return;
      }

      const { message, history } = req.body;
      const groq = new Groq({ apiKey });

      try {
        const snapshot = await buildContextSnapshot(DEMO_COMPANY_ID);
        const stream = await groq.chat.completions.create({
          model: GROQ_MODEL,
          temperature: 0.3,
          max_tokens: 1024,
          stream: true,
          messages: [
            {
              role: "system",
              content: `${SYSTEM_PROMPT}\n\nLive company snapshot (JSON):\n${JSON.stringify(snapshot)}`,
            },
            ...history.map((m) => ({ role: m.role, content: m.content })),
            { role: "user" as const, content: message },
          ],
        });

        let finishReason: string | null = null;
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta?.content;
          if (delta) send("token", { delta });
          if (chunk.choices[0]?.finish_reason) finishReason = chunk.choices[0].finish_reason;
        }
        send("done", { stopReason: finishReason });
      } catch (err) {
        logger.error({ err }, "ai.chat.failed");
        send("error", { message: err instanceof Error ? err.message : "Unknown error" });
      } finally {
        reply.raw.end();
      }
    },
  );
};
