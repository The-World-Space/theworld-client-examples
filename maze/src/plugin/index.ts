import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { Logger } from "./helper/Logger";

class Plugin extends BasePlugin {
    private _coroutineDispatcher: CoroutineDispatcher|null = null;

    public override onLoad(): void {
        Logger.init(this);
        try {
            this._coroutineDispatcher = new CoroutineDispatcher();
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
}

globalThis.PluginImpl = Plugin;
