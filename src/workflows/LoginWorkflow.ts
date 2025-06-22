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
import { ResourceManager } from "../utils/ResourceManager";

export class LoginWorkflow {
  public static sendLoginScreenData(client: ProTankiClient, server: ProTankiServer): void {
    client.sendPacket(new Ping());
    client.sendPacket(new SocialNetwork(server.getSocialNetworks()));
    client.sendPacket(new CaptchaLocation([]));

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
