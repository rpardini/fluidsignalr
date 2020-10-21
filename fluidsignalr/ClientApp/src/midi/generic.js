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
    let understood = false;
    if (!understood) {
        logger(`MIDI Note: ${event.note.name} (${event.note.number}) channel ${event.channel} on '${event.target.name}'`);
    }
}

/**
 * @param event{InputEventControlchange}
 * @param config{Object}
 * @param logger{function}
 */
export function midiInControlChange (event, config, logger) {
    let understood = false;
    if (!understood) {
        logger(`MIDI CC: ${event.controller.number}/${event.value} channel ${event.channel} on '${event.target.name}'`);
    }
}
