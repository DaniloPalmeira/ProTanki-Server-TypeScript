import fs from "fs/promises";
import path from "path";
import axios from "axios";
import { mkdirp } from "mkdirp";

interface MapObject {
  mapId: string;
  preview: number;
  theme: string;
}

class ResourcePathGenerator {
  static getResourcePath({ idLow, versionLow }: { idLow: number; versionLow: number }): string {
    const idHigh = 0;

    const part2 = (idLow >> 16) & 0xff;
    const part3 = (idLow >> 8) & 0xff;
    const part4 = idLow & 0xff;

    const part1Str = idHigh.toString(8);
    const part2Str = part2.toString(8);
    const part3Str = part3.toString(8);
    const part4Str = part4.toString(8);
    const versionStr = versionLow.toString(8);

    return `/${part1Str}/${part2Str}/${part3Str}/${part4Str}/${versionStr}/`;
  }
}

async function processMaps(jsonFilePath: string, outputBaseDir: string) {
  try {
    const jsonContent = await fs.readFile(jsonFilePath, "utf-8");
    const maps: MapObject[] = JSON.parse(jsonContent);

    // Define um limite de segurança para evitar loops infinitos
    const MAX_VERSIONS_TO_CHECK = 100;

    for (const map of maps) {
      const mapName = map.mapId.replace("map_", "");
      const theme = map.theme;
      const idLow = map.preview;

      let versionLow = 1;
      // Flag para controlar a lógica de busca
      let foundFirstImage = false;

      while (versionLow <= MAX_VERSIONS_TO_CHECK) {
        const resourcePath = ResourcePathGenerator.getResourcePath({ idLow, versionLow });
        const imageUrl = `http://146.59.110.103${resourcePath}image.jpg`;
        const outputDir = path.join(outputBaseDir, mapName, theme.toLowerCase(), "preview", `v${versionLow}`);

        try {
          const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

          // Se chegamos aqui, a imagem existe (status 200)
          if (!foundFirstImage) {
            // Limpa a linha de "Procurando..." do console
            process.stdout.write("\r" + " ".repeat(80) + "\r");
            console.log(`Primeira imagem encontrada para ${map.mapId} na versão v${versionLow}.`);
            foundFirstImage = true; // A partir de agora, um 404 significa que as versões acabaram
          }

          await mkdirp(outputDir);
          const outputFilePath = path.join(outputDir, "image.jpg");
          await fs.writeFile(outputFilePath, Buffer.from(response.data));
          console.log(`   -> Imagem salva com sucesso: ${outputFilePath}`);

          versionLow++; // Prepara para buscar a próxima versão
        } catch (error: any) {
          if (error.response?.status === 404) {
            if (foundFirstImage) {
              // Já tínhamos encontrado imagens, então um 404 agora significa o fim da sequência.
              console.log(`Fim das versões para ${map.mapId}. Parando busca neste mapa.`);
              break; // Sai do loop 'while' e vai para o próximo mapa
            } else {
              // Ainda não encontramos a primeira imagem, então continuamos procurando.
              // Log no console sem quebrar a linha para uma experiência mais limpa
              process.stdout.write(`\rProcurando primeira imagem para ${map.mapId}... Tentando v${versionLow}`);
              versionLow++; // Tenta a próxima versão
            }
          } else {
            // Se o erro não for 404, é algo inesperado.
            process.stdout.write("\r" + " ".repeat(80) + "\r");
            console.error(`\nErro inesperado ao baixar ${map.mapId} (v${versionLow}): ${error.message}. Parando busca neste mapa.`);
            break; // Sai do loop 'while' por segurança
          }
        }
      }

      if (!foundFirstImage) {
        process.stdout.write("\r" + " ".repeat(80) + "\r");
        console.log(`Nenhuma imagem encontrada para ${map.mapId} após ${MAX_VERSIONS_TO_CHECK} tentativas.`);
      }
      console.log("-".repeat(50)); // Separador para clareza
    }
  } catch (error: any) {
    console.error("Erro fatal ao processar o arquivo JSON:", error.message);
  }
}

// Exemplo de uso
const jsonFilePath = "./maps.json";
const outputBaseDir = "./output";
processMaps(jsonFilePath, outputBaseDir);
