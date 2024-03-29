export class Time {
    private _oldTime: number;

    private _time: number;
    private _unscaledTime: number;
    private _deltaTime: number;
    private _unscaledDeltaTime: number;
    private _timeScale: number;

    public constructor() {
        this._oldTime = 0;
        this._time = 0;
        this._unscaledTime = 0;
        this._deltaTime = 0;
        this._unscaledDeltaTime = 0;
        this._timeScale = 1;
    }

    public start(): void {
        this._oldTime = Date.now();
    }

    public update(): void {
        const now = Date.now();
        const unscaledDeltaTime = (now - this._oldTime) / 1000;
        this._unscaledDeltaTime = unscaledDeltaTime;
        this._unscaledTime += unscaledDeltaTime;
        this._deltaTime = unscaledDeltaTime * this._timeScale;
        this._time += this._deltaTime;
        this._oldTime = now;
    }

    /**
     * The time at the beginning of this frame.
     */
    public get time(): number {
        return this._time;
    }

    /**
     * The timeScale-independent time for this frame (Read Only). This is the time in seconds since the start of the game.
     */
    public get unscaledTime(): number {
        return this._unscaledTime;
    }
    
    /**
     * the interval in seconds from the last frame to the current one.
     */
    public get deltaTime(): number {
        return this._deltaTime;
    }

    /**
     * The timeScale-independent interval in seconds from the last frame to the current one.
     */
    public get unscaledDeltaTime(): number {
        return this._unscaledDeltaTime;
    }

    /** 
     * The scale at which time passes. (default: 1)
     */
    public get timeScale(): number {
        return this._timeScale;
    }

    /** 
     * The scale at which time passes. (default: 1)
     */
    public set timeScale(value: number) {
        this._timeScale = value;
    }
}
