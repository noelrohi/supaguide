import { database } from "@/db";
import type { Env } from "@/types";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

const app = new Hono<{ Bindings: Env }>();

app.get("/demo/:demoId", async (c) => {
  const { demoId } = c.req.param();
  const db = database(c.env);
  const demo = await db.query.demos.findFirst({
    where: (t, args) => args.eq(t.id, demoId),
    with: {
      clicks: true,
    },
  });
  if (!demo) return c.json({ success: false, error: "Demo not found" }, 404);
  return c.json(demo);
});

app.get(
  "/demos",
  zValidator(
    "query",
    z.object({
      limit: z.coerce.number().min(1).max(100).default(10),
      offset: z.coerce.number().min(0).optional(),
    }),
    (c) => {
      console.log(c);
    },
  ),
  async (c) => {
    const { limit, offset } = c.req.valid("query");
    const db = database(c.env);
    const demos = await db.query.demos.findMany({
      with: {
        clicks: true,
      },
      limit,
      offset,
    });
    return c.json(demos);
  },
);

export { app as web };
