import { ref } from "vue";

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export function useCopilotChat() {
  const messages = ref<CopilotMessage[]>([]);
  const isStreaming = ref(false);
  const error = ref<string | null>(null);

  async function send(userMessage: string, screenContext?: string) {
    const { apiBase } = useApi();
    error.value = null;
    const history = messages.value.slice(-20);
    messages.value.push({ role: "user", content: userMessage });
    const assistantMessage: CopilotMessage = { role: "assistant", content: "" };
    messages.value.push(assistantMessage);
    isStreaming.value = true;

    try {
      const response = await fetch(`${apiBase}/ai/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, screenContext, history }),
      });
      if (!response.body) throw new Error("No response stream");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          const eventLine = frame.split("\n").find((l) => l.startsWith("event:"));
          const dataLine = frame.split("\n").find((l) => l.startsWith("data:"));
          if (!eventLine || !dataLine) continue;

          const event = eventLine.replace("event:", "").trim();
          const data = JSON.parse(dataLine.replace("data:", "").trim());

          if (event === "token") assistantMessage.content += data.delta;
          else if (event === "error") error.value = data.message;
        }
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to reach the Finance Brain";
    } finally {
      isStreaming.value = false;
    }
  }

  return { messages, isStreaming, error, send };
}
