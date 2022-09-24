import { Immutable } from "src/plugin/types/Immutable";

import { Vector2 } from "../math/Vector2";
import { BiomePreset, Desert, Grassland, Mountains } from "./BiomePreset";
import { ITilemapRenderer } from "./ITilemapRenderer";
import { Mulberry32 } from "./Mulberry32";
import { NoiseGenerator, Wave } from "./NoiseGenerator";

export class BiomeTempData {
    public readonly biome: BiomePreset;

    public constructor(preset: BiomePreset) {
        this.biome = preset;
    }

    public getDiffValue(height: number, moisture: number, heat: number): number {
        const biome = this.biome;
        return (height - biome.minHeight) + (moisture - biome.minMoisture) + (heat - biome.minHeat);
    }
}

export class ProceduralMapGenerator {
    public tilemap: ITilemapRenderer;

    public biomes: BiomePreset[] = [
        Desert,
        Grassland,
        Mountains
    ];
    
    public scale = 1.0;

    public heightWaves: Wave[] = [
        new Wave(56, 0.05, 1),
        new Wave(199.36, 0.1, 0.5)
    ];

    public moistureWaves: Wave[] = [
        new Wave(621, 0.03, 1)
    ];

    public heatWaves: Wave[] = [
        new Wave(318.6, 0.04, 1),
        new Wave(329.7, 0.02, 0.5)
    ];

    private readonly _mulberry = new Mulberry32(0);

    public constructor(renderer: ITilemapRenderer) {
        this.tilemap = renderer;
    }

    public generateMap(width: number, height: number, offset: Immutable<Vector2>): void {
        const heightMap = NoiseGenerator.generate(width, height, this.scale, this.heightWaves, offset);
        const moistureMap = NoiseGenerator.generate(width, height, this.scale, this.moistureWaves, offset);
        const heatMap = NoiseGenerator.generate(width, height, this.scale, this.heatWaves, offset);

        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                const height = heightMap[x][y];
                const moisture = moistureMap[x][y];
                const heat = heatMap[x][y];

                const tile = this.getBiome(height, moisture, heat).getTileSprite(this._mulberry);
                this.tilemap!.setTile(x + offset.x, y + offset.y, tile.i, tile.a, false);
            }
        }
    }

    private getBiome(height: number, moisture: number, heat: number): BiomePreset {
        const biomeTemp: BiomeTempData[] = [];
        const biomes = this.biomes;
        for (let i = 0; i < biomes.length; ++i) {
            const biome = biomes[i];
            if (biome.matchCondition(height, moisture, heat)) {
                biomeTemp.push(new BiomeTempData(biome));
            }
        }

        let curVal = 0.0;
        let biomeToReturn: BiomePreset | null = null;
        for (let i = 0; i < biomeTemp.length; ++i) {
            const biome = biomeTemp[i];
            if (biomeToReturn == null) {
                biomeToReturn = biome.biome;
                curVal = biome.getDiffValue(height, moisture, heat);
            } else {
                if (biome.getDiffValue(height, moisture, heat) < curVal) {
                    biomeToReturn = biome.biome;
                    curVal = biome.getDiffValue(height, moisture, heat);
                }
            }
        }

        if (biomeToReturn == null) {
            biomeToReturn = biomes[0];
        }
        return biomeToReturn;
    }
}
