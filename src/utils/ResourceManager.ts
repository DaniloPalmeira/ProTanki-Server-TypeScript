import fs from "fs";
import path from "path";
import { IDependency } from "../packets/interfaces/ILoadDependencies";
import { ResourceId } from "../types/resourceTypes";
import logger from "./Logger";
import { ResourcePathUtils } from "./ResourcePathUtils";

interface ResourceConfig {
  id: ResourceId;
  path: string;
}

export class ResourceManager {
  private static dependencies: Map<ResourceId, IDependency> = new Map();
  private static idLowMap: Map<ResourceId, number> = new Map();

  private static resourceDir = path.join(__dirname, "../../.resource");
  private static pathsFile = path.join(__dirname, "../config/resources.json");
  private static idMapFile = path.join(__dirname, "../config/idMap.json");

  private static languageImageFiles = ["en.jpg", "pt_br.jpg", "ru.jpg", "ua.jpg"];
  private static fileNameToType: { [key: string]: number } = {
    "image.jpg": 10,
    "image.png": 10,
    "sound.swf": 4,
    "sound.mp3": 4,
    "map.xml": 6,
  };

  public static loadResources(): void {
    try {
      if (!fs.existsSync(this.pathsFile) || !fs.existsSync(this.idMapFile)) {
        logger.warn(`Resource config files not found. Run 'npm run build:resources' to generate them.`);
        return;
      }

      const pathData = fs.readFileSync(this.pathsFile, "utf8");
      const idMapData = fs.readFileSync(this.idMapFile, "utf8");

      const pathConfigs: ResourceConfig[] = JSON.parse(pathData);
      const idLowMappings: Record<ResourceId, number> = JSON.parse(idMapData);

      for (const id in idLowMappings) {
        this.idLowMap.set(id as ResourceId, idLowMappings[id as ResourceId]);
      }

      pathConfigs.forEach((config) => {
        const dependency = this.createDependency(config);
        this.dependencies.set(config.id, dependency);
      });

      logger.info(`Loaded ${pathConfigs.length} resource configurations`);
    } catch (error) {
      logger.error("Error loading resource configurations", { error });
      throw error;
    }
  }

  private static createDependency(config: ResourceConfig): IDependency {
    const resourcePath = path.join(this.resourceDir, config.path);

    if (!fs.existsSync(resourcePath)) {
      throw new Error(`Path not found for resource ${config.id} at ${resourcePath}. Run 'npm run build:resources'.`);
    }

    const files = fs.readdirSync(resourcePath);
    const resourceType = this.resolveResourceType(files);

    if (resourceType === undefined) {
      throw new Error(`Could not determine resource type for id "${config.id}".`);
    }

    const { idHigh, idLow, versionHigh, versionLow } = ResourcePathUtils.parseResourcePath(config.path);

    const dependency: IDependency = {
      idhigh: idHigh.toString(),
      idlow: idLow,
      versionhigh: versionHigh.toString(),
      versionlow: versionLow,
      lazy: files.includes("lazy.jpg"),
      alpha: files.includes("alpha.jpg"),
      type: resourceType,
    };

    if (resourceType === 13) {
      dependency.fileNames = files.filter((file) => this.languageImageFiles.includes(file));
    }

    return dependency;
  }

  private static resolveResourceType(files: string[]): number | undefined {
    const hasLanguageFile = this.languageImageFiles.some((file) => files.includes(file));
    if (hasLanguageFile) {
      return 13; // Tipo para coleções de imagens de idioma
    }

    const matchedFile = files.find((file) => this.fileNameToType[file]);
    return matchedFile ? this.fileNameToType[matchedFile] : undefined;
  }

  public static getResourceById(id: ResourceId): IDependency {
    const resource = this.dependencies.get(id);
    if (!resource) {
      throw new Error(`Resource dependency with ID '${id}' not found.`);
    }
    return resource;
  }

  public static getIdlowById(id: ResourceId): number {
    const idLow = this.idLowMap.get(id);
    if (idLow === undefined) {
      throw new Error(`Resource idLow with ID '${id}' not found.`);
    }
    return idLow;
  }
}
