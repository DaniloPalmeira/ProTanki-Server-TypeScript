import { IDependency } from "@/features/loader/loader.types";
import fs from "fs";
import path from "path";
import { MapTheme } from "../features/battle/battle.model";
import { mapDependencies } from "../types/mapDependencies";
import { ResourceData, ResourceId } from "../types/resourceTypes";
import logger from "./Logger";
import { ResourcePathUtils } from "./resource.path.utils";

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
            lazy: id.includes("preview"),
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
                    dependency.weight = props.weight;
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

    private static _getMapLibsByIdLow(mapIdLow: number): ResourceId[] {
        return mapDependencies[mapIdLow] || [];
    }

    public static getSkyboxResourceIds(mapIdWithoutPrefix: string, theme: MapTheme): ResourceId[] {
        const themeStr = MapTheme[theme].toLowerCase();
        const skyboxParts = ["front", "back", "left", "right", "top", "bottom"];

        const specificPathPrefix = `skybox/${mapIdWithoutPrefix}/${themeStr}`;
        const specificSkyboxTestResource = `${specificPathPrefix}/${skyboxParts[0]}` as ResourceId;

        let basePath = `skybox/default/${themeStr}`;

        if (ResourceData[specificSkyboxTestResource]) {
            basePath = specificPathPrefix;
            logger.info(`Using specific skybox path for map: ${mapIdWithoutPrefix}, theme: ${themeStr}`);
        } else {
            logger.info(`Using default skybox path for map: ${mapIdWithoutPrefix}, theme: ${themeStr}`);
        }

        return skyboxParts.map((part) => `${basePath}/${part}` as ResourceId);
    }

    public static getSkyboxResources(mapIdWithoutPrefix: string, theme: MapTheme): IDependency[] {
        const skyboxResourceIds = this.getSkyboxResourceIds(mapIdWithoutPrefix, theme);

        try {
            return this.getBulkResources(skyboxResourceIds);
        } catch (error) {
            const basePath = skyboxResourceIds.length > 0 ? skyboxResourceIds[0].substring(0, skyboxResourceIds[0].lastIndexOf("/")) : "unknown";
            logger.error(`Failed to get skybox resources. This likely means the resources for the path "${basePath}" are missing.`, { error });
            return [];
        }
    }

    public static getMapResources(mapId: string, theme: string): IDependency[] {
        const themePath = theme.toLowerCase();
        const mapXmlResourceId = `map/${mapId}/${themePath}/xml` as ResourceId;
        const mapResource = this.getResourceById(mapXmlResourceId);
        const libraryResourceIds = this._getMapLibsByIdLow(mapResource.idlow);
        return this.getBulkResources(libraryResourceIds);
    }
}