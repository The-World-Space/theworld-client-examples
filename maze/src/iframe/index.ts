import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

import { DebounceExecuter } from "./helper/DebounceExecuter";

const pluginName = "maze-generator";

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
            plugin.emit("seed-input", parseInt(seedInput.value));
        });
    };
    plugin.on("seed", (seed: number) => {
        seedInput.value = seed.toString();
    });
    plugin.emit("request-seed");
}

main();
