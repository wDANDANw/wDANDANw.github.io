// A12 Player Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import LM from "./LevelManager.js";
import BM from "./ButtonManager.js";
import SM from "./SoundManager.js";
import DM from "./DialogueManager.js";

const Player = {

    //region Constants
    COLOR: 0xE91E63 ,

    //endregion

    //region Variables
    x: 1 ,
    y: 1 ,

    unlocked_arrow: [] ,
    unlocked_color : "default",
    num_pickup_eaten: 0 ,
    size: 1 ,
    body_list: [ [ 0 , 0 ] ] ,

    jumping: false ,
    can_jump: true ,
    jump_updates: [] ,
    jump_limiter : 0,           // Animation Limiter. Number to be updated.
    jump_limiter_mod : 5,       // Animation Limiter. Number to be mod.
    jump_limiter_comp : 0,      // Animation Limiter. Number to be compared.
    HARDCODED_JUMP_UPDATE_SERIES: [ - 1 , - 1 , - 1 , - 1 , -1] ,

    moving_right : false,
    moving_left : false,
    moving_limiter : 0,         // Animation Limiter. Number to be updated.
    moving_limiter_mod : 4,     // Animation Limiter. Number to be mod.
    moving_limiter_comp : 0,    // Animation Limiter. Number to be compared.

    blue_mask : false,

    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {
        Player.body_list = [ [ 0 , 0 ] ];
    } ,

    drawPlayer: function () {

        const x = Player.x;
        const y = Player.y;

        for ( let i = 0 ; i < Player.size ; i ++ ) {
            for ( let j = 0 ; j < Player.size ; j ++ ) {
                PS.color( x - i, y - j, Player.COLOR );
            }
        }

    } ,

    move: function (x , y) {
        // If the collision processing is successful (no errors or edge conditions), then draw the player
        if ( isAbleToMove( x , y ) ) {

            let local_x , local_y;

            for (let i = 0; i < Player.body_list.length ; i++) {

                const body_coord = Player.body_list[i];

                // Erase previous bead
                local_x = body_coord[0] + Player.x;
                local_y = body_coord[1] + Player.y;

                PS.color( local_x , local_y , CONFIG.BEAD_BACKGROUND_COLOR );

                // Update moving bead
                local_x = body_coord[0] + x;
                local_y = body_coord[1] + y;

                if (!processCollide( local_x , local_y)) return;
            }

            Player.x = x;
            Player.y = y;

            Player.drawPlayer();
        }
    } ,

    jump: function () {
        if ( !Player.jumping && Player.can_jump ) {
            Player.jump_updates = [ ... Player.HARDCODED_JUMP_UPDATE_SERIES ]; // Deep Copy
            Player.jumping = true;

            // Play jump sound
            const random_jump_name = "Jump" + PS.random(3);
            SM.play(random_jump_name);

            // Mark the button to active
            BM.drawArrows(BM.arrows["up"],BM.BUTTON_STATUS.ACTIVE);
        }
    } ,

    update: function () {
        if ( Player.jumping ) {
            if ( Player.jump_updates.length > 0) {
                if ( ((Player.jump_limiter += 1) % Player.jump_limiter_mod) > Player.jump_limiter_comp ){
                    const next_jump_update = Player.jump_updates.shift();
                    Player.move( Player.x , Player.y + next_jump_update );
                }

                if (Player.jump_limiter >= Player.jump_limiter_mod){
                    Player.jump_limiter = 0;
                }
            } else {
                Player.jumping = false;
            }
        }

        if ( !Player.jumping ) {
            if ( shouldFall() ) { // First one checks if its null. If so, fall. Then check if ground. If not, fall.
                Player.can_jump = false;
                Player.move( Player.x , Player.y + 1 );
            } else {
                if (!Player.can_jump){
                    SM.play(SM.FX.LAND);
                    Player.can_jump = true;
                }
            }
        }

        if ( ((Player.moving_limiter += 1) % Player.moving_limiter_mod) > Player.moving_limiter_comp) {

            if (Player.moving_left) {
                Player.move(Player.x - 1, Player.y);
                BM.drawArrows(BM.arrows["left"],BM.BUTTON_STATUS.ACTIVE);
            }

            if (Player.moving_right) {
                Player.move(Player.x + 1, Player.y);
                BM.drawArrows(BM.arrows["right"],BM.BUTTON_STATUS.ACTIVE);
            }
        }

        if (Player.moving_limiter >= Player.moving_limiter_mod){
            Player.moving_limiter = 0;
        }
    } ,

    reset: function () {
        PS.color( Player.x , Player.y , CONFIG.BEAD_BACKGROUND_COLOR );
        Player.unlocked_arrow = [];
        Player.jump_updates = [];
        Player.body_list = [ [ 0 , 0 ] ];
        Player.num_pickup_eaten = 0;
        Player.size = 1;
        Player.jumping = false;
        Player.can_jump = true;
        Player.x = 1;
        Player.y = 1;
        Player.moving_left = false;
        Player.moving_right = false;
        Player.jump_limiter = 0;
        Player.moving_limiter = 0;
        Player.blue_mask = false;
    }

    //endregion

}

// region Helper Functions

function isAbleToMove(x , y) {

    let local_x , local_y;
    let answer = true;

    Player.body_list.forEach( body_coord => {
        local_x = body_coord[0] + x;
        local_y = body_coord[1] + y;

        answer = answer && LM.isLevelArea( local_x , local_y ) && isMovableArea( local_x , local_y );

    } )

    return answer;
}

// Function to check if one place is movable
function isMovableArea(x , y) {

    let answer = true;

    if ( PS.data(x,y).type === "ground" ) {
        answer = false;
    }

    if ( PS.data(x,y).type === "blue" && !Player.blue_mask) {
        answer = false;
    }

    return answer;
}

// Function to process potential collision
function processCollide(x , y) {

    let should_move = true;

    const data = PS.data( x , y );

    // Special bead. Needs processing
    if ( data ) {
        const tags = data.tags;
        if ( tags.length > 0 ) {

            if ( tags.includes( "next_level" ) ) {

                if (Player.size !== data.size) {
                    DM.showMessage("Wrong Size! Click reset to again?")
                } else {
                    SM.play(SM.FX.PASS_LEVEL);
                    LM.loadLevel( LM.current_level + 1 );
                    should_move = false;
                }
            } else if ( tags.includes( "end_game" ) ) {
                PS.statusText( "That's the prototype. Thanks for playing!" );
            } else if ( tags.includes( "arrow_pickup" ) || tags.includes("color_pickup") ) {
                getPickup( x , y , data );
            } else if ( tags.includes( "ground" ) ) {
                should_move = false;
            } else if (tags.includes("blue")) {
                should_move = Player.blue_mask;
            }

            // Update Dialogue
            if (tags.includes("dialogue")) {
                data.dialogue_data.visited += 1;
                DM.showDialogue(data.dialogue_data);
            }
        }
    }

    return should_move;

}

// Function to get an arrow pickup
function getPickup(x , y , data) {

    if (data.eaten) return;

    if (!canGrowUp(x,y)) {
        console.log("Cannot grow up here")
        return;
    }

    PS.glyph( x , y , 0 );
    PS.border( x , y , 0 );
    PS.radius( x , y , PS.DEFAULT );
    PS.bgColor( x , y , CONFIG.BEAD_BACKGROUND_COLOR );
    PS.bgAlpha( x , y , PS.ALPHA_OPAQUE );

    let ability_to_add = null;
    let picking_arrow = false;

    // Play sound
    const random_jump_name = "Powerup" + PS.random(3);
    SM.play(random_jump_name);

    switch ( data.type ) {
        case "arrow_up" :
            ability_to_add = "up";
            picking_arrow = true;
            break;
        case "arrow_left" :
            ability_to_add = "left";
            picking_arrow = true;
            break;
        case "arrow_right" :
            ability_to_add = "right";
            picking_arrow = true;
            break;
        case "blue_pickup" :
            getBluePickup();
            break;
        case "yellow_pickup" :
            Player.blue_mask = false;
            break;
        case "purple_pickup" :
            Player.blue_mask = false;
            break;
        default:
            break;
    }

    if (picking_arrow) {
        if ( !Player.unlocked_arrow.includes( ability_to_add ) ) Player.unlocked_arrow.push( ability_to_add );
        BM.drawArrows( BM.arrows[ability_to_add] , BM.BUTTON_STATUS.INACTIVE );
    }


    data["eaten"] = true;
    PS.data(x,y,data);

    growUp();

}

function shouldFall(){

    let answer = true;

    for ( let i = 0; i < Player.size; i ++){

        if (Player.blue_mask === true && Player.y === 16) {
            LM.resetLevel();
        }

        if (PS.data( Player.x - i , Player.y + 1 ).tags){
            if (PS.data( Player.x - i, Player.y + 1 ).tags.includes( "ground")){
                answer = false;
            } else if (Player.blue_mask === false && PS.data( Player.x - i, Player.y + 1 ).tags.includes( "blue")){
                answer = false
            }
        }
    }

    return answer;

}

// After eaten every two pickups, the player's size should increase
function growUp() {

    Player.num_pickup_eaten += 1;

    // Change the size
    Player.size += 1;

    // Grow up to the left
    // Will grow up N^2 - (N-1)^2 beads, where N equals to the size after growth
    const num_of_growing_beads = Math.pow(Player.size, 2) - Math.pow((Player.size-1), 2);

    // Then, for this many beads, push to the body list
    // Traverse num / 2 times because this is symmetrical. The last one can be handled manually.
    for ( let i = 0 ; i < (num_of_growing_beads / 2) ; i ++) {
        const body_to_push_1 = [-(Player.size - 1), -i];
        const body_to_push_2 = [-i, -(Player.size - 1)];
        Player.body_list.push(body_to_push_1, body_to_push_2);
    }

    // And the least bead at the corner
    Player.body_list.push([-(Player.size - 1), - (Player.size - 1)]);

}

// Function to check if can grow up at given location
function canGrowUp(x,y){

    let answer = true;

    // Grow up to the left
    // Will grow up N^2 - (N-1)^2 beads, where N equals to the size after growth
    const temp_size = Player.size + 1;
    const num_of_growing_beads = Math.pow(temp_size, 2) - Math.pow((temp_size-1), 2);
    const temp_body_list = [... Player.body_list];

    // Then, for this many beads, push to the body list
    // Traverse num / 2 times because this is symmetrical. The last one can be handled manually.
    for ( let i = 0 ; i < (num_of_growing_beads / 2) ; i ++) {
        const body_to_push_1 = [-(temp_size - 1), -i];
        const body_to_push_2 = [-i, -(temp_size - 1)];
        temp_body_list.push(body_to_push_1, body_to_push_2);
    }

    temp_body_list.push([-(temp_size - 1), - (temp_size - 1)]);

    let local_x, local_y;
    for (let i = 0; i < temp_body_list.length; i ++) {

        local_x = temp_body_list[i][0] + x;
        local_y = temp_body_list[i][1] + y;
        if (!isMovableArea(local_x,local_y)){
            console.log("[" + local_x + " , " + local_y + "] is not movable")
            answer = false;
            break;
        }

    }

    return answer;
}

// Get blue pickup handler
function getBluePickup(){
    Player.unlocked_color = "blue";
    Player.blue_mask = true;
    LM.setBlueWalls(false);
    BM.drawColorBar(Player.unlocked_color);
}


// endregion

export default Player;
