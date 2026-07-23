import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { createLogger } from "@pazy-pro/logging";
import { healthRoutes } from "./routes/health";
import { invoiceRoutes } from "./routes/invoices";
import { vendorRoutes } from "./routes/vendors";
import { approvalRoutes } from "./routes/approvals";
import { paymentRoutes } from "./routes/payments";
import { demoRoutes } from "./routes/demo";
import { aiRoutes } from "./routes/ai";

export async function buildApp() {
  const logger = createLogger("api");

  const app = Fastify({
    loggerInstance: logger as unknown as import("fastify").FastifyBaseLogger,
    genReqId: () => crypto.randomUUID(),
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(cors, { origin: true });
  await app.register(multipart, { limits: { fileSize: 25 * 1024 * 1024 } });

  await app.register(swagger, {
    openapi: {
      info: { title: "PazyPro API", version: "1.0.0" },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: "/docs" });

  app.addHook("onRequest", async (req) => {
    req.log.info({ path: req.url, method: req.method }, "request.received");
  });

  await app.register(healthRoutes);
  await app.register(invoiceRoutes, { prefix: "/api/v1" });
  await app.register(vendorRoutes, { prefix: "/api/v1" });
  await app.register(approvalRoutes, { prefix: "/api/v1" });
  await app.register(paymentRoutes, { prefix: "/api/v1" });
  await app.register(demoRoutes, { prefix: "/api/v1" });
  await app.register(aiRoutes, { prefix: "/api/v1" });

  return app;
}
