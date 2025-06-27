import { ResourcePathUtils } from "../src/utils/ResourcePathUtils";

function printHelp() {
  console.log(`
Uso:
  npm run convert-path -- <modo> <valor> [versão]

Modos:
  to-path    Converte um idLow para um caminho de recurso. Requer um número de versão (padrão: 1).
  to-idlow   Converte um caminho de recurso para seu idLow.

Exemplos:
  npm run convert-path -- to-path 12669901
  npm run convert-path -- to-path 12669901 2
  npm run convert-path -- to-idlow /0/301/123/315/1/
`);
}

const args = process.argv.slice(2);

if (args.length < 2) {
  printHelp();
  process.exit(1);
}

const mode = args[0];
const value = args[1];

try {
  switch (mode) {
    case "to-path": {
      const idLow = parseInt(value, 10);
      if (isNaN(idLow)) {
        throw new Error("O idLow fornecido é inválido. Deve ser um número.");
      }
      const versionLow = args[2] ? parseInt(args[2], 10) : 1;
      if (isNaN(versionLow)) {
        throw new Error("A versão fornecida é inválida. Deve ser um número.");
      }
      const path = ResourcePathUtils.getResourcePath({ idLow, versionLow });
      console.log(`\nCaminho para idLow ${idLow} (versão ${versionLow}):\n${path}\n`);
      break;
    }
    case "to-idlow": {
      const { idLow } = ResourcePathUtils.parseResourcePath(value);
      console.log(`\nidLow para o caminho ${value}:\n${idLow}\n`);
      break;
    }
    default:
      console.error(`\nErro: Modo desconhecido "${mode}"`);
      printHelp();
      process.exit(1);
  }
} catch (error: any) {
  console.error(`\nOcorreu um erro: ${error.message}`);
  process.exit(1);
}
