import axios from "axios";
import * as fs from "fs/promises";
import * as path from "path";

// Definindo a interface para os objetos do JSON
interface ResourceItem {
  id: string;
  name: string;
  description: string;
  isInventory: boolean;
  index: number;
  next_price: number;
  next_rank: number;
  type: number;
  baseItemId: number;
  previewResourceId: number;
  rank: number;
  category: string;
  properts: any[];
  discount: {
    percent: number;
    timeLeftInSeconds: number;
    timeToStartInSeconds: number;
  };
  grouped: boolean;
  isForRent: boolean;
  price: number;
  remainingTimeInSec: number;
  coloring?: number;
  modificationID?: number;
  object3ds?: number;
}

// Função fornecida para obter o caminho do recurso
function getResourcePath({ idLow, versionLow }: { idLow: number; versionLow: number }): string {
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

// Base URL
const BASE_URL = "http://146.59.110.103";
const MAX_VERSION_ATTEMPTS = 100; // Limite de tentativas para versionLow

// Função para gerar URLs e caminhos locais
function generateResourceUrlsAndPaths(items: ResourceItem[]): { id: string; baseUrl: string; file: string; localPath: string; idLow: number }[] {
  const resources: { id: string; baseUrl: string; file: string; localPath: string; idLow: number }[] = [];

  items.forEach((item) => {
    const modificationID = item.modificationID ?? 0; // Default para 0 se não definido
    let baseDir = "";

    // Definir diretórios com base na categoria
    if (item.category === "weapon") {
      baseDir = `output/turret/${item.id}/m${modificationID}`;
    } else if (item.category === "armor") {
      baseDir = `output/hull/${item.id}/m${modificationID}`;
    } else if (item.category === "paint") {
      baseDir = `output/paint/${item.id}`;
    }

    // Para previewResourceId (alpha.jpg, image.jpg)
    if (item.previewResourceId) {
      const urlPath = getResourcePath({ idLow: item.previewResourceId, versionLow: 1 });
      const previewDir = path.join(baseDir, "preview/v1");
      resources.push(
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "alpha.jpg",
          localPath: path.join(previewDir, "alpha.jpg"),
          idLow: item.previewResourceId,
        },
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "image.jpg",
          localPath: path.join(previewDir, "image.jpg"),
          idLow: item.previewResourceId,
        }
      );
    }

    // Para object3ds (details.jpg, details_alpha.jpg, images.xml, lightmap.jpg, object.3ds)
    if (item.object3ds && (item.category === "weapon" || item.category === "armor")) {
      const urlPath = getResourcePath({ idLow: item.object3ds, versionLow: 1 });
      const modelDir = path.join(baseDir, "model/v1");
      resources.push(
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "details.jpg",
          localPath: path.join(modelDir, "details.jpg"),
          idLow: item.object3ds,
        },
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "details_alpha.jpg",
          localPath: path.join(modelDir, "details_alpha.jpg"),
          idLow: item.object3ds,
        },
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "images.xml",
          localPath: path.join(modelDir, "images.xml"),
          idLow: item.object3ds,
        },
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "lightmap.jpg",
          localPath: path.join(modelDir, "lightmap.jpg"),
          idLow: item.object3ds,
        },
        {
          id: item.id,
          baseUrl: `${BASE_URL}${urlPath}`,
          file: "object.3ds",
          localPath: path.join(modelDir, "object.3ds"),
          idLow: item.object3ds,
        }
      );
    }

    // Para coloring (image.jpg)
    if (item.coloring && item.category === "paint") {
      const urlPath = getResourcePath({ idLow: item.coloring, versionLow: 1 });
      const textureDir = path.join(baseDir, "texture/v1");
      resources.push({
        id: item.id,
        baseUrl: `${BASE_URL}${urlPath}`,
        file: "image.jpg",
        localPath: path.join(textureDir, "image.jpg"),
        idLow: item.coloring,
      });
    }
  });

  return resources;
}

// Função para baixar e salvar recursos com tentativas de versionLow
async function downloadAndSaveResources(resources: { id: string; baseUrl: string; file: string; localPath: string; idLow: number }[]): Promise<void> {
  for (const { id, baseUrl, file, localPath, idLow } of resources) {
    let versionLow = 1;
    let success = false;
    let attempts = 0;

    while (!success && attempts < MAX_VERSION_ATTEMPTS) {
      const url = baseUrl.replace(/\/1\/$/, `/${versionLow}/`) + file;
      attempts++;

      try {
        console.log(`Tentativa ${attempts} para ${file} de ${id}: ${url}`);
        const response = await axios.get(url, { responseType: "arraybuffer" });

        if (response.status === 200) {
          // Criar diretórios recursivamente
          const dir = path.dirname(localPath);
          await fs.mkdir(dir, { recursive: true });

          // Salvar o arquivo
          await fs.writeFile(localPath, Buffer.from(response.data));
          console.log(`Arquivo ${file} salvo em ${localPath} (versionLow: ${versionLow})`);
          success = true;
        } else {
          throw new Error(`Status ${response.status}`);
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          console.log(`404 para ${url}, tentando versionLow=${versionLow + 1}`);
          versionLow++;
        } else {
          console.error(`Erro ao baixar/salvar ${file} para ${id}: ${url}`, error);
          break;
        }
      }
    }

    if (!success) {
      console.error(`Falha ao baixar ${file} para ${id} após ${attempts} tentativas (último URL: ${baseUrl.replace(/\/1\/$/, `/${versionLow}/`)}${file})`);
    }
  }
}

// Dados do JSON (copiados do input)
const items: ResourceItem[] = [
  {
    id: "green",
    name: "Verde",
    description: "Um tributo à tradição do tanque clássico, esta cor simples, tão amada por designers de todo o mundo, tornou-se uma tinta padrão para modelos de fábrica.",
    isInventory: false,
    index: 1100,
    next_price: 0,
    next_rank: 1,
    type: 3,
    baseItemId: 388967,
    previewResourceId: 388967,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 0,
    remainingTimeInSec: -1,
    coloring: 966681,
  },
  {
    id: "smoky",
    name: "Canhão-fumegante",
    description: "Canhão de tanque de médio calibre que geralmente é usado em tanques leves e de treinamento. A chave para sua popularidade é o baixo preço e a facilidade de manutenção. Coloque-o em um casco leve e use uma estratégia de desgaste contra tanques pesados e desajeitados de seus oponentes. Vários upgrades podem aumentar significativamente o dano causado por este bebezinho. Lembre-se que a eficácia do canhão-fumegante diminui com a distância.",
    isInventory: false,
    index: 100,
    next_price: 7100,
    next_rank: 8,
    type: 1,
    baseItemId: 651066,
    previewResourceId: 651066,
    rank: 1,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "22", subproperties: null },
          { property: "DAMAGE_TO", value: "28", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "175", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "71.5",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_CHANCE",
        value: "8",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_DAMAGE",
        value: "50",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 0,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 205731,
  },
  {
    id: "hunter",
    name: "Caçador",
    description: "Caçador é a carroceria mais versátil do jogo. Graças ao equilíbrio entre placas de armadura de aço reforçadas e baixo consumo de energia, esta armadura é para todos os fins. É boa para todos, de velocistas a atiradores. Sendo tão versátil, você nunca fique sem emprego em um campo de guerra.",
    isInventory: false,
    index: 800,
    next_price: 3200,
    next_rank: 8,
    type: 2,
    baseItemId: 826132,
    previewResourceId: 826132,
    rank: 1,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "144", subproperties: null },
      { property: "HULL_SPEED", value: "8.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "75.8",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1965", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "9.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 0,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 227169,
  },
  {
    id: "holiday",
    name: "Feriado",
    description: "Uma tinta única e «inteligente» que pode mudar sua aparência dependendo da ocasião. Em um dia normal, é simplesmente uma textura quadriculada em preto e branco. Mas quando chega um feriado, sua aparência muda drasticamente.",
    isInventory: false,
    index: 1200,
    next_price: 0,
    next_rank: 1,
    type: 3,
    baseItemId: 971083,
    previewResourceId: 971083,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 0,
    remainingTimeInSec: -1,
    coloring: 423333,
  },
  {
    id: "smoky",
    name: "Canhão-fumegante",
    description: "Canhão de tanque de médio calibre que geralmente é usado em tanques leves e de treinamento. A chave para sua popularidade é o baixo preço e a facilidade de manutenção. Coloque-o em um casco leve e use uma estratégia de desgaste contra tanques pesados e desajeitados de seus oponentes. Vários upgrades podem aumentar significativamente o dano causado por este bebezinho. Lembre-se que a eficácia do canhão-fumegante diminui com a distância.",
    isInventory: false,
    index: 100,
    next_price: 61400,
    next_rank: 15,
    type: 1,
    baseItemId: 651066,
    previewResourceId: 825544,
    rank: 8,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "29", subproperties: null },
          { property: "DAMAGE_TO", value: "37", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "222", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "87.1",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_CHANCE",
        value: "12",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_DAMAGE",
        value: "65",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 7100,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 31170,
  },
  {
    id: "smoky",
    name: "Canhão-fumegante",
    description: "Canhão de tanque de médio calibre que geralmente é usado em tanques leves e de treinamento. A chave para sua popularidade é o baixo preço e a facilidade de manutenção. Coloque-o em um casco leve e use uma estratégia de desgaste contra tanques pesados e desajeitados de seus oponentes. Vários upgrades podem aumentar significativamente o dano causado por este bebezinho. Lembre-se que a eficácia do canhão-fumegante diminui com a distância.",
    isInventory: false,
    index: 100,
    next_price: 166900,
    next_rank: 23,
    type: 1,
    baseItemId: 651066,
    previewResourceId: 592136,
    rank: 15,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "35", subproperties: null },
          { property: "DAMAGE_TO", value: "45", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "269", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "102.6",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_CHANCE",
        value: "15",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_DAMAGE",
        value: "80",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 61400,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 458970,
  },
  {
    id: "smoky",
    name: "Canhão-fumegante",
    description: "Canhão de tanque de médio calibre que geralmente é usado em tanques leves e de treinamento. A chave para sua popularidade é o baixo preço e a facilidade de manutenção. Coloque-o em um casco leve e use uma estratégia de desgaste contra tanques pesados e desajeitados de seus oponentes. Vários upgrades podem aumentar significativamente o dano causado por este bebezinho. Lembre-se que a eficácia do canhão-fumegante diminui com a distância.",
    isInventory: false,
    index: 100,
    next_price: 166900,
    next_rank: 23,
    type: 1,
    baseItemId: 651066,
    previewResourceId: 379077,
    rank: 23,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "44", subproperties: null },
          { property: "DAMAGE_TO", value: "56", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "330", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "122.6",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_CHANCE",
        value: "20",
        subproperties: null,
      },
      {
        property: "CRITICAL_HIT_DAMAGE",
        value: "100",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 166900,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 768112,
  },
  {
    id: "flamethrower",
    name: "Lança-chamas",
    description: "Quando as batalhas acontecem de perto, não há arma melhor do que um pássaro de fogo. Esta é uma arma de aniquilação em massa que pode e vai derreter qualquer tanque e sua tripulação em pouco tempo. É altamente eficaz em espaços confinados contra movimentos lentos Firebird é relativamente lento quando se trata de recarregar, mas você também pode atirar com uma arma parcialmente recarregada.",
    isInventory: false,
    index: 150,
    next_price: 7100,
    next_rank: 8,
    type: 1,
    baseItemId: 43761,
    previewResourceId: 43761,
    rank: 1,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "41",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "12.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "95.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "23.7",
            subproperties: null,
          },
        ],
      },
      {
        property: "FIRE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "FLAME_TEMPERATURE_LIMIT",
            value: "9.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 150,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 521900,
  },
  {
    id: "flamethrower",
    name: "Lança-chamas",
    description: "Quando as batalhas acontecem de perto, não há arma melhor do que um pássaro de fogo. Esta é uma arma de aniquilação em massa que pode e vai derreter qualquer tanque e sua tripulação em pouco tempo. É altamente eficaz em espaços confinados contra movimentos lentos Firebird é relativamente lento quando se trata de recarregar, mas você também pode atirar com uma arma parcialmente recarregada.",
    isInventory: false,
    index: 150,
    next_price: 61400,
    next_rank: 15,
    type: 1,
    baseItemId: 43761,
    previewResourceId: 608063,
    rank: 8,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "50",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "11.39",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "116.9",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "25.6",
            subproperties: null,
          },
        ],
      },
      {
        property: "FIRE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "FLAME_TEMPERATURE_LIMIT",
            value: "15.9",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 7100,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 18283,
  },
  {
    id: "flamethrower",
    name: "Lança-chamas",
    description: "Quando as batalhas acontecem de perto, não há arma melhor do que um pássaro de fogo. Esta é uma arma de aniquilação em massa que pode e vai derreter qualquer tanque e sua tripulação em pouco tempo. É altamente eficaz em espaços confinados contra movimentos lentos Firebird é relativamente lento quando se trata de recarregar, mas você também pode atirar com uma arma parcialmente recarregada.",
    isInventory: false,
    index: 150,
    next_price: 177700,
    next_rank: 23,
    type: 1,
    baseItemId: 43761,
    previewResourceId: 508353,
    rank: 15,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "60",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "10.78",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "138.4",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "27.5",
            subproperties: null,
          },
        ],
      },
      {
        property: "FIRE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "FLAME_TEMPERATURE_LIMIT",
            value: "22.8",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 61400,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 456708,
  },
  {
    id: "flamethrower",
    name: "Lança-chamas",
    description: "Quando as batalhas acontecem de perto, não há arma melhor do que um pássaro de fogo. Esta é uma arma de aniquilação em massa que pode e vai derreter qualquer tanque e sua tripulação em pouco tempo. É altamente eficaz em espaços confinados contra movimentos lentos Firebird é relativamente lento quando se trata de recarregar, mas você também pode atirar com uma arma parcialmente recarregada.",
    isInventory: false,
    index: 150,
    next_price: 177700,
    next_rank: 23,
    type: 1,
    baseItemId: 43761,
    previewResourceId: 553103,
    rank: 23,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "72",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "10.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "166.2",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "30",
            subproperties: null,
          },
        ],
      },
      {
        property: "FIRE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "FLAME_TEMPERATURE_LIMIT",
            value: "31.2",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 177700,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 758687,
  },
  {
    id: "twins",
    name: "Gêmeos",
    description: "Esta arma de plasma de dois canos de disparo rápido derreterá o inimigo em segundos. Levando em conta o fato de que, ao atingir outros tanques com Twins, você derruba a mira, a arma é ideal quando se trata de tiroteio dinâmico a distâncias médias.",
    isInventory: false,
    index: 200,
    next_price: 12350,
    next_rank: 9,
    type: 1,
    baseItemId: 103660,
    previewResourceId: 103660,
    rank: 2,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_FROM",
            value: "8.8",
            subproperties: null,
          },
          { property: "DAMAGE_TO", value: "10.5", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "97", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "89.6",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "60.7",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_MIN_DAMAGE_PERCENT",
        value: "5.8",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 350,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 495014,
  },
  {
    id: "twins",
    name: "Gêmeos",
    description: "Esta arma de plasma de dois canos de disparo rápido derreterá o inimigo em segundos. Levando em conta o fato de que, ao atingir outros tanques com Twins, você derruba a mira, a arma é ideal quando se trata de tiroteio dinâmico a distâncias médias.",
    isInventory: false,
    index: 200,
    next_price: 70300,
    next_rank: 16,
    type: 1,
    baseItemId: 103660,
    previewResourceId: 686147,
    rank: 9,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_FROM",
            value: "11.4",
            subproperties: null,
          },
          { property: "DAMAGE_TO", value: "13.9", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "117", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "103.9",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "65.2",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_MIN_DAMAGE_PERCENT",
        value: "10.3",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 12350,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 132033,
  },
  {
    id: "twins",
    name: "Gêmeos",
    description: "Esta arma de plasma de dois canos de disparo rápido derreterá o inimigo em segundos. Levando em conta o fato de que, ao atingir outros tanques com Twins, você derruba a mira, a arma é ideal quando se trata de tiroteio dinâmico a distâncias médias.",
    isInventory: false,
    index: 200,
    next_price: 188500,
    next_rank: 24,
    type: 1,
    baseItemId: 103660,
    previewResourceId: 595904,
    rank: 16,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "14", subproperties: null },
          { property: "DAMAGE_TO", value: "17.2", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "137", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "118.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "69.8",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_MIN_DAMAGE_PERCENT",
        value: "14.8",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 70300,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 875465,
  },
  {
    id: "twins",
    name: "Gêmeos",
    description: "Esta arma de plasma de dois canos de disparo rápido derreterá o inimigo em segundos. Levando em conta o fato de que, ao atingir outros tanques com Twins, você derruba a mira, a arma é ideal quando se trata de tiroteio dinâmico a distâncias médias.",
    isInventory: false,
    index: 200,
    next_price: 188500,
    next_rank: 24,
    type: 1,
    baseItemId: 103660,
    previewResourceId: 705554,
    rank: 24,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "17", subproperties: null },
          { property: "DAMAGE_TO", value: "21", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "160", subproperties: null },
      {
        property: "TURRET_TURN_SPEED",
        value: "134.7",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "75",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_MIN_DAMAGE_PERCENT",
        value: "20",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 188500,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 499715,
  },
  {
    id: "railgun",
    name: "Canhão-elétrico",
    description:
      "Se armas de calibre médio não são suficientes para sua auto-expressão, esta arma é certa para você. Arma de grande calibre com enorme velocidade de boca e projéteis usando urânio empobrecido. Projéteis cinéticos extremamente poderosos e precisos podem atravessar o tanque do inimigo ou acerte vários alvos na linha de fogo com um único tiro. Uma escolha ideal para guerra de trincheiras de longo alcance e sniping. Lembre-se de que leva muito tempo para recarregar a arma e garantir que seus oponentes não tirem vantagem disso.",
    isInventory: false,
    index: 250,
    next_price: 17600,
    next_rank: 10,
    type: 1,
    baseItemId: 882259,
    previewResourceId: 882259,
    rank: 3,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "68", subproperties: null },
          { property: "DAMAGE_TO", value: "106", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "369", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "5.85",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "56.2",
        subproperties: null,
      },
      {
        property: "WEAPON_WEAKENING_COEFF",
        value: "35.36",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 800,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 906685,
  },
  {
    id: "railgun",
    name: "Canhão-elétrico",
    description:
      "Se armas de calibre médio não são suficientes para sua auto-expressão, esta arma é certa para você. Arma de grande calibre com enorme velocidade de boca e projéteis usando urânio empobrecido. Projéteis cinéticos extremamente poderosos e precisos podem atravessar o tanque do inimigo ou acerte vários alvos na linha de fogo com um único tiro. Uma escolha ideal para guerra de trincheiras de longo alcance e sniping. Lembre-se de que leva muito tempo para recarregar a arma e garantir que seus oponentes não tirem vantagem disso.",
    isInventory: false,
    index: 250,
    next_price: 79200,
    next_rank: 17,
    type: 1,
    baseItemId: 882259,
    previewResourceId: 603365,
    rank: 10,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "90", subproperties: null },
          { property: "DAMAGE_TO", value: "137", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "479", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "5.38",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "70",
        subproperties: null,
      },
      {
        property: "WEAPON_WEAKENING_COEFF",
        value: "56.90",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 17600,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 369990,
  },
  {
    id: "railgun",
    name: "Canhão-elétrico",
    description:
      "Se armas de calibre médio não são suficientes para sua auto-expressão, esta arma é certa para você. Arma de grande calibre com enorme velocidade de boca e projéteis usando urânio empobrecido. Projéteis cinéticos extremamente poderosos e precisos podem atravessar o tanque do inimigo ou acerte vários alvos na linha de fogo com um único tiro. Uma escolha ideal para guerra de trincheiras de longo alcance e sniping. Lembre-se de que leva muito tempo para recarregar a arma e garantir que seus oponentes não tirem vantagem disso.",
    isInventory: false,
    index: 250,
    next_price: 199300,
    next_rank: 25,
    type: 1,
    baseItemId: 882259,
    previewResourceId: 762220,
    rank: 17,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_FROM",
            value: "111",
            subproperties: null,
          },
          { property: "DAMAGE_TO", value: "168", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "589", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "4.91",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "78.5",
        subproperties: null,
      },
      {
        property: "WEAPON_WEAKENING_COEFF",
        value: "78.45",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 79200,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 73852,
  },
  {
    id: "railgun",
    name: "Canhão-elétrico",
    description:
      "Se armas de calibre médio não são suficientes para sua auto-expressão, esta arma é certa para você. Arma de grande calibre com enorme velocidade de boca e projéteis usando urânio empobrecido. Projéteis cinéticos extremamente poderosos e precisos podem atravessar o tanque do inimigo ou acerte vários alvos na linha de fogo com um único tiro. Uma escolha ideal para guerra de trincheiras de longo alcance e sniping. Lembre-se de que leva muito tempo para recarregar a arma e garantir que seus oponentes não tirem vantagem disso.",
    isInventory: false,
    index: 250,
    next_price: 199300,
    next_rank: 25,
    type: 1,
    baseItemId: 882259,
    previewResourceId: 387778,
    rank: 25,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_FROM",
            value: "133",
            subproperties: null,
          },
          { property: "DAMAGE_TO", value: "199", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "700", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "4.44",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "97.4",
        subproperties: null,
      },
      {
        property: "WEAPON_WEAKENING_COEFF",
        value: "100.00",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 199300,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 839339,
  },
  {
    id: "isida",
    name: "Isida",
    description:
      "A ideia desta arma única surgiu nos tempos da guerra fria, mas só ganhou vida com o desenvolvimento da física quântica e das nanotecnologias. O coração desta máquina-maravilha é gerador de nanorrobôs capazes de reproduzir ou destruir a estrutura de qualquer material não biológico. A arma é equipada com emissor de impulso que permite transportar nanomassa no canal magnético a uma distância de cerca de vinte metros. Material molecular, derivado quando nanorrobôs estão funcionando no modo de destruição de alvos, é usado para fixar o próprio chassi do atirador . Assim, Isida causa dano a inimigos e cura aliados, o que a torna inestimável em batalhas de equipe.",
    isInventory: false,
    index: 300,
    next_price: 22850,
    next_rank: 11,
    type: 1,
    baseItemId: 896849,
    previewResourceId: 896849,
    rank: 4,
    category: "weapon",
    properts: [
      {
        property: "ISIS_HEALING_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "ISIS_HEALING_PER_PERIOD",
            value: "20",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "40",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_SELF_HEALING_PERCENT",
        value: "35.97",
        subproperties: null,
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "11.11",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "91.7",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1250,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 638066,
  },
  {
    id: "isida",
    name: "Isida",
    description:
      "A ideia desta arma única surgiu nos tempos da guerra fria, mas só ganhou vida com o desenvolvimento da física quântica e das nanotecnologias. O coração desta máquina-maravilha é gerador de nanorrobôs capazes de reproduzir ou destruir a estrutura de qualquer material não biológico. A arma é equipada com emissor de impulso que permite transportar nanomassa no canal magnético a uma distância de cerca de vinte metros. Material molecular, derivado quando nanorrobôs estão funcionando no modo de destruição de alvos, é usado para fixar o próprio chassi do atirador . Assim, Isida causa dano a inimigos e cura aliados, o que a torna inestimável em batalhas de equipe.",
    isInventory: false,
    index: 300,
    next_price: 88100,
    next_rank: 18,
    type: 1,
    baseItemId: 896849,
    previewResourceId: 216993,
    rank: 11,
    category: "weapon",
    properts: [
      {
        property: "ISIS_HEALING_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "ISIS_HEALING_PER_PERIOD",
            value: "25",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "50",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_SELF_HEALING_PERCENT",
        value: "40.88",
        subproperties: null,
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "10.37",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "106.7",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 22850,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 332851,
  },
  {
    id: "isida",
    name: "Isida",
    description:
      "A ideia desta arma única surgiu nos tempos da guerra fria, mas só ganhou vida com o desenvolvimento da física quântica e das nanotecnologias. O coração desta máquina-maravilha é gerador de nanorrobôs capazes de reproduzir ou destruir a estrutura de qualquer material não biológico. A arma é equipada com emissor de impulso que permite transportar nanomassa no canal magnético a uma distância de cerca de vinte metros. Material molecular, derivado quando nanorrobôs estão funcionando no modo de destruição de alvos, é usado para fixar o próprio chassi do atirador . Assim, Isida causa dano a inimigos e cura aliados, o que a torna inestimável em batalhas de equipe.",
    isInventory: false,
    index: 300,
    next_price: 221000,
    next_rank: 26,
    type: 1,
    baseItemId: 896849,
    previewResourceId: 807842,
    rank: 18,
    category: "weapon",
    properts: [
      {
        property: "ISIS_HEALING_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "ISIS_HEALING_PER_PERIOD",
            value: "31",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "61",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_SELF_HEALING_PERCENT",
        value: "45.79",
        subproperties: null,
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "9.63",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "121.8",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 88100,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 77397,
  },
  {
    id: "isida",
    name: "Isida",
    description:
      "A ideia desta arma única surgiu nos tempos da guerra fria, mas só ganhou vida com o desenvolvimento da física quântica e das nanotecnologias. O coração desta máquina-maravilha é gerador de nanorrobôs capazes de reproduzir ou destruir a estrutura de qualquer material não biológico. A arma é equipada com emissor de impulso que permite transportar nanomassa no canal magnético a uma distância de cerca de vinte metros. Material molecular, derivado quando nanorrobôs estão funcionando no modo de destruição de alvos, é usado para fixar o próprio chassi do atirador . Assim, Isida causa dano a inimigos e cura aliados, o que a torna inestimável em batalhas de equipe.",
    isInventory: false,
    index: 300,
    next_price: 221000,
    next_rank: 26,
    type: 1,
    baseItemId: 896849,
    previewResourceId: 677721,
    rank: 26,
    category: "weapon",
    properts: [
      {
        property: "ISIS_HEALING_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "ISIS_HEALING_PER_PERIOD",
            value: "35",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "70",
            subproperties: null,
          },
        ],
      },
      {
        property: "ISIS_SELF_HEALING_PERCENT",
        value: "50.00",
        subproperties: null,
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "9.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "134.7",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 221000,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 999935,
  },
  {
    id: "thunder",
    name: "Trovão",
    description: "sta arma de calibre médio de segunda geração é a melhor escolha para batalhas dinâmicas. Dano de respingo (certifique-se de não se acertar!) permite que você ataque um grupo de veículos inimigos. Recarga rápida lhe dará uma vantagem distinta sobre tanques pesados do inimigo. Equipado com armadura leve, o trovão é uma das armas mais perigosas no campo de batalha.",
    isInventory: false,
    index: 350,
    next_price: 28100,
    next_rank: 12,
    type: 1,
    baseItemId: 205433,
    previewResourceId: 205433,
    rank: 5,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "42", subproperties: null },
          { property: "DAMAGE_TO", value: "68", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "169", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "3.15",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "77",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "56.9",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1450,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 503709,
  },
  {
    id: "thunder",
    name: "Trovão",
    description: "sta arma de calibre médio de segunda geração é a melhor escolha para batalhas dinâmicas. Dano de respingo (certifique-se de não se acertar!) permite que você ataque um grupo de veículos inimigos. Recarga rápida lhe dará uma vantagem distinta sobre tanques pesados do inimigo. Equipado com armadura leve, o trovão é uma das armas mais perigosas no campo de batalha.",
    isInventory: false,
    index: 350,
    next_price: 97000,
    next_rank: 19,
    type: 1,
    baseItemId: 205433,
    previewResourceId: 282433,
    rank: 12,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "55", subproperties: null },
          { property: "DAMAGE_TO", value: "83", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "217", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "2.91",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "94.6",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "61.8",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 28100,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 15411,
  },
  {
    id: "thunder",
    name: "Trovão",
    description: "sta arma de calibre médio de segunda geração é a melhor escolha para batalhas dinâmicas. Dano de respingo (certifique-se de não se acertar!) permite que você ataque um grupo de veículos inimigos. Recarga rápida lhe dará uma vantagem distinta sobre tanques pesados do inimigo. Equipado com armadura leve, o trovão é uma das armas mais perigosas no campo de batalha.",
    isInventory: false,
    index: 350,
    next_price: 242500,
    next_rank: 27,
    type: 1,
    baseItemId: 205433,
    previewResourceId: 770995,
    rank: 19,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "68", subproperties: null },
          { property: "DAMAGE_TO", value: "99", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "265", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "2.67",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "112.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "66.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 97000,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 104552,
  },
  {
    id: "thunder",
    name: "Trovão",
    description: "sta arma de calibre médio de segunda geração é a melhor escolha para batalhas dinâmicas. Dano de respingo (certifique-se de não se acertar!) permite que você ataque um grupo de veículos inimigos. Recarga rápida lhe dará uma vantagem distinta sobre tanques pesados do inimigo. Equipado com armadura leve, o trovão é uma das armas mais perigosas no campo de batalha.",
    isInventory: false,
    index: 350,
    next_price: 242500,
    next_rank: 27,
    type: 1,
    baseItemId: 205433,
    previewResourceId: 875152,
    rank: 27,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "78", subproperties: null },
          { property: "DAMAGE_TO", value: "110", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "300", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "2.50",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "124.9",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "70",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 242500,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 551825,
  },
  {
    id: "shotgun",
    name: "Martelo",
    description:
      'A equipe por trás do desenvolvimento desta torreta anti-tanque, realmente penso fora da caixa. Em vez de usar armadura-perfurando escudos regulares, esta torreta dispara estilhaços, carregados com pentes de tungstênio. Estes são carregador para dentro da torreta usando um sistema de carregamento cilíndrico robótico. O resultado é uma torreta que praticamente martela tanques inimidos. Devido à sua mecânica única, esta é uma torreta que é melhor usada para combates de curto e médio alcance, porque perde o seu "soco" conforme aumenta a distância.',
    isInventory: false,
    index: 400,
    next_price: 17600,
    next_rank: 10,
    type: 1,
    baseItemId: 412745,
    previewResourceId: 412745,
    rank: 3,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "57.5",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "22", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "2.16",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "87.2",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "50.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 800,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 412744,
  },
  {
    id: "shotgun",
    name: "Martelo",
    description:
      'A equipe por trás do desenvolvimento desta torreta anti-tanque, realmente penso fora da caixa. Em vez de usar armadura-perfurando escudos regulares, esta torreta dispara estilhaços, carregados com pentes de tungstênio. Estes são carregador para dentro da torreta usando um sistema de carregamento cilíndrico robótico. O resultado é uma torreta que praticamente martela tanques inimidos. Devido à sua mecânica única, esta é uma torreta que é melhor usada para combates de curto e médio alcance, porque perde o seu "soco" conforme aumenta a distância.',
    isInventory: false,
    index: 400,
    next_price: 79200,
    next_rank: 17,
    type: 1,
    baseItemId: 412745,
    previewResourceId: 412747,
    rank: 10,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "75.6",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "29", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "2.04",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "104",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "55.2",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 17600,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 412746,
  },
  {
    id: "shotgun",
    name: "Martelo",
    description:
      'A equipe por trás do desenvolvimento desta torreta anti-tanque, realmente penso fora da caixa. Em vez de usar armadura-perfurando escudos regulares, esta torreta dispara estilhaços, carregados com pentes de tungstênio. Estes são carregador para dentro da torreta usando um sistema de carregamento cilíndrico robótico. O resultado é uma torreta que praticamente martela tanques inimidos. Devido à sua mecânica única, esta é uma torreta que é melhor usada para combates de curto e médio alcance, porque perde o seu "soco" conforme aumenta a distância.',
    isInventory: false,
    index: 400,
    next_price: 210100,
    next_rank: 25,
    type: 1,
    baseItemId: 412745,
    previewResourceId: 412749,
    rank: 17,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "93.4",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "35", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "1.92",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "120.8",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "60.1",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 79200,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 412748,
  },
  {
    id: "shotgun",
    name: "Martelo",
    description:
      'A equipe por trás do desenvolvimento desta torreta anti-tanque, realmente penso fora da caixa. Em vez de usar armadura-perfurando escudos regulares, esta torreta dispara estilhaços, carregados com pentes de tungstênio. Estes são carregador para dentro da torreta usando um sistema de carregamento cilíndrico robótico. O resultado é uma torreta que praticamente martela tanques inimidos. Devido à sua mecânica única, esta é uma torreta que é melhor usada para combates de curto e médio alcance, porque perde o seu "soco" conforme aumenta a distância.',
    isInventory: false,
    index: 400,
    next_price: 210100,
    next_rank: 25,
    type: 1,
    baseItemId: 412745,
    previewResourceId: 412751,
    rank: 25,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "111.3",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "42", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "1.80",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "137.5",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "65",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 210100,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 412750,
  },
  {
    id: "freeze",
    name: "Lança-gelo",
    description:
      'A ideia do sistema de armas Freeze nasceu em uma aldeia russa desolada. Usando uma velha geladeira quebrada «Sever» e um aspirador de pó «Buran», o inventor local fez o «atirador de gelo». Um engenheiro profissional que estava pescando perto da aldeia notou isso a invenção e a trouxe para o Instituto de Pesquisa Zhukov. Lá, o desajeitado "atirador de gelo" tornou-se a formidável arma de congelamento. Ela inunda o inimigo com a composição química baseada em freon. As vítimas sofrem danos e todos os seus movimentos e processos se tornam mais lentos. Embora um fluxo de fogo pode descongelar o alvo.',
    isInventory: false,
    index: 450,
    next_price: 28100,
    next_rank: 12,
    type: 1,
    baseItemId: 262762,
    previewResourceId: 262762,
    rank: 5,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "51",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "13.48",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "125.1",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "24.8",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1450,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 791739,
  },
  {
    id: "freeze",
    name: "Lança-gelo",
    description:
      'A ideia do sistema de armas Freeze nasceu em uma aldeia russa desolada. Usando uma velha geladeira quebrada «Sever» e um aspirador de pó «Buran», o inventor local fez o «atirador de gelo». Um engenheiro profissional que estava pescando perto da aldeia notou isso a invenção e a trouxe para o Instituto de Pesquisa Zhukov. Lá, o desajeitado "atirador de gelo" tornou-se a formidável arma de congelamento. Ela inunda o inimigo com a composição química baseada em freon. As vítimas sofrem danos e todos os seus movimentos e processos se tornam mais lentos. Embora um fluxo de fogo pode descongelar o alvo.',
    isInventory: false,
    index: 450,
    next_price: 97000,
    next_rank: 19,
    type: 1,
    baseItemId: 262762,
    previewResourceId: 581830,
    rank: 12,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "64",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "12.57",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "151.2",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "26.7",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 28100,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 679592,
  },
  {
    id: "freeze",
    name: "Lança-gelo",
    description:
      'A ideia do sistema de armas Freeze nasceu em uma aldeia russa desolada. Usando uma velha geladeira quebrada «Sever» e um aspirador de pó «Buran», o inventor local fez o «atirador de gelo». Um engenheiro profissional que estava pescando perto da aldeia notou isso a invenção e a trouxe para o Instituto de Pesquisa Zhukov. Lá, o desajeitado "atirador de gelo" tornou-se a formidável arma de congelamento. Ela inunda o inimigo com a composição química baseada em freon. As vítimas sofrem danos e todos os seus movimentos e processos se tornam mais lentos. Embora um fluxo de fogo pode descongelar o alvo.',
    isInventory: false,
    index: 450,
    next_price: 253300,
    next_rank: 27,
    type: 1,
    baseItemId: 262762,
    previewResourceId: 926940,
    rank: 19,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "77",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "11.65",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "177.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "28.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 97000,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 115070,
  },
  {
    id: "freeze",
    name: "Lança-gelo",
    description:
      'A ideia do sistema de armas Freeze nasceu em uma aldeia russa desolada. Usando uma velha geladeira quebrada «Sever» e um aspirador de pó «Buran», o inventor local fez o «atirador de gelo». Um engenheiro profissional que estava pescando perto da aldeia notou isso a invenção e a trouxe para o Instituto de Pesquisa Zhukov. Lá, o desajeitado "atirador de gelo" tornou-se a formidável arma de congelamento. Ela inunda o inimigo com a composição química baseada em freon. As vítimas sofrem danos e todos os seus movimentos e processos se tornam mais lentos. Embora um fluxo de fogo pode descongelar o alvo.',
    isInventory: false,
    index: 450,
    next_price: 253300,
    next_rank: 27,
    type: 1,
    baseItemId: 262762,
    previewResourceId: 918917,
    rank: 27,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "86",
            subproperties: null,
          },
        ],
      },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "11.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "196",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "30",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 253300,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 388185,
  },
  {
    id: "ricochet",
    name: "Ricochete",
    description:
      "A arma de plasma ricochete é um novo projeto secreto de cientistas siberianos. Para produzir esta equipe de armas de 22 profissionais de alta classe, trabalham no bunker subterrâneo há mais de três anos sem permissão para sair na superfície. E eles criaram uma arma única . Ele lança cargas de plasma camufladas com um campo negativo inteligente. Quando tal carga atinge o tanque, ela explode, mas salta de qualquer outra superfície. Então, com Ricochete, você pode aquecer alvos fora do seu alcance de visibilidade. Mas tenha cuidado! Não fique no como uma carga liberada, pois você não pode causar danos a si mesmo.",
    isInventory: false,
    index: 500,
    next_price: 33350,
    next_rank: 13,
    type: 1,
    baseItemId: 86316,
    previewResourceId: 86316,
    rank: 6,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "19", subproperties: null },
          { property: "DAMAGE_TO", value: "23", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "164", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "0.56",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "91.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "67.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1700,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 833050,
  },
  {
    id: "ricochet",
    name: "Ricochete",
    description:
      "A arma de plasma ricochete é um novo projeto secreto de cientistas siberianos. Para produzir esta equipe de armas de 22 profissionais de alta classe, trabalham no bunker subterrâneo há mais de três anos sem permissão para sair na superfície. E eles criaram uma arma única . Ele lança cargas de plasma camufladas com um campo negativo inteligente. Quando tal carga atinge o tanque, ela explode, mas salta de qualquer outra superfície. Então, com Ricochete, você pode aquecer alvos fora do seu alcance de visibilidade. Mas tenha cuidado! Não fique no como uma carga liberada, pois você não pode causar danos a si mesmo.",
    isInventory: false,
    index: 500,
    next_price: 105900,
    next_rank: 20,
    type: 1,
    baseItemId: 86316,
    previewResourceId: 9428,
    rank: 13,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "24", subproperties: null },
          { property: "DAMAGE_TO", value: "29", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "193", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "0.53",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "110.2",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "72.3",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 33350,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 544500,
  },
  {
    id: "ricochet",
    name: "Ricochete",
    description:
      "A arma de plasma ricochete é um novo projeto secreto de cientistas siberianos. Para produzir esta equipe de armas de 22 profissionais de alta classe, trabalham no bunker subterrâneo há mais de três anos sem permissão para sair na superfície. E eles criaram uma arma única . Ele lança cargas de plasma camufladas com um campo negativo inteligente. Quando tal carga atinge o tanque, ela explode, mas salta de qualquer outra superfície. Então, com Ricochete, você pode aquecer alvos fora do seu alcance de visibilidade. Mas tenha cuidado! Não fique no como uma carga liberada, pois você não pode causar danos a si mesmo.",
    isInventory: false,
    index: 500,
    next_price: 264200,
    next_rank: 28,
    type: 1,
    baseItemId: 86316,
    previewResourceId: 67785,
    rank: 20,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "29", subproperties: null },
          { property: "DAMAGE_TO", value: "35", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "223", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "0.49",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "129",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "77.2",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 105900,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 263824,
  },
  {
    id: "ricochet",
    name: "Ricochete",
    description:
      "A arma de plasma ricochete é um novo projeto secreto de cientistas siberianos. Para produzir esta equipe de armas de 22 profissionais de alta classe, trabalham no bunker subterrâneo há mais de três anos sem permissão para sair na superfície. E eles criaram uma arma única . Ele lança cargas de plasma camufladas com um campo negativo inteligente. Quando tal carga atinge o tanque, ela explode, mas salta de qualquer outra superfície. Então, com Ricochete, você pode aquecer alvos fora do seu alcance de visibilidade. Mas tenha cuidado! Não fique no como uma carga liberada, pois você não pode causar danos a si mesmo.",
    isInventory: false,
    index: 500,
    next_price: 264200,
    next_rank: 28,
    type: 1,
    baseItemId: 86316,
    previewResourceId: 9711,
    rank: 28,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "32", subproperties: null },
          { property: "DAMAGE_TO", value: "38", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "240", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "0.47",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "139.8",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "80",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 264200,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 482110,
  },
  {
    id: "machinegun",
    name: "Vulcão",
    description: "Um canhão de disparo rápido, perfeito para combates de médio e longo alcance. Ele tem um sistema de controle exclusivo que impede que o sistema de mira seja derrubado mesmo sob fogo inimigo pesado. Lembre-se de que o disparo prolongado pode causar superaquecimento e danificar seu tanque!",
    isInventory: false,
    index: 550,
    next_price: 22850,
    next_rank: 11,
    type: 1,
    baseItemId: 412753,
    previewResourceId: 412753,
    rank: 4,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "33",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "66", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "4.92",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "86.4",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "149.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1250,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 412752,
  },
  {
    id: "machinegun",
    name: "Vulcão",
    description: "Um canhão de disparo rápido, perfeito para combates de médio e longo alcance. Ele tem um sistema de controle exclusivo que impede que o sistema de mira seja derrubado mesmo sob fogo inimigo pesado. Lembre-se de que o disparo prolongado pode causar superaquecimento e danificar seu tanque!",
    isInventory: false,
    index: 550,
    next_price: 88100,
    next_rank: 18,
    type: 1,
    baseItemId: 412753,
    previewResourceId: 412755,
    rank: 11,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "42",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "95", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "5.65",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "100.3",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "169",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 22850,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 412754,
  },
  {
    id: "machinegun",
    name: "Vulcão",
    description: "Um canhão de disparo rápido, perfeito para combates de médio e longo alcance. Ele tem um sistema de controle exclusivo que impede que o sistema de mira seja derrubado mesmo sob fogo inimigo pesado. Lembre-se de que o disparo prolongado pode causar superaquecimento e danificar seu tanque!",
    isInventory: false,
    index: 550,
    next_price: 231800,
    next_rank: 26,
    type: 1,
    baseItemId: 412753,
    previewResourceId: 412757,
    rank: 18,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "51",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "121", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "6.38",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "114.2",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "188.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 88100,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 412756,
  },
  {
    id: "machinegun",
    name: "Vulcão",
    description: "Um canhão de disparo rápido, perfeito para combates de médio e longo alcance. Ele tem um sistema de controle exclusivo que impede que o sistema de mira seja derrubado mesmo sob fogo inimigo pesado. Lembre-se de que o disparo prolongado pode causar superaquecimento e danificar seu tanque!",
    isInventory: false,
    index: 550,
    next_price: 231800,
    next_rank: 26,
    type: 1,
    baseItemId: 412753,
    previewResourceId: 412759,
    rank: 26,
    category: "weapon",
    properts: [
      {
        property: "DAMAGE_PER_SECOND",
        value: null,
        subproperties: [
          {
            property: "DAMAGE_PER_PERIOD",
            value: "60",
            subproperties: null,
          },
        ],
      },
      { property: "IMPACT_FORCE", value: "139", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "7.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "126",
        subproperties: null,
      },
      {
        property: "SHOT_RANGE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_MIN_DAMAGE_RADIUS",
            value: "205",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 231800,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 412758,
  },
  {
    id: "shaft",
    name: "Shaft",
    description: "A arma Shaft foi projetada por cientistas que deram suas enormes possibilidades. Ela pode fazer café, entregar pizzas, pagar contas, mas sua principal característica é o modo sniper, que permite que você fique um passo à frente de seus oponentes. Tenha uma oportunidade única para lutar a longas e curtas distâncias, pois você pode disparar do Shaft sem usar sua mira de atirador.",
    isInventory: false,
    index: 600,
    next_price: 38600,
    next_rank: 14,
    type: 1,
    baseItemId: 507813,
    previewResourceId: 507813,
    rank: 7,
    category: "weapon",
    properts: [
      {
        property: "AIMING_MODE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "SHAFT_AIMING_MODE_MAX_DAMAGE",
            value: "187",
            subproperties: null,
          },
        ],
      },
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "55", subproperties: null },
          { property: "DAMAGE_TO", value: "68", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "199", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "3.59",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "75",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 1900,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 740019,
  },
  {
    id: "shaft",
    name: "Shaft",
    description: "A arma Shaft foi projetada por cientistas que deram suas enormes possibilidades. Ela pode fazer café, entregar pizzas, pagar contas, mas sua principal característica é o modo sniper, que permite que você fique um passo à frente de seus oponentes. Tenha uma oportunidade única para lutar a longas e curtas distâncias, pois você pode disparar do Shaft sem usar sua mira de atirador.",
    isInventory: false,
    index: 600,
    next_price: 114800,
    next_rank: 21,
    type: 1,
    baseItemId: 507813,
    previewResourceId: 581114,
    rank: 14,
    category: "weapon",
    properts: [
      {
        property: "AIMING_MODE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "SHAFT_AIMING_MODE_MAX_DAMAGE",
            value: "235",
            subproperties: null,
          },
        ],
      },
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "69", subproperties: null },
          { property: "DAMAGE_TO", value: "83", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "253", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "3.35",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "91.1",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 38600,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 431730,
  },
  {
    id: "shaft",
    name: "Shaft",
    description: "A arma Shaft foi projetada por cientistas que deram suas enormes possibilidades. Ela pode fazer café, entregar pizzas, pagar contas, mas sua principal característica é o modo sniper, que permite que você fique um passo à frente de seus oponentes. Tenha uma oportunidade única para lutar a longas e curtas distâncias, pois você pode disparar do Shaft sem usar sua mira de atirador.",
    isInventory: false,
    index: 600,
    next_price: 275000,
    next_rank: 29,
    type: 1,
    baseItemId: 507813,
    previewResourceId: 810956,
    rank: 21,
    category: "weapon",
    properts: [
      {
        property: "AIMING_MODE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "SHAFT_AIMING_MODE_MAX_DAMAGE",
            value: "282",
            subproperties: null,
          },
        ],
      },
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "84", subproperties: null },
          { property: "DAMAGE_TO", value: "99", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "307", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "3.10",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "107.2",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 114800,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 65798,
  },
  {
    id: "shaft",
    name: "Shaft",
    description: "A arma Shaft foi projetada por cientistas que deram suas enormes possibilidades. Ela pode fazer café, entregar pizzas, pagar contas, mas sua principal característica é o modo sniper, que permite que você fique um passo à frente de seus oponentes. Tenha uma oportunidade única para lutar a longas e curtas distâncias, pois você pode disparar do Shaft sem usar sua mira de atirador.",
    isInventory: false,
    index: 600,
    next_price: 275000,
    next_rank: 29,
    type: 1,
    baseItemId: 507813,
    previewResourceId: 772221,
    rank: 29,
    category: "weapon",
    properts: [
      {
        property: "AIMING_MODE_DAMAGE",
        value: null,
        subproperties: [
          {
            property: "SHAFT_AIMING_MODE_MAX_DAMAGE",
            value: "302",
            subproperties: null,
          },
        ],
      },
      {
        property: "DAMAGE",
        value: null,
        subproperties: [
          { property: "DAMAGE_FROM", value: "90", subproperties: null },
          { property: "DAMAGE_TO", value: "106", subproperties: null },
        ],
      },
      { property: "IMPACT_FORCE", value: "330", subproperties: null },
      {
        property: "WEAPON_CHARGE_RATE",
        value: null,
        subproperties: [
          {
            property: "WEAPON_RELOAD_TIME",
            value: "3.00",
            subproperties: null,
          },
        ],
      },
      {
        property: "TURRET_TURN_SPEED",
        value: "114.1",
        subproperties: null,
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 275000,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 933781,
  },
  {
    id: "wasp",
    name: "Vespa",
    description: "Leve, econômico, fácil de operar — Vespa é uma carroceria perfeito para iniciantes. Vespa atualizado pode atingir uma alta velocidade, que em combinação com tamanho pequeno dá liberdade de ação no campo de batalha. Devido ao baixo peso, Vespa pode ser facilmente enrolado pelo tiro de um inimigo.",
    isInventory: false,
    index: 700,
    next_price: 7650,
    next_rank: 9,
    type: 2,
    baseItemId: 629496,
    previewResourceId: 629496,
    rank: 2,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "94", subproperties: null },
      { property: "HULL_SPEED", value: "10.80", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "93.9",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1376", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "9.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 200,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 160287,
  },
  {
    id: "wasp",
    name: "Vespa",
    description: "Leve, econômico, fácil de operar — Vespa é uma carroceria perfeito para iniciantes. Vespa atualizado pode atingir uma alta velocidade, que em combinação com tamanho pequeno dá liberdade de ação no campo de batalha. Devido ao baixo peso, Vespa pode ser facilmente enrolado pelo tiro de um inimigo.",
    isInventory: false,
    index: 700,
    next_price: 62450,
    next_rank: 16,
    type: 2,
    baseItemId: 629496,
    previewResourceId: 265425,
    rank: 9,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "121", subproperties: null },
      { property: "HULL_SPEED", value: "11.50", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "111.7",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1638", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "10.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 7650,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 557817,
  },
  {
    id: "wasp",
    name: "Vespa",
    description: "Leve, econômico, fácil de operar — Vespa é uma carroceria perfeito para iniciantes. Vespa atualizado pode atingir uma alta velocidade, que em combinação com tamanho pequeno dá liberdade de ação no campo de batalha. Devido ao baixo peso, Vespa pode ser facilmente enrolado pelo tiro de um inimigo.",
    isInventory: false,
    index: 700,
    next_price: 172600,
    next_rank: 24,
    type: 2,
    baseItemId: 629496,
    previewResourceId: 67263,
    rank: 16,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "149", subproperties: null },
      { property: "HULL_SPEED", value: "12.20", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "129.6",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1901", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11.7",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 62450,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 653204,
  },
  {
    id: "wasp",
    name: "Vespa",
    description: "Leve, econômico, fácil de operar — Vespa é uma carroceria perfeito para iniciantes. Vespa atualizado pode atingir uma alta velocidade, que em combinação com tamanho pequeno dá liberdade de ação no campo de batalha. Devido ao baixo peso, Vespa pode ser facilmente enrolado pelo tiro de um inimigo.",
    isInventory: false,
    index: 700,
    next_price: 172600,
    next_rank: 24,
    type: 2,
    baseItemId: 629496,
    previewResourceId: 923853,
    rank: 24,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "180", subproperties: null },
      { property: "HULL_SPEED", value: "13.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "150",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2200", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "13",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 172600,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 20647,
  },
  {
    id: "hornet",
    name: "Zangão",
    description: "Esta carrocería compacta utilização de materiais compósitos de última geração, o que o torna leve, rápido e garante alta capacidade de sobrevivência mesmo após um golpe direto. Zangão é perfeito para ataques rápidos.",
    isInventory: false,
    index: 750,
    next_price: 21000,
    next_rank: 12,
    type: 2,
    baseItemId: 209092,
    previewResourceId: 209092,
    rank: 5,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "122", subproperties: null },
      { property: "HULL_SPEED", value: "10.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "90.8",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1616", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "10.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 500,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 916624,
  },
  {
    id: "hornet",
    name: "Zangão",
    description: "Esta carrocería compacta utilização de materiais compósitos de última geração, o que o torna leve, rápido e garante alta capacidade de sobrevivência mesmo após um golpe direto. Zangão é perfeito para ataques rápidos.",
    isInventory: false,
    index: 750,
    next_price: 86600,
    next_rank: 19,
    type: 2,
    baseItemId: 209092,
    previewResourceId: 930953,
    rank: 12,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "154", subproperties: null },
      { property: "HULL_SPEED", value: "10.70", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "105.2",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "1905", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11.7",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 21000,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 682348,
  },
  {
    id: "hornet",
    name: "Zangão",
    description: "Esta carrocería compacta utilização de materiais compósitos de última geração, o que o torna leve, rápido e garante alta capacidade de sobrevivência mesmo após um golpe direto. Zangão é perfeito para ataques rápidos.",
    isInventory: false,
    index: 750,
    next_price: 215500,
    next_rank: 27,
    type: 2,
    baseItemId: 209092,
    previewResourceId: 725125,
    rank: 19,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "187", subproperties: null },
      { property: "HULL_SPEED", value: "11.50", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "119.7",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2194", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "13.1",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 86600,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 46049,
  },
  {
    id: "hornet",
    name: "Zangão",
    description: "Esta carrocería compacta utilização de materiais compósitos de última geração, o que o torna leve, rápido e garante alta capacidade de sobrevivência mesmo após um golpe direto. Zangão é perfeito para ataques rápidos.",
    isInventory: false,
    index: 750,
    next_price: 215500,
    next_rank: 27,
    type: 2,
    baseItemId: 209092,
    previewResourceId: 72507,
    rank: 27,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "210", subproperties: null },
      { property: "HULL_SPEED", value: "12.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "130",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2400", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "14",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 215500,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 907343,
  },
  {
    id: "hunter",
    name: "Caçador",
    description: "Caçador é a carroceria mais versátil do jogo. Graças ao equilíbrio entre placas de armadura de aço reforçadas e baixo consumo de energia, esta armadura é para todos os fins. É boa para todos, de velocistas a atiradores. Sendo tão versátil, você nunca fique sem emprego em um campo de guerra.",
    isInventory: false,
    index: 800,
    next_price: 54400,
    next_rank: 15,
    type: 2,
    baseItemId: 826132,
    previewResourceId: 289133,
    rank: 8,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "187", subproperties: null },
      { property: "HULL_SPEED", value: "8.60", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "95.3",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2280", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 3200,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 377977,
  },
  {
    id: "hunter",
    name: "Caçador",
    description: "Caçador é a carroceria mais versátil do jogo. Graças ao equilíbrio entre placas de armadura de aço reforçadas e baixo consumo de energia, esta armadura é para todos os fins. É boa para todos, de velocistas a atiradores. Sendo tão versátil, você nunca fique sem emprego em um campo de guerra.",
    isInventory: false,
    index: 800,
    next_price: 158300,
    next_rank: 23,
    type: 2,
    baseItemId: 826132,
    previewResourceId: 271579,
    rank: 15,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "230", subproperties: null },
      { property: "HULL_SPEED", value: "9.20", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "114.9",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2595", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "12.3",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 54400,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 271004,
  },
  {
    id: "hunter",
    name: "Caçador",
    description: "Caçador é a carroceria mais versátil do jogo. Graças ao equilíbrio entre placas de armadura de aço reforçadas e baixo consumo de energia, esta armadura é para todos os fins. É boa para todos, de velocistas a atiradores. Sendo tão versátil, você nunca fique sem emprego em um campo de guerra.",
    isInventory: false,
    index: 800,
    next_price: 158300,
    next_rank: 23,
    type: 2,
    baseItemId: 826132,
    previewResourceId: 630759,
    rank: 23,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "285", subproperties: null },
      { property: "HULL_SPEED", value: "10.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "140",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "3000", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "14",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 158300,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 257012,
  },
  {
    id: "dictator",
    name: "Ditador",
    description: "Devido ao sistema de defesa ativo aprimorado e ao uso dos mais novos materiais compostos, esta blindagem absorve efetivamente a energia de um impacto de quase qualquer arma de calibre. Com o Dictator, você pode lutar na linha de frente de qualquer batalha. Sendo um dos cascos mais rápidos e protegidos no jogo, o Ditador é grande, o que o torna um alvo fácil.",
    isInventory: false,
    index: 850,
    next_price: 16550,
    next_rank: 11,
    type: 2,
    baseItemId: 904690,
    previewResourceId: 904690,
    rank: 4,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "188", subproperties: null },
      { property: "HULL_SPEED", value: "7.00", subproperties: null },
      { property: "HULL_TURN_SPEED", value: "89", subproperties: null },
      { property: "HULL_MASS", value: "2410", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "10.9",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 400,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 931026,
  },
  {
    id: "dictator",
    name: "Ditador",
    description: "Devido ao sistema de defesa ativo aprimorado e ao uso dos mais novos materiais compostos, esta blindagem absorve efetivamente a energia de um impacto de quase qualquer arma de calibre. Com o Dictator, você pode lutar na linha de frente de qualquer batalha. Sendo um dos cascos mais rápidos e protegidos no jogo, o Ditador é grande, o que o torna um alvo fácil.",
    isInventory: false,
    index: 850,
    next_price: 78550,
    next_rank: 18,
    type: 2,
    baseItemId: 904690,
    previewResourceId: 486892,
    rank: 11,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "243", subproperties: null },
      { property: "HULL_SPEED", value: "7.30", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "103.3",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2722", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "12.3",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 16550,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 6338,
  },
  {
    id: "dictator",
    name: "Ditador",
    description: "Devido ao sistema de defesa ativo aprimorado e ao uso dos mais novos materiais compostos, esta blindagem absorve efetivamente a energia de um impacto de quase qualquer arma de calibre. Com o Dictator, você pode lutar na linha de frente de qualquer batalha. Sendo um dos cascos mais rápidos e protegidos no jogo, o Ditador é grande, o que o torna um alvo fácil.",
    isInventory: false,
    index: 850,
    next_price: 201200,
    next_rank: 26,
    type: 2,
    baseItemId: 904690,
    previewResourceId: 55428,
    rank: 18,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "298", subproperties: null },
      { property: "HULL_SPEED", value: "7.70", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "117.7",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "3033", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "13.8",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 78550,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 890676,
  },
  {
    id: "dictator",
    name: "Ditador",
    description: "Devido ao sistema de defesa ativo aprimorado e ao uso dos mais novos materiais compostos, esta blindagem absorve efetivamente a energia de um impacto de quase qualquer arma de calibre. Com o Dictator, você pode lutar na linha de frente de qualquer batalha. Sendo um dos cascos mais rápidos e protegidos no jogo, o Ditador é grande, o que o torna um alvo fácil.",
    isInventory: false,
    index: 850,
    next_price: 201200,
    next_rank: 26,
    type: 2,
    baseItemId: 904690,
    previewResourceId: 64819,
    rank: 26,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "345", subproperties: null },
      { property: "HULL_SPEED", value: "8.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "130",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "3300", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "15",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 201200,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 802804,
  },
  {
    id: "viking",
    name: "Viking",
    description: "Esta blindagem incorpora todas as tecnologias militares modernas. A blindagem reforçada e o motor «Tipo 2» fazem do Viking uma das carrocerias mais versáteis. Ataque o inimigo ou cubra seus companheiros de equipe – esta carroceria provará ser bom e confiável em qualquer situação.",
    isInventory: false,
    index: 900,
    next_price: 29900,
    next_rank: 14,
    type: 2,
    baseItemId: 730749,
    previewResourceId: 730749,
    rank: 7,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "195", subproperties: null },
      { property: "HULL_SPEED", value: "7.80", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "80.6",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2235", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11.5",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 700,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 513347,
  },
  {
    id: "viking",
    name: "Viking",
    description: "Esta blindagem incorpora todas as tecnologias militares modernas. A blindagem reforçada e o motor «Tipo 2» fazem do Viking uma das carrocerias mais versáteis. Ataque o inimigo ou cubra seus companheiros de equipe – esta carroceria provará ser bom e confiável em qualquer situação.",
    isInventory: false,
    index: 900,
    next_price: 102700,
    next_rank: 21,
    type: 2,
    baseItemId: 730749,
    previewResourceId: 500013,
    rank: 14,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "244", subproperties: null },
      { property: "HULL_SPEED", value: "8.30", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "92.7",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2550", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "12.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 29900,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 347843,
  },
  {
    id: "viking",
    name: "Viking",
    description: "Esta blindagem incorpora todas as tecnologias militares modernas. A blindagem reforçada e o motor «Tipo 2» fazem do Viking uma das carrocerias mais versáteis. Ataque o inimigo ou cubra seus companheiros de equipe – esta carroceria provará ser bom e confiável em qualquer situação.",
    isInventory: false,
    index: 900,
    next_price: 244200,
    next_rank: 29,
    type: 2,
    baseItemId: 730749,
    previewResourceId: 914016,
    rank: 21,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "294", subproperties: null },
      { property: "HULL_SPEED", value: "8.80", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "104.8",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "2865", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "14.4",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 102700,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 153457,
  },
  {
    id: "viking",
    name: "Viking",
    description: "Esta blindagem incorpora todas as tecnologias militares modernas. A blindagem reforçada e o motor «Tipo 2» fazem do Viking uma das carrocerias mais versáteis. Ataque o inimigo ou cubra seus companheiros de equipe – esta carroceria provará ser bom e confiável em qualquer situação.",
    isInventory: false,
    index: 900,
    next_price: 244200,
    next_rank: 29,
    type: 2,
    baseItemId: 730749,
    previewResourceId: 832320,
    rank: 29,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "315", subproperties: null },
      { property: "HULL_SPEED", value: "9.00", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "110",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "3000", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "15",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 244200,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 937522,
  },
  {
    id: "titan",
    name: "Titã",
    description: "Placas de armadura de liga Titan combinadas com geometria especial tornam esta carroceria altamente eficaz mesmo contra armas de grande calibre. Com o Titan, você pode mergulhar no meio de uma batalha sem qualquer hesitação. Observe que, devido à baixa velocidade, esta carroceria não é adequado para ataques rápidos atrás das linhas inimigas.",
    isInventory: false,
    index: 950,
    next_price: 12100,
    next_rank: 10,
    type: 2,
    baseItemId: 882375,
    previewResourceId: 882375,
    rank: 3,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "224", subproperties: null },
      { property: "HULL_SPEED", value: "5.30", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "55.7",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "3571", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11.7",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 300,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 819540,
  },
  {
    id: "titan",
    name: "Titã",
    description: "Placas de armadura de liga Titan combinadas com geometria especial tornam esta carroceria altamente eficaz mesmo contra armas de grande calibre. Com o Titan, você pode mergulhar no meio de uma batalha sem qualquer hesitação. Observe que, devido à baixa velocidade, esta carroceria não é adequado para ataques rápidos atrás das linhas inimigas.",
    isInventory: false,
    index: 950,
    next_price: 70500,
    next_rank: 17,
    type: 2,
    baseItemId: 882375,
    previewResourceId: 511249,
    rank: 10,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "289", subproperties: null },
      { property: "HULL_SPEED", value: "5.50", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "67.1",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "4047", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "13.1",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 12100,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 385322,
  },
  {
    id: "titan",
    name: "Titã",
    description: "Placas de armadura de liga Titan combinadas com geometria especial tornam esta carroceria altamente eficaz mesmo contra armas de grande calibre. Com o Titan, você pode mergulhar no meio de uma batalha sem qualquer hesitação. Observe que, devido à baixa velocidade, esta carroceria não é adequado para ataques rápidos atrás das linhas inimigas.",
    isInventory: false,
    index: 950,
    next_price: 187000,
    next_rank: 25,
    type: 2,
    baseItemId: 882375,
    previewResourceId: 372034,
    rank: 17,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "355", subproperties: null },
      { property: "HULL_SPEED", value: "5.80", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "78.6",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "4524", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "14.6",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 70500,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 175994,
  },
  {
    id: "titan",
    name: "Titã",
    description: "Placas de armadura de liga Titan combinadas com geometria especial tornam esta carroceria altamente eficaz mesmo contra armas de grande calibre. Com o Titan, você pode mergulhar no meio de uma batalha sem qualquer hesitação. Observe que, devido à baixa velocidade, esta carroceria não é adequado para ataques rápidos atrás das linhas inimigas.",
    isInventory: false,
    index: 950,
    next_price: 187000,
    next_rank: 25,
    type: 2,
    baseItemId: 882375,
    previewResourceId: 185908,
    rank: 25,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "420", subproperties: null },
      { property: "HULL_SPEED", value: "6.00", subproperties: null },
      { property: "HULL_TURN_SPEED", value: "90", subproperties: null },
      { property: "HULL_MASS", value: "5000", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "16",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 187000,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 142350,
  },
  {
    id: "mammoth",
    name: "Mamute",
    description: "Este não é um tanque - é uma fortaleza sobre trilhos. Mamute é o carro-chefe entre outras carrocerias. Extremamente pesado, reforçado com superconcreto este casco é lento, o que não impede o Mamute de lutar com sucesso contra vários tanques inimigos.",
    isInventory: false,
    index: 1000,
    next_price: 25450,
    next_rank: 13,
    type: 2,
    baseItemId: 542698,
    previewResourceId: 542698,
    rank: 6,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "297", subproperties: null },
      { property: "HULL_SPEED", value: "4.40", subproperties: null },
      { property: "HULL_TURN_SPEED", value: "54", subproperties: null },
      { property: "HULL_MASS", value: "4262", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "11.3",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 600,
    remainingTimeInSec: -1,
    modificationID: 0,
    object3ds: 139472,
  },
  {
    id: "mammoth",
    name: "Mamute",
    description: "Este não é um tanque - é uma fortaleza sobre trilhos. Mamute é o carro-chefe entre outras carrocerias. Extremamente pesado, reforçado com superconcreto este casco é lento, o que não impede o Mamute de lutar com sucesso contra vários tanques inimigos.",
    isInventory: false,
    index: 1000,
    next_price: 94650,
    next_rank: 20,
    type: 2,
    baseItemId: 542698,
    previewResourceId: 906451,
    rank: 13,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "376", subproperties: null },
      { property: "HULL_SPEED", value: "4.60", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "64.1",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "4743", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "12.7",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 25450,
    remainingTimeInSec: -1,
    modificationID: 1,
    object3ds: 219122,
  },
  {
    id: "mammoth",
    name: "Mamute",
    description: "Este não é um tanque - é uma fortaleza sobre trilhos. Mamute é o carro-chefe entre outras carrocerias. Extremamente pesado, reforçado com superconcreto este casco é lento, o que não impede o Mamute de lutar com sucesso contra vários tanques inimigos.",
    isInventory: false,
    index: 1000,
    next_price: 229900,
    next_rank: 28,
    type: 2,
    baseItemId: 542698,
    previewResourceId: 905090,
    rank: 20,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "455", subproperties: null },
      { property: "HULL_SPEED", value: "4.90", subproperties: null },
      {
        property: "HULL_TURN_SPEED",
        value: "74.2",
        subproperties: null,
      },
      { property: "HULL_MASS", value: "5225", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "14.2",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 94650,
    remainingTimeInSec: -1,
    modificationID: 2,
    object3ds: 550964,
  },
  {
    id: "mammoth",
    name: "Mamute",
    description: "Este não é um tanque - é uma fortaleza sobre trilhos. Mamute é o carro-chefe entre outras carrocerias. Extremamente pesado, reforçado com superconcreto este casco é lento, o que não impede o Mamute de lutar com sucesso contra vários tanques inimigos.",
    isInventory: false,
    index: 1000,
    next_price: 229900,
    next_rank: 28,
    type: 2,
    baseItemId: 542698,
    previewResourceId: 385917,
    rank: 28,
    category: "armor",
    properts: [
      { property: "HULL_ARMOR", value: "500", subproperties: null },
      { property: "HULL_SPEED", value: "5.00", subproperties: null },
      { property: "HULL_TURN_SPEED", value: "80", subproperties: null },
      { property: "HULL_MASS", value: "5500", subproperties: null },
      {
        property: "HULL_POWER",
        value: null,
        subproperties: [
          {
            property: "HULL_ACCELERATION",
            value: "15",
            subproperties: null,
          },
        ],
      },
    ],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 229900,
    remainingTimeInSec: -1,
    modificationID: 3,
    object3ds: 165165,
  },
  {
    id: "red",
    name: "Vermelha",
    description: "A cor vermelha - a personificação da raiva e da coragem. Também tem a aplicação prática de poder esconder qualquer vestígio de sangue inimigo.",
    isInventory: false,
    index: 2850,
    next_price: 100,
    next_rank: 1,
    type: 3,
    baseItemId: 471061,
    previewResourceId: 471061,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 100,
    remainingTimeInSec: -1,
    coloring: 529101,
  },
  {
    id: "blue",
    name: "Azul",
    description: "Esta pintura foi adicionada à lista oficial em memória de um projeto fracassado - o desenvolvimento de um tanque anfíbio codinome «Catfish». Os designers estavam planejando dar ao <Catfish> a capacidade de se mover sob as águas de rios rasos, permitindo que ele tomar posição atrás das linhas inimigas. A cor azul seria perfeita para camuflagem.",
    isInventory: false,
    index: 2900,
    next_price: 100,
    next_rank: 1,
    type: 3,
    baseItemId: 350240,
    previewResourceId: 350240,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 100,
    remainingTimeInSec: -1,
    coloring: 98644,
  },
  {
    id: "black",
    name: "Preta",
    description: "Esta cor tornou-se o padrão não oficial para a divisão de tanques sabotadores, cuja principal tarefa é penetrar no território inimigo durante a noite. Dentro dos círculos militares, essas divisões de elite foram apelidadas de «Os pontos negros da morte».",
    isInventory: false,
    index: 2950,
    next_price: 100,
    next_rank: 1,
    type: 3,
    baseItemId: 468704,
    previewResourceId: 468704,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 100,
    remainingTimeInSec: -1,
    coloring: 976299,
  },
  {
    id: "white",
    name: "Branca",
    description: "Esta tinta foi desenvolvida especificamente para operações terrestres em países com clima frio. Em áreas com neve, pode reduzir significativamente a probabilidade de detecção. Para aumentar as vendas, alguns fabricantes incluíram na embalagem um casaco quente e botas.",
    isInventory: false,
    index: 3000,
    next_price: 100,
    next_rank: 1,
    type: 3,
    baseItemId: 912977,
    previewResourceId: 912977,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 100,
    remainingTimeInSec: -1,
    coloring: 996274,
  },
  {
    id: "orange",
    name: "Laranja",
    description: "Originalmente, não havia planos para incluir essa cor na lista oficial, pois não tinha nenhum valor prático, exceto talvez uma camuflagem decente em áreas desérticas. No entanto, psicólogos do exército provaram que esse tom específico de laranja tem um efeito terapêutico positivo. em tanques em estado de choque.",
    isInventory: false,
    index: 3050,
    next_price: 100,
    next_rank: 1,
    type: 3,
    baseItemId: 456516,
    previewResourceId: 456516,
    rank: 1,
    category: "paint",
    properts: [],
    discount: {
      percent: 0,
      timeLeftInSeconds: -1751858089,
      timeToStartInSeconds: -1751858089,
    },
    grouped: false,
    isForRent: false,
    price: 100,
    remainingTimeInSec: -1,
    coloring: 104412,
  },
];
// Executando o script
(async () => {
  const resources = generateResourceUrlsAndPaths(items);
  console.log("Recursos a serem baixados:", resources);
  await downloadAndSaveResources(resources);
})();
