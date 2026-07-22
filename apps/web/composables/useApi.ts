export function useApi() {
  const config = useRuntimeConfig();
  return { apiBase: config.public.apiBase };
}
