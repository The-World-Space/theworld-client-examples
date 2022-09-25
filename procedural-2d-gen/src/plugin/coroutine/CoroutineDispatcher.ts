import { Logger } from "../helper/Logger";
import { Coroutine } from "./Coroutine";
import { CoroutineIterator } from "./CoroutineIterator";
import { CoroutineProcessor } from "./CoroutineProcessor";
import { Time } from "./Time";

export class CoroutineDispatcher {
    private readonly _logger: Logger;
    private readonly _time: Time;
    private readonly _coroutineProcessor: CoroutineProcessor;
    private _setIntervalId: ReturnType<typeof setInterval>|null;

    public constructor(logger: Logger, updateInterval = 10) {
        this._logger = logger;
        const time = this._time = new Time();
        this._coroutineProcessor = new CoroutineProcessor(time);

        time.start();

        this._setIntervalId = setInterval(() => {
            try {
                this.update();
            } catch(e) {
                this._logger.error(e);
            }
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
