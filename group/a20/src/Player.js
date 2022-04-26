// A12 Player Manager
// Author: Raphael Liu
/* globals PS : true */



const Player = {

    INPUTS : {
        UP: "UP",
        DOWN: "DOWN",
        RIGHT: "RIGHT",
        LEFT: "LEFT",
        NONE: "NONE"
    },

    direction : null,
    space: false,

    init: function () {
        Player.direction = Player.INPUTS.NONE;
    } ,
}

export default Player;
