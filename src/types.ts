enum MessageType {
  FLAG,
  PING,
}

interface DefaultMessage {
  type: MessageType;
  key: string;
}

interface FlagMessage extends DefaultMessage {
  everestFlag: string;
  enabled: boolean;
}

export { MessageType, DefaultMessage, FlagMessage };
