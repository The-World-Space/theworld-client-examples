import { Coroutine } from "../coroutine/Coroutine";
import { CoroutineDispatcher } from "../coroutine/CoroutineDispatcher";
import { CoroutineIterator } from "../coroutine/CoroutineIterator";
import { Logger } from "../helper/Logger";
import { Vector2 } from "../math/Vector2";
import { Immutable } from "../types/Immutable";
import { IWorld } from "./IWorld";

class TileTask {
    public readonly position: Immutable<Vector2>;

    public constructor(position: Immutable<Vector2>) {
        this.position = position;
    }
}

class TileAddTask extends TileTask {
    public readonly atlasId: number;
    public readonly atlasIndex: number;

    public constructor(position: Immutable<Vector2>, atlasId: number, atlasIndex: number) {
        super(position);
        this.atlasId = atlasId;
        this.atlasIndex = atlasIndex;
    }
}

class ColliderTask {
    public readonly position: Immutable<Vector2>;
    public readonly exists: boolean;

    public constructor(position: Immutable<Vector2>, exists: boolean) {
        this.position = position;
        this.exists = exists;
    }
}

export class LazyWorld {
    private readonly _dispatcher: CoroutineDispatcher;
    private readonly _world: IWorld;
    private readonly _spawnedTiles: Immutable<Vector2>[] = [];
    private readonly _spawnedColliders: Immutable<Vector2>[] = [];

    private readonly _tileQueue: TileTask[] = [];
    private readonly _collidersQueue: ColliderTask[] = [];
    private _coroutine: Coroutine|null = null;

    public constructor(dispatcher: CoroutineDispatcher, world: IWorld) {
        this._dispatcher = dispatcher;
        this._world = world;
    }

    private *processQueue(): CoroutineIterator {
        yield null;
        let startTime = Date.now();

        while (0 < this._tileQueue.length || 0 < this._collidersQueue.length) {
            if (0 < this._tileQueue.length) {
                const task = this._tileQueue.shift()!;

                if (task instanceof TileAddTask) {
                    this._world.setTile(task.position.x, task.position.y, task.atlasId, task.atlasIndex, false);
                    this._spawnedTiles.push(task.position);
                } else {
                    this._world.deleteTile(task.position.x, task.position.y, false);
                    const index = this._spawnedTiles.indexOf(task.position);
                    if (index >= 0) {
                        this._spawnedTiles.splice(index, 1);
                    }
                }
            } else if (0 < this._collidersQueue.length) {
                const task = this._collidersQueue.shift()!;
            
                this._world.setCollider(task.position.x, task.position.y, task.exists);
                if (task.exists) {
                    this._spawnedColliders.push(task.position);
                } else {
                    const index = this._spawnedColliders.indexOf(task.position);
                    if (index >= 0) {
                        this._spawnedColliders.splice(index, 1);
                    }
                }
            }

            const currentTime = Date.now();
            if (10 < currentTime - startTime) {
                startTime = currentTime;
                yield null;
            }
        }
    }

    private startCoroutineIfNeeded(): void {
        if (this._coroutine === null) {
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;

            this._coroutine = this._dispatcher.startCoroutine((function* (): CoroutineIterator {
                yield* self.processQueue();
                self._coroutine = null;
            })());
        }
    }

    public setTile(x: number, y: number, atlasId: number, atlasIndex: number): void {
        this._tileQueue.push(new TileAddTask(new Vector2(x, y), atlasId, atlasIndex));
        this.startCoroutineIfNeeded();
    }

    public deleteTile(x: number, y: number): void {
        this._tileQueue.push(new TileTask(new Vector2(x, y)));
        this.startCoroutineIfNeeded();
    }

    public setCollider(x: number, y: number, exists: boolean): void {
        this._collidersQueue.push(new ColliderTask(new Vector2(x, y), exists));
        this.startCoroutineIfNeeded();
    }

    public dispose(): void {
        for (let i = 0; i < this._spawnedTiles.length; ++i) {
            const position = this._spawnedTiles[i];
            this._world.deleteTile(position.x, position.y, false);
        }
        for (let i = 0; i < this._spawnedColliders.length; ++i) {
            const position = this._spawnedColliders[i];
            this._world.setCollider(position.x, position.y, false);
        }
        this._spawnedTiles.length = 0;
        this._spawnedColliders.length = 0;

        if (this._coroutine !== null) {
            this._dispatcher.stopCoroutine(this._coroutine);
            this._coroutine = null;
        }
        this._tileQueue.length = 0;
        this._collidersQueue.length = 0;
    }
}
