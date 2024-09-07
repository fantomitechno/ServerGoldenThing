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
  return {
    onClose(_, __) {
      console.log(`Client connection closed (${username})`);
      delete clientWebsockets[username];
    },
    onOpen(_, ws) {
      console.log(`Client connected (${username})`);
      clientWebsockets[username] = ws;

      const whitelistMessage: WhitelistMessage = {
        type: MessageType.WHITELIST,
        username,
      };
      serverWebsocket?.send(JSON.stringify(whitelistMessage));
    },
    onMessage(evt, ws) {
      let data: DefaultMessage = JSON.parse(evt.data as string);
      data.username = username;
      serverWebsocket?.send(JSON.stringify(data));
    },
  };
};

export { serverWebsocketDefintion, clientWebsocketDefinition };
