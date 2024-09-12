import { WSContext } from "hono/ws";

const celesteWebsockets: { [key: string]: WSContext | undefined } = {};
const minecraftWebsockets: { [key: string]: WSContext | undefined } = {};

const addCelesteWS = (key: string, ws: WSContext) => {
  celesteWebsockets[key] = ws;
};

const addMinecraftWS = (key: string, ws: WSContext) => {
  minecraftWebsockets[key] = ws;
};

const getCelesteWS = (key: string) => celesteWebsockets[key];

const getMinecraftWS = (key: string) => minecraftWebsockets[key];

const deleteCelesteWS = (key: string) => delete celesteWebsockets[key];

const deleteMinecraftWS = (key: string) => delete minecraftWebsockets[key];

export {
  addCelesteWS,
  addMinecraftWS,
  getCelesteWS,
  getMinecraftWS,
  deleteCelesteWS,
  deleteMinecraftWS,
};
