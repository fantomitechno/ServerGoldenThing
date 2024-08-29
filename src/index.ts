import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import EventEmitter from "events";

import { config } from "dotenv";
config();

declare interface InternalEvent {
  on(event: "message", listener: (data: any) => void): this;
  on(event: "whitelist", listener: (username: string) => void): this;
  emit(event: "message", data: any): boolean;
  emit(event: "whitelist", username: string): boolean;
}
class InternalEvent extends EventEmitter {}

const app = new Hono();
const { upgradeWebSocket } = createNodeWebSocket({ app });

const internal = new InternalEvent();

app.get("/", (c) => {
  return c.text("Hello look at this cool API to link Celeste and Minecraft!");
});

app.get("/ip", (c) => {
  return c.text(process.env.SERVER_IP ?? "");
});

app.post("/whitelist", async (c) => {
  const data: { username: string } = await c.req.json();

  const username = data["username"];

  internal.emit("whitelist", username);
  return c.json({});
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const type = c.req.queries("type");
    if (!type || type.length != 1) {
      return {};
    }
    return {
      onMessage(event, _) {
        if (type[0] == "server") {
          internal.emit("message", event.data);
        }
      },
      onClose(event, ws) {
        console.log("Connection closed");
      },
      onOpen(_, ws) {
        if (type[0] !== "server") {
          internal.on("whitelist", (username) => {
            ws.send(username);
          });
        } else {
          internal.on("message", (data) => {
            ws.send(data);
          });
        }
      },
    };
  })
);

const port = Number(process.env.PORT);
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
