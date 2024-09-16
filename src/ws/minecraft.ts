import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage } from "../types";
import { addMinecraftWS, deleteMinecraftWS, getCelesteWS } from ".";

export const minecraftWSDefinition: (
  c: Context,
  key: string
) => WSEvents | Promise<WSEvents> = (_c, key) => {
  return {
    onMessage(event, _ws) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      getCelesteWS(key)?.send(JSON.stringify(data));
    },
    onClose(_event, _ws) {
      deleteMinecraftWS(key);
      console.log("Minecraft connection closed");
    },
    onOpen(_event, ws) {
      addMinecraftWS(key, ws);
      console.log("Minecraft connected");
    },
  };
};
