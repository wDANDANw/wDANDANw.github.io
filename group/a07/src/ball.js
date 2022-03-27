// Ball.js
// Ball related globals

/* globals PS : true */

import {debug as UtilsDebug} from "./utils.js";
import GAME_CONFIG from "./config.js";
import PAINT from "./paint.js";

const BALL_DEBUG_MASK = true;
const debug = (message, message_debug_level) => { if (BALL_DEBUG_MASK) UtilsDebug(message, message_debug_level)}

/**
 * The ball object for the ball in the game
 */
const BALL = {

    // Constants
    BALL_COLOR : 0xA9A9A9,		            // Ball Color
    BOTTOM_ROW: GAME_CONFIG.HEIGHT, 		// The bottom row at where ball will vanish
    // End of Constant Section

    // Variables
    ball_list: [], 							// The list of all balls
    destroy_list: [],                       // The list of balls that is going to be destroyed
    destroying_all: false,                  // Special flag when destorying all
    // End of Variable Section

    // Functions
    /**
     * The function that will calculate and update all balls on the canvas
     */
    updateAllBalls : function() {

        // Check if needs a new update loop
        if (!BALL.shouldStartOneNewUpdateLoop()) {
            debug("updateAllBalls: Should not update. Skipped.", 2)
            return
        }

        // If should start a new update loop, traverse all balls in the list to update all of them
        for (let index = BALL.ball_list.length - 1; index >= 0; index--){ // Traverse reversely because the current object may get deleted
            BALL.updateOneBall(BALL.ball_list[index], index) // Update each ball
        }

        // At last, destroy all balls in the destroy list
        BALL.destroyBallsInDestroyList();
    },

    /**
     * Should Start A New Update Loop
     * Initial status checker to avoid unnecessary loop running
     * @returns {should_get_started: boolean}
     */
    shouldStartOneNewUpdateLoop : function () {
        var should_get_started = true;

        // If there is no ball in the list, then there is no need to execute a new loop
        if ( BALL.ball_list.length < 1) should_get_started = false

        return should_get_started;
    },

    /**
     * Method to update one ball
     * @param ball: a ball in the ball list
     */
    updateOneBall : function (ball, ball_index) {

        const x = ball[0]; // The x coordinate of the ball
        const y = ball[1]; // The y coordinate of the ball

        // Move the ball to next position
        if (ball[2] !== undefined) { // Is bouncing

            if (ball[2] === -1 && x === 10) {
                ball[2] = 1;
            }

            if (ball[2] === 1 && x === 21) {
                ball[2] = -1;
            }

            if (ball[3] === -1 && y === 2) {
                ball[3] = 1;
            }

            if (y === 27) {
                if (Math.abs(x - PAINT.pinball_x) < 4) {
                    ball[3] = -1;
                    ball[2] = PAINT.pinball_direction;
                }
            }

                BALL.move(ball, ball_index, [x + ball[2], y + ball[3]]);

        } else if ( (y === 27 && PAINT.current === 9) ) { // Check pinball

            console.log("bouncing!")

            if (Math.abs(x - PAINT.pinball_x) < 4) {
                BALL.ball_list[ball_index][2] = PAINT.pinball_direction;
                BALL.ball_list[ball_index][3] = -1;
                BALL.move(ball, ball_index, [x + PAINT.pinball_direction, y - 1])
            }

        } else if (y < BALL.BOTTOM_ROW - 1) { // Normal cases

            // In normal cases, the ball will move downwards by one bead
            BALL.move(ball, ball_index, [x, y+1]);

        } else { // Ball is already at the last row. Should destroy it.

            // Last row processes
            // Now only erase the old bead
            PS.color( ball[0], ball[1], GAME_CONFIG.BEAD_BACKGROUND_COLOR );


            BALL.destroy(ball_index);

        }
    },

    /**
     * Move the ball to a specific coordinate by erasing the last bead and draw the next bead
     * @param old_coord: the coordinate of the old position
     * @param new_coord: the coordinate of the new position
     */
    move : function (ball, ball_index, new_coord) {

        const old_coord = [ball[0], ball[1]];

        // Check if the new position is movable
        if (!BALL.beadIsMovable(new_coord)) {
            PAINT.clearBead(old_coord);
            BALL.destroy(ball_index);
            return
        }

        if (ball[2] !== undefined) { // bouncing

        }

        // Clear the old bead
        PAINT.clearBead(old_coord);

        // Update the new bead
        PAINT.drawBall(new_coord);

        // Check collisions
        BALL.checkCollision(new_coord[0], new_coord[1]);

        // Update the ball position
        BALL.ball_list[ball_index][0] = new_coord[0];
        BALL.ball_list[ball_index][1] = new_coord[1];
    },

    /**
     * Check collision at location. Assume valid point since only caller would be move
     * @param x
     * @param y
     */
    checkCollision : function (x ,y) {

        const color = PS.data(x,y);
        if (color === 0xFF) return;

        switch (color) {
            case PAINT.COLORS[0]:
                PS.audioPlay( PS.piano(40) );
                PAINT.addToMusicBarList(PAINT.COLORS[0]);
                break;
            case PAINT.COLORS[1]:
                PS.audioPlay( PS.piano(42) );
                PAINT.addToMusicBarList(PAINT.COLORS[1]);
                break;
            case PAINT.COLORS[2]:
                PS.audioPlay( PS.piano(44) );
                PAINT.addToMusicBarList(PAINT.COLORS[2]);
                break;
            case PAINT.COLORS[3]:
                PS.audioPlay( PS.piano(45) );
                PAINT.addToMusicBarList(PAINT.COLORS[3]);
                break;
            case PAINT.COLORS[4]:
                PS.audioPlay( PS.piano(47) );
                PAINT.addToMusicBarList(PAINT.COLORS[4]);
                break;
            case PAINT.COLORS[5]:
                PS.audioPlay( PS.piano(49) );
                PAINT.addToMusicBarList(PAINT.COLORS[5]);
                break;
            case PAINT.COLORS[6]:
                PS.audioPlay( PS.piano(51) );
                PAINT.addToMusicBarList(PAINT.COLORS[6]);
                break;
            default:
                debug("Default in collision");
                break;
        }

    },

    /**
     * Check if the coordinate is movable
     * @param coord
     */
    beadIsMovable : function (coord) {

        const x = coord[0];
        const y = coord[1];

        if ( (x < 10 || x >= 22) || (y < 2 || y >= 30) ) {
            debug("This place is not movable!")
            return false;
        } else if ( BALL.ball_list.filter( (ball) => { return (ball[0] == x && ball[1] == y)}).length > 0){ // If there are balls with same position
            return false;
        }

        return true;
    },

    /**
     * Destroy function to remove a ball at the end of this frame
     * @param ball_index: The index of the ball to be destroyed in the current ball_list (this frame)
     */
    destroy : function (ball_index) {
        BALL.destroy_list.push(ball_index);
    },

    /**
     * Function to instantly destroy all balls in the list
     * Since needs instant destroy, cannot use the destroy balls in list function
     */
    destroyAll : function (from_reset_ball_count_panel = false) {
        debug("BALL:destoryAll: Destroying all!", 1)

        // Destroy all balls by empty and initialize those two lists
        BALL.ball_list = [];
        BALL.destroy_list = [];

        // Then turn the flag to false
        BALL.destroying_all = false;

        // After this, tell PAINT::BallCountPanel that balls reset. Therefore, update the ball count panel accordingly.
        if (!from_reset_ball_count_panel) PAINT.resetBallCountPanel();

    },

    /**
     * Destroy all balls in the destroy list.
     * Executed at the end of updating all balls loop.
     * Can be manually invoked to destroy the balls immediately.
     */
    destroyBallsInDestroyList : function () {

        // First sort the destroy list in ascending order.
        // This will ensure that previous deleted index will not impact next index
        BALL.destroy_list.sort( (a, b) => {return a - b}) // Sort takes a comparison function

        // Then destroy all balls in the list
        while (BALL.destroy_list.length > 0) {
            const index_to_be_deleted = BALL.destroy_list.pop();
            BALL.ball_list.splice(index_to_be_deleted, 1);
            PAINT.updateBallCountPanel(+1);

        }
    },

    /**
     * Function to add a ball at a specific bead
     * @param x: the x coordinate of where the ball will be added
     * @param y: the y coordinate of where the ball will be added
     */
    addBall : function(x, y) {

        if (!BALL.beadIsMovable([x,y])) return

        const new_ball = [x, y] // Assuming a ball is a 2 element array now
        BALL.ball_list.push(new_ball);

        PAINT.drawBall([x,y]);
        PAINT.updateBallCountPanel(-1);

        debug("Added a new ball!", 1);
    },

    /**
     * Determine if a coord is in the playground area
     * @param x
     * @param y
     * @returns {boolean}
     */
    isInPlaygroundArea : function (x, y) {
        return (x >=10 && x < 22) && (y >= 2 && y <30)
    },

};

export default BALL;
