import CONFIG from "./config.js";
import Player from "./Player.js";
import Snake from "./snake.js";

const width = 16;
const height = 16;

let player = null;
let playerX = 2;
let playerY = 13;

let ground = null;
let egg = null;

let unlocked = false;

let loop_id = null;

let playerType = 'bead';

let counter = 0;
let stage = 0;

const LV3 = {

    init : function () {
        PS.gridSize( width , height );
        PS.gridColor(  0x555555 );
        PS.border( PS.ALL , PS.ALL , 0 );
        PS.statusColor( PS.COLOR_WHITE );
        PS.bgColor(PS.ALL, PS.ALL, PS.COLOR_BLACK);
        PS.color(PS.ALL, PS.ALL, PS.COLOR_BLACK);

        player = sprite(1,1);
        plane(player, 2);
        color(player, PS.COLOR_WHITE);
        move(player, playerX, playerY);

        ground = sprite(16, 2);
        plane(ground, 1)
        color(ground, 0x333333);
        move(ground, 0, 14);

        PS.statusText("The Resit");

        loop_id = PS.timerStart( CONFIG.FRAME_RATE, LV3.update);

        Snake.init();
    },

    update : function () {

        if (playerType === 'bead') {
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
        }

        if (playerType === 'animation') {
            if (counter ++ > 5) {
                counter = 0;

                switch ( stage ) {

                    case 0: {
                        move( ground , 0 , 15 );
                        stage++;
                        break;
                    }

                    case 1: {
                        move( ground , 0 , 19 );
                        stage++;
                        break;
                    }
                    case 2:{
                        playerType = 'snake';
                        PS.statusText('WASD to change direction')
                        stage++;
                        break;
                    }
                    default:
                        break;
                }
            }
        }

        if (playerType === 'snake'){

            if( Player.direction === Player.INPUTS.LEFT && (Snake.d !== "LEFT") && (Snake.d !== "RIGHT") )  Snake.d = "LEFT";
            if( Player.direction === Player.INPUTS.UP && (Snake.d !== "UP") && (Snake.d !== "DOWN") ) Snake.d = "UP"
            if( Player.direction === Player.INPUTS.RIGHT && (Snake.d !== "RIGHT") && (Snake.d !== "LEFR")) Snake.d = "RIGHT"
            if( Player.direction === Player.INPUTS.DOWN && (Snake.d !== "DOWN") && (Snake.d !== "UP")) Snake.d = "DOWN"


            Snake.update();

        }
    },

    stop : function () {
        PS.timerStop(loop_id);
    }

}


const move = function (obj, x, y) {
    if (obj === player){

        if (x === 7 && y === 13) {
            PS.spriteMove(player, -1, -1);
            playerType = 'animation'
            Player.direction = Player.INPUTS.UP;
            return;
            PS.statusText('The Ouroboros, an endless loop... ');
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
    PS.imageLoad( "assets/img/LV3-egg.png", function (data) {
        egg = PS.spriteImage( data );
        PS.spritePlane(egg, 1);
        move(egg, 2, 1);
        PS.spriteCollide(egg, eggCollisionHandle);
    });
}

const eggCollisionHandle = function (s1, p1, s2, p2, type){
    console.log(s1 + " collided with " + s2 + "! WITH TYPE: " + type );
}

export default LV3;
