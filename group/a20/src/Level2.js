import CONFIG from "./config.js";
import Player from "./Player.js";
import LV3 from "./Level3.js";

const width = 16;
const height = 16;

let player = null;
let playerX = 1;
let playerY = 13;
let playerType = "bead";

let ground = null;

let unlocked = false;

let loop_id = null;
let played = false;

let platform = null;
let platformX = 6;
let platformY = 14;
let bounceX = -1;
let bounceY = -1;

let resetting = false;

const LV2 = {

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
        plane(ground, 1);
        color(ground, 0x333333);
        move(ground, 0, 14);

        platform = sprite(4, 1);
        plane(platform, 2);
        color(platform, PS.COLOR_WHITE);
        move(platform, platformX, platformY);
        PS.spriteCollide(platform, platformCollisionHandle);



        PS.statusText("The Resit");

        loop_id = PS.timerStart( CONFIG.FRAME_RATE, LV2.update);
        resetting = false;
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

        else if (playerType === 'platform') {
            switch ( Player.direction ) {
                case Player.INPUTS.RIGHT:
                    move(platform, platformX+1, platformY)
                    break;

                case Player.INPUTS.LEFT:
                    move(platform, platformX-1, platformY)
                    break;
                default:
                    break;
            }
            updateBall();
        }

        if (Player.space === true) {

            if (!resetting) resetting = true
            else {
                LV2.stop();
                LV2.reset();
                LV2.init();
            }
        }

    },

    stop : function () {
        PS.timerStop(loop_id);
    },

    reset : function () {

        PS.spriteDelete(player);
        PS.spriteDelete(ground);
        PS.spriteDelete(platform);

        player = null;
        playerX = 1;
        playerY = 13;
        playerType = "bead";

        ground = null;

        played = false;

        unlocked = false;

        platform = null;
        platformX = 6;
        platformY = 14;
        bounceX = -1;
        bounceY = -1;

        counter = 0;
        stage = 0;
    }

}


const move = function (obj, x, y) {
    if (obj === player){


        if (playerType === 'bead' && x > 15) {
            LV2.stop();
            LV3.init();
        }

        if (x === 7 && y === 13 && !played) {
            playAnimation();
        }

        if (x < 0 || x > 15 || y < 0 || y > 18) {
            return;
        }

        playerX = x;
        playerY = y;
    }

    if (obj === platform){
        platformX = x;
        platformY = y;
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

const playAnimation = function () {
    PS.statusText('Breakout');
    PS.timerStop(loop_id);
    loop_id = PS.timerStart(CONFIG.FRAME_RATE, platformAnimation);
}

let counter = 0;
let stage = 0;
const platformAnimation = function () {

    if (counter ++ > 5) {
        counter = 0;

        switch ( stage ) {

            case 0: {
                move(ground, 0, 15);
                break;
            }

            case 1: {
                move(ground, 0, 19);
                break;
            }

            case 2: {
                for (let i = 0; i < width; i ++){
                    PS.color(i, 0, 0x333333);
                    PS.data(i, 0, 0x333333);
                }
                break;
            }

            case 3: {
                for (let i = 0; i < width; i ++){
                    PS.color(i, 1, 0x555555);
                    PS.data(i, 1, 0x555555);
                }
                break;
            }

            case 4: {
                for (let i = 0; i < width; i ++){
                    PS.color(i, 2, 0x777777);
                    PS.data(i, 2, 0x777777);
                }
                break;
            }

            case 5: {
                for (let i = 0; i < width; i ++){
                    PS.color(i, 3, 0x999999);
                    PS.data(i, 3, 0x999999);
                }
                break;
            }
        }

        stage ++;

    }

    if (stage > 5) {
        endPlatformAnimation();
    }
}

const endPlatformAnimation = function () {
    PS.timerStop(loop_id);
    loop_id = PS.timerStart(CONFIG.FRAME_RATE, LV2.update);
    playerType = 'platform';
    PS.statusText('WASD to move the platform');
    played = true;
}

let update_ball_counter = 0;
let data;
const updateBall = function () {

    if (update_ball_counter ++ > 1) {
        update_ball_counter = 0;
        if ( (playerX + bounceX) < 0 ) bounceX = 1;
        if ( (playerX + bounceX) > 15 ) bounceX = -1;
        if ( (playerY + bounceY) < 0 ) bounceY = 1;
        if ( (playerY + bounceY) > 15 ) {
            playerType = 'bead';
            playerY = 18;
            playerX += bounceX * 3;
        };

        let newX = playerX + bounceX;
        let newY = playerY + bounceY;
        if (inLevelRange(newX, newY)) {
            data = PS.data(newX, newY);
            if (data) {
                if (data === 0x777777) {
                    move(ground, 0, 14);
                    move(player, 7,13);
                    move(platform, 0, 16);
                    playerType = 'bead';
                    return;
                } else {
                    bounceY = 1;
                }
                PS.color(newX, newY, PS.COLOR_BLACK);
                PS.data(newX, newY, null);
            }
            move(player, playerX + bounceX, playerY + bounceY);
        }

    }
}

const platformCollisionHandle = function (s1, p1, s2, p2, type) {

    console.log(s1, s2)

    if (playerType === 'platform') {

        if (s1 === platform && s2 === player) {
            bounceY = -1;
            move(player, playerX + bounceX, playerY + bounceY)
        }
    }

}

const inLevelRange = function (x , y) {
    return ! ( (x < 0) || (y < 0) || (x > width) || (y > width));
}

export default LV2;
