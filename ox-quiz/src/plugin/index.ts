import { IframeInfo, PluginEnvironmentInfo } from "theworld-client/types/plugin/declarations";
import { Logger } from "./helper/Logger";

enum OX {
    O = 1,
    X = 0,
}

class Plugin extends BasePlugin {
    private _iframeInfo: IframeInfo|null = null;
    private readonly _players = new Map<string, [number, number]>();
    private judge_x = 0;

    private question = "";
    private playing = false;

    private answer = OX.X;

    private _broadcastPublicInfomation() {
        this.broadcastMessage("pub_state",
            this.question,
            this.playing
        )
    }

    private _broadcastPrivateInfomation() {
        this.broadcastMessage("priv_state",
            this.question,
            this.playing,    
            this.answer,
        )
    }

    public override onLoad(_: any, environmentInfo: PluginEnvironmentInfo): void {
        Logger.init(this);
        try {
            if(!environmentInfo.isLocal) throw new Error("Global not supported");
            this._iframeInfo = environmentInfo.iframe;

            this.judge_x = this._iframeInfo.x + this._iframeInfo.width/2;

        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }
    
    public override onPlayerJoin(userId: string): void {
        try {
            let x = 987654321,y = 987654321;
            if (this._iframeInfo) {
                x = this._iframeInfo.x + 1;
                y = this._iframeInfo.y + 1;
            }
            this._players.set(userId, [x, y]);
        } catch(e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public override onPlayerLeave(userId: string): void {
        try {
            this._players.delete(userId);
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    public onPlayerMove(userId: string, x: number, y: number): void {
        this._players.set(userId, [x, y]);
    }

    private _judge() {
        if(this._iframeInfo === null) return;
        const info = this._iframeInfo;

        this._players.forEach(([x, y], userId) => {
            if(!(
                info.x <= x
                && x < info.x + info.width
                && info.y <= y
                && y < info.y + info.height )) return;
            
            const player_select = (x >= this.judge_x) ? OX.X : OX.O;
            
            
            if (player_select !== this.answer) {
                this.teleportPlayer(
                    userId, 
                    info.x + info.width + 1,
                    info.y + info.height - 2,
                );
            }
        });
    }

    public override onChat(userId: string, message: string): void {
        if(!this.isAdmin(userId)) return;
        
        if (/정답:(O|X)/gi.test(message)) {
            this.playing = false;
            const a = message.slice(3);
            this.answer = (a[0].toLowerCase()==="o") ? OX.O : OX.X;
            this._judge();
            this._broadcastPrivateInfomation();
            return;
        }
        else if (/문제:+./gi.test(message)) {
            this.playing = true;
            const q = message.slice(3);
            this.question = q;
        }
        this._broadcastPublicInfomation();
    }
}

globalThis.PluginImpl = Plugin;
