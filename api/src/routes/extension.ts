import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono();

const fileSchema = z
  .instanceof(File)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
    "Invalid file type",
  );

app.post("/start", async (c) => {
  // create a demo record in db
  return c.json({
    success: true,
    url: "https://supaguide.com",
    demoId: "demoId",
  });
});

app.post(
  "/stop",
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
  "/image",
  zValidator(
    "form",
    z.object({
      demoId: z.string(),
      x: z.coerce.number(),
      y: z.coerce.number(),
      timestamp: z.string(),
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

export { app as extension };
