import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage, MessageType } from "../types";
import { addCelesteWS, deleteCelesteWS, getMinecraftWS, getNextKey } from ".";

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

  let pingInterval: NodeJS.Timeout;
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
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
      }, 5000);
    },
  };
};
