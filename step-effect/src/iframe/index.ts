import "./index.css";

import { Client } from "theworld-client";
import { $INLINE_FILE } from "ts-transformer-inline-file";

const pluginName = "project-template";

type Circle = {
    x: number;
    y: number;
    radius: number;
    opacity: number;
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


    const canvas = document.getElementById("canvas")! as HTMLCanvasElement;
    const ctx = canvas.getContext("2d")!;
    canvas.width = innerWidth;
    canvas.height = innerHeight;

    const circles = new Set<Circle>();

    plugin.on("step", (x: number, y: number) => {
        circles.add({
            x,
            y,
            radius: 0,
            opacity: 1
        });
    });

    function frameLoop(): void {
        frame();
        requestAnimationFrame(frameLoop);
    }

    function frame(): void {
        update();
        render();
    }

    let lastTime = performance.now() / 1000;
    function update(): void {
        const currentTime = performance.now() / 1000;
        const deltaTime = currentTime - lastTime;

        const circlesToRemove = new Set<Circle>();
        for(const circle of circles) {
            circle.opacity = Math.max(circle.opacity - 0.5*deltaTime, 0);
            circle.radius += 3*deltaTime;

            if(circle.opacity === 0) {
                circlesToRemove.add(circle);
            }
        }

        for(const circle of circlesToRemove) {
            circles.delete(circle);
        }

        lastTime = currentTime;
    }

    const tilePixel = 50;
    frameLoop();
    function render(): void {
        ctx.clearRect(0, 0, innerWidth, innerHeight);
        for(const circle of circles) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(0, 0, 0, ${circle.opacity})`;
            // ctx.lineWidth = circle.radius / 4 * tilePixel;
            ctx.arc((circle.x + 0.5) * tilePixel, innerHeight - (circle.y + 0.5) * tilePixel, circle.radius * tilePixel, 0, Math.PI*2);
            ctx.stroke();
        }
    }
}

main();
