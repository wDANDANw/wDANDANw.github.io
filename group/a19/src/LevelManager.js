// A12 Level Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import Player from "./Player.js";
import GM from "./GameManager.js";
import DM from "./DialogueManager.js";
import Snake from "./snake.js";

const LM = {

    //region Constants
    GENERAL_AREA: {
        TOP: 0 ,
        BOTTOM: 15 ,
        LEFT: 0 ,
        RIGHT: 15 ,
    } ,

    NUM_OF_LEVELS: 3 ,

    //endregion

    //region Variables
    player: null ,

    current_level: 1 ,
    previous_level: 1,
    levels : {},

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Read the levels from file to memory
        preloadLevels( LM.NUM_OF_LEVELS );
    } ,

    /**
     * Function to load a level
     * @param level
     */
    loadLevel: function (level) {

        const level_str = (typeof (level) === "string") ? level : level.toString();

        if ( !(level_str in LM.levels) ) {
            console.log( "LM::loadLevel: Error: Level does not exist" )
        }

        LM.previous_level = LM.current_level;
        LM.current_level = level;

        let bool = false;
        if (level === "death_level") {
            bool = true;
        }

        // Draw the level
        resetCanvas();
        renderLevel( level_str , bool );

    } ,

    /**
     *
     */
    resetLevel: function () {
        resetCanvas();
        renderLevel( LM.current_level );
    } ,

    /**
     * Checks a point to see if it is in the level
     * @param x
     * @param y
     */
    isLevelArea: function (x , y) {
        return !((x < LM.GENERAL_AREA.LEFT || x > LM.GENERAL_AREA.RIGHT) || (y < LM.GENERAL_AREA.TOP || y > LM.GENERAL_AREA.BOTTOM)); // Needs a ! at the beginning because this checks outside of area
    } ,

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
                LM.levels[i.toString()] = response
            }
        } );
    }

    $.ajax( {
        url: "./src/levels/death-level.json" ,
        async: false ,
        dataType: 'json' ,
        success: function (response) {
            LM.levels["death-level"] = response
        }
    } );
}

// Renders a level
function renderLevel(level, bool=false) {

    const level_data = LM.levels[level];

    // Render the platforms and grounds
    drawBeads( level_data.level_layout );

    // // Draw the dialogue points
    // const dialogues = level_data.dialogues;
    // DM.renderDialoguesInLevel( dialogues );

    // Initialize and Render the player
    // Put at last to process potential collision
    const player_x = level_data.level_config.player.position.x;
    const player_y = level_data.level_config.player.position.y;

    Player.init( player_x , player_y );

    GM.restartGameLoop(bool);
}


// Function to draw platforms in a level
function drawBeads(level_layout) {
    const local_copy = JSON.parse( JSON.stringify( level_layout ) ); // Deep Copy

    Object.values(local_copy).forEach( bead_data => {
        PS.color( bead_data.position.x , bead_data.position.y , bead_data.color[0], bead_data.color[1], bead_data.color[2] );
        PS.data( bead_data.position.x , bead_data.position.y , bead_data );
    })
}

// Erase the whole canvas
function resetCanvas() {

    for ( let col = LM.GENERAL_AREA.LEFT ; col <= LM.GENERAL_AREA.RIGHT ; col ++ ) {
        for ( let row = LM.GENERAL_AREA.TOP ; row <= LM.GENERAL_AREA.BOTTOM ; row ++ ) {

            PS.color( col , row , CONFIG.BEAD_BACKGROUND_COLOR );
            PS.data( col , row , PS.DEFAULT );

            PS.glyph( col , row , 0 );
            PS.border( col , row , 0 );
            PS.radius( col , row , PS.DEFAULT );
            PS.bgColor( col , row , CONFIG.BEAD_BACKGROUND_COLOR );
            PS.bgAlpha( col , row , PS.ALPHA_OPAQUE );


        }
    }

    // Player.reset();
    // DM.reset();
}


// endregion

export default LM;
