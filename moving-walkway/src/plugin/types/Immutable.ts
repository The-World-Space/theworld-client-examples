export type ImmutConvertable<T = any> = T & {
    freeze(): T;
};

export type Immutable<T extends ImmutConvertable> = 
    T extends ImmutConvertable<infer U>
        ? U
        : never;
