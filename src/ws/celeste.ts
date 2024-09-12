import { WSEvents } from "hono/ws";
import { Context } from "vm";
import { DefaultMessage } from "../types";
import { addMinecraftWS, deleteMinecraftWS, getCelesteWS } from ".";

export const celesteWSDefinition: (
  c: Context,
  key: string
) => WSEvents | Promise<WSEvents> = (c, key) => {
  return {
    onMessage(event, _) {
      const data: DefaultMessage = JSON.parse(event.data as string);
      getCelesteWS(key)?.send(JSON.stringify(data));
    },
    onClose(event, ws) {
      deleteMinecraftWS(key);
      console.log("Server connection closed");
    },
    onOpen(_, ws) {
      addMinecraftWS(key, ws);
      console.log("Server connected");
    },
  };
};
