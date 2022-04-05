// A12 Game Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import DM from "./DialogueManager.js";

const GM = {

    //region Constants


    //endregion

    //region Variables


    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the grid
        initGrid();

        // Initialize the boarders
        initBoarders();
    } ,

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

// Initialize Boarders
function initBoarders() {

    // Top
    const top = PS.spriteSolid( 21 , 1 );
    PS.spriteSolidColor( top , CONFIG.BOARDER_COLOR );
    PS.spriteMove( top , 0 , 0 );

    // Left
    const left = PS.spriteSolid( 1 , 16 );
    PS.spriteSolidColor( left , CONFIG.BOARDER_COLOR );
    PS.spriteMove( left , 0 , 0 );

    // Right
    const right = PS.spriteSolid( 1 , 16 );
    PS.spriteSolidColor( right , CONFIG.BOARDER_COLOR );
    PS.spriteMove( right , 0 , 20 );

}

//endregion

export default GM;
