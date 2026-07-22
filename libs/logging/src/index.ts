import pino from "pino";

/**
 * Structured JSON logger shared across the API and background workers.
 * `service` is bound so log aggregation (Loki) can filter by origin.
 */
export function createLogger(service: string) {
  return pino({
    name: service,
    level: process.env.LOG_LEVEL ?? "info",
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    base: { service },
  });
}

export type Logger = ReturnType<typeof createLogger>;
