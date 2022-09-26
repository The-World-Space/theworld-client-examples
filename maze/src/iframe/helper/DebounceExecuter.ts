export class DebounceExecuter {
    private readonly _delay: number;
    private _timer: number|null = null;

    public constructor(delay = 500) {
        this._delay = delay;
    }

    public execute(callback: () => void): void {
        if (this._timer !== null) {
            window.clearTimeout(this._timer);
        }

        this._timer = window.setTimeout(callback, this._delay);
    }
}
