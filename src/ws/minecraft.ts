import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage, MessageType, UsernameMessage } from "../types";
import { addMinecraftWS, deleteMinecraftWS, getCelesteWS } from ".";

export const minecraftWSDefinition: (
  c: Context,
  key: string,
  username: string
) => WSEvents | Promise<WSEvents> = (_c, key, username) => {
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
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
      addMinecraftWS(key, ws);
      console.log("Minecraft connected");

      const message: UsernameMessage = {
        key,
        type: MessageType.MINECRAFT_USERNAME,
        username,
      };
      getCelesteWS(key)?.send(JSON.stringify(message));

      const openedMessage: DefaultMessage = {
        key,
        type: MessageType.OPENED,
      };
      ws.send(JSON.stringify(openedMessage));
    },
  };
};
