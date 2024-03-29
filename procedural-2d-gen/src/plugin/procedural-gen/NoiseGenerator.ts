import { Immutable } from "src/plugin/types/Immutable";

import { Vector2 } from "../math/Vector2";

export class Wave {
    public seed: number;
    public readonly frequency: number;
    public readonly amplitude: number;

    public constructor(seed: number, frequency: number, amplitude: number) {
        this.seed = seed;
        this.frequency = frequency;
        this.amplitude = amplitude;
    }
}

export class NoiseGenerator {
    private static readonly _perm = [
        151, 160, 137, 91, 90, 15,
        131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
        190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
        88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
        77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
        102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
        135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
        5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
        223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
        129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
        251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
        49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
        138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180,
        151
    ];

    public static generate(width: number, height: number, scale: number, waves: Wave[], offset: Immutable<Vector2>): number[][] {
        // create the noise map
        const noiseMap = new Array(width);
        for (let x = 0; x < width; x++) {
            noiseMap[x] = new Array(height);

            for (let y = 0; y < height; y++) {
                noiseMap[x][y] = 0;
            }
        }
        // loop through each element in the noise map
        for (let x = 0; x < width; ++x) {
            for (let y = 0; y < height; ++y) {
                // calculate the sample positions
                const samplePosX = x * scale + offset.x;
                const samplePosY = y * scale + offset.y;
                let normalization = 0.0;
                // loop through each wave
                for (let i = 0; i < waves.length; ++i) {
                    const wave = waves[i];
                    // sample the perlin noise taking into consideration amplitude and frequency
                    noiseMap[x][y] += wave.amplitude * (this.perlinNoise(samplePosX * wave.frequency + wave.seed, samplePosY * wave.frequency + wave.seed) + 0.5);
                    normalization += wave.amplitude;
                }
                // normalize the value
                noiseMap[x][y] /= normalization;
            }
        }

        return noiseMap;
    }

    private static floorToInt(x: number): number {
        return x > 0 ? Math.floor(x) : Math.ceil(x);
    }

    private static fade(t: number): number {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }
    
    private static grad(hash: number, x: number, y: number): number {
        return ((hash & 1) == 0 ? x : -x) + ((hash & 2) == 0 ? y : -y);
    }

    private static lerp(t: number, a: number, b: number): number {
        return a + t * (b - a);
    }

    private static perlinNoise(x: number, y: number): number {
        const intX = NoiseGenerator.floorToInt(x) & 0xff;
        const intY = NoiseGenerator.floorToInt(y) & 0xff;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = (NoiseGenerator._perm[intX] + intY) & 0xff;
        const b = (NoiseGenerator._perm[intY + 1] + intY) & 0xff;
        return this.lerp(
            v,
            this.lerp(u, this.grad(NoiseGenerator._perm[a], x, y), this.grad(NoiseGenerator._perm[b], x - 1, y)),
            this.lerp(u, this.grad(NoiseGenerator._perm[a + 1], x, y - 1), this.grad(NoiseGenerator._perm[b + 1], x - 1, y - 1))
        );
    }
}
