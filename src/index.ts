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
    if (type && type[0] == "server") {
      return serverWebsocketDefintion(c);
    } else {
      return clientWebsocketDefinition(c);
    }
  })
);
const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

injectWebSocket(
  serve({
    fetch: app.fetch,
    port,
  })
);
