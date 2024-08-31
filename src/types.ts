enum Status {
  done,
  failed,
}

interface StatusRequest {
  status: Status;
  username: string;
}

declare interface InternalEvent {
  on(event: "message", listener: (data: StatusRequest) => void): this;
  on(event: "whitelist", listener: (username: string) => void): this;
  emit(event: "message", data: StatusRequest): boolean;
  emit(event: "whitelist", username: string): boolean;
  removeListener(
    event: "message",
    listener: (data: StatusRequest) => void
  ): this;
  removeListener(
    event: "whitelist",
    listener: (username: string) => void
  ): this;
}
