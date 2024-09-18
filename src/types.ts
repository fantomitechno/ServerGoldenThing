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

  TELEPORTATION = 30,

  KILL = 40,

  OPENED = 51,
  MINECRAFT_USERNAME = 52,
}

interface DefaultMessage {
  type: MessageType;
  key: string;
}

interface FlagMessage extends DefaultMessage {
  everestFlag: string;
  enabled: boolean;
}

interface UsernameMessage extends DefaultMessage {
  username: string;
}

export { MessageType, DefaultMessage, FlagMessage, UsernameMessage };
