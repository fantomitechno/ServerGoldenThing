import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import EventEmitter from "events";

import { config } from "dotenv";
config();

interface Status {
  done: boolean;
  failed: boolean;
}

declare interface InternalEvent {
  on(event: "message", listener: (data: Status) => void): this;
  on(event: "whitelist", listener: (username: string) => void): this;
  emit(event: "message", data: Status): boolean;
  emit(event: "whitelist", username: string): boolean;
  removeListener(event: "message", listener: (data: Status) => void): this;
  removeListener(
    event: "whitelist",
    listener: (username: string) => void
  ): this;
}
class InternalEvent extends EventEmitter {}

const app = new Hono();
const { upgradeWebSocket, injectWebSocket } = createNodeWebSocket({ app });

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
  console.log("Whitelisting " + username);

  internal.emit("whitelist", username);
  return c.json({});
});

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    const type = c.req.queries("type");
    let messageReceiver: (data: Status) => void;
    let whitelistReceiver: (username: string) => void;
    return {
      onMessage(event, _) {
        if (type && type[0] == "server") {
          internal.emit("message", JSON.parse(event.data as string));
        }
      },
      onClose(event, ws) {
        console.log("Connection closed");
        if (messageReceiver)
          internal.removeListener("message", messageReceiver);
        if (whitelistReceiver)
          internal.removeListener("whitelist", whitelistReceiver);
      },
      onOpen(_, ws) {
        if (type && type[0] === "server") {
          console.log("Server connected");
          whitelistReceiver = (username) => {
            ws.send(username);
          };
          internal.on("whitelist", whitelistReceiver);
        } else {
          console.log("Client connected");
          messageReceiver = (data) => {
            ws.send(JSON.stringify(data));
            console.log(data);
          };
          internal.on("message", messageReceiver);
        }
      },
    };
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
