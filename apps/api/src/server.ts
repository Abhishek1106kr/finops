import "dotenv/config";
import { buildApp } from "./app";

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

buildApp()
  .then((app) => app.listen({ port, host }))
  .then(() => {
    // eslint-disable-next-line no-console
    console.log(`PazyPro API listening on http://${host}:${port} (docs at /docs)`);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
