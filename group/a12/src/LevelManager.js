// A12 Level Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import Player from "./Player.js";
import BM from "./ButtonManager.js";

let levels = {};

const LM = {

    //region Constants
    GENERAL_AREA: {
        TOP: 1 ,
        BOTTOM: 16 ,
        LEFT: 1 ,
        RIGHT: 19 ,
    } ,

    DEST_COLOR: 0x8BC34A ,

    //endregion

    //region Variables
    player: null ,
    current_level : 1,

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Read the levels from file to memory
        preloadLevels( 5 );
    } ,

    /**
     * Function to load a level
     * @param level
     */
    loadLevel: function (level) {

        const level_str = level.toString();

        if ( !(level_str in levels) ) {
            console.log( "LM::loadLevel: Error: Level does not exist" )

        }

        LM.current_level = level;

        // Draw the level
        renderLevel( level_str );

    } ,

    /**
     *
     */
    resetLevel: function () {
        resetCanvas();
        renderLevel(LM.current_level);
    }


    //endregion

}

// region Helper Functions

// Function to preload levels to local memory
function preloadLevels(num_of_levels) {

    let filename;

    for ( let i = 1 ; i <= num_of_levels ; i ++ ) {

        filename = "./src/levels/level-" + i + ".json"
        $.ajax( {
            url: filename ,
            async: false ,
            dataType: 'json' ,
            success: function (response) {
                levels[i.toString()] = response
            }
        } );
    }
}

// Renders a level
function renderLevel(level) {

    const level_data = levels[level];

    // Initialize and Render the player
    Player.x = level_data.player.position.x;
    Player.y = level_data.player.position.y;

    Player.drawPlayer();

    // Render the destination
    const destX = level_data.dest.position.x;
    const destY = level_data.dest.position.y;
    const dest_data = level_data.dest.data;

    drawDestination( destX , destY , dest_data );

    // Render the platforms and grounds
    const platforms = level_data.platforms
    drawPlatforms(platforms);

    // Draw a reset button at top
    BM.drawResetButton();
}

// Function to draw destination
function drawDestination(x , y , data) {
    PS.color( x , y , LM.DEST_COLOR );
    PS.data( x , y , data );
}

// Function to draw platforms in a level
function drawPlatforms(platforms){

    for (let [platform_name , platform_data] of Object.entries(platforms)){

        const col_start = platform_data.position.upper_left.x;
        const row_start = platform_data.position.upper_left.y;
        const col_end = platform_data.position.lower_right.x;
        const row_end = platform_data.position.lower_right.y;

        const data = platform_data.data;

        for (let col = col_start ; col <= col_end ; col ++) {
            for (let row = row_start ; row <= row_end ; row ++) {

                drawOnePlatformBead( col , row , data);

            }
        }

    }

}

// Function to draw one platform bead
function drawOnePlatformBead( x , y , data){
    PS.color( x , y , Number(data.color));
    PS.data( x , y , data );
}

// Erase the whole canvas
function resetCanvas() {

    for ( let col = LM.GENERAL_AREA.LEFT ; col <= LM.GENERAL_AREA.RIGHT ; col ++ ) {
        for ( let row = LM.GENERAL_AREA.TOP ; row <= LM.GENERAL_AREA.BOTTOM ; row ++ ) {

            PS.color( col , row , CONFIG.BEAD_BACKGROUND_COLOR );
            PS.data( col , row , PS.DEFAULT );

        }
    }

}


// endregion

export default LM;
