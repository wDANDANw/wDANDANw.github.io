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
    COLOR: 0xB13E53 ,

    //endregion

    //region Variables
    x: 1 ,
    y: 1 ,

    unlocked_arrow: [] ,
    unlocked_color : "default",
    num_pickup_eaten: 0 ,
    grown : false,
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

                // Fix potential erase of wall after grown
                if (Player.grown) {

                    // Fix the after grow up erased wall bug
                    let fix_x, fix_y, fix_data;
                    for ( let col = 0; col < Player.size; col++){
                        for ( let row = 0; row < Player.size + 1; row++){ // Maybe 1 bead bottom as well

                            fix_x = Player.x - Player.size + 1 + col;
                            fix_y = Player.y - Player.size + 1 + row;
                            fix_data = PS.data(fix_x, fix_y);

                            if (fix_data !== 0 && fix_data.tags.includes("ground")){
                                PS.color( fix_x , fix_y , Number(fix_data.color) );
                            }
                        }
                    }

                    Player.grown = false;
                }

                // Update moving bead
                local_x = body_coord[0] + x;
                local_y = body_coord[1] + y;

                const move_offset = [local_x - Player.x, local_y - Player.y];

                if (!processCollide( local_x , local_y , move_offset)) return;
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
        Player.unlocked_color = "default";
        Player.jump_updates = [];
        Player.body_list = [ [ 0 , 0 ] ];
        Player.num_pickup_eaten = 0;
        Player.size = 1;
        Player.grown = false;
        Player.jumping = false;
        Player.can_jump = true;
        Player.x = 1;
        Player.y = 1;
        Player.moving_left = false;
        Player.moving_right = false;
        Player.jump_limiter = 0;
        Player.moving_limiter = 0;
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

    if ( PS.data(x,y).type === "blue" && Player.unlocked_color !== "blue") {
        answer = false;
    }

    if ( PS.data(x,y).type === "purple" && Player.unlocked_color !== "purple") {
        answer = false;
    }

    return answer;
}

// Function to process potential collision
function processCollide(x , y, move_offset) {

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
                PS.statusText( "Thanks for playing!" );
            } else if ( tags.includes( "arrow_pickup" ) || tags.includes("color_pickup") ) {
                getPickup( x , y , data );
            } else if ( tags.includes( "ground" ) ) {
                should_move = false;
            } else if (tags.includes("blue")) {
                should_move = (Player.unlocked_color === "blue");
            } else if (tags.includes("purple") && Player.unlocked_color === "purple") {
                teleport(data, move_offset);
                should_move = false;
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

    if (data.type !== "yellow_pickup" && !canGrowUp(x,y)) {
        console.log("Cannot grow up here")
    }

    PS.glyph( x , y , 0 );
    PS.border( x , y , 0 );
    PS.radius( x , y , PS.DEFAULT );
    PS.bgColor( x , y , CONFIG.BEAD_BACKGROUND_COLOR );
    PS.bgAlpha( x , y , PS.ALPHA_OPAQUE );
    PS.color( x , y , CONFIG.BEAD_BACKGROUND_COLOR);

    let ability_to_add = null;
    let picking_arrow = false;
    let picking_yellow = false;

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
            getYellowPickup();
            picking_yellow = true;
            break;
        case "purple_pickup" :
            getPurplePickup();
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

    if (!picking_yellow) {
        growUp();
    }

}

function shouldFall(){

    let answer = true;

    for ( let i = 0; i < Player.size; i ++){

        if ( (Player.unlocked_color === "blue") && Player.y === 16) {
            LM.resetLevel();
        }

        if (PS.data( Player.x - i , Player.y + 1 ).tags){
            if (PS.data( Player.x - i, Player.y + 1 ).tags.includes( "ground")){
                answer = false;
                break;
            } else if (Player.unlocked_color !== "blue" && PS.data( Player.x - i, Player.y + 1 ).tags.includes( "blue")){
                answer = false
                break;
            } else if (Player.unlocked_color !== "purple" && PS.data( Player.x - i, Player.y + 1 ).tags.includes( "purple")){
                answer = false
                break;
            }
        }
    }

    return answer;

}

// After eaten every two pickups, the player's size should increase
function growUp() {

    Player.num_pickup_eaten += 1;
    Player.grown = true;

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
    LM.setBlueWalls(false);
    BM.drawColorBar(Player.unlocked_color);
}

// Get yellow pickup handler
function getYellowPickup() {
    const x = Player.x;
    const y = Player.y;

    for ( let i = 0 ; i < Player.size ; i ++ ) {
        for ( let j = 0 ; j < Player.size ; j ++ ) {
            PS.color( x - i, y - j, CONFIG.BEAD_BACKGROUND_COLOR );
        }
    }

    Player.unlocked_color = "yellow";
    Player.body_list = [ [ 0 , 0 ] ];
    Player.num_pickup_eaten = 0;
    Player.size = 1;
    BM.drawColorBar(Player.unlocked_color);
    LM.setBlueWalls(true);
}

// Get purple pickup handler
function getPurplePickup() {
    Player.unlocked_color = "purple";
    BM.drawColorBar(Player.unlocked_color);
    LM.setBlueWalls(true);
}

// Teleport handler
function teleport(data, move_offset) {

    // Erase old player
    const x = Player.x;
    const y = Player.y;

    for ( let i = 0 ; i < Player.size ; i ++ ) {
        for ( let j = 0 ; j < Player.size ; j ++ ) {
            PS.color( x - i, y - j, CONFIG.BEAD_BACKGROUND_COLOR );
        }
    }

    // Calculate new position
    if (move_offset[0] < 0) {
        Player.x = data.tp_location.x - move_offset[0] - Player.size;
    } else if (move_offset[0] > 0) {
        Player.x = data.tp_location.x + Player.size;
    } else {
        Player.x = data.tp_location.x;
    }

    if (move_offset[1] < 0) {
        Player.y = data.tp_location.y - move_offset[0] - Player.size - 1;
    } else if (move_offset[1] > 0) {
        Player.y = data.tp_location.y + Player.size;
    } else {
        Player.y = data.tp_location.y;
    }

    // Draw the player
    Player.drawPlayer();
}


// endregion

export default Player;
