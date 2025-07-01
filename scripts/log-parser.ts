import fs from "fs";
import path from "path";
import readline from "readline";
import { PacketService } from "../src/packets/PacketService";
import logger from "../src/utils/Logger";

logger.transports.forEach((t) => (t.silent = true));

const LOG_FILE_PATH = path.join(__dirname, "packets.log");
const OUTPUT_FILE_PATH = path.join(__dirname, "packets_decoded.log");

async function parseLogFile() {
  console.log(`Iniciando a análise do log: ${LOG_FILE_PATH}`);

  if (!fs.existsSync(LOG_FILE_PATH)) {
    console.error(`Erro: Arquivo de log não encontrado em ${LOG_FILE_PATH}`);
    process.exit(1);
  }

  const packetService = new PacketService();
  const fileStream = fs.createReadStream(LOG_FILE_PATH);
  const writeStream = fs.createWriteStream(OUTPUT_FILE_PATH, { flags: "w" });

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  writeStream.write(`--- Análise de Log de Pacotes - ${new Date().toISOString()} ---\n\n`);

  for await (const line of rl) {
    if (line.trim() === "") continue;

    let outputLine: string;

    try {
      const logEntry = JSON.parse(line);
      const { timestamp } = logEntry;
      const { buffer: hexBuffer, direction, packetID } = logEntry.message;

      if (typeof packetID !== "number" || typeof hexBuffer !== "string") {
        outputLine = `[PULADO] Entrada de log malformada: ${line}`;
      } else {
        const packet = packetService.createPacket(packetID);
        if (packet) {
          const buffer = Buffer.from(hexBuffer, "hex");
          packet.read(buffer);
          outputLine = `[${timestamp}] [${direction.toUpperCase()}] [${packetID}] [${packet.constructor.name}] -> ${packet.toString()}`;
        } else {
          outputLine = `[${timestamp}] [${direction.toUpperCase()}] [${packetID}] [!!! DESCONHECIDO !!!] -> Hex Original: ${hexBuffer}`;
        }
      }
    } catch (e) {
      outputLine = `[ERRO] Falha ao analisar a linha: ${line}`;
    }

    writeStream.write(outputLine + "\n");
  }

  writeStream.end();
  console.log(`Análise de log concluída. Saída salva em: ${OUTPUT_FILE_PATH}`);
}

parseLogFile().catch((error) => {
  console.error("Ocorreu um erro inesperado durante a análise do log:", error);
  process.exit(1);
});
