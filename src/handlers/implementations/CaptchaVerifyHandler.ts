import { ProTankiClient } from "../../server/ProTankiClient";
import { ProTankiServer } from "../../server/ProTankiServer";
import { IPacketHandler } from "../IPacketHandler";
import CaptchaVerify from "../../packets/implementations/CaptchaVerify";
import CaptchaIsValid from "../../packets/implementations/CaptchaIsValid";
import CaptchaIsInvalid from "../../packets/implementations/CaptchaIsInvalid";
import generateCaptcha from "../../utils/GenerateCaptcha";

export default class CaptchaVerifyHandler implements IPacketHandler<CaptchaVerify> {
  public readonly packetId = CaptchaVerify.getId();

  public execute(client: ProTankiClient, server: ProTankiServer, packet: CaptchaVerify): void {
    if (client.captchaSolution === packet.solution.toLowerCase()) {
      client.sendPacket(new CaptchaIsValid(packet.view));
      return;
    }

    const captcha = generateCaptcha();
    client.captchaSolution = captcha.text;
    client.sendPacket(new CaptchaIsInvalid(packet.view, captcha.image));
  }
}
