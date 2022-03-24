// Utils.js
// Utility function module

// Debug related
const GLOBAL_DEBUG_MASK = true;
const GLOBAL_DEBUG_LEVEL = 1;

/**
 * Global debug function
 * @param message: The message to print while triggered
 * @param message_debug_level: Gives option to debug at different levels
 */
export const debug = (message, message_debug_level= 0) => {
    if ( GLOBAL_DEBUG_MASK && GLOBAL_DEBUG_LEVEL >= message_debug_level ) {
        console.log(message);
    }
};
