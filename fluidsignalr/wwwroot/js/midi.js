console.log("MIDI HERE!", "2");

function connect() {
    navigator.requestMIDIAccess()
        .then(
            (midi) => midiReady(midi),
            (err) => console.log('Something went wrong', err));
}

function midiReady(midi) {
    // Also react to device changes.
    midi.addEventListener('statechange', (event) => {
        console.log("midi STATE CHANGE", event);
        initDevices(event.target);
    });
    initDevices(midi); // see the next section!
}


function initDevices(midi) {
    console.log("MIDI initDevices", midi);
    // Reset.
    let midiIn = [];
    let midiOut = [];

    // MIDI devices that send you data.
    const inputs = midi.inputs.values();
    for (let input = inputs.next(); input && !input.done; input = inputs.next()) {
        console.log("One midi input", "name", input.value.name);
        midiIn.push(input.value);
    }

    // MIDI devices that you send data to.
    const outputs = midi.outputs.values();
    for (let output = outputs.next(); output && !output.done; output = outputs.next()) {
        midiOut.push(output.value);
    }

    startListening(midiIn);
}


// Start listening to MIDI messages.
function startListening(midiIn) {
    for (const input of midiIn) {
        console.log("Start midimessage event listener on ", input);
        input.removeEventListener('midimessage', midiMessageReceived);
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

    // Korg nanoKONTROL2.
    if (event.target.name.toLowerCase().includes("nanokontrol")) {
        // controllerNumber 0 to 7 are the sliders (value 0 to 127)
        // controllerNumber 16 to 23 are the knobs corresponding to the sliders  (value 0 to 127)
        //                  32 to 39 are the S buttons 
        //                  48 to 55 are the M buttons
        //                  64 to 71 are the R buttons
        // everything is on channel 0.

        if (parsed.channel === 0) {

            if (parsed.controllerNumber === 0) {
                config.SPLAT_FORCE = Math.floor((parsed.controllerValue / 127) * 10000);
                if (config.SPLAT_FORCE === 0) config.SPLAT_FORCE = 0.01;
                console.log("config.SPLAT_FORCE", config.SPLAT_FORCE);
                understood = true;
            }

            if (parsed.controllerNumber === 1) {
                config.SPLAT_RADIUS = parsed.controllerValue / 127;
                if (config.SPLAT_RADIUS === 0) config.SPLAT_RADIUS = 0.01;
                console.log("config.SPLAT_RADIUS", config.SPLAT_RADIUS);
                understood = true;
            }

            if (parsed.controllerNumber === 2) {
                config.DYE_RESOLUTION = 32 + ((parsed.controllerValue / 127) * 1024);
                console.log("config.DYE_RESOLUTION", config.DYE_RESOLUTION);
                config.doReinitFramebuffers = true;
                understood = true;
            }


            if (parsed.controllerNumber === 3) {
                config.SIM_RESOLUTION = 32 + ((parsed.controllerValue / 127) * 1024);
                console.log("config.SIM_RESOLUTION", config.SIM_RESOLUTION);
                config.doReinitFramebuffers = true;
                understood = true;
            }

            if (parsed.controllerNumber === 4) {
                config.CURL = (parsed.controllerValue / 127) * 50;
                console.log("config.CURL", config.CURL);
                understood = true;
            }

            if (parsed.controllerNumber === 7) {
                config.PRESSURE = (parsed.controllerValue / 127);
                console.log("config.PRESSURE", config.PRESSURE);
                understood = true;
            }


            if (parsed.controllerNumber === 16) {
                config.DENSITY_DISSIPATION = ((parsed.controllerValue / 127) - 0.5) * 4;
                console.log("config.DENSITY_DISSIPATION", config.DENSITY_DISSIPATION);
                understood = true;

            }


            if (parsed.controllerNumber === 17) {
                let knob = (parsed.controllerValue / 127);
                config.VELOCITY_DISSIPATION = knob * 10;
                console.log("config.VELOCITY_DISSIPATION", config.VELOCITY_DISSIPATION);
                understood = true;

            }


        }


    } else {
        // Traktor

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
                    config.DENSITY_DISSIPATION = ((parsed.controllerValue / 127) - 0.5) * 4;
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
    }

    if (understood) connection.invoke('config', JSON.stringify(config));
    if (!understood) console.log("Got midi message but not understood: ", event.target.name, "messsageType", parsed.messageType, "controllerNumber", parsed.controllerNumber, "channel: ", parsed.channel, "value: ", parsed.controllerValue, parsed);

}

connect();
