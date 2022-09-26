import { CoroutineIterator } from "./CoroutineIterator";
import { YieldInstruction } from "./YieldInstruction";

export class Coroutine {
    private _elapsedTime: number;
    private readonly _coroutineIterator: CoroutineIterator;
    private _currentYieldInstruction: YieldInstruction|null;
    private _isCurrenYieldInstructionExist: boolean;
    private _onFinish: (() => void)|null;

    public constructor(coroutineIterator: CoroutineIterator, onFinish?: () => void) {
        this._elapsedTime = 0;
        this._coroutineIterator = coroutineIterator;
        this._currentYieldInstruction = null;
        this._isCurrenYieldInstructionExist = false;
        this._onFinish = onFinish ?? null;
    }

    public get elapsedTime(): number {
        return this._elapsedTime;
    }

    public set elapsedTime(value: number) {
        this._elapsedTime = value;
    }

    public get currentYieldInstruction(): YieldInstruction|null {
        return this._currentYieldInstruction;
    }

    public get currentYieldInstructionExist(): boolean {
        return this._isCurrenYieldInstructionExist;
    }

    public fatchNextInstruction(): YieldInstruction|null {
        const result = this._coroutineIterator.next();
        if (result.done) {
            this._currentYieldInstruction = null;
            this._isCurrenYieldInstructionExist = false;
            this._onFinish?.();
            this._onFinish = null;
            return null;
        }
        this._currentYieldInstruction = result.value;
        this._isCurrenYieldInstructionExist = true;
        return this._currentYieldInstruction;
    }
}
