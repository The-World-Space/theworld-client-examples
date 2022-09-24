globalThis.Plugin = class Plugin extends BasePlugin {
    public onLoad() {

    }
    
    public onPlayerMove(playerId, x, y) {
        if(this.isOn) {
            this.broadcastMessage("playerMove", playerId, x, y);
            this.setTile(x, y, 70, 20, false);
        }
    }

    public onMessage(playerId, message, ...args) {
        this.broadcastMessage("WTF", playerId, message);
        if(message === "setEnabled") {
            this.isOn = args[0] === true;
        }
    }
};
