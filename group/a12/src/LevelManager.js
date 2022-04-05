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

    PICKUP: {
        BORDER_WIDTH: 5,
        RADIUS:20,
    },

    NUM_OF_LEVELS : 5,

    //endregion

    //region Variables
    player: null ,
    current_level: 1 ,

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

        const level_str = level.toString();

        if ( !(level_str in levels) ) {
            console.log( "LM::loadLevel: Error: Level does not exist" )

        }

        LM.current_level = level;

        // Draw the level
        resetCanvas();
        renderLevel( level_str );

    } ,

    /**
     *
     */
    resetLevel: function () {
        resetCanvas();
        renderLevel( LM.current_level );
    },

    /**
     * Checks a point to see if it is in the level
     * @param x
     * @param y
     */
    isLevelArea : function (x , y) {
        return !( ( x < LM.GENERAL_AREA.LEFT || x >LM.GENERAL_AREA.RIGHT) || ( y < LM.GENERAL_AREA.TOP || y > LM.GENERAL_AREA.BOTTOM) ); // Needs a ! at the beginning because this checks outside of area
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

    Player.move( Player.x , Player.y );

    // Render the destination
    const destX = level_data.dest.position.x;
    const destY = level_data.dest.position.y;
    const dest_data = level_data.dest.data;

    drawDestination( destX , destY , dest_data );

    // Render the platforms and grounds
    const platforms = level_data.platforms
    drawPlatforms( platforms );

    // Draw the other button related stuff
    BM.renderButtons( level_data.buttons );

    // Draw the pick ups
    const pickups = level_data.pickups;
    drawPickups( pickups );
}

// Function to draw destination
function drawDestination(x , y , data) {
    PS.color( x , y , LM.DEST_COLOR );
    PS.data( x , y , data );
}

// Function to draw platforms in a level
function drawPlatforms(platforms) {

    const local_copy = JSON.parse(JSON.stringify(platforms)); // Deep Copy

    for ( let [ platform_name , platform_data ] of Object.entries( local_copy ) ) {

        const col_start = platform_data.position.upper_left.x;
        const row_start = platform_data.position.upper_left.y;
        const col_end = platform_data.position.lower_right.x;
        const row_end = platform_data.position.lower_right.y;

        const data = platform_data.data;

        for ( let col = col_start ; col <= col_end ; col ++ ) {
            for ( let row = row_start ; row <= row_end ; row ++ ) {

                drawOnePlatformBead( col , row , data );

            }
        }

    }

}

// Function to draw one platform bead
function drawOnePlatformBead(x , y , data) {
    PS.color( x , y , Number( data.color ) );
    PS.data( x , y , data );
}

// Function to draw pickups
function drawPickups(pickups) {

    const local_copy = JSON.parse(JSON.stringify(pickups)); // Deep Copy

    if ( Object.keys( local_copy ).length > 0 ) {

        // Values are the position + data dict
        Object.values( local_copy ).forEach( pickup => {

            const x = pickup.position.x;
            const y = pickup.position.y;
            const data = pickup.data;

            drawOnePickup( x , y , data );

        } )

    }

}

// Function to draw one pickup
function drawOnePickup(x , y , data) {

    PS.border(x,y,LM.PICKUP.BORDER_WIDTH);
    PS.radius(x,y,LM.PICKUP.RADIUS);
    PS.bgColor ( x, y, CONFIG.BEAD_BACKGROUND_COLOR);
    PS.bgAlpha( x, y, PS.ALPHA_OPAQUE );

    if (data.tags.includes("arrow_pickup")) {
        drawArrowPickup(x,y,data.type, data);
    }

}

// Function to draw an arrow pickup
function drawArrowPickup(x,y,arrow,data){

    let glyph_unicode = "O";
    switch ( arrow ) {
        case "arrow_up" :
            glyph_unicode = 0x1F815;
            break;
        case "arrow_left" :
            glyph_unicode = 0x1F814;
            break;
        case "arrow_right" :
            glyph_unicode = 0x1F812;
            break;
        default:
            break;
    }

    PS.glyph(x,y,glyph_unicode);
    PS.data(x,y,data);

}

// Erase the whole canvas
function resetCanvas() {

    for ( let col = LM.GENERAL_AREA.LEFT ; col <= LM.GENERAL_AREA.RIGHT ; col ++ ) {
        for ( let row = LM.GENERAL_AREA.TOP ; row <= LM.GENERAL_AREA.BOTTOM ; row ++ ) {

            PS.color( col , row , CONFIG.BEAD_BACKGROUND_COLOR );
            PS.data( col , row , PS.DEFAULT );

        }
    }

    Player.reset();

}


// endregion

export default LM;
