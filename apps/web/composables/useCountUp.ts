import { ref, watch, type Ref } from "vue";

/** Animates a displayed number toward `target` whenever it changes (client-only; SSR just sets the value directly). */
export function useCountUp(target: Ref<number>, durationMs = 600) {
  const display = ref(target.value);

  if (!import.meta.client) {
    watch(target, (next) => (display.value = next));
    return display;
  }

  let frame: number | null = null;

  watch(target, (next, prev) => {
    if (frame) cancelAnimationFrame(frame);
    const from = prev ?? 0;
    const start = performance.now();

    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      display.value = from + (next - from) * eased;
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
  });

  return display;
}
