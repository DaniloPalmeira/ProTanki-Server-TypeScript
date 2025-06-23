// Este é um arquivo placeholder para satisfazer a importação inicial do TypeScript.
// Ele garante que o servidor possa ser analisado sem erros antes do primeiro build,
// definindo a "forma" dos dados que o ResourceManager espera importar.
//
// O conteúdo real será gerado e sobrescrito pelo script `npm run build:resources`.
// Este arquivo é ignorado pelo Git para evitar que o conteúdo gerado seja versionado.

export const ResourceData: Record<string, { idLow: number; path: string; versionLow: number }> = {};

export type ResourceId = keyof typeof ResourceData;
