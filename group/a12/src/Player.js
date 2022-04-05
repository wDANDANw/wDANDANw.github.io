// A12 Player Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";

const Player = {

    //region Constants
    COLOR: 0xE91E63 ,

    //endregion

    //region Variables
    x: - 1 ,
    y: - 1 ,

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the grid

        // Initialize the boarders
        initBoarders();
    } ,

    drawPlayer: function () {
        PS.color( Player.x , Player.y , Player.COLOR );
    } ,

    move: function (x , y) {
        // If the collision processing is succesful (no errors or edge conditions), then draw the player
        if ( processCollide( x , y ) ) {

            PS.color( Player.x , Player.y , CONFIG.BEAD_BACKGROUND_COLOR );

            Player.x = x;
            Player.y = y;

            Player.drawPlayer();
        }
    } ,

    //endregion

}

// region Helper Functions

// Function to process potential collision
function processCollide(x,y) {

    let processSuccess = true;

    const data = PS.data(x,y);

    // Special bead. Needs processing
    if (data) {
        if (data.tags.length > 0) {

            switch (data.type) {
                case "dest":
                    LM.loadLevel(LM.current_level + 1);
                    break;
                default:
                    break;
            }
        }
    }

    return processSuccess;

}

// endregion

export default Player;
