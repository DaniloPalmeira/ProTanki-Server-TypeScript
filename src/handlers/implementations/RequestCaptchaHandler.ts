import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import RequestCaptcha from "../../packets/implementations/RequestCaptcha";
import generateCaptcha from "../../utils/GenerateCaptcha";
import Captcha from "../../packets/implementations/Captcha";

export default class RequestCaptchaHandler implements IPacketHandler<RequestCaptcha> {
  public readonly packetId = RequestCaptcha.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: RequestCaptcha): void {
    const captcha = generateCaptcha();
    client.captchaSolution = captcha.text;
    client.sendPacket(new Captcha(packet.view, captcha.image));
  }
}
