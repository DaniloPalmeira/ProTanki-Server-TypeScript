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
  private static resourceDir = path.join(__dirname, "../../resource");
  private static pathsFile = path.join(__dirname, "../config/resources.json");

  private static languageImageFiles = [
    "en.jpg",
    "pt_br.jpg",
    "ru.jpg",
    "ua.jpg",
  ];

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
    const resourcePath = path.join(
      this.resourceDir,
      config.path.replace(/^\/|\/$/g, "")
    );

    if (!fs.existsSync(resourcePath)) {
      throw new Error(`Path not found for resource ${config.id}`);
    }

    const files = fs.readdirSync(resourcePath);
    const isLazy = files.includes("lazy.jpg");
    const isAlpha = files.includes("alpha.jpg");

    let resourceType: number | undefined;
    if (config.type !== undefined) {
      resourceType = config.type;
    } else {
      const isLanguageResource = this.languageImageFiles.some((file) =>
        files.includes(file)
      );
      if (isLanguageResource) {
        resourceType = 13;
      } else {
        const matchingFile = files.find((file) => this.fileNameToType[file]);
        resourceType = matchingFile
          ? this.fileNameToType[matchingFile]
          : undefined;
      }
    }

    if (resourceType === undefined) {
      throw new Error(`Unknown resource type for ${config.id}`);
    }

    const { idHigh, idLow, versionHigh, versionLow } = this.parseResourcePath(
      config.path
    );

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
      dependency.fileNames = files.filter((file) =>
        this.languageImageFiles.includes(file)
      );
    }

    return dependency;
  }

  public static getResourceById(id: ResourceId): IDependency | null {
    const resource = this.resources.get(id);
    if (!resource) {
      logger.error(`Resource with ID ${id} not found`);
      return null;
    }
    return resource;
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

    const idHigh = (part2 << 16) | (part3 << 8) | part4;

    return {
      idLow: part1,
      idHigh: idHigh,
      versionLow: 0,
      versionHigh: versionOct,
    };
  }

  public static getResourcePath(
    idLow: number,
    idHigh: number,
    versionLow: number,
    versionHigh: number
  ): string {
    const versionOct = versionHigh.toString(8);
    const part1 = idLow.toString(8);
    const part2 = (idHigh >>> 16).toString(8);
    const part3 = ((idHigh >>> 8) & 0xff).toString(8);
    const part4 = (idHigh & 0xff).toString(8);

    return `/${part1}/${part2}/${part3}/${part4}/${versionOct}/`;
  }
}
