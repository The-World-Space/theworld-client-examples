/**
 * base class for all yield instructions
 */
export class YieldInstruction { }

/**
 * suspends the coroutine execution for the given amount of seconds
 */
export class WaitForSeconds extends YieldInstruction {
    private readonly _seconds: number;
    public constructor(seconds: number) {
        super();
        this._seconds = seconds;
    }
    public get seconds(): number {
        return this._seconds;
    }
}

/**
 * suspends the coroutine execution until the supplied delegate evaluates to true
 */
export class WaitUntil extends YieldInstruction {
    private readonly _predicate: () => boolean;
    public constructor(predicate: () => boolean) {
        super();
        this._predicate = predicate;
    }
    public get predicate(): () => boolean {
        return this._predicate;
    }
}

/**
 * suspends the coroutine execution until the supplied delegate evaluates to false
 */
export class WaitWhile extends YieldInstruction {
    private readonly _predicate: () => boolean;
    public constructor(predicate: () => boolean) {
        super();
        this._predicate = predicate;
    }
    public get predicate(): () => boolean {
        return this._predicate;
    }
}
