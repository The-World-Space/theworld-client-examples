
import React from "react";
import { Input } from "webmidi";

function Key({ index, isPressed, setPressed, isByMe } : { index:number, isPressed:boolean, setPressed:(pressed:boolean)=>void, isByMe:boolean }) {
    const indexInOctave = index % 12;
    const isWhite = [0,2,4,5,7,9,11].includes(indexInOctave);

    const classNames = ["key", isWhite ? "white" : "black", isPressed ? "pressed" : ""];

    return (
        <div className={classNames.join(" ")} style={{
            "--posIndex": Math.floor(index/12)*14 + indexInOctave + (indexInOctave>=5 ? 1 : 0)
        } as any}
        onMouseDown={e => {
            setPressed(true);
        }}
        onMouseUp={e => {
            setPressed(false);
        }}
        onMouseLeave={e => {
            if(isByMe) setPressed(false);
        }}
        onMouseEnter={e => {
            if(!!e.buttons) setPressed(true);
        }}/>
    );
}

export default Key;