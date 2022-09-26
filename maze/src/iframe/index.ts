import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

import { DebounceExecuter } from "./helper/DebounceExecuter";

const pluginName = "maze-generator";

async function main(): Promise<void> {
    const client = new Client();
    client.addPluginPort("plugin", $INLINE_FILE("./plugin.js"), "");
    console.log("Connecting...");
    await client.connect();

    const plugin = await client.getPlugin("plugin");
    console.log("plugin loaded");
    
    plugin.on("log", (message: any) => {
        console.log(`[${pluginName}]`, message);
    });

    plugin.on("error", (error: Error) => {
        console.error(`[${pluginName}]`, error);
    });

    const positionXInput = document.getElementById("position-x") as HTMLInputElement;
    const positionYInput = document.getElementById("position-y") as HTMLInputElement;
    const positionInputEventExecutor = new DebounceExecuter();
    const positionEvent = (): void => {
        positionInputEventExecutor.execute(() => {
            plugin.emit("position-input", {
                x: parseInt(positionXInput.value),
                y: parseInt(positionYInput.value)
            });
        });
    };
    positionXInput.oninput = positionEvent;
    positionYInput.oninput = positionEvent;
    plugin.on("position", (position: { x: number, y: number }) => {
        positionXInput.value = position.x.toString();
        positionYInput.value = position.y.toString();
    });
    plugin.emit("request-position");

    const sizeXInput = document.getElementById("size-x") as HTMLInputElement;
    const sizeYInput = document.getElementById("size-y") as HTMLInputElement;
    const sizeInputEventExecutor = new DebounceExecuter();
    const sizeEvent = (): void => {
        sizeInputEventExecutor.execute(() => {
            plugin.emit("size-input", {
                x: parseInt(sizeXInput.value),
                y: parseInt(sizeYInput.value)
            });
        });
    };
    sizeXInput.oninput = sizeEvent;
    sizeYInput.oninput = sizeEvent;
    plugin.on("size", (size: { x: number, y: number }) => {
        sizeXInput.value = size.x.toString();
        sizeYInput.value = size.y.toString();
    });
    plugin.emit("request-size");

    
    const seedInput = document.getElementById("seed") as HTMLInputElement;
    const seedInputEventExecutor = new DebounceExecuter();
    seedInput.oninput = (): void => {
        seedInputEventExecutor.execute(() => {
            plugin.emit("set-seed", parseInt(seedInput.value));
        });
    };
    plugin.on("seed", (seed: number) => {
        seedInput.value = seed.toString();
    });
    plugin.emit("request-seed");
}

main();
