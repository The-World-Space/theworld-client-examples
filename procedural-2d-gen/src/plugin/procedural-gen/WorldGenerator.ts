import { Immutable } from "src/plugin/types/Immutable";

import { CoroutineDispatcher } from "../coroutine/CoroutineDispatcher";
import { CoroutineIterator } from "../coroutine/CoroutineIterator";
import { Vector2 } from "../math/Vector2";
import { ChunkLoader } from "./ChunkLoader";
import { ITilemapRenderer } from "./ITilemapRenderer";

class UserChunkData {
    public readonly loadedChunks = new Set<`${number}_${number}`>;
    public readonly loadChunkQueue = new Set<`${number}_${number}`>;
    public readonly unloadChunkQueue = new Set<`${number}_${number}`>;
}

type ResetParameters = {
    chunkSize: number;
    playerViewDistance: number;
    seed: number
};

export class WorldGenerator {
    private readonly _coroutineDispatcher: CoroutineDispatcher;
    private readonly _renderer: ITilemapRenderer;
    private _chunkLoader: ChunkLoader;
    private _chunkSize: number;
    private _playerViewDistance: number;
    private _seed: number;

    private _loadCirclePoints: readonly Immutable<Vector2>[];
    private _unloadChunkQueueMaxValue: number;
    private readonly _playerPositions = new Map<string, Vector2>();
    private readonly _playerChunkPositions = new Map<string, Vector2>();
    private readonly _userChunks = new Map<string, UserChunkData>();
    private readonly _loadedChunks = new Map<`${number}_${number}`, number>();

    private _locked = false;
    private _resetParameters: ResetParameters|null = null;

    public constructor(
        dispatcher: CoroutineDispatcher,
        renderer: ITilemapRenderer,
        chunkSize = 9,
        playerViewDistance = 3,
        seed = 0
    ) {
        this._coroutineDispatcher = dispatcher;
        this._renderer = renderer;

        this._chunkSize = chunkSize;
        this._playerViewDistance = playerViewDistance;
        this._seed = seed;

        this._chunkLoader = WorldGenerator.createChunkLoader(renderer, chunkSize, seed);

        this._loadCirclePoints = this.computeCirclePoints(this._playerViewDistance);
        this._unloadChunkQueueMaxValue = this._loadCirclePoints.length * 3;
    }

    private static createChunkLoader(
        renderer: ITilemapRenderer,
        chunkSize: number,
        seed: number
    ): ChunkLoader {
        const chunkLoader = new ChunkLoader(renderer, chunkSize);
        const heatWaves = chunkLoader.generator.heatWaves;
        for (let i = 0; i < heatWaves.length; i++) {
            heatWaves[i].seed += seed;
        }
        const moistureWaves = chunkLoader.generator.moistureWaves;
        for (let i = 0; i < moistureWaves.length; i++) {
            moistureWaves[i].seed += seed;
        }
        const heightWaves = chunkLoader.generator.heightWaves;
        for (let i = 0; i < heightWaves.length; i++) {
            heightWaves[i].seed += seed;
        }
        return chunkLoader;
    }


    private computeCirclePoints(radius: number): Immutable<Vector2>[] {
        const result: Vector2[] = [];

        if (radius < 1) return result;
    
        if (radius == 1) {
            result.push(new Vector2(0, 0));
            return result;
        }
    
        radius -= 1;
    
        let xk = 0;
        let yk = radius;
        let pk = 3 - (radius + radius);
    
        do {
            const axkt = xk;
            for (let i = -xk; i <= axkt; i++) {
                result.push(new Vector2(i, -yk));
                result.push(new Vector2(i, yk));
            }
            const aykt = xk;
            for (let i = -xk; i <= aykt; i++) {
                result.push(new Vector2(-yk, i));
                result.push(new Vector2(yk, i));
            }
    
            xk += 1;
            if (pk < 0) pk += (xk << 2) + 6;
            else {
                yk -= 1;
                pk += ((xk - yk) << 2) + 10;
    
            }
    
        } while (xk <= yk);
    
        const xkm1 = xk - 1;
    
        for (let i = -yk; i <= yk; i++) {
            for (let j = -xk + 1; j <= xkm1; j++) {
                result.push(new Vector2(j, i));
            }
        }

        // Remove duplicates
        const uniquePoints = new Set<string>();
        for (let i = 0; i < result.length; i++) {
            const point = result[i];
            const key = `${point.x},${point.y}`;
            if (uniquePoints.has(key)) {
                result.splice(i, 1);
                i--;
            } else {
                uniquePoints.add(key);
            }
        }

        // Sort by distance
        result.sort((a, b) => {
            const aDistance = a.length();
            const bDistance = b.length();
            if (aDistance < bDistance) return -1;
            if (aDistance > bDistance) return 1;
            return 0;
        });

        return result;
    }

    private updateChunkEnqueue(playerId: string, chunkIndex?: Immutable<Vector2>): void {
        const loadCirclePoints = this._loadCirclePoints!;

        let userChunkData = this._userChunks.get(playerId);
        if (userChunkData === undefined) {
            userChunkData = new UserChunkData();
            this._userChunks.set(playerId, userChunkData);
        }

        const loadChunkQueue = userChunkData.loadChunkQueue;
        const unloadChunkQueue = userChunkData.unloadChunkQueue;
        loadChunkQueue.clear();
        unloadChunkQueue.clear();

        const unloadChunkList: `${number}_${number}`[] = [];
        
        userChunkData.loadedChunks.forEach((chunkKey) => {
            unloadChunkList.push(chunkKey);
        });

        for (let i = unloadChunkList.length - 1; 0 <= i; --i) {
            unloadChunkQueue.add(unloadChunkList[i]);
        }

        if (chunkIndex) {
            for (let i = 0; i < loadCirclePoints.length; i++) {
                const point = loadCirclePoints[i];
                const chunkKey = (point.x + chunkIndex.x) + "_" + (point.y + chunkIndex.y) as `${number}_${number}`;

                if (unloadChunkQueue.has(chunkKey)) {
                    unloadChunkQueue.delete(chunkKey);
                } else {
                    loadChunkQueue.add(chunkKey);
                }
            }
        }
    }

    private readonly _tempVector2 = new Vector2();

    private *processUpdateChunk(playerId?: string): CoroutineIterator {
        let startTime = Date.now();

        if (this._resetParameters !== null) {
            while (0 < this._loadedChunks.size) {
                const chunkKey = this._loadedChunks.keys().next().value as `${number}_${number}`;
                if (chunkKey === undefined) break;
                this._loadedChunks.delete(chunkKey);

                const parsedUnloadChunk = chunkKey.split("_").map(Number) as [number, number];
                this._chunkLoader.unloadChunk(this._tempVector2.set(parsedUnloadChunk[0], parsedUnloadChunk[1]));

                const currentTime = Date.now();
                if (10 < currentTime - startTime) {
                    startTime = currentTime;
                    yield null;
                }
            }

            const newParameters = this._resetParameters;

            this._chunkSize = newParameters.chunkSize;
            this._playerViewDistance = newParameters.playerViewDistance;
            this._seed = newParameters.seed;

            this._chunkLoader = WorldGenerator.createChunkLoader(this._renderer, this._chunkSize, this._seed);

            this._loadCirclePoints = this.computeCirclePoints(this._playerViewDistance);
            this._unloadChunkQueueMaxValue = this._loadCirclePoints.length * 3;

            this._userChunks.forEach((userChunkData) => {
                userChunkData.loadedChunks.clear();
                userChunkData.loadChunkQueue.clear();
                userChunkData.unloadChunkQueue.clear();
            });
            this._userChunks.clear();

            this._resetParameters = null;
            
            this._playerPositions.forEach((position, playerId) => {
                this.updatePlayerPosition(playerId, position, true);
            });
        } else {
            const userChunkData = playerId !== undefined
                ? this._userChunks.get(playerId)
                : undefined;
            if (userChunkData === undefined) return;

            const loadChunkQueue = userChunkData.loadChunkQueue;
            const unloadChunkQueue = userChunkData.unloadChunkQueue;
            const loadedChunks = userChunkData.loadedChunks;

            while ((0 < loadChunkQueue.size || 0 < unloadChunkQueue.size) && !this._locked) {
                if (this._unloadChunkQueueMaxValue < unloadChunkQueue.size || loadChunkQueue.size <= 0) {
                    //unloadChunk
                    const unloadChunk = unloadChunkQueue.keys().next().value as `${number}_${number}`;
                    unloadChunkQueue.delete(unloadChunk);
                    loadedChunks.delete(unloadChunk);

                    const loadedChunkRefs = this._loadedChunks.get(unloadChunk);
                    if (loadedChunkRefs !== undefined) {
                        if (loadedChunkRefs - 1 <= 0) {
                            this._loadedChunks.delete(unloadChunk);

                            const parsedUnloadChunk = unloadChunk.split("_").map(Number) as [number, number];
                            this._chunkLoader.unloadChunk(this._tempVector2.set(parsedUnloadChunk[0], parsedUnloadChunk[1]));
                        } else {
                            this._loadedChunks.set(unloadChunk, loadedChunkRefs - 1);
                        }
                    }
                } else {
                    //loadChunk
                    const loadChunk = loadChunkQueue.keys().next().value as `${number}_${number}`;
                    loadChunkQueue.delete(loadChunk);
                    loadedChunks.add(loadChunk);

                    const loadedChunkRefs = this._loadedChunks.get(loadChunk);
                    if (loadedChunkRefs === undefined) {
                        this._loadedChunks.set(loadChunk, 1);

                        const parsedLoadChunk = loadChunk.split("_").map(Number) as [number, number];
                        this._chunkLoader.loadChunk(this._tempVector2.set(parsedLoadChunk[0], parsedLoadChunk[1]));
                    } else {
                        this._loadedChunks.set(loadChunk, loadedChunkRefs + 1);
                    }
                }

                const currentTime = Date.now();
                if (10 < currentTime - startTime) {
                    startTime = currentTime;
                    yield null;
                }
            }
        }
    }
    
    private readonly _taskQueue = new Set<string>();
    private readonly _runningTasks = new Set<string>();

    private lazyUpdateChunk(playerId: string, chunkIndex?: Immutable<Vector2>): void {
        this.updateChunkEnqueue(playerId, chunkIndex);

        if (this._runningTasks.has(playerId)) return;
        this._taskQueue.add(playerId);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const worldGenerator = this;

        if (this._runningTasks.size < 4) {
            this._coroutineDispatcher.startCoroutine((function* (): CoroutineIterator {
                worldGenerator._runningTasks.add(playerId);
                yield* worldGenerator.processUpdateChunk(playerId);
                worldGenerator._runningTasks.delete(playerId);
            })());
        }
    }

    private readonly _tempVector1 = new Vector2();

    private lazyResetGenerator(resetParameters: ResetParameters): void {
        this._resetParameters = resetParameters;
        
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const worldGenerator = this;

        if (this._runningTasks.size === 0) {
            this._coroutineDispatcher.startCoroutine((function* (): CoroutineIterator {
                yield* worldGenerator.processUpdateChunk();
            })());
        }
    }

    public updatePlayerPosition(playerId: string, position: Immutable<Vector2>, forceUpdate = false): void {
        const chunkLoader = this._chunkLoader;

        const savedPosition = this._playerPositions.get(playerId);
        if (savedPosition !== undefined) {
            savedPosition.copy(position);
        } else {
            this._playerPositions.set(playerId, position.clone());
        }

        const playerChunkPosition = chunkLoader.getChunkIndexFromPosition(position, this._tempVector1);
        const playerOldChunkPosition = this._playerChunkPositions.get(playerId);
        if (!forceUpdate && playerOldChunkPosition?.equals(playerChunkPosition)) return;

        this.lazyUpdateChunk(playerId, playerChunkPosition);

        if (playerOldChunkPosition) {
            playerOldChunkPosition.copy(playerChunkPosition);
        } else {
            this._playerChunkPositions.set(playerId, playerChunkPosition.clone());
        }   
    }

    public removePlayer(playerId: string): void {
        this._playerPositions.delete(playerId);

        const playerChunkPosition = this._playerChunkPositions.get(playerId);
        if (playerChunkPosition) {
            this.lazyUpdateChunk(playerId, undefined);
            this._playerChunkPositions.delete(playerId);
        }
    }

    public dispose(): void {
        const loadedChunks = this._loadedChunks;
        loadedChunks.forEach((_, chunkKey) => {
            const parsedChunkKey = chunkKey.split("_").map(Number) as [number, number];
            this._chunkLoader.unloadChunk(this._tempVector1.set(parsedChunkKey[0], parsedChunkKey[1]));
        });
        this._locked = true;
    }

    public get chunkSize(): number {
        if (this._resetParameters !== null) {
            return this._resetParameters.chunkSize;
        }
        return this._chunkSize;
    }

    public set chunkSize(value: number) {
        const parameters: ResetParameters = this._resetParameters
            ? { ...this._resetParameters, chunkSize: value }
            : { chunkSize: value, seed: this._seed, playerViewDistance: this._playerViewDistance };
        this.lazyResetGenerator(parameters);
    }

    public get seed(): number {
        if (this._resetParameters !== null) {
            return this._resetParameters.seed;
        }
        return this._seed;
    }

    public set seed(value: number) {
        const parameters: ResetParameters = this._resetParameters
            ? { ...this._resetParameters, seed: value }
            : { chunkSize: this._chunkSize, seed: value, playerViewDistance: this._playerViewDistance };
        this.lazyResetGenerator(parameters);
    }

    public get playerViewDistance(): number {
        if (this._resetParameters !== null) {
            return this._resetParameters.playerViewDistance;
        }
        return this._playerViewDistance;
    }

    public set playerViewDistance(value: number) {
        const parameters: ResetParameters = this._resetParameters
            ? { ...this._resetParameters, playerViewDistance: value }
            : { chunkSize: this._chunkSize, seed: this._seed, playerViewDistance: value };
        this.lazyResetGenerator(parameters);
    }
}
