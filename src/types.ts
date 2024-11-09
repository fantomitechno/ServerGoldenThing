/**
 * MessageCodes:
 * 1X: Meta type
 * 2X: Everest flags
 * 3X: Teleportation
 * 4X: Kill events
 * 5X: Other events
 */
enum MessageType {
  PING = 10,

  FLAG = 20,
  DIALOG = 21,
  FLAG_BATCH = 22,

  TELEPORTATION = 30,

  KILL = 40,

  OPENED = 51,
  MINECRAFT_USERNAME = 52,
  LOST_CONNECTION = 53,
}

interface DefaultMessage {
  type: MessageType;
  key: string;
}

interface FlagMessage extends DefaultMessage {
  everestFlag: string;
  enabled: boolean;
}

interface FlagBatchMessage extends DefaultMessage {
  flags: string[];
}

interface DialogMessage extends DefaultMessage {
  dialog: string;
}

interface UsernameMessage extends DefaultMessage {
  username: string;
}

export {
  MessageType,
  DefaultMessage,
  FlagMessage,
  DialogMessage,
  UsernameMessage,
  FlagBatchMessage,
};
