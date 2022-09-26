import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

import { DebounceExecuter } from "./helper/DebounceExecuter";

async function main(): Promise<void> {
    const client = new Client();
    client.addPluginPort("plugin", $INLINE_FILE("./plugin.js"), "");
    await client.connect();

    const plugin = await client.getPlugin("plugin");

    plugin.on("log", (message: any) => {
        console.log("[procedural-2d-gen]", message);
    });

    plugin.on("error", (error: Error) => {
        console.error("[procedural-2d-gen]", error);
    });

    const chunkSizeInput = document.getElementById("chunk-size") as HTMLInputElement;
    const chunkSizeInputEventExecutor = new DebounceExecuter();
    chunkSizeInput.addEventListener("input", event => {
        event.preventDefault();
        chunkSizeInputEventExecutor.execute(() => {
            plugin.emit("set-chunk-size", parseInt(chunkSizeInput.value));
        });
    });
    plugin.on("set-chunk-size", (chunkSize: number) => {
        chunkSizeInput.value = chunkSize.toString();
    });
    
    const viewDistanceInput = document.getElementById("view-distance") as HTMLInputElement;
    const viewDistanceInputEventExecutor = new DebounceExecuter();
    viewDistanceInput.addEventListener("input", event => {
        event.preventDefault();
        viewDistanceInputEventExecutor.execute(() => {
            plugin.emit("set-player-view-distance", parseInt(viewDistanceInput.value));
        });
    });
    plugin.on("set-player-view-distance", (viewDistance: number) => {
        viewDistanceInput.value = viewDistance.toString();
    });

    const seedInput = document.getElementById("seed") as HTMLInputElement;
    const seedInputEventExecutor = new DebounceExecuter();
    seedInput.addEventListener("input", event => {
        event.preventDefault();
        seedInputEventExecutor.execute(() => {
            plugin.emit("set-seed", seedInput.value);
        });
    });
}

main();
