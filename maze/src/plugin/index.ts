import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { MazeGenerator } from "./generator/MazeGenerator";
import { Logger } from "./helper/Logger";
import { Vector2 } from "./math/Vector2";

class Plugin extends BasePlugin {
    private _coroutineDispatcher: CoroutineDispatcher|null = null;
    private _mazeGenerator: MazeGenerator|null = null;

    public override onLoad(): void {
        Logger.init(this);
        try {
            this._coroutineDispatcher = new CoroutineDispatcher();
            this._mazeGenerator = new MazeGenerator(this);
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._coroutineDispatcher!.dispose();
            this._coroutineDispatcher = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(userId: string, event: string, ...messages: any): void {
        try {
            Logger.log(`onMessage: ${userId}, ${event}, ${messages}`);
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onChat(userId: string, message: string): void {
        try {
            const args = message.split(" ");
            if (args.length > 0) {
                if (args[0] === "gen") {
                    if (4 > args.length) return;
                    const x = parseInt(args[1]);
                    const y = parseInt(args[2]);
                    const seed = parseInt(args[3]);
                    this._mazeGenerator!.generate(10, 10, new Vector2(x, y), seed);
                }
            }
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
