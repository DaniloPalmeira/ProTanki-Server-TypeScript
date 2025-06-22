import Config, { IConfig } from "../models/Config";
import logger from "../utils/Logger";

export class ConfigService {
  public static async getConfig(key: string): Promise<string | undefined> {
    try {
      const config = await Config.findOne({ key });
      return config?.value;
    } catch (error) {
      logger.error(`Error fetching config for key ${key}`, { error });
      throw error;
    }
  }

  public static async setConfig(key: string, value: string): Promise<IConfig> {
    try {
      const config = await Config.findOneAndUpdate({ key }, { value }, { new: true, upsert: true });
      logger.info(`Config updated`, { key, value });
      return config;
    } catch (error) {
      logger.error(`Error setting config for key ${key}`, { error });
      throw error;
    }
  }

  public static async getAllConfigs(): Promise<{ [key: string]: string }> {
    try {
      const configs = await Config.find({});
      const configMap: { [key: string]: string } = {};
      configs.forEach((config) => {
        configMap[config.key] = config.value;
      });
      return configMap;
    } catch (error) {
      logger.error("Error fetching all configs", { error });
      throw error;
    }
  }

  public static async initializeDefaultConfigs(defaults: { [key: string]: string }): Promise<void> {
    const keys = Object.keys(defaults);
    for (const key of keys) {
      const value = defaults[key];
      try {
        const existingValue = await this.getConfig(key);
        if (existingValue === undefined) {
          await this.setConfig(key, value);
        }
      } catch (error) {
        logger.error(`Error initializing default config for key ${key}`, { error });
        throw error;
      }
    }
    logger.info("Default configurations initialized", { keys });
  }
}
