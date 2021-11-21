
import { NotePlayer } from "mobx-music";
import { useClient } from "theworld-client-react";
import React, { useEffect, useState } from "react";
import { useMidiInputs, useNote, useNotes } from "react-riffs";
import { Input } from "webmidi";
import Key from "./Key";
import { Broadcaster } from "theworld-client";

function noteNumToStr(num : number) {
    const pianoNum = num - 20;
    const indexInOctave = (pianoNum + 11)%12;
    return ["A","A#","B","C","C#","D","D#","E","F","F#","G","G#"][indexInOctave] + Math.floor((pianoNum+8)/12);
}

interface Note {
    pressed: boolean;
    velocity: number;
};

function Keyboard({ length, enableMidi, startTone, instrument, broadcaster } : { length:number, enableMidi:boolean, startTone:number, instrument:NotePlayer, broadcaster: Broadcaster }) {
    let [midiInput] = enableMidi ? useMidiInputs() : [null];
    const [notes, setNotes] = useState<Note[]>(new Array(length).fill({
        pressed: false,
        velocity: 0.5
    }));
    const [note, isOn] = useNote(midiInput);
    const [enabled, setEnabled] = useState(false);
    const [pressedKeyI, setPressedKeyI] = useState(-1);
    const client = useClient();

    function setNote(index : number, pressed : boolean, velocity : number) {
        const note = { pressed, velocity };
        setNotes(notes => notes.map((note_, i) => 
            i === index ? note : note_
        ));
    }

    useEffect(() => {
        if(!note.type) return;
        if(!enabled) return;
        const index = note.note.number - startTone;
        if(index >= 0 && index < length) {
            broadcaster.emit("key", index, isOn, note.velocity);
        }
    }, [note]);

    useEffect(() => {
        if(!client) return;
        function onKey(userId : string, index : number, isPressed : boolean, velocity:number) {
            setNote(index, isPressed, velocity);
        }

        broadcaster.on("key", onKey);

        return () =>{
            broadcaster.off("key", onKey);
        };
    }, [client]);

    for(const i in notes) {
        const note = notes[i];
        const noteStr = noteNumToStr(Number(i) + startTone);
        useEffect(() => {
            if(note.pressed) {
                instrument.play(noteStr, {
                    gain: note.velocity*100
                });
            } else {
                instrument.stop(noteStr);
            }
        }, [note]);
    }

    function setPressed(index : number, pressed : boolean) {
        if(!enabled) return;
        setPressedKeyI(pressed ? index : -1);
        broadcaster.emit("key", index, pressed, 0.5);
    }

    return (
        <div className="keyboard">
            <div className="bar">
                <input type="checkbox" onChange={e => setEnabled(e.target.checked)} checked={enabled}/>
            </div>
            <div className="keys" style={{
                "--length": length
            } as any}>
            {
                new Array(length).fill(null).map((note, i) =>
                    <Key index={i} key={i} isPressed={notes[i].pressed} setPressed={pressed => setPressed(i, pressed)} isByMe={i === pressedKeyI}/>
                )
            }
            </div>
        </div>
    );
}

export default Keyboard;