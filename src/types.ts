enum MessageType {
  FLAG,
  WHITELIST,
  PING,
}

interface DefaultMessage {
  type: MessageType;
  username: string;
}

interface FlagMessage extends DefaultMessage {
  everestFlag: string;
  enabled: boolean;
}

interface WhitelistMessage extends DefaultMessage {}

export { MessageType, DefaultMessage, FlagMessage, WhitelistMessage };
