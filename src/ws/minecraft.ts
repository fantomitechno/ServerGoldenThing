import { WSEvents } from "hono/ws";
import { DefaultMessage, MessageType } from "../types.js";
import { addMinecraftWS, deleteMinecraftWS, getCelesteWS } from "./index.js";
import { Context } from "hono";

export const minecraftWSDefinition: (
  c: Context,
  key: string
) => WSEvents | Promise<WSEvents> = (_c, key) => {
  const pingTimeout = Number(process.env.PING_INTERVAL);
  let removeFromNoPingTimeout: NodeJS.Timeout;
  let pingInterval: NodeJS.Timeout;
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      if (data.type == MessageType.PING) {
        clearTimeout(removeFromNoPingTimeout);
        return;
      }
      getCelesteWS(key)?.send(JSON.stringify(data));
    },
    onClose(_event, _ws) {
      deleteMinecraftWS(key);
      clearTimeout(removeFromNoPingTimeout);
      clearInterval(pingInterval);
      console.log("Minecraft connection closed");
      const disconnectMessage: DefaultMessage = {
        key,
        type: MessageType.LOST_CONNECTION,
      };

      getCelesteWS(key)?.send(JSON.stringify(disconnectMessage));
    },
    onOpen(_event, ws) {
      try {
        addMinecraftWS(key, ws);
      } catch (error) {
        ws.close(3000, "Unauthorized");
      }
      console.log("Minecraft connected");
      const openedMessage: DefaultMessage = {
        key,
        type: MessageType.OPENED,
      };
      ws.send(JSON.stringify(openedMessage));

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
