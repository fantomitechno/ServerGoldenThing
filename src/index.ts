import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { config } from "dotenv";
config();

import { WSEvents } from "hono/ws";
import { minecraftWSDefinition } from "./ws/minecraft.js";
import { celesteWSDefinition } from "./ws/celeste.js";
import { getCelesteUsers, getMinecraftUsers } from "./ws/index.js";

const app = new Hono();
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });
app.notFound((c) => {
  return c.json({ message: "not found" });
});

app.get("/", (c) => {
  return c.text("Hello look at this cool API to link Celeste and Minecraft!");
});

app.get("/clients", (c) => {
  return c.json({
    celeste: getCelesteUsers(),
    minecraft: getMinecraftUsers(),
  });
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const type = c.req.queries("type");
    if (!type) return closeWS;

    switch (type[0]) {
      case "celeste":
        return celesteWSDefinition(c);

      case "minecraft":
        const key = c.req.queries("key");
        if (!key) return closeWS;
        return minecraftWSDefinition(c, key[0]);

      default:
        return closeWS;
    }
  })
);

const visageHeaders = {
  "User-Agent":
    "ServerGoldenThing/2.0 (+https://simon.renoux.dev/projects/tgc; <simon@renoux.dev>)",
};

app.get("/portrait", async (c) => {
  const username = c.req.queries("username");

  const res = await fetch(`https://visage.surgeplay.com/bust/160/${username}`, {
    headers: visageHeaders,
  });

  if (res.status == 404) {
    const res = await fetch(`https://visage.surgeplay.com/bust/160/X-Steve`, {
      headers: visageHeaders,
    });
    return c.newResponse(res.body);
  }

  return c.newResponse(res.body);
});

const closeWS: WSEvents = {
  onOpen(_, ws) {
    ws.close(3000, "Unauthorized");
  },
};

const port = Number(process.env.PORT);
injectWebSocket(
  serve({
    fetch: app.fetch,
    port,
  })
);

console.log(`Server is running on port ${port}`);
