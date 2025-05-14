import Config, { ConfigAttributes } from "../models/Config";
import logger from "../utils/Logger";
import { FindOptions } from "sequelize";

export class ConfigService {
  // Funções utilitárias para converter promessas em callbacks
  private static findConfig(
    options: FindOptions<ConfigAttributes>,
    callback: (error: Error | null, config: Config | null) => void
  ): void {
    Config.findOne(options)
      .then((config: Config | null) => callback(null, config))
      .catch((error: Error) => callback(error, null));
  }

  private static createConfig(
    attributes: ConfigAttributes,
    callback: (error: Error | null, config?: Config) => void
  ): void {
    Config.create(attributes)
      .then((config: Config) => callback(null, config))
      .catch((error: Error) => callback(error));
  }

  private static upsertConfig(
    attributes: ConfigAttributes,
    callback: (error: Error | null, config?: Config) => void
  ): void {
    Config.upsert(attributes)
      .then(([config, created]) => callback(null, config))
      .catch((error: Error) => callback(error));
  }

  /**
   * Obtém o valor de uma configuração pelo nome da chave.
   */
  public static getConfig(
    key: string,
    callback: (error: Error | null, value?: string) => void
  ): void {
    this.findConfig({ where: { key } }, (error, config) => {
      if (error) {
        logger.error(`Error fetching config for key ${key}`, { error });
        return callback(error);
      }
      callback(null, config?.value);
    });
  }

  /**
   * Define ou atualiza o valor de uma configuração.
   */
  public static setConfig(
    key: string,
    value: string,
    callback: (error: Error | null, config?: Config) => void
  ): void {
    this.upsertConfig({ key, value }, (error, config) => {
      if (error) {
        logger.error(`Error setting config for key ${key}`, { error });
        return callback(error);
      }
      logger.info(`Config updated`, { key, value });
      callback(null, config);
    });
  }

  /**
   * Obtém todas as configurações do banco de dados.
   */
  public static getAllConfigs(
    callback: (error: Error | null, configs?: { [key: string]: string }) => void
  ): void {
    Config.findAll()
      .then((configs) => {
        const configMap: { [key: string]: string } = {};
        configs.forEach((config) => {
          configMap[config.key] = config.value;
        });
        callback(null, configMap);
      })
      .catch((error) => {
        logger.error("Error fetching all configs", { error });
        callback(error);
      });
  }

  /**
   * Inicializa configurações padrão se não existirem no banco de dados.
   */
  public static initializeDefaultConfigs(
    defaults: { [key: string]: string },
    callback: (error: Error | null) => void
  ): void {
    const keys = Object.keys(defaults);
    let processed = 0;

    function processNext() {
      if (processed >= keys.length) {
        logger.info("Default configurations initialized", { keys });
        return callback(null);
      }

      const key = keys[processed];
      const value = defaults[key];

      ConfigService.getConfig(key, (error, existingValue) => {
        if (error) {
          logger.error(`Error checking default config for key ${key}`, { error });
          return callback(error);
        }

        if (existingValue === undefined) {
          ConfigService.setConfig(key, value, (setError) => {
            if (setError) {
              logger.error(`Error setting default config for key ${key}`, {
                error: setError,
              });
              return callback(setError);
            }
            processed++;
            processNext();
          });
        } else {
          processed++;
          processNext();
        }
      });
    }

    processNext();
  }
}