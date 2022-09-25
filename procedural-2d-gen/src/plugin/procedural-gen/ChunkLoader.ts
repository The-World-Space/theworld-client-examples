import { Immutable } from "src/plugin/types/Immutable";

import { Vector2 } from "../math/Vector2";
import { ITilemapRenderer } from "./ITilemapRenderer";
import { ProceduralMapGenerator } from "./ProceduralMapGenerator";

export class ChunkLoader {
    public readonly generator: ProceduralMapGenerator;

    private readonly _chunkSize: number;
    private readonly _renderer: ITilemapRenderer;
    private readonly _loadedChunks = new Set<`${number}_${number}`>();

    public constructor(renderer: ITilemapRenderer, chunkSize = 15) {
        this.generator = new ProceduralMapGenerator(renderer);
        this._chunkSize = chunkSize;
        this._renderer = renderer;
    }

    private vector2ToString(v: Immutable<Vector2>): `${number}_${number}` {
        return v.x + "_" + v.y as `${number}_${number}`;
    }

    private readonly _tempVector2 = new Vector2();

    private generateChunk(chunkIndex: Immutable<Vector2>): void {
        const chunkSize = this._chunkSize;
        const chunkPosition = this._tempVector2.set(
            chunkIndex.x * chunkSize - Math.floor(chunkSize / 2),
            chunkIndex.y * chunkSize - Math.floor(chunkSize / 2)
        );
        this.generator.generateMap(chunkSize, chunkSize, chunkPosition);
    }

    private destroyChunk(chunkIndex: Immutable<Vector2>): void {
        const chunkSize = this._chunkSize;
        const chunkPosition = this._tempVector2.set(
            chunkIndex.x * chunkSize - Math.floor(chunkSize / 2),
            chunkIndex.y * chunkSize - Math.floor(chunkSize / 2)
        );
        const renderer = this._renderer;
        for (let y = 0; y < chunkSize; y++) {
            for (let x = 0; x < chunkSize; x++) {
                renderer.deleteTile(chunkPosition.x + x, chunkPosition.y + y, false);
            }
        }
    }

    public loadChunk(chunkIndex: Immutable<Vector2>): void {
        const chunkIndexString = this.vector2ToString(chunkIndex);
        if (this._loadedChunks.has(chunkIndexString)) return;

        this.generateChunk(chunkIndex);
        this._loadedChunks.add(chunkIndexString);
    }

    public unloadChunk(chunkIndex: Immutable<Vector2>): void {
        const chunkIndexString = this.vector2ToString(chunkIndex);
        if (!this._loadedChunks.has(chunkIndexString)) return;

        this.destroyChunk(chunkIndex);
        this._loadedChunks.delete(chunkIndexString);
    }

    public unloadAllChunks(): void {
        this._loadedChunks.forEach((chunkIndexString) => {
            const chunkIndex = chunkIndexString.split("_") as [string, string];
            this.destroyChunk(new Vector2(parseInt(chunkIndex[0]), parseInt(chunkIndex[1])));
        });
        this._loadedChunks.clear();
    }

    public getChunkIndexFromPosition(position: Immutable<Vector2>, out?: Vector2): Vector2 {
        out ??= new Vector2();
        return out.set(
            Math.floor((position.x + this._chunkSize / 2) / this._chunkSize),
            Math.floor((position.y + this._chunkSize / 2) / this._chunkSize)
        );
    }
}
