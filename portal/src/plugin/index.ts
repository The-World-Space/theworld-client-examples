import { IframeInfo, PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";

import { Logger } from "./helper/Logger";

type Data = {
    target: [number, number] | null;
}

class Plugin extends BasePlugin<Data> {
    private _iframeInfo: IframeInfo | null = null;
    private _target: [number, number] | null = null;
    private _setupId: string | null = null;
    private readonly _userPositions: Map<string, [number, number]> = new Map();

    public override onLoad(data: Data, environmentInfo: PluginEnvironmentInfo): void {
        Logger.init(this);
        try {
            if(!environmentInfo.isLocal) throw new Error("Portal does not support global mode");

            this._iframeInfo = environmentInfo.iframe;

            if(!data) {
                this.saveData({ target: null });
            } else {
                this._target = data.target;
            }
            
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onPlayerMove(userId: string, x: number, y: number): void {
        try {
            if(this._iframeInfo === null) return;

            this._userPositions.set(userId, [x, y]);

            if(
                this._iframeInfo.x <= x
                && x < this._iframeInfo.x + this._iframeInfo.width
                && this._iframeInfo.y <= y
                && y < this._iframeInfo.y + this._iframeInfo.height
            ) {
                if(this._target === null) return;
                this.teleportPlayer(userId, this._target[0], this._target[1]);
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(userId: string, event: string, ...messages: any): void {
        try {
            if(event === "checkShouldSetup") {
                if(!this.isAdmin(userId)) return;
                if(this._target === null) {
                    this._setupId = Math.floor(Math.random() * 0x10000).toString(16).padStart(4, "0");
                    this.sendMessage(userId, "setup", this._setupId);
                }
            } else if(event === "setup") {
                if(!this.isAdmin(userId)) return;
                const x = messages[0];
                const y = messages[1];

                if(!Number.isInteger(x) || !Number.isInteger(y)) return;
                
                this._target = [x, y];
                this.saveData({ target: [x, y] });
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onChat(userId: string, message: string): void {
        try {
            if(!this.isAdmin(userId)) return;
            if(this._setupId === null) return;

            const cmds = message.split(" ");
            if(cmds[0] === "/setup-portal") {
                const setupId = cmds[1];
                if (this._setupId !== setupId) return;
                const position = this._userPositions.get(userId);
                if (!position) return;

                const x = position[0];
                const y = position[1];

                this._target = [x, y];
                this.saveData({ target: [x, y] });
                this._setupId = null;

                this.sendMessage(userId, "setuped");
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._iframeInfo = null;
            this._target = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
