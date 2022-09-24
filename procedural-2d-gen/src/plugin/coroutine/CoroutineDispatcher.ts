import { Coroutine } from "./Coroutine";
import { CoroutineIterator } from "./CoroutineIterator";
import { CoroutineProcessor } from "./CoroutineProcessor";
import { Time } from "./Time";

export class CoroutineDispatcher {
    private readonly _time: Time;
    private readonly _coroutineProcessor: CoroutineProcessor;
    private _setIntervalId: ReturnType<typeof setInterval>|null;

    public constructor(updateInterval = 10) {
        const time = this._time = new Time();
        this._coroutineProcessor = new CoroutineProcessor(time);

        time.start();

        this._setIntervalId = setInterval(() => {
            this.update();
        }, updateInterval);
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

    public dispose(): void {
        if (this._setIntervalId !== null) {
            clearInterval(this._setIntervalId);
            this._setIntervalId = null;
        }
    }
}
