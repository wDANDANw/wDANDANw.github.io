// A12 Player Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import LM from "./LevelManager.js";
import BM from "./ButtonManager.js";

const Player = {

    //region Constants
    COLOR: 0xE91E63 ,

    //endregion

    //region Variables
    x: 1 ,
    y: 1 ,

    unlocked: [] ,

    jumping: false ,
    can_jump: true,
    jump_updates: [] ,
    HARDCODED_JUMP_UPDATE_SERIES: [ - 1 , - 1 , - 1 , - 1 ] ,

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

    } ,

    drawPlayer: function () {
        PS.color( Player.x , Player.y , Player.COLOR );
    } ,

    move: function (x , y) {
        // If the collision processing is successful (no errors or edge conditions), then draw the player
        if ( LM.isLevelArea( x , y ) && processCollide( x , y ) ) {

            PS.color( Player.x , Player.y , CONFIG.BEAD_BACKGROUND_COLOR );

            Player.x = x;
            Player.y = y;

            Player.drawPlayer();
        }
    } ,

    jump: function () {
        if ( !Player.jumping && Player.can_jump) {
            Player.jump_updates = [ ... Player.HARDCODED_JUMP_UPDATE_SERIES ]; // Deep Copy
            Player.jumping = true;
        }
    } ,

    update: function () {
        if ( Player.jumping ) {
            if ( Player.jump_updates.length > 0 ) {
                const next_jump_update = Player.jump_updates.shift();
                Player.move( Player.x , Player.y + next_jump_update );
            } else {
                Player.jumping = false;
            }
        }

        if ( !Player.jumping ) {
            if ( !PS.data( Player.x , Player.y + 1 ).tags || !(PS.data( Player.x , Player.y + 1 ).tags).includes( "ground" ) ) { // First one checks if its null. If so, fall. Then check if ground. If not, fall.
                Player.can_jump = false;
                Player.move( Player.x , Player.y + 1 );
            } else {
                Player.can_jump = true;
            }
        }
    } ,

    reset: function () {
        PS.color( Player.x , Player.y , CONFIG.BEAD_BACKGROUND_COLOR );
        Player.unlocked = [];
        Player.jump_updates = [];
    }

    //endregion

}

// region Helper Functions

// Function to process potential collision
function processCollide(x , y) {

    let should_move = true;

    const data = PS.data( x , y );

    // Special bead. Needs processing
    if ( data ) {
        const tags = data.tags;
        if ( tags.length > 0 ) {

            if ( tags.includes( "next_level" ) ) {
                LM.loadLevel( LM.current_level + 1 );
                should_move = false;
            } else if ( tags.includes( "end_game" ) ) {
                PS.statusText("That's the prototype. Thanks for playing!");
            } else if ( tags.includes( "arrow_pickup" ) ) {
                getArrowPickup( x , y , data );
            } else if ( tags.includes( "ground" ) ) {
                should_move = false;
            }
        }
    }

    return should_move;

}

// Function to get an arrow pickup
function getArrowPickup(x , y , data) {

    PS.glyph( x , y , 0 );
    PS.border( x , y , 0 );
    PS.radius( x , y , PS.DEFAULT );
    PS.bgColor( x , y , CONFIG.BEAD_BACKGROUND_COLOR );
    PS.bgAlpha( x , y , PS.ALPHA_OPAQUE );

    let ability_to_add = null;

    switch ( data.type ) {
        case "arrow_up" :
            ability_to_add = "up";
            break;
        case "arrow_left" :
            ability_to_add = "left";
            break;
        case "arrow_right" :
            ability_to_add = "right";
            break;
        default:
            break;
    }

    if ( !Player.unlocked.includes( ability_to_add ) ) Player.unlocked.push( ability_to_add );
    BM.drawArrows( BM.arrows[ability_to_add] , BM.BUTTON_STATUS.INACTIVE );

}

// endregion

export default Player;
