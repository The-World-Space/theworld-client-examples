import { Logger } from "../helper/Logger";
import { Coroutine } from "./Coroutine";
import { CoroutineIterator } from "./CoroutineIterator";
import { CoroutineProcessor } from "./CoroutineProcessor";
import { Time } from "./Time";

export class CoroutineDispatcher {
    private readonly _time: Time;
    private readonly _coroutineProcessor: CoroutineProcessor;
    private _setTimeoutlId: ReturnType<typeof setTimeout>|null = null;

    public constructor(updateInterval = 10) {
        const time = this._time = new Time();
        this._coroutineProcessor = new CoroutineProcessor(time);

        time.start();

        const requestFrame = (): void => {
            this._setTimeoutlId = setTimeout(() => {
                requestFrame();
            }, updateInterval);

            try {
                this.update();
            } catch (e: any) {
                Logger.error(`${e.message}\n${e.stack}`);
            }
        };

        requestFrame();
    }

    private readonly update = (): void => {
        this._time.update();
        this._coroutineProcessor.process();
        this._coroutineProcessor.tryCompact();
    };

    public startCoroutine(coroutineIterator: CoroutineIterator): Coroutine {
        const coroutine = new Coroutine(coroutineIterator);
        coroutine.fatchNextInstruction();
        this._coroutineProcessor.addCoroutine(coroutine);
        return coroutine;
    }

    public stopCoroutine(coroutine: Coroutine): void {
        this._coroutineProcessor.removeCoroutine(coroutine);
    }

    public dispose(): void {
        if (this._setTimeoutlId !== null) {
            clearTimeout(this._setTimeoutlId);
            this._setTimeoutlId = null;
        }
    }
}
