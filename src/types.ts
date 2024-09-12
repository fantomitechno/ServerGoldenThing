enum MessageType {
  FLAG,
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

export { MessageType, DefaultMessage, FlagMessage };
