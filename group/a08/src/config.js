// Config.js
// Game Related Configurations

/**
 * The global game configurations
 * @type {{WIDTH: number, HEIGHT: number, FRAME_RATE: number}}
 */
const GAME_CONFIG = {
    // Game Loop Related Constants
    FRAME_RATE: 10,	// animation frame rate; 6/60ths = 10 fps // Now to be static. If wants more interesting, can change this to simulate speed change

    // Grid Size Related Constants
    WIDTH: 32, // width of grid (one extra column for palette)
    HEIGHT: 32, // height of grid

    // Grid Color Related Constants
    GRID_BACKGROUND_COLOR : 0x303030,
    BEAD_BACKGROUND_COLOR : 0xFFFFFF,
    STATUS_COLOR : 0xFFFFFF,
}

export default GAME_CONFIG;
