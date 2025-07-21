import { DEFAULT_MAX_CLIENTS } from "@/config/constants";
import logger from "@/utils/Logger";
import Config, { IConfig } from "./config.model";

export class ConfigService {
    private cachedConfigs: { [key: string]: string } = {};

    public async getConfig(key: string): Promise<string | undefined> {
        if (this.cachedConfigs[key]) {
            return this.cachedConfigs[key];
        }
        try {
            const config = await Config.findOne({ key });
            return config?.value;
        } catch (error) {
            logger.error(`Error fetching config for key ${key}`, { error });
            throw error;
        }
    }

    public async setConfig(key: string, value: string): Promise<IConfig> {
        try {
            const config = await Config.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
            this.cachedConfigs[key] = value;
            logger.info(`Config updated`, { key, value });
            return config;
        } catch (error) {
            logger.error(`Error setting config for key ${key}`, { error });
            throw error;
        }
    }

    public async loadAndCacheConfigs(): Promise<void> {
        try {
            const configs = await Config.find({});
            this.cachedConfigs = {};
            configs.forEach((config) => {
                this.cachedConfigs[config.key] = config.value;
            });
            logger.info("All configurations have been loaded and cached.");
        } catch (error) {
            logger.error("Error fetching and caching all configs", { error });
            throw error;
        }
    }

    public async initializeDefaultConfigs(defaults: { [key: string]: string }): Promise<void> {
        for (const key of Object.keys(defaults)) {
            try {
                const existingConfig = await Config.findOne({ key });
                if (!existingConfig) {
                    await this.setConfig(key, defaults[key]);
                }
            } catch (error) {
                logger.error(`Error initializing default config for key ${key}`, { error });
                throw error;
            }
        }
        logger.info("Default configurations checked and initialized.");
    }

    public getNeedInviteCode = (): boolean => this.cachedConfigs.needInviteCode === "true";
    public getMaxClients = (): number => parseInt(this.cachedConfigs.maxClients, 10) || DEFAULT_MAX_CLIENTS;
    public getChatEnabled = (): boolean => this.cachedConfigs.chatEnabled === "true";
    public getChatAntifloodEnabled = (): boolean => this.cachedConfigs.chatAntifloodEnabled === "true";
    public getChatTypingSpeedAntifloodEnabled = (): boolean => this.cachedConfigs.chatTypingSpeedAntifloodEnabled === "true";
    public getChatShowLinks = (): boolean => this.cachedConfigs.chatShowLinks === "true";
    public getChatBufferSize = (): number => parseInt(this.cachedConfigs.chatBufferSize, 10) || 60;
    public getChatMinChar = (): number => parseInt(this.cachedConfigs.chatMinChar, 10) || 60;
    public getChatMinWord = (): number => parseInt(this.cachedConfigs.chatMinWord, 10) || 5;
    public getChatCharDelayFactor = (): number => parseInt(this.cachedConfigs.chatCharDelayFactor, 10) || 176;
    public getChatMessageBaseDelay = (): number => parseInt(this.cachedConfigs.chatMessageBaseDelay, 10) || 880;
    public getChatHistoryLimit = (): number => parseInt(this.cachedConfigs.chatHistoryLimit, 10) || 70;

    public getSocialAuthLinks = (): { [key: string]: string } => {
        try {
            return JSON.parse(this.cachedConfigs.socialAuthLinks || "{}");
        } catch (error) {
            logger.error("Failed to parse socialAuthLinks from config", { error });
            return {};
        }
    };

    public getCaptchaLocations = (): number[] => {
        try {
            return JSON.parse(this.cachedConfigs.captchaLocations || "[]");
        } catch (error) {
            logger.error("Failed to parse captchaLocations from config", { error });
            return [];
        }
    };

    public getChatLinksWhitelist = (): string[] => {
        try {
            return JSON.parse(this.cachedConfigs.chatLinksWhitelist || "[]");
        } catch (error) {
            logger.error("Failed to parse chatLinksWhitelist from config", { error });
            return [];
        }
    };

    public getShopEnabledCountries = (): [string, string][] => {
        try {
            const countriesObj = JSON.parse(this.cachedConfigs.shopEnabledCountries || "{}");
            return Object.entries(countriesObj);
        } catch (error) {
            logger.error("Failed to parse shopEnabledCountries from config", { error });
            return [];
        }
    };

    public getShopLocationSwitchingEnabled = (): boolean => this.cachedConfigs.shopLocationSwitchingEnabled === "true";

    public getSocialNetworksForServer = (): [string, string][] => {
        const socialLinksObj = this.getSocialAuthLinks();
        return Object.entries(socialLinksObj)
            .map(([key, url]) => {
                if (typeof url === "string" && url.trim() !== "") {
                    return [url, key] as [string, string];
                }
                return null;
            })
            .filter((item): item is [string, string] => item !== null);
    };
}