import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { createNodeWebSocket } from "@hono/node-ws";
import EventEmitter from "events";

import { config } from "dotenv";
config();

interface Status {
  done: boolean;
  failed: boolean;
  username: string;
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

app.get(
  "/ws",
  upgradeWebSocket((c) => {
    let messageReceiver: (data: Status) => void;
    let whitelistReceiver: (username: string) => void;
    return {
      onMessage(event, _) {
        const type = c.req.queries("type");
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
        const type = c.req.queries("type");
        if (type && type[0] === "server") {
          console.log("Server connected");
          whitelistReceiver = (username) => {
            console.log("Whitelisting " + username);
            ws.send(username);
          };
          internal.on("whitelist", whitelistReceiver);
        } else {
          console.log("Client connected");
          const username = c.req.queries("username");
          if (!username || username.length != 1) return ws.close();
          internal.emit("whitelist", username[0]);
          messageReceiver = (data) => {
            console.log(`Sending ${JSON.stringify(data)}`);
            if (data.username == username[0]) {
            ws.send(JSON.stringify(data));
            console.log(data);
            }
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
