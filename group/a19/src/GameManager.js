// A12 Game Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import DM from "./DialogueManager.js";
import LM from "./LevelManager.js";
import Player from "./Player.js";
import SM from "./SoundManager.js";

const GM = {

    //region Constants


    //endregion

    //region Variables
    MAIN_LOOP_ID : null,                // Global Main Loop ID
    input_block_timer: {
        id: null,
        counter: 0,
    },

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the grid
        initGrid();


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
    restartGameLoop : function (bool) {

        if (bool) {
            if (GM.input_block_timer.id === null){
                GM.stopGameLoop();
                GM.input_block_timer.id = PS.timerStart(30, inputBlockHandle);
            }
        } else {
            GM.stopGameLoop();
            GM.MAIN_LOOP_ID = PS.timerStart( CONFIG.FRAME_RATE, GM.update );
        }
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

// Load the tutorial level to start
function start() {
    LM.loadLevel(3);
}

function inputBlockHandle(){

    if ( GM.input_block_timer.counter < 1) {
        GM.input_block_timer.counter += 1;
    } else {
        PS.timerStop(GM.input_block_timer.id);
        GM.input_block_timer.id = null;
        GM.input_block_timer.counter = 0;
        GM.MAIN_LOOP_ID = PS.timerStart( CONFIG.FRAME_RATE, GM.update );
    }

}

//endregion

export default GM;
