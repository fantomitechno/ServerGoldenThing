import { Context } from "hono";
import { WSEvents } from "hono/ws";
import EventEmitter from "events";

class InternalEvent extends EventEmitter {}

const internal = new InternalEvent();

const serverWebsocketDefintion: (c: Context) => WSEvents | Promise<WSEvents> = (
  c
) => {
  let whitelistReceiver: (username: string) => void;

  return {
    onMessage(event, _) {
      internal.emit("message", JSON.parse(event.data as string));
    },
    onClose(event, ws) {
      console.log("Server connection closed");
      if (whitelistReceiver)
        internal.removeListener("whitelist", whitelistReceiver);
    },
    onOpen(_, ws) {
      const key = c.req.queries("key");
      if (!key || key[0] !== process.env.KEY) return ws.close();
      console.log("Server connected");
      whitelistReceiver = (username) => {
        console.log("Whitelisting " + username);
        ws.send(username);
      };
      internal.on("whitelist", whitelistReceiver);
    },
  };
};

const clientWebsocketDefinition: (
  c: Context
) => WSEvents | Promise<WSEvents> = (c) => {
  const username = c.req.queries("username");
  let messageReceiver: (data: StatusRequest) => void;
  return {
    onClose(event, ws) {
      console.log(`Client connection closed (${username?.at(0)})`);
      if (messageReceiver) internal.removeListener("message", messageReceiver);
    },
    onOpen(_, ws) {
      if (!username || username.length != 1) return ws.close();
      console.log("Client connected");
      internal.emit("whitelist", username[0]);
      messageReceiver = (data) => {
        console.log(`Sending ${JSON.stringify(data)}`);
        if (data.username == username[0]) {
          ws.send(JSON.stringify(data));
          console.log(data);
        }
      };
      internal.on("message", messageReceiver);
    },
  };
};

export { serverWebsocketDefintion, clientWebsocketDefinition };
