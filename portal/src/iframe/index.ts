import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

const pluginName = "project-template";

async function main(): Promise<void> {
    const client = new Client();
    client.addPluginPort("plugin", $INLINE_FILE("./plugin.js"), "");
    await client.connect();

    const plugin = await client.getPlugin("plugin");

    plugin.on("log", (message: any) => {
        console.log(`[${pluginName}]`, message);
    });

    plugin.on("error", (error: Error) => {
        console.error(`[${pluginName}]`, error);
    });


    const setupDiv = document.getElementById("setup")!;
    const setupBtn = document.getElementById("setup_btn")!;

    let setupId: null | string = null;

    plugin.emit("checkShouldSetup");
    plugin.on("setup", (setupId2: string) => {
        setupId = setupId2;
        setupDiv.style.display = "block";
    });
    plugin.on("setuped", () => {
        setupDiv.style.display = "none";
    });

    setupBtn.addEventListener("click", () => {
        alert("포탈의 목적지에서 입력: /setup-portal " + setupId);
    });
}

main();
