import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { Logger } from "./helper/Logger";
import { Vector2 } from "./math/Vector2";
import { WorldGenerator } from "./procedural-gen/WorldGenerator";

class Plugin extends BasePlugin {
    private readonly _defaultChunkSize = 9;
    private readonly _defaultPlayerViewDistance = 3;

    private _coroutineDispatcher: CoroutineDispatcher|null = null;
    private _worldGenerator: WorldGenerator|null = null;

    private readonly _players = new Set<string>();
    private readonly _tempVector = new Vector2();

    public override onLoad(): void {
        Logger.init(this);
        try {
            const dispatcher = this._coroutineDispatcher = new CoroutineDispatcher();
            this._worldGenerator = new WorldGenerator(dispatcher, this, this._defaultChunkSize, this._defaultPlayerViewDistance);
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._coroutineDispatcher!.dispose();
            this._coroutineDispatcher = null;
            this._worldGenerator!.dispose();
            this._worldGenerator = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onPlayerJoin(userId: string): void {
        try {
            this._players.add(userId);
            this._worldGenerator?.updatePlayerPosition(userId, this._tempVector.set(0, 0));
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onPlayerLeave(userId: string): void {
        try {
            this._players.delete(userId);
            this._worldGenerator?.removePlayer(userId);
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
    
    public override onPlayerMove(playerId: string, x: number, y: number): void {
        try {
            this._worldGenerator?.updatePlayerPosition(playerId, this._tempVector.set(x, y));
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(_userId: string, event: string, ...args: any[]): void {
        try {
            if (event === "set-chunk-size") {
                if (this._worldGenerator) {
                    this._worldGenerator.chunkSize = Math.floor(args[0]);
                    this.broadcastMessage("chunk-size", this._worldGenerator.chunkSize);
                }
            } else if (event === "request-chunk-size") {
                if (this._worldGenerator) {
                    this.broadcastMessage("chunk-size", this._worldGenerator.chunkSize);
                }
            }
            
            if (event === "set-player-view-distance") {
                if (this._worldGenerator) {
                    this._worldGenerator.playerViewDistance = Math.floor(args[0]);
                    this.broadcastMessage("player-view-distance", this._worldGenerator.playerViewDistance);
                }
            } else if (event === "request-player-view-distance") {
                if (this._worldGenerator) {
                    this.broadcastMessage("player-view-distance", this._worldGenerator.playerViewDistance);
                }
            }
            
            if (event === "set-seed") {
                if (this._worldGenerator) {
                    this._worldGenerator.seed = args[0];
                    this.broadcastMessage("seed", this._worldGenerator.seed);
                }
            } else if (event === "request-seed") {
                if (this._worldGenerator) {
                    this.broadcastMessage("seed", this._worldGenerator.seed);
                }
            }
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
