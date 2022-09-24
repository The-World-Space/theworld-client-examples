import { ImmutConvertable } from "src/plugin/types/Immutable";

interface ReadonlyVector2 {
    readonly x: number;
    readonly y: number;
}

export class Vector2 implements ImmutConvertable<ReadonlyVector2> {
    public x: number;
    public y: number;

    public constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    public freeze(): ReadonlyVector2 {
        return Object.freeze(this);
    }

    public copy(other: ReadonlyVector2): Vector2 {
        this.x = other.x;
        this.y = other.y;
        return this;
    }

    public clone(): Vector2 {
        return new Vector2(this.x, this.y);
    }

    public set(x: number, y: number): Vector2 {
        this.x = x;
        this.y = y;

        return this;
    }

    public equals(other: ReadonlyVector2): boolean {
        return this.x === other.x && this.y === other.y;
    }

    public length(): number {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    public lengthSquared(): number {
        return this.x * this.x + this.y * this.y;
    }
}
