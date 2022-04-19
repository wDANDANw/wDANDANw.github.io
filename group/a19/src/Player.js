// A12 Player Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import LM from "./LevelManager.js";
import SM from "./SoundManager.js";
import DM from "./DialogueManager.js";
import GM from "./GameManager.js";

const Player = {

    //region Constants
    NOT_MOVABLE_TAGS : [],
    COLOR: 0xB13E53 ,
    MOVE_ANIMATION_PARAS : {
        counter : 0,
        modular : 3,
        comparator : 0
    },

    //endregion

    //region Variables
    init_x : 0,
    init_y : 0,
    x: 1 ,
    y: 1 ,
    type: "bead",

    inputs : {
        up : false,
        down: false,
        left: false,
        right: false,
        space: false,
        inputted: false,
    },
    //endregion

    init : function (x, y) {
        Player.reset();
        Player.init_x = x;
        Player.init_y = y;

        Player.x = Player.init_x;
        Player.y = Player.init_y;

        Player.move(x, y);
    },

    update : function () {

        if (Player.inputs.inputted && isTimeToUpdateMoveAnimation()){

            Player.inputs.inputted = false;

            let move_x = 0;
            let move_y = 0;

            if (Player.inputs.up) {
                move_y += -1;
            }

            if (Player.inputs.down) {
                move_y += 1;
            }

            if (Player.inputs.left) {
                move_x += -1;
            }

            if (Player.inputs.right) {
                move_x += 1;
            }

            if (Player.type === "bead") {
                Player.move(Player.x + move_x, Player.y + move_y);
            }

        }

        if (Player.type === "bead") {
            // Simulate Falling
            if ( isAbleToMove( Player.x , Player.y + 1 ) && isTimeToUpdateMoveAnimation() ) {
                Player.move( Player.x , Player.y + 1 );
            }
        }

    },

    drawPlayer: function () {
        PS.color( Player.x, Player.y, Player.COLOR );
    } ,

    move: function (x , y) {
        // If the collision processing is successful (no errors or edge conditions), then draw the player
        if ( Player.type === "bead" && isAbleToMove( x , y ) ) {

            let local_x , local_y;

            local_x = Player.x;
            local_y = Player.y;

            // Erase the previous color
            const color = PS.data(local_x, local_y).color;
            PS.color( local_x , local_y , color[0], color[1], color[2]);


            // Update player position
            Player.x = x;
            Player.y = y;

            // Draw Player
            Player.drawPlayer();

        }
    },

    reset : function () {
        Player.x = Player.init_x;
        Player.y = Player.init_y;

        for ( let [ key , value ] of Object.entries( Player.inputs ) ) {
            value = false;
        }
    }

}

function isAbleToMove(x , y) {

    if (y > LM.GENERAL_AREA.BOTTOM) {
        if (LM.current_level === "death-level") {
            LM.loadLevel(LM.previous_level);
        } else if (LM.current_level === 3){
        } else {
            LM.loadLevel(LM.current_level+1);

        }
    }

    return LM.isLevelArea( x , y ) && processCollide( x , y );
}

// Function to process potential collision
function processCollide(x , y) {

    let should_move = true;

    const tags = PS.data( x , y ).tags;

    if ( tags.length > 0 ) {

        for ( let i = 0; i < tags.length; i ++) {
            if (Player.NOT_MOVABLE_TAGS.includes(tags[i])){
                should_move = false;
                break;
            }

            switch ( tags[i] ) {
                case "next_level":
                    SM.play(SM.FX.PASS_LEVEL);
                    LM.loadLevel( LM.current_level + 1 );
                    should_move = false;
                    break;
                case "end_game":
                    DM.showMessage("End of Prototype. Thanks for Playing!");
                    break;
                case "white_wall":
                    should_move = false;
                    break;
                case "grey_wall_1":
                    should_move = false;
                    break;
                case "grey_wall_2":

                    if (LM.current_level === 1) {

                        const bead = LM.levels[LM.current_level]["level_layout"][(x * 16 + y).toString()];

                        if (bead.data.visited < 1) {
                            bead.data.group.forEach( index => {

                                let color
                                if (bead.data.visited < 0) {
                                    color = [85, 85, 85];
                                } else {
                                    color = [0, 0, 0];
                                }

                                LM.levels[LM.current_level]["level_layout"][index.toString()].color = color;
                                LM.levels[LM.current_level]["level_layout"][index.toString()].data.visited += 1;
                            })
                            LM.loadLevel("death-level");
                        }



                        // PS.data (x, y).color = [0, 0, 0];
                    }
                    break;
                case "snake_head":
                    should_move = false;
                    const color = PS.data(Player.x, Player.y).color;
                    PS.color( Player.x , Player.y , color[0], color[1], color[2]);
                    Player.type = "snake";
                    CONFIG.FRAME_RATE = 5;
                    GM.restartGameLoop();

                default:
                    break;
            }
        }

        // // Update Dialogue
        // if (tags.includes("dialogue")) {
        //     data.dialogue_data.visited += 1;
        //     DM.showDialogue(data.dialogue_data);
        // }
    }

    return should_move;

}

function isTimeToUpdateMoveAnimation(){

    let answer = false;

    if ( ((Player.MOVE_ANIMATION_PARAS.counter += 1) % Player.MOVE_ANIMATION_PARAS.modular) > Player.MOVE_ANIMATION_PARAS.comparator) {
        answer = true;
    }

    if (Player.MOVE_ANIMATION_PARAS.counter >= Player.MOVE_ANIMATION_PARAS.comparator){
        Player.MOVE_ANIMATION_PARAS.counter = 0;
    }

    return answer;
}

// endregion

export default Player;
