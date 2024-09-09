import { Context } from "hono";
import { WSContext, WSEvents } from "hono/ws";

import { DefaultMessage, MessageType, WhitelistMessage } from "./types.js";

const clientWebsockets: { [username: string]: WSContext | undefined } = {};
let serverWebsocket: WSContext | null;

const serverWebsocketDefintion: (c: Context) => WSEvents | Promise<WSEvents> = (
  c
) => {
  return {
    onMessage(event, _) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      clientWebsockets[data.username]?.send(event.data as string);
    },
    onClose(event, ws) {
      console.log("Server connection closed");
      serverWebsocket = null;
    },
    onOpen(_, ws) {
      serverWebsocket = ws;
      const key = c.req.queries("key");
      if (!key || key[0] !== process.env.KEY) return ws.close();
      console.log("Server connected");
    },
  };
};

const clientWebsocketDefinition: (
  c: Context
) => WSEvents | Promise<WSEvents> = (c) => {
  const queryUsername = c.req.queries("username");
  if (!queryUsername || queryUsername.length != 1)
    return {
      onOpen(_, ws) {
        console.log("Client without username logged in");
        ws.close();
      },
    };

  const username = queryUsername[0];
  let interval: NodeJS.Timeout;

  return {
    onClose(_, __) {
      console.log(`Client connection closed (${username})`);

      // Clearing memory
      delete clientWebsockets[username];
      clearInterval(interval);
    },
    onOpen(_, ws) {
      console.log(`Client connected (${username})`);
      clientWebsockets[username] = ws;

      // Whitelist user
      const whitelistMessage: WhitelistMessage = {
        type: MessageType.WHITELIST,
        username,
      };
      serverWebsocket?.send(JSON.stringify(whitelistMessage));

      // Setup PING intervale
      const ping: DefaultMessage = {
        type: MessageType.PING,
        username,
      };

      interval = setInterval(() => {
        ws.send(JSON.stringify(ping));
      }, 10 * 1000);
    },
    onMessage(evt, ws) {
      let data: DefaultMessage = JSON.parse(evt.data as string);
      data.username = username;
      if (data.type == MessageType.PING) {
        return;
      }
      serverWebsocket?.send(JSON.stringify(data));
    },
  };
};

const getUsers = () => {
  return Object.keys(clientWebsockets);
};

export { serverWebsocketDefintion, clientWebsocketDefinition, getUsers };
