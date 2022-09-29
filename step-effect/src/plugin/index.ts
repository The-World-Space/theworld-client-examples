import { IframeInfo, PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";

import { Logger } from "./helper/Logger";

class Plugin extends BasePlugin {
    private _iframeInfo: IframeInfo|null = null;

    public override onLoad(_: any, environmentInfo: PluginEnvironmentInfo): void {
        Logger.init(this);
        try {
            if(!environmentInfo.isLocal) {
                throw new Error("This plugin works for only local");
            } else {
                this._iframeInfo = environmentInfo.iframe;
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onPlayerMove(_: string, x: number, y: number): void {
        if(this._iframeInfo === null) return;

        if(
            this._iframeInfo.x <= x
            && x < this._iframeInfo.x + this._iframeInfo.width
            && this._iframeInfo.y <= y
            && y < this._iframeInfo.y + this._iframeInfo.height
        ) {
            setTimeout(((x: number, y: number) => () => {
                this.broadcastMessage("step", x, y);
            })(x - this._iframeInfo.x, y - this._iframeInfo.y), 70);
        }
    }

    public override onUnload(): void {
        try {
            this._iframeInfo = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
