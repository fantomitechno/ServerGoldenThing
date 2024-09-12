import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import { config } from "dotenv";
config();

import {
  clientWebsocketDefinition,
  getUsers,
  serverWebsocketDefintion,
} from "./websocket.js";
import { WSEvents } from "hono/ws";
import { minecraftWSDefinition } from "./ws/minecraft.js";

const app = new Hono();
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

app.get("/", (c) => {
  return c.text("Hello look at this cool API to link Celeste and Minecraft!");
});

app.get("/ip", (c) => {
  return c.text(process.env.SERVER_IP ?? "");
});

app.get("/ip-info", (c) => {
  return c.text(process.env.SERVER_INFO ?? "");
});

app.get("/clients", (c) => {
  return c.json(getUsers());
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const type = c.req.queries("type");
    if (!type) return closeWS;

    switch (type[0]) {
      case "celeste":
        return serverWebsocketDefintion(c);

      case "minecraft":
        const key = c.req.queries("key");
        if (!key) return closeWS;
        return minecraftWSDefinition(c, key[0]);

      default:
        return closeWS;
    }
  })
);

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
