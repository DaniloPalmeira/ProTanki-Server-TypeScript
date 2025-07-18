import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { rimraf } from "rimraf";
import crc32 from "crc-32";
import { ResourcePathUtils } from "../src/utils/ResourcePathUtils";
import { parseStringPromise } from "xml2js";
import { create } from "xmlbuilder2";

const ROOT_DIR = path.join(__dirname, "..");
const RESOURCES_DIR = path.join(ROOT_DIR, "resources");
const RESOURCE_BUILD_DIR = path.join(ROOT_DIR, ".resource");
const TYPES_DIR = path.join(ROOT_DIR, "src", "types");

interface ResourceDefinition {
  id: string;
  idLow: number;
  versionLow: number;
  sourcePath: string;
  buildPath: string;
}

interface IVector3 {
  x: number;
  y: number;
  z: number;
}

interface ISpawnPoint {
  type: string;
  position: IVector3;
  rotation: IVector3;
}

interface ISpecialBox {
  minX: number;
  minY: number;
  minZ: number;
  maxX: number;
  maxY: number;
  maxZ: number;
  action: "kill" | "kick";
}

interface ICtfFlags {
  red: IVector3;
  blue: IVector3;
}

function generateResourceId(friendlyPath: string): number {
  return (crc32.str(friendlyPath) & 0xffffff) >>> 0;
}

async function findResources(dir: string, parentPath: string = ""): Promise<ResourceDefinition[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  let resources: ResourceDefinition[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const relativePath = parentPath ? `${parentPath}/${entry.name}` : entry.name;
      const versionDirs = (await fs.promises.readdir(fullPath, { withFileTypes: true }))
        .filter((d) => d.isDirectory() && d.name.startsWith("v"))
        .map((d) => parseInt(d.name.substring(1), 10))
        .filter((version) => !isNaN(version))
        .sort((a, b) => b - a);

      if (versionDirs.length > 0) {
        const latestVersion = versionDirs[0];
        const id = relativePath.replace(/\\/g, "/");
        const sourcePath = path.join(fullPath, `v${latestVersion}`);
        let idLow: number;

        const idFilePath = path.join(sourcePath, "id.json");

        if (fs.existsSync(idFilePath)) {
          const idFileContent = await fs.promises.readFile(idFilePath, "utf8");
          const idData = JSON.parse(idFileContent);
          if (typeof idData.idlow !== "number") {
            throw new Error(`"idlow" inválido ou ausente em ${idFilePath}`);
          }
          idLow = idData.idlow;
          console.log(`ID Fixo encontrado para "${id}": ${idLow}`);
        } else {
          idLow = generateResourceId(id);
        }

        const buildPath = ResourcePathUtils.getResourcePath({ idLow, versionLow: latestVersion });

        resources.push({ id, idLow, versionLow: latestVersion, sourcePath: path.join(fullPath, `v${latestVersion}`), buildPath });
      } else {
        resources = resources.concat(await findResources(fullPath, relativePath));
      }
    }
  }
  return resources;
}

async function copyRootFiles() {
  const entries = await fs.promises.readdir(RESOURCES_DIR, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isFile()) {
      const sourceFile = path.join(RESOURCES_DIR, entry.name);
      const destFile = path.join(RESOURCE_BUILD_DIR, entry.name);
      await fse.copy(sourceFile, destFile);
      console.log(`Copied root file: ${entry.name}`);
    }
  }
}

function generateResourceTypesFileContent(resources: ResourceDefinition[]): string {
  let content = `// Arquivo gerado automaticamente. Não edite manualmente.\n\n`;

  content += `export const ResourceData = {\n`;
  resources.forEach((res) => {
    content += `    "${res.id}": { idLow: ${res.idLow}, path: "${res.buildPath}", versionLow: ${res.versionLow} },\n`;
  });
  content += `} as const;\n\n`;

  content += `export type ResourceId = keyof typeof ResourceData;\n`;

  return content;
}

function friendlyNameToResourceId(name: string): string {
  return `library/${name.toLowerCase().replace(/\s+/g, "_")}`;
}

async function generatePropLibsXmls(resources: ResourceDefinition[]): Promise<void> {
  console.log("Generating proplibs.xml for maps...");

  const resourceMap = new Map<string, ResourceDefinition>(resources.map((r) => [r.id, r]));
  const mapResources = resources.filter((r) => r.id.startsWith("map/") && r.id.endsWith("/xml"));

  for (const mapResource of mapResources) {
    const mapXmlPath = path.join(mapResource.sourcePath, "map.xml");
    if (!fs.existsSync(mapXmlPath)) continue;

    try {
      const mapXmlContent = await fs.promises.readFile(mapXmlPath, "utf8");
      const parsedMap = await parseStringPromise(mapXmlContent);

      const propLibs = new Set<string>();
      if (parsedMap.map && parsedMap.map["static-geometry"] && parsedMap.map["static-geometry"][0] && parsedMap.map["static-geometry"][0].prop) {
        parsedMap.map["static-geometry"][0].prop.forEach((prop: any) => {
          if (prop.$ && prop.$["library-name"]) {
            propLibs.add(prop.$["library-name"]);
          }
        });
      }

      const root = create({ version: "1.0", encoding: "UTF-8" }).ele("proplibs");
      for (const libName of propLibs) {
        const resourceId = friendlyNameToResourceId(libName);
        const libResource = resourceMap.get(resourceId);

        if (libResource) {
          root.ele("library", {
            name: libName,
            "resource-id": libResource.idLow.toString(16),
            version: libResource.versionLow,
          });
        } else {
          console.warn(`Warning: Library "${libName}" referenced in map "${mapResource.id}" not found.`);
        }
      }

      const propLibsXmlContent = root.end({ prettyPrint: true });
      const destPath = path.join(RESOURCE_BUILD_DIR, mapResource.buildPath, "proplibs.xml");
      await fs.promises.writeFile(destPath, propLibsXmlContent);
      console.log(`Generated proplibs.xml for ${mapResource.id}`);
    } catch (error) {
      console.error(`Failed to process map ${mapResource.id}:`, error);
    }
  }
}

async function generateMapDependenciesFile(resources: ResourceDefinition[]): Promise<void> {
  console.log("Generating mapDependencies.ts...");
  const resourceMap = new Map<string, ResourceDefinition>(resources.map((r) => [r.id, r]));
  const mapResources = resources.filter((r) => r.id.startsWith("map/") && r.id.endsWith("/xml"));

  let content = `// Arquivo gerado automaticamente. Não edite manualmente.\n\n`;
  content += `import { ResourceId } from "./resourceTypes";\n\n`;
  content += `export const mapDependencies: { [key: number]: ResourceId[] } = {\n`;

  for (const mapResource of mapResources) {
    const mapXmlPath = path.join(mapResource.sourcePath, "map.xml");
    if (!fs.existsSync(mapXmlPath)) continue;

    try {
      const mapXmlContent = await fs.promises.readFile(mapXmlPath, "utf8");
      const parsedMap = await parseStringPromise(mapXmlContent);

      const propLibs = new Set<string>();
      if (parsedMap.map && parsedMap.map["static-geometry"] && parsedMap.map["static-geometry"][0] && parsedMap.map["static-geometry"][0].prop) {
        parsedMap.map["static-geometry"][0].prop.forEach((prop: any) => {
          if (prop.$ && prop.$["library-name"]) {
            propLibs.add(prop.$["library-name"]);
          }
        });
      }

      const libResourceIds: string[] = [];
      for (const libName of propLibs) {
        const resourceId = friendlyNameToResourceId(libName);
        if (resourceMap.has(resourceId)) {
          libResourceIds.push(resourceId);
        }
      }

      content += `    ${mapResource.idLow}: [${libResourceIds.map((id) => `"${id}"`).join(", ")}],\n`;
    } catch (error) {
      console.error(`Failed to generate dependencies for map ${mapResource.id}:`, error);
    }
  }

  content += `};\n`;

  await fs.promises.writeFile(path.join(TYPES_DIR, "mapDependencies.ts"), content);
  console.log("Generated mapDependencies.ts successfully.");
}

async function processAndExtractSpawnPoints(mapResources: ResourceDefinition[]): Promise<void> {
  console.log("Processing map spawn points...");

  const allSpawns: { [key: string]: ISpawnPoint[] } = {};

  for (const mapResource of mapResources) {
    const destXmlPath = path.join(RESOURCE_BUILD_DIR, mapResource.buildPath, "map.xml");
    if (!fs.existsSync(destXmlPath)) continue;

    try {
      const mapXmlContent = await fs.promises.readFile(destXmlPath, "utf8");
      const parsedMap = await parseStringPromise(mapXmlContent);

      const spawnPointsNode = parsedMap.map?.["spawn-points"]?.[0]?.["spawn-point"];
      if (!spawnPointsNode) {
        continue;
      }

      const extractedSpawns: ISpawnPoint[] = spawnPointsNode.map((spData: any) => {
        const pos = spData.position[0];
        const rot = spData.rotation[0];
        return {
          type: spData.$.type,
          position: {
            x: parseFloat(pos.x?.[0] ?? "0"),
            y: parseFloat(pos.y?.[0] ?? "0"),
            z: parseFloat(pos.z?.[0] ?? "0"),
          },
          rotation: {
            x: parseFloat(rot.x?.[0] ?? "0"),
            y: parseFloat(rot.y?.[0] ?? "0"),
            z: parseFloat(rot.z?.[0] ?? "0"),
          },
        };
      });

      allSpawns[mapResource.id] = extractedSpawns;
      console.log(`Extracted ${extractedSpawns.length} spawn points for ${mapResource.id}`);

      delete parsedMap.map["spawn-points"];

      const newXmlString = create(parsedMap).end({ prettyPrint: true });
      await fs.promises.writeFile(destXmlPath, newXmlString);
    } catch (error) {
      console.error(`Failed to process spawn points for map ${mapResource.id}:`, error);
    }
  }

  let content = `// Arquivo gerado automaticamente. Não edite manualmente.\n\n`;
  content += `interface IVector3 { x: number; y: number; z: number; }\n`;
  content += `interface ISpawnPoint { type: string; position: IVector3; rotation: IVector3; }\n\n`;
  content += `export const mapSpawns: { [key: string]: ISpawnPoint[] } = ${JSON.stringify(allSpawns, null, 4)};\n`;

  await fs.promises.writeFile(path.join(TYPES_DIR, "mapSpawns.ts"), content);
  console.log("Generated mapSpawns.ts successfully.");
}

async function processAndExtractSpecialGeometries(mapResources: ResourceDefinition[]): Promise<void> {
  console.log("Processing map special geometries...");

  const allGeometries: { [key: string]: ISpecialBox[] } = {};

  for (const mapResource of mapResources) {
    const destXmlPath = path.join(RESOURCE_BUILD_DIR, mapResource.buildPath, "map.xml");
    if (!fs.existsSync(destXmlPath)) continue;

    try {
      const mapXmlContent = await fs.promises.readFile(destXmlPath, "utf8");
      const parsedMap = await parseStringPromise(mapXmlContent);

      const geometryNode = parsedMap.map?.["special-geometry"]?.[0]?.["special-box"];
      if (!geometryNode) {
        continue;
      }

      const extractedGeometries: ISpecialBox[] = geometryNode.map((boxData: any) => ({
        minX: parseFloat(boxData.minX[0]),
        minY: parseFloat(boxData.minY[0]),
        minZ: parseFloat(boxData.minZ[0]),
        maxX: parseFloat(boxData.maxX[0]),
        maxY: parseFloat(boxData.maxY[0]),
        maxZ: parseFloat(boxData.maxZ[0]),
        action: boxData.action[0],
      }));

      allGeometries[mapResource.id] = extractedGeometries;
      console.log(`Extracted ${extractedGeometries.length} special geometry boxes for ${mapResource.id}`);

      delete parsedMap.map["special-geometry"];

      const newXmlString = create(parsedMap).end({ prettyPrint: true });
      await fs.promises.writeFile(destXmlPath, newXmlString);
    } catch (error) {
      console.error(`Failed to process special geometries for map ${mapResource.id}:`, error);
    }
  }

  let content = `// Arquivo gerado automaticamente. Não edite manualmente.\n\n`;
  content += `export interface ISpecialBox { minX: number; minY: number; minZ: number; maxX: number; maxY: number; maxZ: number; action: 'kill' | 'kick'; }\n\n`;
  content += `export const mapGeometries: { [key: string]: ISpecialBox[] } = ${JSON.stringify(allGeometries, null, 4)};\n`;

  await fs.promises.writeFile(path.join(TYPES_DIR, "mapGeometries.ts"), content);
  console.log("Generated mapGeometries.ts successfully.");
}

async function processAndExtractCtfFlags(mapResources: ResourceDefinition[]): Promise<void> {
  console.log("Processing CTF flags positions...");

  const allFlags: { [key: string]: ICtfFlags } = {};

  for (const mapResource of mapResources) {
    const destXmlPath = path.join(RESOURCE_BUILD_DIR, mapResource.buildPath, "map.xml");
    if (!fs.existsSync(destXmlPath)) continue;

    try {
      const mapXmlContent = await fs.promises.readFile(destXmlPath, "utf8");
      const parsedMap = await parseStringPromise(mapXmlContent);

      const flagsNode = parsedMap.map?.["ctf-flags"]?.[0];
      if (!flagsNode) {
        continue;
      }

      const redFlag = flagsNode["flag-red"]?.[0];
      const blueFlag = flagsNode["flag-blue"]?.[0];

      if (redFlag && blueFlag) {
        allFlags[mapResource.id] = {
          red: { x: parseFloat(redFlag.x[0]), y: parseFloat(redFlag.y[0]), z: parseFloat(redFlag.z[0]) },
          blue: { x: parseFloat(blueFlag.x[0]), y: parseFloat(blueFlag.y[0]), z: parseFloat(blueFlag.z[0]) },
        };
        console.log(`Extracted CTF flag positions for ${mapResource.id}`);
      }

      delete parsedMap.map["ctf-flags"];

      const newXmlString = create(parsedMap).end({ prettyPrint: true });
      await fs.promises.writeFile(destXmlPath, newXmlString);
    } catch (error) {
      console.error(`Failed to process ctf flags for map ${mapResource.id}:`, error);
    }
  }

  let content = `// Arquivo gerado automaticamente. Não edite manualmente.\n\n`;
  content += `interface IVector3 { x: number; y: number; z: number; }\n`;
  content += `interface ICtfFlags { red: IVector3; blue: IVector3; }\n\n`;
  content += `export const mapCtfFlags: { [key: string]: ICtfFlags } = ${JSON.stringify(allFlags, null, 4)};\n`;

  await fs.promises.writeFile(path.join(TYPES_DIR, "mapCtfFlags.ts"), content);
  console.log("Generated mapCtfFlags.ts successfully.");
}

async function validateSkyboxDirectories(resources: ResourceDefinition[]): Promise<void> {
  console.log("Validating skybox directories...");
  const skyboxSourceDir = path.join(RESOURCES_DIR, "skybox");
  if (!fs.existsSync(skyboxSourceDir)) {
    console.log("No skybox directory found, skipping validation.");
    return;
  }

  const mapNames = new Set<string>();
  resources.forEach((res) => {
    if (res.id.startsWith("map/")) {
      const parts = res.id.split("/");
      if (parts.length > 1) {
        mapNames.add(parts[1]);
      }
    }
  });

  const skyboxDirs = await fs.promises.readdir(skyboxSourceDir, { withFileTypes: true });
  for (const dir of skyboxDirs) {
    if (dir.isDirectory() && dir.name !== "default") {
      if (!mapNames.has(dir.name)) {
        console.warn(`Warning: Skybox directory "/skybox/${dir.name}/" does not correspond to any known map.`);
      }
    }
  }
}

async function validateTaraResources(resources: ResourceDefinition[]): Promise<void> {
  console.log("Validating .tara resources...");
  for (const resource of resources) {
    const sourceFiles = await fs.promises.readdir(resource.sourcePath);
    const isImageTara = sourceFiles.includes("image.tara");
    const hasProperties = sourceFiles.includes("properties.json");

    if (isImageTara && !hasProperties) {
      throw new Error(`Resource "${resource.id}" is an image.tara resource but is missing the required "properties.json" file in its source directory: ${resource.sourcePath}`);
    }
  }
}

async function build() {
  console.log("Starting resource build process...");

  await rimraf(RESOURCE_BUILD_DIR);
  await fs.promises.mkdir(RESOURCE_BUILD_DIR, { recursive: true });

  console.log("Discovering resources from 'resources' directory...");
  const resources = await findResources(RESOURCES_DIR);

  const idMap = new Map<number, string>();
  for (const res of resources) {
    if (idMap.has(res.idLow)) {
      throw new Error(`Hash collision detected! Both "${res.id}" and "${idMap.get(res.idLow)}" produce the same ID (${res.idLow}). Please rename one.`);
    }
    idMap.set(res.idLow, res.id);
  }
  console.log(`Found ${resources.length} resources. No collisions detected.`);

  await validateSkyboxDirectories(resources);
  await validateTaraResources(resources);

  console.log("Generating 'resourceTypes.ts'...");
  const typesContent = generateResourceTypesFileContent(resources);
  await fs.promises.writeFile(path.join(TYPES_DIR, "resourceTypes.ts"), typesContent);

  await generateMapDependenciesFile(resources);

  console.log("Copying categorized resource files to '.resource' directory...");
  for (const res of resources) {
    const destPath = path.join(RESOURCE_BUILD_DIR, res.buildPath);
    await fse.copy(res.sourcePath, destPath);
  }

  await generatePropLibsXmls(resources);

  const mapResources = resources.filter((r) => r.id.startsWith("map/") && r.id.endsWith("/xml"));
  await processAndExtractSpawnPoints(mapResources);
  await processAndExtractSpecialGeometries(mapResources);
  await processAndExtractCtfFlags(mapResources);

  await copyRootFiles();
  console.log("Resource build process completed successfully!");
}

build().catch((error) => {
  console.error("Resource build failed:", error);
  process.exit(1);
});