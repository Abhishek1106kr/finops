import { io, type Socket } from "socket.io-client";
import { ref, onUnmounted } from "vue";

let socket: Socket | null = null;

function getSocket(url: string): Socket {
  if (!socket) {
    socket = io(url, { path: "/realtime", transports: ["websocket", "polling"] });
  }
  return socket;
}

export interface DomainEventEnvelope {
  eventId: string;
  eventType: string;
  companyId: string;
  occurredAt: string;
  actor: { type: string; id: string };
  payload: Record<string, unknown>;
}

/**
 * Subscribes to the API's Socket.IO `/realtime` bridge (see
 * apps/api/src/realtime.ts), which tails the Redis Streams event mesh and
 * rebroadcasts every domain event. Client-only — no-ops during SSR.
 */
export function useDomainEvents(onEvent: (event: DomainEventEnvelope) => void) {
  const connected = ref(false);

  if (import.meta.client) {
    const { public: pub } = useRuntimeConfig();
    const sock = getSocket(pub.socketUrl as string);

    const handleConnect = () => (connected.value = true);
    const handleDisconnect = () => (connected.value = false);

    sock.on("connect", handleConnect);
    sock.on("disconnect", handleDisconnect);
    sock.on("domain-event", onEvent);
    connected.value = sock.connected;

    onUnmounted(() => {
      sock.off("connect", handleConnect);
      sock.off("disconnect", handleDisconnect);
      sock.off("domain-event", onEvent);
    });
  }

  return { connected };
}
