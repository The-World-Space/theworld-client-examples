import { Mulberry32 } from "./Mulberry32";

export abstract class BiomePreset {
    public abstract readonly tiles: { i: number, a: number }[];
    public abstract readonly minHeight: number;
    public abstract readonly minMoisture: number;
    public abstract readonly minHeat: number;

    public getTileSprite(mulberry: Mulberry32): { i: number, a: number } {
        const tiles = this.tiles;
        return tiles[Math.floor(mulberry.next() * tiles.length)];
    }

    public matchCondition(height: number, moisture: number, heat: number): boolean {
        return height >= this.minHeight && moisture >= this.minMoisture && heat >= this.minHeat;
    }
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Desert = new class Desert extends BiomePreset {
    public readonly tiles = [
        { i: 0, a: 15 }
    ];
    public readonly minHeight = 0;
    public readonly minMoisture = 0;
    public readonly minHeat = 0.9;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Grassland = new class Grassland extends BiomePreset {
    public readonly tiles = [
        { i: 0, a: 22 }
    ];
    public readonly minHeight = 0.1;
    public readonly minMoisture = 0.2;
    public readonly minHeat = 0.1;
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Mountains = new class Mountains extends BiomePreset {
    public readonly tiles = [
        { i: 0, a: 54 }
    ];
    public readonly minHeight = 0.7;
    public readonly minMoisture = 0;
    public readonly minHeat = 0;
};
