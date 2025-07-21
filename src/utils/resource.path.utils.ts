export class ResourcePathUtils {
    public static parseResourcePath(resourcePath: string): { idHigh: number; idLow: number; versionHigh: number; versionLow: number } {
        const parts = resourcePath.replace(/^\/|\/$/g, "").split("/");
        if (parts.length !== 5) {
            throw new Error(`Invalid path format: ${resourcePath}`);
        }

        const part1 = parseInt(parts[0], 8);
        const part2 = parseInt(parts[1], 8);
        const part3 = parseInt(parts[2], 8);
        const part4 = parseInt(parts[3], 8);
        const versionOct = parseInt(parts[4], 8);

        const idLow = (part2 << 16) | (part3 << 8) | part4;

        return { idHigh: part1, idLow, versionHigh: 0, versionLow: versionOct };
    }

    public static getResourcePath({ idLow, versionLow }: { idLow: number; versionLow: number }): string {
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
