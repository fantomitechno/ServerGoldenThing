import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage, MessageType } from "../types.js";
import {
  addCelesteWS,
  deleteCelesteWS,
  getMinecraftWS,
  getNextKey,
} from "./index.js";

export const celesteWSDefinition: (
  c: Context
) => WSEvents | Promise<WSEvents> = (_c) => {
  const key = getNextKey();
  if (!key)
    return {
      onOpen(_, ws) {
        ws.close(1011, "No key available right now");
      },
    };

  let removeFromNoPingTimeout: NodeJS.Timeout;
  let pingInterval: NodeJS.Timeout;
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      if (data.type == MessageType.PING) {
        clearTimeout(removeFromNoPingTimeout);
        return;
      }
      getMinecraftWS(key)?.send(JSON.stringify(data));
    },
    onClose(_event, _ws) {
      deleteCelesteWS(key);
      console.log("Celeste connection closed");

      clearInterval(pingInterval);
      const disconnectMessage: DefaultMessage = {
        key,
        type: MessageType.LOST_CONNECTION,
      };

      getMinecraftWS(key)?.send(JSON.stringify(disconnectMessage));
    },
    onOpen(_event, ws) {
      addCelesteWS(key, ws);
      console.log("Celeste connected");

      const openedMessage: DefaultMessage = {
        type: MessageType.OPENED,
        key,
      };
      setTimeout(() => {
        ws.send(JSON.stringify(openedMessage));
      }, 500);

      const pingMessage: DefaultMessage = {
        type: MessageType.PING,
        key,
      };
      pingInterval = setInterval(() => {
        ws.send(JSON.stringify(pingMessage));
        removeFromNoPingTimeout = setTimeout(() => {
          ws.close(1000, "Disconnected from no response");
        }, 5000);
      }, 10000);
    },
  };
};
