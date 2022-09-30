import { PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";

import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { LazyWorld } from "./generator/LazyWorld";
import { MazeGenerator } from "./generator/MazeGenerator";
import { DebounceExecuter } from "./helper/DebounceExecuter";
import { Logger } from "./helper/Logger";
import { Vector2 } from "./math/Vector2";

class Plugin extends BasePlugin {
    private _coroutineDispatcher: CoroutineDispatcher|null = null;
    private _lazyWorld: LazyWorld|null = null;
    private _mazeGenerator: MazeGenerator|null = null;

    private readonly _iframePosition = new Vector2(0, 0);
    private readonly _mazePosition = new Vector2(0, 0);
    private readonly _mazeSize = new Vector2(10, 10);
    private _seed = 0;
    private readonly _generateExecuter = new DebounceExecuter(500);

    public override onLoad(_data: any, info: PluginEnvironmentInfo): void {
        Logger.init(this);
        try {
            if (info.isLocal) {
                this._iframePosition.set(info.iframe.x, info.iframe.y);
            }

            this._coroutineDispatcher = new CoroutineDispatcher();
            this._lazyWorld = new LazyWorld(this._coroutineDispatcher, this);
            this._mazeGenerator = new MazeGenerator(this._lazyWorld);

            this.clearAndGenerate();
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._mazeGenerator!.clear();
            this._mazeGenerator = null;

            this._lazyWorld!.dispose();
            this._lazyWorld = null;

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
                this.clearAndGenerate();
            } else if (event === "size-input") {
                const { x, y } = messages[0];
                this._mazeSize.set(x, y);
                this.clearAndGenerate();
            } else if (event === "seed-input") {
                const seed = messages[0];
                this._seed = seed;
                this.clearAndGenerate();
            }
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    private readonly _tempVector = new Vector2();

    private clearAndGenerate(): void {
        this._generateExecuter.execute(() => {
            this._mazeGenerator?.clear();
            this._mazeGenerator?.generate(
                this._mazeSize.x,
                this._mazeSize.y,
                this._tempVector
                    .copy(this._mazePosition)
                    .add(this._iframePosition),
                this._seed
            );
        });
    }
}

globalThis.PluginImpl = Plugin;
