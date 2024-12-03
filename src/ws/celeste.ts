import { WSEvents } from "hono/ws";
import { DefaultMessage, MessageType } from "../types.js";
import {
  addCelesteWS,
  deleteCelesteWS,
  getMinecraftWS,
  getNextKey,
  pingTimeout,
} from "./index.js";
import { Context } from "hono";

const ips: string[] = [];

export const celesteWSDefinition: (
  c: Context
) => WSEvents | Promise<WSEvents> = (c) => {
  const key = getNextKey();
  const ip = c.req.header("X-RealIP") ?? "";
  if (!key || ip in ips)
    return {
      onOpen(_, ws) {
        ws.close(1011, "No key available right now");
      },
    };

  ips.push(ip);

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

      clearTimeout(removeFromNoPingTimeout);
      clearInterval(pingInterval);
      const disconnectMessage: DefaultMessage = {
        key,
        type: MessageType.LOST_CONNECTION,
      };

      getMinecraftWS(key)?.send(JSON.stringify(disconnectMessage));

      const index = ips.indexOf(ip);
      if (index > -1) {
        ips.splice(index, 1);
      }
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
        }, pingTimeout / 2);
      }, pingTimeout);
    },
  };
};
