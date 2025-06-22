import { CALLBACK } from "../config/constants";
import CaptchaLocation from "../packets/implementations/CaptchaLocation";
import HideLoader from "../packets/implementations/HideLoader";
import InviteEnabled from "../packets/implementations/InviteEnabled";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import Ping from "../packets/implementations/Ping";
import Registration from "../packets/implementations/Registration";
import SocialNetwork from "../packets/implementations/SocialNetwork";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { ConfigService } from "../services/ConfigService";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";

export class LoginWorkflow {
  public static async sendLoginScreenData(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    client.sendPacket(new Ping());
    client.sendPacket(new SocialNetwork(server.getSocialNetworks()));

    let captchaLocations: number[] = [];
    try {
      const locationsValue = await ConfigService.getConfig("captchaLocations");
      if (locationsValue) {
        captchaLocations = JSON.parse(locationsValue);
      }
    } catch (error) {
      logger.error("Failed to parse captchaLocations from config", { error });
    }

    client.sendPacket(new CaptchaLocation(captchaLocations));

    const dependencies = {
      resources: [ResourceManager.getResourceById("language_images"), ResourceManager.getResourceById("login_background")],
    };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.LOGIN_FORM));
  }

  public static initializeLoginForm(client: ProTankiClient, server: ProTankiServer): void {
    client.sendPacket(new InviteEnabled(server.getNeedInviteCode()));

    const loginForm = server.getLoginForm();
    client.sendPacket(new Registration(loginForm.bgResource, loginForm.enableRequiredEmail, loginForm.maxPasswordLength, loginForm.minPasswordLength));

    client.sendPacket(new HideLoader());
  }
}
