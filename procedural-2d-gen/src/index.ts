import { Client } from "theworld-client";

async function main(): Promise<void> {
    const textDiv = document.getElementById("text")!;
    const onButton = document.getElementById("onButton")!;
    const offButton = document.getElementById("offButton")!;

    const client = new Client();
    client.addPluginPort("ang", `
    globalThis.Plugin = class Plugin extends BasePlugin {
        isOn = false;
        onLoad() {

        }
        onPlayerMove(playerId, x, y) {
            if(this.isOn) {
                this.broadcastMessage("playerMove", playerId, x, y);
                this.setTile(x, y, 70, 20, false);
            }
        }
        onMessage(playerId, message, ...args) {
            this.broadcastMessage("WTF", playerId, message);
            if(message === "setEnabled") {
                this.isOn = args[0] === true;
            }
        }
        onChat(playerId, message) {
            
        }
    }
    `, "");
    await client.connect();
    
    const plugin = await client.getPlugin("ang");

    plugin.on("playerMove", (playerId: string, x: number, y: number) => {
        textDiv.innerText = `${playerId} ${x} ${y}`;
    });

    onButton.addEventListener("click", () => {
        plugin.emit("setEnabled", true);
    });
    offButton.addEventListener("click", () => {
        plugin.emit("setEnabled", false);
    });
}

main();
