import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

const pluginName = "project-template";

enum Direction {
    up = 0,
    right = 1,
    down = 2,
    left = 3
}

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


    // Setup
    const setupUiDiv = document.getElementById("setup")!;

    plugin.on("setup", () => {
        setupUiDiv.style.display = "block";
    });
    plugin.emit("checkShouldSetup");

    const setupUpBtn = document.getElementById("setup_up")!;
    const setupRightBtn = document.getElementById("setup_right")!;
    const setupDownBtn = document.getElementById("setup_down")!;
    const setupLeftBtn = document.getElementById("setup_left")!;

    setupUpBtn.addEventListener("click", () => {
        plugin.emit("setDirection", 0);
        setupComplete();
    });
    setupRightBtn.addEventListener("click", () => {
        plugin.emit("setDirection", 1);
        setupComplete();
    });
    setupDownBtn.addEventListener("click", () => {
        plugin.emit("setDirection", 2);
        setupComplete();
    });
    setupLeftBtn.addEventListener("click", () => {
        plugin.emit("setDirection", 3);
        setupComplete();
    });

    function setupComplete(): void {
        setupUiDiv.style.display = "none";
        plugin.emit("getDirection");
    }

    plugin.on("setDirection", (direction: Direction) => {
        if(direction === Direction.up) {
            document.body.classList.add("movingWalkwayBackgroundUp");
        } else if(direction === Direction.right) {
            document.body.classList.add("movingWalkwayBackgroundRight");
        } else if(direction === Direction.down) {
            document.body.classList.add("movingWalkwayBackgroundDown");
        } else if(direction === Direction.left) {
            document.body.classList.add("movingWalkwayBackgroundLeft");
        }
    });
    plugin.emit("getDirection");
}

main();
