
declare module "react-riffs" {
    import { Input, IEventNote, InputEventNoteon } from "webmidi";
    export function useMidiInputs(): Input[];
    export function useClock(input : Input): [number, boolean];
    export function useControl(input : Input): number;
    export function useNote(input : Input): [InputEventNoteon, boolean];
    export function useNotes(input : Input): InputEventNoteon[];
    export function usePitchbend(input : Input): number;
}