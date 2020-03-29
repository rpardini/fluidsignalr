console.log("MIDI HERE!", "2");

function connect() {
    navigator.requestMIDIAccess()
        .then(
            (midi) => midiReady(midi),
            (err) => console.log('Something went wrong', err));
}

function midiReady(midi) {
    // Also react to device changes.
    midi.addEventListener('statechange', (event) => initDevices(event.target));
    initDevices(midi); // see the next section!
}


function initDevices(midi) {
    // Reset.
    midiIn = [];
    midiOut = [];

    // MIDI devices that send you data.
    const inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        midiIn.push(input.value);
    }

    // MIDI devices that you send data to.
    const outputs = midi.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOut.push(output.value);
    }

    startListening();
}


// Start listening to MIDI messages.
function startListening() {
    for (const input of midiIn) {
        console.log("Start midimessage event listener on ", input);
        input.addEventListener('midimessage', midiMessageReceived);
    }
}

function midiMessageReceived(event) {
    let parsed = midimessage(event);

    let understood = false;

    if (parsed.messageType === "noteon") {
        if (parsed.velocity === 127) { // only on touch
            randomSplatsNow((parsed.key * 1) - 2);
            understood = true;
        }
    }

    if (parsed.messageType === "controlchange") {
        if (parsed.controllerNumber === 42) {
            // pitch sliders
            if (parsed.channel === 1) {
                console.log("LEFT PITCH: ", parsed.controllerValue);
                // transpose 0 to 0.01, 127 to 1.0
                config.PRESSURE = (parsed.controllerValue / 127) * 2;
                console.log("config.PRESSURE", config.PRESSURE);
                understood = true;
            }
            if (parsed.channel === 3) {
                console.log("RIGHT PITCH: ", parsed.controllerValue);
                // transpose 0 to 0.01, 127 to 1.0
                config.DYE_RESOLUTION = 32 + ((parsed.controllerValue / 127) * 1024);
                console.log("config.DYE_RESOLUTION", config.DYE_RESOLUTION);
                config.doReinitFramebuffers = true;
                understood = true;
            }
        }


        if (parsed.controllerNumber === 1) {
            if (parsed.channel === 5) {
                // the left main level knob. value is 0 to 127.
                console.log("LEFT LEVEL MAIN: ", parsed.controllerValue);
                // transpose 0 to 0.01, 127 to 1.0
                config.SPLAT_RADIUS = parsed.controllerValue / 127;
                if (config.SPLAT_RADIUS === 0) config.SPLAT_RADIUS = 0.01;
                console.log("config.SPLAT_RADIUS", config.SPLAT_RADIUS);
                understood = true;
            }

            if (parsed.channel === 7) {
                // the left main level knob. value is 0 to 127.
                console.log("MIXER SLIDER: ", parsed.controllerValue);
                // transpose 0 to 0, 127 to 1.0
                //config.PRESSURE = parsed.controllerValue / 127;
                //console.log("config.PRESSURE", config.PRESSURE);
                //config.PRESSURE_ITERATIONS = (parsed.controllerValue / 127) * 200;
                //console.log("config.PRESSURE_ITERATIONS", config.PRESSURE);

                config.SIM_RESOLUTION = 32 + ((parsed.controllerValue / 127) * 128);
                console.log("config.SIM_RESOLUTION", config.SIM_RESOLUTION);
                config.doReinitFramebuffers = true;


                understood = true;
            }

            if (parsed.channel === 6) {
                // the right main level knob. value is 0 to 127.
                console.log("RIGHT LEVEL MAIN: ", parsed.controllerValue);
                // transpose 0 to 0, 127 to 1.0
                config.CURL = (parsed.controllerValue / 127) * 50;
                console.log("config.CURL", config.CURL);
                understood = true;
            }


        }
        if (parsed.controllerNumber === 2) {
            if (parsed.channel === 5) {
                console.log("LEFT EFFECT KNOB: ", parsed.controllerValue);
                // transpose 0 to 0.01, 127 to 1.0
                config.DENSITY_DISSIPATION = ((parsed.controllerValue / 127)  - 0.5) * 4;
                console.log("config.DENSITY_DISSIPATION", config.DENSITY_DISSIPATION);
                understood = true;
            }

            if (parsed.channel === 6) {
                console.log("RIGHT EFFECT KNOB: ", parsed.controllerValue);
                // transpose 0 to 0, 127 to 1.0
                let knob = (parsed.controllerValue / 127) - 0.5;
                config.VELOCITY_DISSIPATION = knob * 4;
                console.log("config.VELOCITY_DISSIPATION", config.VELOCITY_DISSIPATION);
                understood = true;
            }


        }


    }

    if (understood) connection.invoke('config', JSON.stringify(config));
    if (!understood) console.log("Got midi message but not understood: ", "messsageType", parsed.messageType, "controllerNumber", parsed.controllerNumber, "channel: ", parsed.channel, "value: ", parsed.controllerValue, parsed);

}

connect();
