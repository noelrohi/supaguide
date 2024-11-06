import { database } from "@/db";
import { clicks, demos } from "@/db/schema";
import type { Env } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { createClient } from "@supabase/supabase-js";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

const fileSchema = z
  .instanceof(File)
  .refine(
    (file) => ["image/jpeg", "image/png", "image/gif"].includes(file.type),
    "Invalid file type",
  );

app.post("/start", async (c) => {
  // create a demo record in db
  const db = database(c.env);
  const [demo] = await db
    .insert(demos)
    .values({
      isDraft: true,
    })
    .returning();
  return c.json({
    success: true,
    url: "https://supaguide.com",
    demoId: demo.id,
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
    const { demoId, clickCount } = c.req.valid("json");
    const db = database(c.env);
    const [demo] = await db
      .update(demos)
      .set({ isDraft: false, clickCount })
      .where(eq(demos.id, demoId))
      .returning();
    return c.json({
      success: true,
      demo,
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
    const { screenshot, ...body } = c.req.valid("form");
    const db = database(c.env);
    const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_ANON_KEY);
    console.log(screenshot, "File");
    const { data } = await supabase.storage
      .from("files")
      .upload(`/public/${screenshot.name}`, screenshot);
    if (!data)
      return c.json(
        { success: false, error: "Failed to upload screenshot" },
        500,
      );
    const toInsert: typeof clicks.$inferInsert = {
      demoId: body.demoId,
      x: body.x,
      y: body.y,
      elementHTML: body.elementHTML,
      elementContent: body.elementContent,
      imageUrl: `${c.env.SUPABASE_URL}/storage/v1/object/${data.fullPath}`,
    };
    const [click] = await db.insert(clicks).values(toInsert).returning();

    return c.json({
      success: true,
      click,
    });
  },
);

export { app as extension };
