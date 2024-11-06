import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { prettyJSON } from "hono/pretty-json";
import { z } from "zod";

const app = new Hono();

const fileSchema = z
  .instanceof(File)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
    "Invalid file type",
  );

app.use("*", prettyJSON());
app.use("/extension/*", cors());
app.use("*", logger());

app.get("/", (c) => {
  return c.text("supaguide is running!");
});

app.post("/extension/start", async (c) => {
  // create a demo record in db
  return c.json({
    success: true,
    url: "https://supaguide.com",
    demoId: "demoId",
  });
});

app.post(
  "/extension/stop",
  zValidator(
    "json",
    z.object({
      demoId: z.string(),
      clickCount: z.number(),
    }),
    (c) => {
      console.log(c);
    },
  ),
  async (c) => {
    // stop recording
    const { demoId, clickCount } = c.req.valid("json");
    return c.json({
      success: true,
      demoId,
    });
  },
);

app.post(
  "/extension/image",
  zValidator(
    "form",
    z.object({
      demoId: z.string(),
      x: z.number(),
      y: z.number(),
      timestamp: z.number(),
      elementHTML: z.string(),
      elementContent: z.string(),
      screenshot: fileSchema,
    }),
    (c) => {
      console.log(c);
    },
  ),
  async (c) => {
    // check if demoId exists, check if it is not closed yet, then proceed
    const body = c.req.valid("form");

    return c.json({
      success: true,
      demoId: body.demoId,
    });
  },
);

app.onError((err, c) => {
  console.error(err);
  c.res.status = 500;
  return c.json({ error: err.message });
});

export default app;
