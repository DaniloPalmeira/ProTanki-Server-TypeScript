import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { rimraf } from "rimraf";
import crc32 from "crc-32";
import { ResourcePathUtils } from "../src/utils/ResourcePathUtils";

const ROOT_DIR = path.join(__dirname, "..");
const RESOURCES_DIR = path.join(ROOT_DIR, "resources");
const RESOURCE_BUILD_DIR = path.join(ROOT_DIR, ".resource");
const CONFIG_DIR = path.join(ROOT_DIR, "src", "config");
const TYPES_DIR = path.join(ROOT_DIR, "src", "types");

interface ResourceDefinition {
  id: string;
  idLow: number;
  versionLow: number;
  sourcePath: string;
  buildPath: string;
}

function generateResourceId(friendlyPath: string): number {
  // Aplica o hash e depois a máscara de 24 bits (0xFFFFFF) para garantir
  // que o número se encaixe na estrutura de 3 bytes do caminho.
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
        .sort((a, b) => b - a);

      if (versionDirs.length > 0) {
        const latestVersion = versionDirs[0];
        const id = relativePath.replace(/\\/g, "/");
        const idLow = generateResourceId(id);
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

function generateIdMap(resources: ResourceDefinition[]): Record<string, number> {
  const map: Record<string, number> = {};
  for (const res of resources) {
    map[res.id] = res.idLow;
  }
  return map;
}

function generateResourcesJson(resources: ResourceDefinition[]): any[] {
  return resources.map((res) => ({ id: res.id, path: res.buildPath }));
}

function generateResourceTypes(resources: ResourceDefinition[]): string {
  const resourceIds = resources.map((res) => res.id);
  const typeContent = `// Arquivo gerado automaticamente. Não edite manualmente.\n\ndeclare const ResourceIds: {\n${resourceIds.map((id) => `    "${id}": "${id}";`).join("\n")}\n};\n\nexport type ResourceId = keyof typeof ResourceIds;\n`;
  return typeContent;
}

async function build() {
  console.log("Starting resource build process...");

  await rimraf(RESOURCE_BUILD_DIR);
  await fs.promises.mkdir(RESOURCE_BUILD_DIR, { recursive: true });

  if (!fs.existsSync(CONFIG_DIR)) {
    await fs.promises.mkdir(CONFIG_DIR, { recursive: true });
  }

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

  console.log("Generating 'resources.json'...");
  const resourcesJson = generateResourcesJson(resources);
  await fs.promises.writeFile(path.join(CONFIG_DIR, "resources.json"), JSON.stringify(resourcesJson, null, 4));

  console.log("Generating 'idMap.json'...");
  const idMapJson = generateIdMap(resources);
  await fs.promises.writeFile(path.join(CONFIG_DIR, "idMap.json"), JSON.stringify(idMapJson, null, 4));

  console.log("Generating 'resourceTypes.d.ts'...");
  const typesContent = generateResourceTypes(resources);
  await fs.promises.writeFile(path.join(TYPES_DIR, "resourceTypes.d.ts"), typesContent);

  console.log("Copying categorized resource files to '.resource' directory...");
  for (const res of resources) {
    const destPath = path.join(RESOURCE_BUILD_DIR, res.buildPath);
    await fse.copy(res.sourcePath, destPath);
  }

  await copyRootFiles();
  console.log("Resource build process completed successfully!");
}

build().catch((error) => {
  console.error("Resource build failed:", error);
  process.exit(1);
});
