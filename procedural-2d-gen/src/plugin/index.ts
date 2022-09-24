import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { Vector2 } from "./math/Vector2";
import { WorldGenerator } from "./procedural-gen/WorldGenerator";

class Plugin extends BasePlugin {
    private readonly _chunkSize = 15;
    private readonly _playerViewDistance = 3;

    private _coroutineDispatcher: CoroutineDispatcher|null = null;
    private _worldGenerator: WorldGenerator|null = null;

    private readonly _players = new Set<string>();
    private readonly _tempVector = new Vector2();

    public override onLoad(): void {
        const dispatcher = this._coroutineDispatcher = new CoroutineDispatcher();
        this._worldGenerator = new WorldGenerator(dispatcher, this, this._chunkSize, this._playerViewDistance);
    }

    public override onUnload(): void {
        this._coroutineDispatcher!.dispose();
        this._coroutineDispatcher = null;
        this._worldGenerator!.dispose();
        this._worldGenerator = null;
    }

    public override onPlayerJoin(userId: string): void {
        this._players.add(userId);
        this._worldGenerator?.updatePlayerPosition(userId, this._tempVector.set(0, 0));
    }

    public override onPlayerLeave(userId: string): void {
        this._players.delete(userId);
    }
    
    public override onPlayerMove(playerId: string, x: number, y: number): void {
        this._worldGenerator?.updatePlayerPosition(playerId, this._tempVector.set(x, y));
    }
}

globalThis.PluginImpl = Plugin;
