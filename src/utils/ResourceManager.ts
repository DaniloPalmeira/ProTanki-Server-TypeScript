import fs from "fs";
import path from "path";
import { IDependency } from "../packets/interfaces/ILoadDependencies";
import { ResourceId } from "../types/resourceTypes"; // Importa o tipo gerado
import logger from "./Logger";

interface ResourceConfig {
  id: ResourceId; // Usa o tipo ResourceId
  path: string;
  type?: number;
}

export class ResourceManager {
  private static resources: Map<ResourceId, IDependency> = new Map();
  private static resourceDir = path.join(__dirname, "../../.resource");
  private static pathsFile = path.join(__dirname, "../config/resources.json");

  private static languageImageFiles = ["en.jpg", "pt_br.jpg", "ru.jpg", "ua.jpg"];

  private static fileNameToType: { [key: string]: number } = {
    "image.jpg": 10,
    "sound.swf": 4,
  };

  public static loadResources(): void {
    try {
      const data = fs.readFileSync(this.pathsFile, "utf8");
      const configs: ResourceConfig[] = JSON.parse(data);

      configs.forEach((config) => {
        const dependency = this.createDependency(config);
        this.resources.set(config.id, dependency);
      });

      logger.info(`Loaded ${configs.length} resource configurations`, {
        file: this.pathsFile,
      });
    } catch (error) {
      logger.error("Error loading resources.json or processing resources", {
        error,
      });
      throw new Error("Failed to load resource configurations");
    }
  }

  private static createDependency(config: ResourceConfig): IDependency {
    const normalizedPath = config.path.replace(/^\/|\/$/g, "");
    let resourcePath = path.join(this.resourceDir, normalizedPath);

    logger.debug(`Checking resource path: ${resourcePath} for ${config.id}`);

    if (!fs.existsSync(resourcePath)) {
      // Fallback: Try alternate resource directory
      const fallbackDir = path.join(this.resourceDir, "../../.resource/");
      const fallbackPath = path.join(fallbackDir, normalizedPath);
      logger.debug(`Fallback: Checking resource path: ${fallbackPath} for ${config.id}`);

      if (!fs.existsSync(fallbackPath)) {
        throw new Error(`Path not found for resource ${config.id} at ${resourcePath} or fallback ${fallbackPath}`);
      }

      this.resourceDir = fallbackDir;
      resourcePath = fallbackPath;

      logger.info(`Using fallback resource directory: ${this.resourceDir} for ${config.id}`);
    }

    const files = fs.readdirSync(resourcePath);
    const isLazy = files.includes("lazy.jpg");
    const isAlpha = files.includes("alpha.jpg");

    const resourceType = this.resolveResourceType(config, files);

    if (resourceType === undefined) {
      throw new Error(`Unknown resource type for ${config.id}`);
    }

    const { idHigh, idLow, versionHigh, versionLow } = this.parseResourcePath(config.path);

    const dependency: IDependency = {
      idhigh: idHigh.toString(),
      idlow: idLow,
      versionhigh: versionHigh.toString(),
      versionlow: versionLow,
      lazy: isLazy,
      alpha: isAlpha,
      type: resourceType,
    };

    if (resourceType === 13) {
      dependency.fileNames = files.filter((file) => this.languageImageFiles.includes(file));
    }

    return dependency;
  }

  private static resolveResourceType(config: ResourceConfig, files: string[]): number | undefined {
    if (config.type !== undefined) return config.type;

    const hasLanguageFile = this.languageImageFiles.some((file) => files.includes(file));
    if (hasLanguageFile) return 13;

    const matchedFile = files.find((file) => this.fileNameToType[file]);
    return matchedFile ? this.fileNameToType[matchedFile] : undefined;
  }

  public static getResourceById(id: ResourceId): IDependency {
    const resource = this.resources.get(id);
    if (!resource) {
      logger.error(`Resource with ID ${id} not found`);
      throw new Error(`Resource with ID ${id} not found`);
    }
    return resource;
  }

  public static getIdlowById(id: ResourceId): number {
    const resource = this.getResourceById(id);
    return resource.idlow;
  }

  public static parseResourcePath(resourcePath: string): {
    idHigh: number;
    idLow: number;
    versionHigh: number;
    versionLow: number;
  } {
    const parts = resourcePath.replace(/^\/|\/$/g, "").split("/");
    if (parts.length !== 5) {
      throw new Error("Invalid path format");
    }

    const part1 = parseInt(parts[0], 8);
    const part2 = parseInt(parts[1], 8);
    const part3 = parseInt(parts[2], 8);
    const part4 = parseInt(parts[3], 8);
    const versionOct = parseInt(parts[4], 8);

    const idLow = (part2 << 16) | (part3 << 8) | part4;

    return {
      idHigh: part1,
      idLow: idLow,
      versionHigh: 0,
      versionLow: versionOct,
    };
  }

  public static getResourcePath({ idHigh, idLow, versionHigh, versionLow }: { idHigh: number; idLow: number; versionHigh: number; versionLow: number }): string {
    // Extrair part2, part3 e part4 de idLow
    const part2 = (idLow >> 16) & 0xff; // Desloca 16 bits e mascara para obter 8 bits
    const part3 = (idLow >> 8) & 0xff; // Desloca 8 bits e mascara para obter 8 bits
    const part4 = idLow & 0xff; // Mascara para obter os últimos 8 bits

    // Converter todas as partes para strings octais (sem zeros à esquerda desnecessários)
    const part1Str = idHigh.toString(8); // part1 é idHigh
    const part2Str = part2.toString(8);
    const part3Str = part3.toString(8);
    const part4Str = part4.toString(8);
    const versionStr = versionLow.toString(8); // versionLow é a última parte

    // Montar o caminho com barras
    return `/${part1Str}/${part2Str}/${part3Str}/${part4Str}/${versionStr}/`;
  }
}
