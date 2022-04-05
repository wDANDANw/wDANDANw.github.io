// A12 Game Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import DM from "./DialogueManager.js";
import BM from "./ButtonManager.js";
import LM from "./LevelManager.js";
import Player from "./Player.js";

const GM = {

    //region Constants


    //endregion

    //region Variables
    MAIN_LOOP_ID : null,                // Global Main Loop ID

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the grid
        initGrid();

        // Initialize the borders
        initBorders();

        // Load Sounds
        loadSounds();

        // Initialize Button Panel Area
        BM.init();

        // Initialize the Level Manger (load levels to memory)
        LM.init();

        // Start the game loop
        GM.restartGameLoop();

        // Load level 1 to start
        start();
    } ,

    /**
     * Function to load sounds
     */


    /**
     * The main update loop
     * Player's update is dependent on this
     */
    update : function () {
        Player.update();
    },

    /**
     * Global function to stop the update loop
     */
    stopGameLoop : function () {
        if (!GM.MAIN_LOOP_ID) return;

        PS.timerStop(GM.MAIN_LOOP_ID);
        GM.MAIN_LOOP_ID = null;
    },

    /**
     * Global function to start update loop
     */
    restartGameLoop : function () {
        GM.MAIN_LOOP_ID = PS.timerStart( CONFIG.FRAME_RATE, GM.update );
    }

    //endregion
}

//region Local Helpers

// Initialize the Grid
function initGrid() {

    PS.gridSize( CONFIG.WIDTH , CONFIG.HEIGHT );
    PS.gridColor( CONFIG.GRID_BACKGROUND_COLOR );
    PS.border( PS.ALL , PS.ALL , 0 ); // disable all borders
    PS.statusColor( DM.STATUS_COLOR );
    PS.statusText( DM.DEFAULT_TEXT );

}

// Initialize Borders
function initBorders() {

    // Top
    const top = PS.spriteSolid( 21 , 1 );
    PS.spriteSolidColor( top , CONFIG.BOARDER_COLOR );
    PS.spriteMove( top , 0 , 0 );

    // Left
    const left = PS.spriteSolid( 1 , 16 );
    PS.spriteSolidColor( left , CONFIG.BOARDER_COLOR );
    PS.spriteMove( left , 0 , 1 );

    // Right
    const right = PS.spriteSolid( 1 , 16 );
    PS.spriteSolidColor( right , CONFIG.BOARDER_COLOR );
    PS.spriteMove( right , 20 , 1 );

}

// Load sounds
function loadSounds() {

}

// Load the tutorial level to start
function start() {
    LM.loadLevel(1);
}

//endregion

export default GM;
