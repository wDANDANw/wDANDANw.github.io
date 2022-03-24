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
    BALL_COLOR : PS.COLOR_BLACK,		    // Ball Color
    BOTTOM_ROW: GAME_CONFIG.HEIGHT, 		// The bottom row at where ball will vanish
    // End of Constant Section

    // Variables
    ball_list: [], 							// The list of all balls
    destroy_list: [],                       // The list of balls that is going to be destroyed\
    // End of Variable Section

    // Functions
    /**
     * The function that will calculate and update all balls on the canvas
     */
    updateAllBalls : function() {

        // Check if needs a new update loop
        if (!BALL.shouldStartOneNewUpdateLoop()) {
            debug("updateAllBalls: Should not update. Skipped.", 1)
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
        if (y < BALL.BOTTOM_ROW - 1) { // Normal cases

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

        // Erase the old bead
        PS.color( ball[0], ball[1], GAME_CONFIG.BEAD_BACKGROUND_COLOR );

        // Check if the new position is movable
        if (!BALL.beadIsMovable(new_coord)) {
            return
        }

        // Update the color of the beads
        PS.color( new_coord[0], new_coord[1], BALL.BALL_COLOR );

        // Update the ball position
        BALL.ball_list[ball_index][0] = new_coord[0];
        BALL.ball_list[ball_index][1] = new_coord[1];
    },

    /**
     * Check if the coordinate is movable
     * @param coord
     */
    beadIsMovable : function (coord) {

        if ( (coord[0] < 0 || coord[0] >= GAME_CONFIG.WIDTH) || (coord[1] < 0 || coord[1] >= GAME_CONFIG.HEIGHT) ) {
            debug("This place is not movable!")
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
        }
    },

    /**
     * Function to add a ball at a specific bead
     * @param x: the x coordinate of where the ball will be added
     * @param y: the y coordinate of where the ball will be added
     */
    addBall : function(x, y) {
        const new_ball = [x, y] // Assuming a ball is a 2 element array now
        BALL.ball_list.push(new_ball);

        debug("Added a new ball!", 1);
    },

};

export default BALL;
