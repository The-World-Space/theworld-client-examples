
import React from 'react';
import Keyboard from './Keyboard';
import { useAsync } from 'react-use';

import { useMidiInputs } from 'react-riffs';
import { getInstrumentNames, ReactMobxMusic } from 'react-mobx-music';
import URL from 'url-parse';

import { useClient } from 'theworld-client-react';

function App() {
    const url = new URL(location.href, true);
    const client = useClient();

    const length = parseInt(url.query.size || '60');
    const startTone = parseInt(url.query.start || '30');
    const instrument : any = url.query.instrument || 'acoustic_grand_piano';
    const enableMidi = url.query.midi === '0' ? false : true;

    const keyBroadcaster = useAsync(() => client.getBroadcaster('key'));

    if(!getInstrumentNames().includes(instrument)) {
        return (
            <div>
                그런 악기는 없습니다. 대신 다음 악기들 중에서 골라 보세요.
                <p>{
                    getInstrumentNames().join(', ')
                }
                </p>
            </div>
        );
    }

    return (
        <ReactMobxMusic instrumentNames={[instrument]}>
            {({ isLoading, instruments }) =>
                isLoading || keyBroadcaster.loading ? (
                    <div>Loading</div>
                ) : (
                    <Keyboard length={length} startTone={startTone} enableMidi={enableMidi} instrument={instruments.get(instrument)} broadcaster={keyBroadcaster.value!}/>
                )
            }
        </ReactMobxMusic>
    )
}

export default App;