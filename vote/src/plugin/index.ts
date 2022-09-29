import { CoroutineDispatcher } from "./coroutine/CoroutineDispatcher";
import { Logger } from "./helper/Logger";

class Plugin extends BasePlugin {
    private _coroutineDispatcher: CoroutineDispatcher | null = null;

    private readonly _voted_players = new Set<string>();
    private readonly _vote_count = new Map<number, number>();
    private _voting = false;
    private _candidates: string[] = [];

    public data: [string, number][] = [];

    public override onLoad(): void {
        Logger.init(this);
    }

    public override onUnload(): void {
        try {
            this._coroutineDispatcher!.dispose();
            this._coroutineDispatcher = null;
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

    private _sendState(userId: string) {
        this.sendMessage(
            userId,
            "pstate",
            this._voting,
            this._candidates,
            this.data,
            this._voted_players.has(userId),
            this.isAdmin(userId),
        );
    }
    private _broadCastState() {
        this.broadcastMessage(
            "state",
            this._voting,
            this._candidates,
            this.data
        );
    }

    private _updateData() {
        this.data = this._candidates.map((e, i) => [e, this._vote_count.get(i + 1) || 0]);
    }

    public override onMessage(userId: string, event: string, ...messages: any): void {
        try {
            switch (event) {
                case "start": {
                    if(!this.isAdmin(userId)) return;
                    this._voting = true;

                    break;
                }
                case "stop": {
                    if(!this.isAdmin(userId)) return;
                    this._voting = false;

                    break;
                }
                case "reset": {
                    if(!this.isAdmin(userId)) return;

                    const oldVotedPlayers: string[] = [];
                    this._voted_players.forEach(value => oldVotedPlayers.push(value));

                    this._vote_count.clear();
                    this._voted_players.clear();
                    this._candidates = [];
                    this._voting = false;

                    this._updateData();
                    for(let i = 0; i < oldVotedPlayers.length; i++) {
                        const userId = oldVotedPlayers[i];
                        try {
                            this._sendState(userId);
                        } catch(e) {
                            Logger.error(e);
                        }
                    }
                    break;
                }
                case "vote": {
                    if (this._voted_players.has(userId)) return;
                    this._voted_players.add(userId);

                    const num: number = messages[0];
                    if (!(Number.isInteger(num) && this._voting)) return;

                    const cnt = this._vote_count.get(num);
                    this._vote_count.set(num, (cnt || 0) + 1);

                    this._updateData();
                    break;
                }
                case "add_cand": {
                    if(!this.isAdmin(userId)) return;
                    const cand: string = messages[0];

                    this._candidates.push(cand);

                    this._updateData();
                    break;
                }
                case "get_state": {
                    this._sendState(userId);
                    break;
                }
                default:
                    Logger.error("unknown event " + event);
            }
            this._sendState(userId);
            this._broadCastState();
        } catch (e: any) {
            Logger.error(`${e.message}\n${e.stack}`);
        }
    }

}

globalThis.PluginImpl = Plugin;
