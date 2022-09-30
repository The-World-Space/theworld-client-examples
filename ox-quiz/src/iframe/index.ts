import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

const pluginName = "ox-quiz";

enum OX {
    O = 1,
    X = 0,
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

    plugin.emit("init");

    const quiz = document.getElementById("quiz")!;
    let answer = OX.O;

    function reciver(question: string, playing: boolean) {
        quiz.innerText = question;
        if (!playing) {
            quiz.innerHTML += "<br>정답은:" + (answer ? "O" : "X")
        }
    }

    plugin.on("pub_state", reciver);
    plugin.on("priv_state", (q: any, p: any, _answer: OX) => {
        answer = _answer;
        reciver(q, p);
    })
}

main();
