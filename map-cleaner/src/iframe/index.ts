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


    const xRadiusInput = document.getElementById("x_radius")! as HTMLInputElement;
    const yRadiusInput = document.getElementById("y_radius")! as HTMLInputElement;
    const cleanBtn = document.getElementById("clean")!;

    cleanBtn.addEventListener("click", () => {
        plugin.emit("clean", Number.parseInt(xRadiusInput.value), Number.parseInt(yRadiusInput.value));
    });
}

main();
