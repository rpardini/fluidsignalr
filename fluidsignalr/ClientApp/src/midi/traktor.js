export const name = "Traktor";

/**
 * @param manufacturer{String}
 * @param name{String}
 * @returns {boolean}
 */
export function isSupportedDevice (manufacturer, name) {
    if (!name) return false;
    return name.toLowerCase().includes("traktor");
}

/**
 * @param event{InputEventNoteon}
 * @param config{Object}
 * @param logger{function}
 * @param randomSplatsNow{function}
 */
export function midiInNoteOn (event, config, logger, randomSplatsNow) {
    logger(`Traktor MIDI Note: ${event.note.name} (${event.note.number}) channel ${event.channel} on '${event.target.name}'`);
    let numRandomSplats = (event.note.number % 10);
    randomSplatsNow(numRandomSplats > 0 ? numRandomSplats : 1);
    return false; // do not broadcast config change.
}

/**
 * @param event{InputEventControlchange}
 * @param config{Object}
 * @param logger{function}
 */
export function midiInControlChange (event, config, logger) {
    let understood = false;

    if (event.controller.number === 42 && event.channel === 2) { // left tempo
        config.SPLAT_FORCE = Math.floor((event.value / 127) * 10000);
        if (config.SPLAT_FORCE === 0) config.SPLAT_FORCE = 0.01;
        logger("SPLAT_FORCE", config.SPLAT_FORCE);
        understood = true;
    }

    if (event.controller.number === 1 && event.channel === 6) { // left level
        config.SPLAT_RADIUS = event.value / 127;
        if (config.SPLAT_RADIUS === 0) config.SPLAT_RADIUS = 0.01;
        logger("SPLAT_RADIUS", config.SPLAT_RADIUS);
        understood = true;
    }

    if (event.controller.number === 1 && event.channel === 7) { // right level
        config.DYE_RESOLUTION = 32 + ((event.value / 127) * 1024);
        logger("DYE_RESOLUTION", config.DYE_RESOLUTION);
        config.doReinitFramebuffers = true;
        understood = true;
    }


    if (event.controller.number === 1 && event.channel === 8) { // horizontal mixer slider
        config.SIM_RESOLUTION = 32 + ((event.value / 127) * 1024);
        logger("SIM_RESOLUTION", config.SIM_RESOLUTION);
        config.doReinitFramebuffers = true;
        understood = true;
    }

    if (event.controller.number === 3 && event.channel === 6) { // left bass knob
        config.CURL = (event.value / 127) * 50;
        logger("CURL", config.CURL);
        understood = true;
    }

    if (event.controller.number === 3 && event.channel === 7) { // right bass knob
        config.PRESSURE = (event.value / 127);
        logger("PRESSURE", config.PRESSURE);
        understood = true;
    }


    if (event.controller.number === 2 && event.channel === 6) { // left effect
        config.DENSITY_DISSIPATION = ((event.value / 127) - 0.5) * 4;
        logger("DENSITY_DISSIPATION", config.DENSITY_DISSIPATION);
        understood = true;

    }

    if (event.controller.number === 2 && event.channel === 7) { // right effect
        config.VELOCITY_DISSIPATION = ((event.value / 127) - 0.5) * 4;
        logger("VELOCITY_DISSIPATION", config.VELOCITY_DISSIPATION);
        understood = true;
    }

    if (!understood) {
        logger(`MIDI CC: ${event.controller.number}/${event.value} channel ${event.channel} on '${event.target.name}'`);
    }

    return understood;
}


/**
 * @param port{Output}
 * @returns {splatHook}
 */
/*
export function midiSplatHandler (port) {
    // @TODO: who knows what messages light up the leds on the traktor?
    for (let i = 1; i < 120; i++) {
        port.sendControlChange(i, 127, "all");
    }
}
*/
