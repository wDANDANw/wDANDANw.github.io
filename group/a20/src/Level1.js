import CONFIG from "./config.js";
import Player from "./Player.js";
import LV2 from "./Level2.js";

const width = 16;
const height = 16;

let player = null;
let playerX = 2;
let playerY = 13;

let ground = null;
let egg = null;

const password = "WAAAASD"
let unlocked = false;

let loop_id = null;

const LV1 = {

    init : function () {
        PS.gridSize( width , height );
        PS.gridColor(  0x555555 );
        PS.border( PS.ALL , PS.ALL , 0 );
        PS.statusColor( PS.COLOR_WHITE );
        PS.bgColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);

        player = sprite(1,1);
        plane(player, 1);
        color(player, PS.COLOR_WHITE);
        move(player, playerX, playerY);

        ground = sprite(16, 2);
        color(ground, 0x333333);
        move(ground, 0, 14);

        loadEgg();

        PS.statusText("WASD to move");

        loop_id = PS.timerStart( CONFIG.FRAME_RATE, LV1.update);
    },

    update : function () {

        switch ( Player.direction ) {

            case Player.INPUTS.UP:
                if (unlocked) move(player, playerX, playerY - 1)
                break;

            case Player.INPUTS.DOWN:
                if (unlocked) move(player, playerX, playerY + 1)
                break;

            case Player.INPUTS.RIGHT:
                move(player, playerX+1, playerY)
                break;

            case Player.INPUTS.LEFT:
                move(player, playerX-1, playerY)
                break;
            default:
                break;
        }

    },

    stop : function () {
        PS.timerStop(loop_id);
    }

}


const move = function (obj, x, y) {
    if (obj === player){

        if (x === 16) {
            LV1.stop();
            LV2.init();
        }

        if (x < 0 || x > 15 || y < 0 || y > 13) {
            return;
        }
        playerX = x;
        playerY = y;
    }

    PS.spriteMove(obj, x, y);
}

const sprite = function (w,h) {
    return PS.spriteSolid(w,h);
}

const color = function (obj, color) {
    PS.spriteSolidColor(obj, color);
}

const plane = function (obj, plane) {
    PS.spritePlane(obj, plane);
}

const loadEgg = function () {
    PS.imageLoad( "assets/img/lv1-egg.png", function (data) {
        egg = PS.spriteImage( data );
        PS.spritePlane(egg, 1);
        move(egg, 2, 1);
        PS.spriteCollide(egg, eggCollisionHandle);
    });
}

const eggCollisionHandle = function (s1, p1, s2, p2, type){
    console.log(s1 + " collided with " + s2 + "! WITH TYPE: " + type );
}

export default LV1;
