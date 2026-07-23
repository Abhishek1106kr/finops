import "dotenv/config";
import { buildApp } from "./app";
import { attachRealtime } from "./realtime";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

async function main() {
  const app = await buildApp();
  await app.listen({ port, host });
  attachRealtime(app.server);
  // eslint-disable-next-line no-console
  console.log(`PazyPro API listening on http://${host}:${port} (docs at /docs, realtime at /realtime)`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
