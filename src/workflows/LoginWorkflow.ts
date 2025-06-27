import { CALLBACK } from "../config/constants";
import Captcha from "../packets/implementations/Captcha";
import CaptchaLocation from "../packets/implementations/CaptchaLocation";
import HideLoader from "../packets/implementations/HideLoader";
import InviteEnabled from "../packets/implementations/InviteEnabled";
import LoadDependencies from "../packets/implementations/LoadDependencies";
import Ping from "../packets/implementations/Ping";
import RecoveryEmailInvalidCode from "../packets/implementations/RecoveryEmailInvalidCode";
import Registration from "../packets/implementations/Registration";
import SocialNetwork from "../packets/implementations/SocialNetwork";
import { ProTankiClient } from "../server/ProTankiClient";
import { ProTankiServer } from "../server/ProTankiServer";
import { ResourceId } from "../types/resourceTypes";
import generateCaptcha from "../utils/GenerateCaptcha";
import logger from "../utils/Logger";
import { ResourceManager } from "../utils/ResourceManager";

export class LoginWorkflow {
  public static async sendLoginScreenData(client: ProTankiClient, server: ProTankiServer): Promise<void> {
    client.sendPacket(new Ping());
    client.sendPacket(new SocialNetwork(server.getSocialNetworks()));
    client.sendPacket(new CaptchaLocation(server.configService.getCaptchaLocations()));

    const resourceIds: ResourceId[] = ["ui/language_images", "ui/login_background", "ui/quests/icons/battle_score", "ui/quests/icons/get_crystal", "ui/quests/icons/kill_enemies", "ui/quests/window/week1/quest_chain", "ui/quests/window/week2/quest_chain", "ui/quests/window/week3/quest_chain", "ui/quests/window/week4/quest_chain", "ui/quests/window/week1/final_reward", "ui/quests/window/week2/final_reward", "ui/quests/window/week3/final_reward", "ui/quests/window/week4/final_reward", "maps/map_sandbox/preview/SUMMER", "maps/map_sandbox/preview/WINTER", "maps/map_sandbox/preview/SUMMER_NIGHT", "maps/map_sandbox/preview/SPACE", "maps/map_sandal/preview/SUMMER", "maps/map_sandal/preview/WINTER", "maps/map_sandal/preview/SPACE", "maps/map_serpuhov/preview/SUMMER", "maps/map_serpuhov/preview/WINTER", "maps/map_serpuhov/preview/SPACE", "sounds/notifications/battle_invite"];

    const dependencies = {
      resources: ResourceManager.getBulkResources(resourceIds),
    };
    client.sendPacket(new LoadDependencies(dependencies, CALLBACK.LOGIN_FORM));
  }

  public static initializeLoginForm(client: ProTankiClient, server: ProTankiServer): void {
    client.sendPacket(new InviteEnabled(server.getNeedInviteCode()));

    const loginForm = server.getLoginForm();
    client.sendPacket(new Registration(loginForm.bgResource, loginForm.enableRequiredEmail, loginForm.maxPasswordLength, loginForm.minPasswordLength));

    client.sendPacket(new HideLoader());
  }

  public static handleInvalidRecoveryCode(client: ProTankiClient): void {
    const captcha = generateCaptcha();
    client.captchaSolution = captcha.text;

    client.sendPacket(new RecoveryEmailInvalidCode());
    client.sendPacket(new Captcha(3, captcha.image));
  }
}
