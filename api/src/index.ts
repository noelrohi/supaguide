import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { extension } from "./routes/extension";

const app = new Hono()
  .use("*", prettyJSON())
  .use("*", cors())
  .use("*", logger())
  .route("/extension", extension)
  .onError((err, c) => {
    console.error(err);
    c.res.status = 500;
    return c.json({ error: err.message });
  });

export default app;
