import type { Server as HttpServer } from "node:http";
import { Server as SocketIOServer } from "socket.io";
import { consumeEvents } from "@pazy-pro/events";
import { createLogger } from "@pazy-pro/logging";

const logger = createLogger("realtime");

/**
 * Bridges the Redis Streams event mesh (ADR-0001) to connected browser
 * clients over Socket.IO. Runs inside the API process (which owns the HTTP
 * server) rather than the BullMQ workers process, since Socket.IO needs the
 * underlying `http.Server` instance — workers publish events onto the same
 * stream, this just tails it and rebroadcasts.
 */
export function attachRealtime(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    path: "/realtime",
    cors: { origin: process.env.CORS_ORIGIN ?? "*" },
  });

  io.on("connection", (socket) => {
    logger.info({ socketId: socket.id }, "realtime.client.connected");
    socket.on("disconnect", () => logger.info({ socketId: socket.id }, "realtime.client.disconnected"));
  });

  // Fire-and-forget: tails the stream for the lifetime of the process.
  void tailEventMesh(io);

  return io;
}

async function tailEventMesh(io: SocketIOServer) {
  try {
    for await (const envelope of consumeEvents({
      group: "realtime-bridge",
      consumer: `api-${process.pid}`,
    })) {
      io.emit("domain-event", envelope);
      io.to(`company:${envelope.companyId}`).emit("domain-event", envelope);
    }
  } catch (err) {
    logger.error({ err }, "realtime.bridge.failed");
  }
}
