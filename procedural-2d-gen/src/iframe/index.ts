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
    chunkSizeInput.oninput = (event): void => {
        event.preventDefault();
        chunkSizeInputEventExecutor.execute(() => {
            plugin.emit("set-chunk-size", parseInt(chunkSizeInput.value));
        });
    };
    plugin.on("chunk-size", (chunkSize: number) => {
        console.log("[procedural-2d-gen] chunk-size", chunkSize);
        chunkSizeInput.value = chunkSize.toString();
    });
    plugin.emit("request-chunk-size");
    
    const viewDistanceInput = document.getElementById("view-distance") as HTMLInputElement;
    const viewDistanceInputEventExecutor = new DebounceExecuter();
    viewDistanceInput.oninput = (event): void => {
        event.preventDefault();
        viewDistanceInputEventExecutor.execute(() => {
            plugin.emit("set-player-view-distance", parseInt(viewDistanceInput.value));
        });
    };
    plugin.on("player-view-distance", (viewDistance: number) => {
        viewDistanceInput.value = viewDistance.toString();
    });
    plugin.emit("request-player-view-distance");

    const seedInput = document.getElementById("seed") as HTMLInputElement;
    const seedInputEventExecutor = new DebounceExecuter();
    seedInput.oninput = (event): void => {
        event.preventDefault();
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
