
export function* range(a : number, b? : number, step? : number) {
    let count;
    let max;
    if(arguments.length === 0) {
        throw new TypeError("range expected 1 arguments, got 0");
    } else if(arguments.length >= 4) {
        throw new TypeError(`range expected at most 3 arguments, got ${arguments.length}`);
    } else if(arguments.length === 1) {
        count = 0;
        max = a;
        step = 1;
    } else if(arguments.length === 2) {
        count = a;
        max = b;
        step = 1;
    } else if(arguments.length === 3) {
        count = a;
        max = b;
        step = step;
    }
    while(count < max) {
        yield count;
        count += step;
    }
};