import WebSocket from "ws";
import {
  DefaultMessage,
  FlagMessage,
  MessageType,
  WhitelistMessage,
} from "./types.js";

const ws = new WebSocket("ws://127.0.0.1:3000/ws?type=server&key=test");

ws.on("open", () => {
  console.log("Server connected");
});

let status = true;

setTimeout(() => {
  ws.send(
    `{"type": 0, "everestFlag": "test", "enabled": ${status}, "username":"Steve"}`
  );
  console.log(`Sending everestFlag "test" with value ${status}`);
  status = !status;
}, 5000);

ws.on("message", (data, isBinary) => {
  const message: DefaultMessage = JSON.parse(data.toString());

  switch (message.type) {
    case MessageType.WHITELIST:
      const whitelist = message as WhitelistMessage;
      console.log("/whitelist add " + whitelist.username);
      break;

    case MessageType.FLAG:
      const flag = message as FlagMessage;
      console.log(
        `Flag ${flag.everestFlag} got put to ${flag.enabled} by ${flag.username}`
      );

      setTimeout(() => {
        ws.send(
          `{"type": 0, "everestFlag": "doors_test", "enabled": ${flag.enabled}, "username":"Steve"}`
        );
        console.log(
          `Sending everestFlag "doors_test" with value ${flag.enabled}`
        );
      }, 5000);
      break;
    default:
      console.log(`Unrecognized message type: ${message.type}`);
      break;
  }
});

ws.on("close", () => {
  console.log("Websocket connection closed");
});
