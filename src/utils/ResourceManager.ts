import fs from "fs";
import path from "path";
import { IDependency } from "../packets/interfaces/ILoadDependencies";
import { ResourceId, ResourceData } from "../types/resourceTypes";
import logger from "./Logger";
import { ResourcePathUtils } from "./ResourcePathUtils";

export class ResourceManager {
  private static dependencies: Map<ResourceId, IDependency> = new Map();

  private static resourceDir = path.join(__dirname, "../../.resource");

  private static fileNameToType: { [key: string]: number } = {
    "image.jpg": 10,
    "image.png": 10,
    "sound.swf": 4,
    "sound.mp3": 4,
    "map.xml": 7,
    "object.3ds": 17,
    "library.tara": 8,
    "image.tara": 11,
  };

  public static loadResources(): void {
    try {
      const resourceIds = Object.keys(ResourceData) as ResourceId[];

      resourceIds.forEach((id) => {
        const config = ResourceData[id];
        const dependency = this.createDependency(id, config.path);
        this.dependencies.set(id, dependency);
      });

      logger.info(`Loaded ${resourceIds.length} resource configurations`);
    } catch (error) {
      logger.error("Error loading resource configurations", { error });
      throw error;
    }
  }

  private static createDependency(id: ResourceId, resourceBuildPath: string): IDependency {
    const fullResourcePath = path.join(this.resourceDir, resourceBuildPath);

    if (!fs.existsSync(fullResourcePath)) {
      throw new Error(`Path not found for resource ${id} at ${fullResourcePath}. Run 'npm run build:resources'.`);
    }

    const files = fs.readdirSync(fullResourcePath);
    const resourceType = this.resolveResourceType(files);

    if (resourceType === undefined) {
      throw new Error(`Could not determine resource type for id "${id}".`);
    }

    const { idHigh, idLow, versionHigh, versionLow } = ResourcePathUtils.parseResourcePath(resourceBuildPath);

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
      dependency.fileNames = files.filter((file) => file.endsWith(".jpg") || file.endsWith(".png"));
    }

    if (resourceType === 11) {
      const propsPath = path.join(fullResourcePath, "properties.json");
      if (fs.existsSync(propsPath)) {
        try {
          const props = JSON.parse(fs.readFileSync(propsPath, "utf8"));
          dependency.width = props.weight;
          dependency.height = props.height;
          dependency.numFrames = props.numFrames;
          dependency.fps = props.fps;
        } catch (e) {
          logger.error(`Failed to parse properties.json for resource ${id}`, { error: e });
        }
      }
    }

    return dependency;
  }

  private static resolveResourceType(files: string[]): number | undefined {
    const hasLanguageFile = files.some((file) => file.match(/^(en|pt_br|ru|ua)\.(jpg|png)$/));
    if (hasLanguageFile) {
      return 13;
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

  public static getBulkResources(ids: ResourceId[]): IDependency[] {
    return ids.map((id) => this.getResourceById(id));
  }

  public static getIdlowById(id: ResourceId): number {
    const resourceInfo = ResourceData[id];
    if (!resourceInfo) {
      throw new Error(`Resource idLow with ID '${id}' not found.`);
    }
    return resourceInfo.idLow;
  }
}
