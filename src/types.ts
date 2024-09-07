enum MessageType {
  FLAG,
  WHITELIST,
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
