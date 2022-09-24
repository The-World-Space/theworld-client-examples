import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

async function main(): Promise<void> {
    const client = new Client();
    client.addPluginPort("plugin", $INLINE_FILE("./plugin.js"), "");
    await client.connect();
}

main();
