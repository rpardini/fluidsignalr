export const name = "Generic";

/**
 * @param manufacturer{String}
 * @param name{String}
 * @returns {boolean}
 */
export function isSupportedDevice (manufacturer, name) {
    if (!name) return false;
    return true; // (generic!)
}

/**
 * @param event{InputEventNoteon}
 * @param config{Object}
 * @param logger{function}
 * @param randomSplatsNow{function}
 */
export function midiInNoteOn (event, config, logger, randomSplatsNow) {
    logger(`Generic MIDI Note: ${event.note.name} (${event.note.number}) channel ${event.channel} on '${event.target.name}'`);
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
    config.SPLAT_RADIUS = event.value / 127;
    if (config.SPLAT_RADIUS === 0) config.SPLAT_RADIUS = 0.01;
    logger(`SPLAT_RADIUS: ${config.SPLAT_RADIUS} - Generic MIDI CC: ${event.controller.number}/${event.value} channel ${event.channel} on '${event.target.name}'`);
    return true;
}
