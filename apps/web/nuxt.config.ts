export default defineNuxtConfig({
  compatibilityDate: "2026-07-01",
  devtools: { enabled: true },
  modules: ["@nuxtjs/tailwindcss", "@pinia/nuxt", "@vueuse/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE ?? "http://localhost:4000/api/v1",
      socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL ?? "http://localhost:4000",
    },
  },
  app: {
    head: {
      title: "PazyPro — Autonomous Finance Operating System",
      meta: [{ name: "description", content: "Don't automate invoices. Understand the company." }],
    },
  },
  tailwindcss: {
    config: {
      presets: [(await import("@pazy-pro/config/tailwind-preset")).default],
    },
  },
});
