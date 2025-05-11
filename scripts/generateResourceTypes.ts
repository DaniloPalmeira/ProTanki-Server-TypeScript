import fs from "fs";
import path from "path";

const resourcesFile = path.join(__dirname, "../src/config/resources.json");
const outputFile = path.join(__dirname, "../src/types/resourceTypes.d.ts");

try {
  // Lê o resources.json
  const data = fs.readFileSync(resourcesFile, "utf8");
  const resources: { id: string; path: string; type?: number }[] =
    JSON.parse(data);

  // Extrai os IDs
  const resourceIds = resources.map((resource) => resource.id);

  // Gera o conteúdo do arquivo de tipos
  const typeContent = `// Arquivo gerado automaticamente a partir de resources.json\n// Não edite manualmente\n\ndeclare const ResourceIds: {\n${resourceIds
    .map((id) => `  "${id}": "${id}";`)
    .join("\n")}\n};\n\nexport type ResourceId = keyof typeof ResourceIds;\n`;

  // Escreve o arquivo de tipos
  fs.writeFileSync(outputFile, typeContent, "utf8");
  console.log(
    `Generated ${outputFile} with ${resourceIds.length} resource IDs`
  );
} catch (error) {
  console.error("Error generating resource types:", error);
  process.exit(1);
}
