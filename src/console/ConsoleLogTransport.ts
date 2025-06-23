import Transport from "winston-transport";
import { MESSAGE } from "triple-beam";

export class ConsoleLogTransport extends Transport {
  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit("logged", info);
    });

    const formattedMessage = info[MESSAGE];
    this.emit("log", formattedMessage);

    callback();
  }
}
