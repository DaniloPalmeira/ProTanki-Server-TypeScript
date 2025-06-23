import fs from "fs";
import path from "path";
import fse from "fs-extra";
import { rimraf } from "rimraf";
import crc32 from "crc-32";
import { ResourcePathUtils } from "../src/utils/ResourcePathUtils";

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

  console.log("Generating 'resourceTypes.d.ts'...");
  const typesContent = generateResourceTypesFileContent(resources);
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
