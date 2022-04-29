

const globals = {

    TAGS: {
        BASE_OBJECT: 'base object',
        GAME_OBJECT : 'game object',
        ENVIRONMENT : 'environment',
        ACTOR: 'actor',
        LEVEL: 'level',
        VECTOR2: 'vector2',
        PLAYER: 'player',
        INVISIBLE: 'hidden',
        LOAD_LEVEL: 'load-level',
    },

    DEBUG : true,
    debug: function (message) {
        if (globals.DEBUG) {
            console.log(message);
        }
    },

    EVENTS: {
        STEP_EVENT: 'step',
        COLLISION_EVENT: 'collide',
        KEYBOARD_EVENT: 'keyboard',
    },

    KEYBOARD: {
        KEYS: {
            UP: "UP",
            DOWN: "DOWN",
            RIGHT: "RIGHT",
            LEFT: "LEFT",
            SPACE: "SPACE",
        },
        STATUS: {
            KEYDOWN: "KEYDOWN",
            KEYUP: "KEYUP",
        }
    },

    FRAME_RATE: 3,

    // Hardcoded supported levels
    LEVELS: {
        LV1: 'level-1',
        LV2: 'level-2',
        LV3: 'level-3',
        LV4: 'level-4',
        LV5: 'level-5',
    },

    // Default Level Background Color
    LEVEL_GRID_BACKGROUND_COLOR: 0x555555,
    LEVEL_STATUS_TEXT_COLOR: PS.COLOR_WHITE,

}


export default globals;
