import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

const pluginName = "vote";

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

    const domContainer = document.getElementById("dom-container")!;
    const controlPanel = document.getElementById("control-panel")!;
    const title = document.getElementById("title")!;
    let am_i_voted = false;
    let am_i_admin = false;

    controlPanel.style.display = "block";

    function broadCastReceiver(voting: boolean, _: string[], data: [string, number][]) {
        domContainer.textContent = "";
        for (const i in data) {
            const [cand_name, cand_cnt] = data[i];
            const voteBtn = document.createElement("button");
            const voteBar = document.createElement("span");

            voteBtn.innerText = `${+i + 1}번, ${cand_name}`;
            voteBar.innerText = "#".repeat(cand_cnt) + ` (${cand_cnt})`;
            voteBtn.disabled = am_i_voted || !voting;
            voteBtn.onclick = () => {
                plugin.emit("vote", +i+1);
                console.debug("voted ", +i+1);
            };

            domContainer.appendChild(voteBtn);
            domContainer.appendChild(voteBar);
            domContainer.appendChild(document.createElement('br'));
        }

        if (!voting) {
            title.innerText = "투표가 종료되었습니다.";
        }
        else if (am_i_voted) {
            title.innerText = "투표에 참여해 주셔서 감사합니다.";
        }
        else {
            title.innerText = "투표";
        }

        controlPanel.style.display = am_i_admin ? "block" : "none";
    }

    plugin.emit("get_state");
    plugin.on("state", broadCastReceiver);
    plugin.on("pstate", (voting: any, _: any, data: any, _am_i_voted: boolean, _am_i_admin: boolean) => {
        am_i_voted = _am_i_voted;
        am_i_admin = _am_i_admin;
        broadCastReceiver(voting, _, data);

        console.log(voting, _, data, _am_i_voted, _am_i_admin);
    });

    const reset = document.getElementById("reset")!;
    const start = document.getElementById("start")!;
    const stop = document.getElementById("stop")!;
    const add = document.getElementById("add")!;

    reset.onclick = () => plugin.emit("reset");
    start.onclick = () => plugin.emit("start");
    stop.onclick = () => plugin.emit("stop");
    add.onclick = () => {
        const name = prompt("항목 이름 입력:");
        plugin.emit("add_cand", name);
    };
}

main();
