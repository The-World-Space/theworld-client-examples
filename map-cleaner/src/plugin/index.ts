
import { IframeInfo, PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";

import { Logger } from "./helper/Logger";

class Plugin extends BasePlugin {
    private _iframeInfo: IframeInfo | null = null;

    public override onLoad(_: any, environmentInfo: PluginEnvironmentInfo): void {
        Logger.init(this);
        try {
            if(!environmentInfo.isLocal) {
                throw new Error("This is works only for local");
            }
            this._iframeInfo = environmentInfo.iframe;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(_: string, event: string, ...messages: any): void {
        if (this._iframeInfo === null) return;

        if(event === "clean") {
            const xRadius = messages[0];
            const yRadius = messages[1];

            if(!Number.isInteger(xRadius) || !Number.isInteger(yRadius)) return;
            for(let x = this._iframeInfo.x - xRadius; x < this._iframeInfo.x + xRadius; x++) {
                for(let y = this._iframeInfo.y - yRadius; y < this._iframeInfo.y + yRadius; y++) {
                    this.deleteTile(x, y, false);
                    this.deleteTile(x, y, true);
                    this.setCollider(x, y, false);
                }
            }
        }
    }
}

globalThis.PluginImpl = Plugin;
