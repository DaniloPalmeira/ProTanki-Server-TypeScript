import { PacketService } from "../src/packets/PacketService";
import logger from "../src/utils/Logger";

function printHelp() {
  console.log(`
Uso:
    npm run test:packet -- <packetId> <payloadHex>

Argumentos:
    packetId    O ID numérico do pacote a ser testado.
    payloadHex  A carga de dados do pacote em formato hexadecimal.

Exemplo:
    npm run test:packet -- 705454610 010000000b48656c6c6f576f726c64
`);
}

async function main() {
  logger.transports.forEach((t) => (t.silent = true));

  const args = process.argv.slice(2);

  if (args.length < 2) {
    printHelp();
    process.exit(1);
  }

  const packetIdStr = args[0];
  const payloadHex = args[1];

  const packetId = parseInt(packetIdStr, 10);
  if (isNaN(packetId)) {
    console.error("\nErro: O ID do pacote deve ser um número válido.");
    printHelp();
    process.exit(1);
  }

  let payload: Buffer;
  try {
    payload = Buffer.from(payloadHex, "hex");
  } catch (error) {
    console.error("\nErro: Payload hexadecimal inválido.");
    printHelp();
    process.exit(1);
  }

  try {
    console.log("Inicializando PacketService para carregar as definições de pacotes...");
    const packetService = new PacketService();

    const packetInstance = packetService.createPacket(packetId);

    if (!packetInstance) {
      console.error(`\nErro: Pacote com ID ${packetId} não encontrado.`);
      process.exit(1);
    }

    console.log(`\nPacote encontrado: ${packetInstance.constructor.name}`);
    console.log("Lendo o payload hexadecimal...");

    packetInstance.read(payload);

    console.log("\nResultado do toString() após a leitura:");
    console.log("------------------------------------------");
    console.log(packetInstance.toString());
    console.log("------------------------------------------\n");
  } catch (error: any) {
    console.error(`\nOcorreu um erro ao processar o pacote: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(`\nErro inesperado: ${error.message}`);
  process.exit(1);
});
