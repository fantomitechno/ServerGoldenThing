import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage, MessageType } from "../types.js";
import { addMinecraftWS, deleteMinecraftWS, getCelesteWS } from "./index.js";

export const minecraftWSDefinition: (
  c: Context,
  key: string
) => WSEvents | Promise<WSEvents> = (_c, key) => {
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      if (data.type == MessageType.PING) return;
      getCelesteWS(key)?.send(JSON.stringify(data));
    },
    onClose(_event, _ws) {
      deleteMinecraftWS(key);
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
    },
  };
};
