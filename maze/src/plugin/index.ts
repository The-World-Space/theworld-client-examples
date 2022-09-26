import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { MazeGenerator } from "./generator/MazeGenerator";
import { Logger } from "./helper/Logger";
import { Vector2 } from "./math/Vector2";

class Plugin extends BasePlugin {
    private _coroutineDispatcher: CoroutineDispatcher|null = null;
    private _mazeGenerator: MazeGenerator|null = null;

    private readonly _mazePosition = new Vector2(0, 0);
    private readonly _mazeSize = new Vector2(10, 10);
    private _seed = 0;

    public override onLoad(): void {
        Logger.init(this);
        try {
            this._coroutineDispatcher = new CoroutineDispatcher();
            this._mazeGenerator = new MazeGenerator(this);

            this._mazeGenerator.generate(this._mazeSize.x, this._mazeSize.y, this._mazePosition, this._seed);
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._mazeGenerator!.clear();
            this._mazeGenerator = null;

            this._coroutineDispatcher!.dispose();
            this._coroutineDispatcher = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(userId: string, event: string, ...messages: any): void {
        try {
            if (event === "request-position") {
                this.sendMessage(userId, "position", this._mazePosition);
            } else if (event === "request-size") {
                this.sendMessage(userId, "size", this._mazeSize);
            } else if (event === "request-seed") {
                this.sendMessage(userId, "seed", this._seed);
            }

            if (event === "position-input") {
                const { x, y } = messages[0];
                this._mazePosition.set(x, y);
                this._mazeGenerator!.clear();
                this._mazeGenerator!.generate(this._mazeSize.x, this._mazeSize.y, this._mazePosition, this._seed);
            } else if (event === "size-input") {
                const { x, y } = messages[0];
                this._mazeSize.set(x, y);
                this._mazeGenerator!.clear();
                this._mazeGenerator!.generate(this._mazeSize.x, this._mazeSize.y, this._mazePosition, this._seed);
            } else if (event === "seed-input") {
                const seed = messages[0];
                this._seed = seed;
                this._mazeGenerator!.clear();
                this._mazeGenerator!.generate(this._mazeSize.x, this._mazeSize.y, this._mazePosition, this._seed);
            }
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
