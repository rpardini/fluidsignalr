export const name = "nanoKontrol2";

const nanoKontrol2_button_PARAM1_SOLO = 32;
const nanoKontrol2_button_PARAM2_SOLO = 33;
const nanoKontrol2_button_PARAM3_SOLO = 34;
const nanoKontrol2_button_PARAM4_SOLO = 35;
const nanoKontrol2_button_PARAM5_SOLO = 36;
const nanoKontrol2_button_PARAM6_SOLO = 37;
const nanoKontrol2_button_PARAM7_SOLO = 38;
const nanoKontrol2_button_PARAM8_SOLO = 39;
const nanoKontrol2_button_PARAM1_MUTE = 48;
const nanoKontrol2_button_PARAM2_MUTE = 49;
const nanoKontrol2_button_PARAM3_MUTE = 50;
const nanoKontrol2_button_PARAM4_MUTE = 51;
const nanoKontrol2_button_PARAM5_MUTE = 52;
const nanoKontrol2_button_PARAM6_MUTE = 53;
const nanoKontrol2_button_PARAM7_MUTE = 54;
const nanoKontrol2_button_PARAM8_MUTE = 55;
const nanoKontrol2_button_PARAM1_RECORD = 64;
const nanoKontrol2_button_PARAM2_RECORD = 65;
const nanoKontrol2_button_PARAM3_RECORD = 66;
const nanoKontrol2_button_PARAM4_RECORD = 67;
const nanoKontrol2_button_PARAM5_RECORD = 68;
const nanoKontrol2_button_PARAM6_RECORD = 69;
const nanoKontrol2_button_PARAM7_RECORD = 70;
const nanoKontrol2_button_PARAM8_RECORD = 71;

const nanoKontrol2_slidersGroupButtons = [
    [
        nanoKontrol2_button_PARAM1_SOLO,
        nanoKontrol2_button_PARAM2_SOLO,
        nanoKontrol2_button_PARAM3_SOLO,
        nanoKontrol2_button_PARAM4_SOLO,
        nanoKontrol2_button_PARAM5_SOLO,
        nanoKontrol2_button_PARAM6_SOLO,
        nanoKontrol2_button_PARAM7_SOLO,
        nanoKontrol2_button_PARAM8_SOLO
    ],
    [
        nanoKontrol2_button_PARAM1_MUTE,
        nanoKontrol2_button_PARAM2_MUTE,
        nanoKontrol2_button_PARAM3_MUTE,
        nanoKontrol2_button_PARAM4_MUTE,
        nanoKontrol2_button_PARAM5_MUTE,
        nanoKontrol2_button_PARAM6_MUTE,
        nanoKontrol2_button_PARAM7_MUTE,
        nanoKontrol2_button_PARAM8_MUTE
    ],
    [
        nanoKontrol2_button_PARAM1_RECORD,
        nanoKontrol2_button_PARAM2_RECORD,
        nanoKontrol2_button_PARAM3_RECORD,
        nanoKontrol2_button_PARAM4_RECORD,
        nanoKontrol2_button_PARAM5_RECORD,
        nanoKontrol2_button_PARAM6_RECORD,
        nanoKontrol2_button_PARAM7_RECORD,
        nanoKontrol2_button_PARAM8_RECORD
    ]
];

/**
 * @param manufacturer{String}
 * @param name{String}
 * @returns {boolean}
 */
export function isSupportedDevice (manufacturer, name) {
    if (!name) return false;
    return name.toLowerCase().includes("nanokontrol");
}


/**
 * @param event{InputEventControlchange}
 * @param config{Object}
 * @param logger{function}
 */
export function midiInControlChange (event, config, logger) {
    let understood = false;

    if (event.controller.number === 0) {
        config.SPLAT_FORCE = Math.floor((event.value / 127) * 10000);
        if (config.SPLAT_FORCE === 0) config.SPLAT_FORCE = 0.01;
        logger("SPLAT_FORCE", config.SPLAT_FORCE);
        understood = true;
    }

    if (event.controller.number === 1) {
        config.SPLAT_RADIUS = event.value / 127;
        if (config.SPLAT_RADIUS === 0) config.SPLAT_RADIUS = 0.01;
        logger("SPLAT_RADIUS", config.SPLAT_RADIUS);
        understood = true;
    }

    if (event.controller.number === 2) {
        config.DYE_RESOLUTION = 32 + ((event.value / 127) * 1024);
        logger("DYE_RESOLUTION", config.DYE_RESOLUTION);
        config.doReinitFramebuffers = true;
        understood = true;
    }


    if (event.controller.number === 3) {
        config.SIM_RESOLUTION = 32 + ((event.value / 127) * 1024);
        logger("SIM_RESOLUTION", config.SIM_RESOLUTION);
        config.doReinitFramebuffers = true;
        understood = true;
    }

    if (event.controller.number === 4) {
        config.CURL = (event.value / 127) * 50;
        logger("CURL", config.CURL);
        understood = true;
    }

    if (event.controller.number === 7) {
        config.PRESSURE = (event.value / 127);
        logger("PRESSURE", config.PRESSURE);
        understood = true;
    }


    if (event.controller.number === 16) {
        config.DENSITY_DISSIPATION = ((event.value / 127) - 0.5) * 4;
        logger("DENSITY_DISSIPATION", config.DENSITY_DISSIPATION);
        understood = true;

    }

    if (event.controller.number === 17) {
        config.VELOCITY_DISSIPATION = ((event.value / 127) - 0.5) * 4;
        logger("VELOCITY_DISSIPATION", config.VELOCITY_DISSIPATION);
        understood = true;
    }

    if (!understood) {
        logger(`Unknown MIDI CC: ${event.controller.number}/${event.value} on '${event.target.name}'`);
        //console.warn("Got midi message but not understood: ", event.target.name, "messsageType", event.type, "controllerNumber", event.controller.number, "channel: ", event.channel, "value: ", event.value);
    }

    return understood;
}

/**
 * @param port{Output}
 * @returns {splatHook}
 */
export function midiSplatHandler (port) {
    // reset all the leds to off initially
    nanoKontrol2_slidersGroupButtons.forEach(rows => {
        rows.forEach(button => {
            port.sendControlChange(button, 0);
        });
    });
    // return the handler that's invoked on splats
    let splatHook = (x, y, dx, dy, realColor) => {
        // x goes from 0.00 to 1.00 (left to right)
        let buttonX = Math.ceil((x + 0.00) * 8);
        buttonX = buttonX < 1 ? 1 : buttonX;
        // y goes from 1.00 to 0.00 (top to bottom)
        let buttonY = Math.ceil((1.00 - y) * 3);
        buttonY = buttonY < 1 ? 1 : buttonY;

        // now find the button for that x, y
        let theButton = nanoKontrol2_slidersGroupButtons[buttonY - 1][buttonX - 1];
        port.sendControlChange(theButton, 127, "all");
        port.sendControlChange(theButton, 0, "all", {time: "+500"});
    }
    return splatHook;
}
