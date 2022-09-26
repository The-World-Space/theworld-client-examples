export class DebounceExecuter {
    private readonly _delay: number;
    private _timer: ReturnType<typeof setTimeout>|null = null;

    public constructor(delay = 500) {
        this._delay = delay;
    }

    public execute(callback: () => void): void {
        if (this._timer !== null) {
            clearTimeout(this._timer);
        }

        this._timer = setTimeout(callback, this._delay);
    }
}
