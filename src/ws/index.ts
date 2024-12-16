import { WSContext } from "hono/ws";
import { getFiveDigitStr } from "../utils.js";

const celesteWebsockets: { [key: string]: WSContext | undefined } = {};
const minecraftWebsockets: { [key: string]: WSContext | undefined } = {};

const addCelesteWS = (key: string, ws: WSContext) => {
  celesteWebsockets[key] = ws;
};

const addMinecraftWS = (key: string, ws: WSContext) => {
  if (minecraftWebsockets[key] != null) throw Error();
  minecraftWebsockets[key] = ws;
};

const getCelesteWS = (key: string) => celesteWebsockets[key];

const getMinecraftWS = (key: string) => minecraftWebsockets[key];

const deleteCelesteWS = (key: string) => delete celesteWebsockets[key];

const deleteMinecraftWS = (key: string) => delete minecraftWebsockets[key];

const getNextKey = () => {
  const celesteKeys = Object.keys(celesteWebsockets);
  const minecraftKeys = Object.keys(minecraftWebsockets);
  for (let i = 0; i < 100000; i++) {
    if (
      celesteKeys.includes(getFiveDigitStr(i)) ||
      minecraftKeys.includes(getFiveDigitStr(i))
    )
      continue;
    return getFiveDigitStr(i);
  }
  return null;
};

const getCelesteUsers = () => Object.keys(celesteWebsockets).length;
const getMinecraftUsers = () => Object.keys(minecraftWebsockets).length;

export {
  addCelesteWS,
  addMinecraftWS,
  getCelesteWS,
  getMinecraftWS,
  deleteCelesteWS,
  deleteMinecraftWS,
  getNextKey,
  getCelesteUsers,
  getMinecraftUsers,
};
