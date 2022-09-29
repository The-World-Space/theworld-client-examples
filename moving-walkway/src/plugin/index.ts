import { IframeInfo, PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";

import { Logger } from "./helper/Logger";

enum Direction {
    up = 0,
    right = 1,
    down = 2,
    left = 3
}

interface Data {
    direction: Direction
}

class Plugin extends BasePlugin<Data> {
    private _iframeInfo: IframeInfo|null = null;

    private _direction: Direction|null = null;

    public override onLoad(data: Data, environmentInfo: PluginEnvironmentInfo): void {
        Logger.init(this);

        try {
            if(!environmentInfo.isLocal) throw new Error("Global not supported");
            this._iframeInfo = environmentInfo.iframe;

            if(data) {
                this._direction = data.direction;
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onMessage(_: string, event: string, ...messages: any): void {
        try {
            if(event === "checkShouldSetup") {
                if(this._direction === null) {
                    this.broadcastMessage("setup");
                }
            } else if(event === "setDirection") {
                const direction = messages[0];
                if (Number.isInteger(direction) && direction <= 3 && 0 <= direction) {
                    this._direction = direction;
                    this.broadcastMessage("setDirection", this._direction);
                    
                    this.saveData({
                        direction: direction
                    });
                }
            } else if(event === "getDirection") {
                if (this._direction !== null) {
                    this.broadcastMessage("setDirection", this._direction);
                }
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
    
    public onPlayerMove(userId: string, x: number, y: number): void {
        try {
            if(this._iframeInfo === null) return;
            if(this._direction === null) return;
            
            if(
                this._iframeInfo.x <= x
                && x < this._iframeInfo.x + this._iframeInfo.width
                && this._iframeInfo.y <= y
                && y < this._iframeInfo.y + this._iframeInfo.height
            ) {
                if(this._direction === Direction.up) {
                    this.requestMovePlayer(userId, x, this._iframeInfo.y + this._iframeInfo.height);
                } else if(this._direction === Direction.right) {
                    this.requestMovePlayer(userId, this._iframeInfo.x + this._iframeInfo.width, y);
                } else if(this._direction === Direction.down) {
                    this.requestMovePlayer(userId, x, this._iframeInfo.y - 1);
                } else if(this._direction === Direction.left) {
                    this.requestMovePlayer(userId, this._iframeInfo.x - 1, y);
                }
            }
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onUnload(): void {
        try {
            this._iframeInfo = null;
            this._direction = null;
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
}

globalThis.PluginImpl = Plugin;
