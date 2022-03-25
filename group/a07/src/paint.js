// Paint.js
import GAME_CONFIG from "./config.js";
import {debug as UtilsDebug} from "./utils.js";
import BALL from "./ball.js";
import GAME from "../game.js";

/* globals PS : true */

const PAINT_DEBUG_MASK = true;
const debug = (message, message_debug_level) => { if (PAINT_DEBUG_MASK) UtilsDebug(message, message_debug_level)};

/**
 * The paint module for the canvas and drawing functionalities of the toy
 */
const PAINT = {

    // CONSTANTS

    COLOR_GRID_WIDTH: 6, // The width of a color grid
    COLOR_GRID_HEIGHT: 2, // The height of a color grid
    COLOR_GRID_BOARDER_COLOR: 0xC0C0C0, // The color of the boarder when selected

    // The palette colors, scientifically chosen! :)

    COLORS: [
        0xFB536A, // RED
        0xFF8057, // ORANGE
        0xFAEA08, // YELLOW
        0xA0EA48, // GREEN
        0x16B9E1, // CYAN
        0x4F34CA, // BLUE
        0xC038CF, // PURPLE
    ],

    // VARIABLES
    // Variable names are lower-case with camelCaps

    current: 0, // 10 possibilities: 0-6 = colors index. 7 = white. 8 = ball. 9 = pinball
    color: 0xDCF5FF, // color of current palette selection
    underColor: 0xDCF5FF, // color of bead under the brush
    dragging: false, // true if dragging brush

    ball_panel_ball_coord_list: [], // The coordinate list for positions of balls
    ball_numbers : 18, // At most 18 balls

    pinball_sprite : null, // The reference to the pinball sprite
    pinball_x : 25, // The x-coordinate of the pinball
    pinball_direction: 0, // the movement direction of the pinball -1 = left, 0 = mid, 1 = right

    music_bar_list : [], // The music bar list
    // FUNCTIONS

    // PAINT.select ( x, y, data )
    // Selects a new color for painting

    /**
     * Paint function to initialize paint related functionalities
     */
    init : function () {

        // Draw panels
        PAINT.drawBoarders();

        PAINT.drawColorPanel();

        PAINT.drawBallPanel();


        // Start with first color selected
        PAINT.current = 0;
        PAINT.color = PAINT.COLORS[0];

        PAINT.reset();
    },

    /**
     * Helper function to draw outer boarders
     */
    drawBoarders : function () {
        // Draw the top boarder
        const upper_boarder = PS.spriteSolid(32, 2);
        PS.spriteSolidColor( upper_boarder , PS.COLOR_BLACK );
        PS.spriteMove( upper_boarder, 0, 0);

        // Draw the bottom boarder
        const bottom_boarder = PS.spriteSolid(32, 2);
        PS.spriteSolidColor( bottom_boarder , PS.COLOR_BLACK );
        PS.spriteMove( bottom_boarder, 0, 30);

        // Draw the left boarder at color panel
        const color_left_boarder = PS.spriteSolid(2, 28);
        PS.spriteSolidColor( color_left_boarder , PS.COLOR_BLACK );
        PS.spriteMove( color_left_boarder, 0, 2);

        // Draw the right boarder at color panel
        const color_right_boarder = PS.spriteSolid(2, 28);
        PS.spriteSolidColor( color_right_boarder , PS.COLOR_BLACK );
        PS.spriteMove( color_right_boarder, 8, 2);

        // Draw the left boarder at ball panel
        const ball_left_boarder = PS.spriteSolid(2, 28);
        PS.spriteSolidColor( ball_left_boarder , PS.COLOR_BLACK );
        PS.spriteMove( ball_left_boarder, 22
            , 2)

        // Draw the right boarder at ball panel
        const ball_right_boarder = PS.spriteSolid(2, 28);
        PS.spriteSolidColor( ball_right_boarder , PS.COLOR_BLACK );
        PS.spriteMove( ball_right_boarder, 30, 2)
    },

    /**
     * Helper function to draw the color panel at left and the playground at the middle
     * 10 x 32 for color panel
     * 12 x 32 for playground (too simple so combined with color panel in init)
     */
    drawColorPanel : function () {

        _drawEraser();

        _drawColorPanel(); // Step 3: Draw the color panel for selecting colors

        _drawRestart(); // Step 4: Draw the button panel for eraser and restart

        _drawPlayground();

        /**
         * Helper function to draw the eraser
         * @private
         */
        function _drawEraser() {

            // Draw the eraser button
            /*
                ◜ ━ ━ ━ ━◝
                |🧹🧹🧹🧹|
             */
            PS.glyph(2, 2, 0x256D) // ╭
            PS.glyph(3, 2, 0x2501); // ━
            PS.glyph(4, 2, 0x2501); // ━
            PS.glyph(5, 2, 0x2501); // ━
            PS.glyph(6, 2, 0x2501); // ━
            PS.glyph(7, 2, 0x256E); // ╮
            PS.glyph(2, 3, "|"); // |
            PS.glyph(3, 3, 0x1F9F9); // 🧹
            PS.glyph(4, 3, 0x1F9F9); // 🧹
            PS.glyph(5, 3, 0x1F9F9); // 🧹
            PS.glyph(6, 3, 0x1F9F9); // 🧹
            PS.glyph(7, 3, "|"); // |

            // Boarder between logo and color palette
            const sub_boarder_1 = PS.spriteSolid(6, 2);
            PS.spriteSolidColor( sub_boarder_1 , PS.COLOR_BLACK );
            PS.spriteMove( sub_boarder_1, 2, 4);

            PS.exec(2,2,PAINT.select);
            PS.exec(3,2,PAINT.select);
            PS.exec(4,2,PAINT.select);
            PS.exec(5,2,PAINT.select);
            PS.exec(6,2,PAINT.select);
            PS.exec(7,2,PAINT.select);
            PS.exec(2,3,PAINT.select);
            PS.exec(3,3,PAINT.select);
            PS.exec(4,3,PAINT.select);
            PS.exec(5,3,PAINT.select);
            PS.exec(6,3,PAINT.select);
            PS.exec(7,3,PAINT.select);
        }

        /**
         * Helper function to draw the color panel
         * @private
         */
        function _drawColorPanel() {

            // Loop to automatically construct palettes
            let current_anchor = [2, 6];
            let temp_boarder_ref;
            for ( let index = 0 ; index < PAINT.COLORS.length ; index ++) {

                // Draw the Palette
                _drawOneColorPalette(PAINT.COLORS[index], current_anchor);

                // Move the anchor to boarder position
                current_anchor[1] += 2;

                // Draw a boarder
                if (index < PAINT.COLORS.length - 1) { // Last color boarder is 2 in height
                    temp_boarder_ref = PS.spriteSolid(6, 1);
                    PS.spriteSolidColor( temp_boarder_ref , PS.COLOR_BLACK );
                    PS.spriteMove( temp_boarder_ref, current_anchor[0], current_anchor[1]);
                } else {
                    temp_boarder_ref = PS.spriteSolid(6, 2);
                    PS.spriteSolidColor( temp_boarder_ref , PS.COLOR_BLACK );
                    PS.spriteMove( temp_boarder_ref, current_anchor[0], current_anchor[1]);
                }

                // Move the anchor to next position
                current_anchor[1] += 1;
            }

            /**
             * Helper method to draw a color grid at a specific location that is determined by anchor
             * @param color: The color of the grid
             * @param upper_left_coord: The upper left corner of the grid
             * @private
             */
            function _drawOneColorPalette(color, upper_left_coord) {

                let drawX, drawY;

                for (let row = 0; row < PAINT.COLOR_GRID_HEIGHT; row++) {
                    for (let col = 0; col < PAINT.COLOR_GRID_WIDTH; col++) {
                        drawX = upper_left_coord[0] + col;
                        drawY = upper_left_coord[1] + row;

                        PS.color( drawX, drawY, color ); // set color of the palette
                        PS.data( drawX, drawY, color );
                        PS.exec( drawX, drawY, PAINT.select);
                    }
                }
            }
        }

        /**
         * Helper function to draw the buttons in the color panel
         * @private
         */
        function _drawRestart() {

            // Draw the restart button

            /*
                |🧹🧹🧹🧹|
                ╰ ━ ━ ━ ━ ╯
             */
            PS.glyph(2, 28, "|"); // |
            PS.glyph(3, 28, 0x2B6E); // ⭮
            PS.glyph(4, 28, 0x2B6E); // ⭮
            PS.glyph(5, 28, 0x2B6F); // ⭯
            PS.glyph(6, 28, 0x2B6F); // ⭯
            PS.glyph(7, 28, "|"); // |
            PS.glyph(2, 29, 0x2570) // ╭
            PS.glyph(3, 29, 0x2501); // ━
            PS.glyph(4, 29, 0x2501); // ━
            PS.glyph(5, 29, 0x2501); // ━
            PS.glyph(6, 29, 0x2501); // ━
            PS.glyph(7, 29, 0x256F); // ╮

            PS.exec(2, 28, PAINT.reset );
            PS.exec(3, 28, PAINT.reset );
            PS.exec(4, 28, PAINT.reset );
            PS.exec(5, 28, PAINT.reset );
            PS.exec(6, 28, PAINT.reset );
            PS.exec(7, 28, PAINT.reset );
            PS.exec(2, 29, PAINT.reset );
            PS.exec(3, 29, PAINT.reset );
            PS.exec(4, 29, PAINT.reset );
            PS.exec(5, 29, PAINT.reset );
            PS.exec(6, 29, PAINT.reset );
            PS.exec(7, 29, PAINT.reset );

            // Draw the reset button
        }

        /**
         * Helper function to initialize the playground area
         * @private
         */
        function _drawPlayground() {
            for ( let col = 10 ; col < 22; col ++) {
                for (let row = 2 ; row < 30 ; row ++) {
                    PS.data(col, row, GAME_CONFIG.BEAD_BACKGROUND_COLOR);
                }
            }
        }
    },


    /**
     * Helper function to draw the ball panel
     */
    drawBallPanel : function () {

        // Load the boarder image // Cannot use bcasue somehow event resetting the background color doesnt matter
        // Guess layer is different
        // const ball_panel_boarder_loader = (image) => {
        //     PS.imageBlit( image, 24,  2);
        // }
        //
        // PS.imageLoad( "assets/ball_panel.png", ball_panel_boarder_loader );

        // Draw the boarder
        _drawBoarders();

        // Draw the balls
        PAINT.callBackBalls();

        // Draw Ball Indicator
        _drawBallIndicator();

        // Draw the speed panel
        _drawSpeeds();

        // Draw Pinball Panel
        _drawPinball();

        // Draw the pinball
        PAINT.drawPinball(25);

        // Helper functions

        /**
         * Helper function to draw boarders
         * @private
         */
        function _drawBoarders() {

            // Draw the L shape at top
            PS.color(27, 5, PS.COLOR_BLACK);
            PS.color(27, 6, PS.COLOR_BLACK);
            PS.color(27, 7, PS.COLOR_BLACK);
            PS.color(28, 5, PS.COLOR_BLACK);
            PS.color(29, 5, PS.COLOR_BLACK);

            // Draw the double line between balls and music bar
            const double_boarder_1 = PS.spriteSolid(6, 2);
            PS.spriteSolidColor( double_boarder_1 , PS.COLOR_BLACK );
            PS.spriteMove( double_boarder_1, 24, 8);

            // Draw the music bar

            // Draw the double line between music bar and speed bar
            const double_boarder_2 = PS.spriteSolid(6, 2);
            PS.spriteSolidColor( double_boarder_2 , PS.COLOR_BLACK );
            PS.spriteMove( double_boarder_2, 24, 16);

            // Draw the cross
            const double_boarder_3 = PS.spriteSolid(6, 2);
            PS.spriteSolidColor( double_boarder_3 , PS.COLOR_BLACK );
            PS.spriteMove( double_boarder_3, 24, 20);

            const double_boarder_4 = PS.spriteSolid(2, 6);
            PS.spriteSolidColor( double_boarder_4 , PS.COLOR_BLACK );
            PS.spriteMove( double_boarder_4, 26, 18);

            const double_boarder_5 = PS.spriteSolid(6, 2);
            PS.spriteSolidColor( double_boarder_5 , PS.COLOR_BLACK );
            PS.spriteMove( double_boarder_5, 24, 24);

        }

        /**
         * Helper function to draw the ball indicator
         * @private
         */
        function _drawBallIndicator() {
            PS.glyph(28, 6, (PAINT.ball_numbers / 10).toString());
            PS.glyph(29, 6, (PAINT.ball_numbers % 10).toString());

            PS.exec(28, 6, PAINT.callBackBalls);
            PS.exec(28, 6, PAINT.callBackBalls);
            PS.exec(29, 7, PAINT.callBackBalls);
            PS.exec(29, 7, PAINT.callBackBalls);
        }


        /**
         * Helper function to draw the speed changing section of the ball panel
         * @private
         */
        function _drawSpeeds() {

            // Draw 1X
            PS.glyph(24, 18, 0x1F40C ); // Snail 🐌
            PS.glyph(25, 18, 0x1F40C ); // Snail 🐌
            PS.glyph(24, 19, ">" ); // >
            PS.glyph(25, 19, "1" ); // 1

            PS.exec(24, 18, PAINT.select);
            PS.exec(25, 18, PAINT.select);
            PS.exec(24, 19, PAINT.select);
            PS.exec(25, 19, PAINT.select);


            // Draw 2X
            PS.glyph(28, 18, 0x1F6F5 ); // Scooter 🛵
            PS.glyph(29, 18, 0x1F6F5 ); // Scooter 🛵
            PS.glyph(28, 19, 0x2ABC ); // ⪼
            PS.glyph(29, 19, "2" ); // 2

            PS.exec(28, 18, PAINT.select);
            PS.exec(28, 19, PAINT.select);
            PS.exec(29, 18, PAINT.select);
            PS.exec(29, 19, PAINT.select);

            // Draw 3X
            PS.glyph(24, 22, 0x1F682 ); // train 🚂
            PS.glyph(25, 22, 0x1F682 ); // train 🚂
            PS.glyph(24, 23, 0x2AF8 ); // ⪼
            PS.glyph(25, 23, "3" ); // 3

            PS.exec(24, 22, PAINT.select);
            PS.exec(25, 22, PAINT.select);
            PS.exec(24, 23, PAINT.select);
            PS.exec(25, 23, PAINT.select);

            // Draw 4X
            PS.glyph(28, 22, 0X1F6EB ); // train 🛫
            PS.glyph(29, 22, 0X1F6EB ); // train 🛫
            PS.glyph(28, 23, 0x2AF8 ); // ⫸
            PS.glyph(29, 23, "4" ); // 3

            PS.exec(28, 22, PAINT.select);
            PS.exec(29, 22, PAINT.select);
            PS.exec(28, 23, PAINT.select);
            PS.exec(29, 23, PAINT.select);
        }

        /**
         *
         * @private
         */
        function _drawPinball() {
            for ( let col = 24 ; col < 30; col ++) {
                for (let row = 26; row < 30; row ++) {
                    PS.data( col, row, PS.COLOR_BLACK);
                    PS.exec( col, row, PAINT.select);
                }
            }
        }

    },

    updateBallPanel : function (change) {

        if (change == -1) {

            PAINT.ball_numbers -=1;
            PAINT.clearBead(PAINT.ball_panel_ball_coord_list[PAINT.ball_numbers - 1], false);

        } else if (change == 1) {

            PAINT.ball_numbers +=1;
            PAINT.drawBall(PAINT.ball_panel_ball_coord_list[PAINT.ball_numbers - 1]);

        } else  {
            debug("PAINT::updateBallPanel: Error: not +1 or -1")
        }

        PS.glyph(28, 6, (PAINT.ball_numbers / 10).toString());
        PS.glyph(29, 6, (PAINT.ball_numbers % 10).toString());

    },

    /**
     * Function to draw the pinball
     * @param x: the x coordinate of the left side of the pinball
     */
    drawPinball : function (x) {

        if (!PAINT.pinball_sprite) {
            PAINT.pinball_sprite = PS.spriteSolid(4, 1);
            PS.spriteSolidColor( PAINT.pinball_sprite , PS.COLOR_BLACK );
            PS.spriteMove( PAINT.pinball_sprite, PAINT.pinball_x, 28);
        }

        if (x < PAINT.pinball_x) { // Moving leftwards
            if (x < 10) {
                PS.spriteMove( PAINT.pinball_sprite, 10, 28);
                PAINT.pinball_x = 10;
                PAINT.pinball_direction = 0;
            } else {
                PS.spriteMove(PAINT.pinball_sprite, x, 28);
                PAINT.pinball_x = x;
                PAINT.pinball_direction = -1;
            }
        } else { // Moving rightwards or stay not moving
            if (x > 28) {
                PS.spriteMove(PAINT.pinball_sprite, 28, 28);
                PAINT.pinball_x = 28;
                PAINT.pinball_direction = 0;
            } else {
                PS.spriteMove(PAINT.pinball_sprite, x, 28);
                PAINT.pinball_x = x;
                PAINT.pinball_direction = 1;
            }
        }
    },

    /**
     * Function to draw the music bar
     */
    drawMusicBar : function () {

        if (PAINT.music_bar_list.length < 1) {
            return
        }

        // Draw the music bar from lower right to upper left
        let col = 29;
        let row = 15;

        let len = PAINT.music_bar_list.length;
        if (len > 36) {
            debug("drawMusicBar: Error: Music bar list greater than 36")
            len = 36
        }

        for ( let i = 0 ; i < len ; i ++) {
            PS.color(col, row, PAINT.music_bar_list[i]);
            col --;
            if (col <= 23) {
                col = 29;
                row --;
            }
        }
    },

    /**
     * Function to add a new color to the music bar list
     * @param new_color
     */
    addToMusicBarList : function (new_color) {

        // Add to front
        PAINT.music_bar_list.unshift(new_color);

        if (PAINT.music_bar_list.length > 36) {
            PAINT.music_bar_list = PAINT.music_bar_list.slice(0, 36); // Take the 36 elements at the beginning
        }

    },

    /**
     * Method to draw a ball
     * @param coord
     */
    drawBall : function (coord) {

        const x = coord[0];
        const y = coord[1];

        PS.bgColor ( x, y, PS.data(x, y) ) // use original color
        PS.bgAlpha( x, y, PS.ALPHA_OPAQUE )
        PS.scale( x, y, 85 ) // Slightly smaller
        PS.radius( x, y, 50 ) // Circular
        PS.color( x, y, BALL.BALL_COLOR );
    },

    /**
     * Method to empty a bead
     * @param coord
     */
    clearBead : function (coord, dataAndFunctionReset=true) {

        const x = coord[0];
        const y = coord[1];

        PS.color( x, y, GAME_CONFIG.BEAD_BACKGROUND_COLOR );
        PS.radius( x, y, 0 );
        PS.scale( x, y, 100 );
        PS.bgColor( x, y, GAME_CONFIG.BEAD_BACKGROUND_COLOR );
        PS.bgAlpha( x, y, PS.ALPHA_OPAQUE )

        if (dataAndFunctionReset) {
            PS.data( x, y, GAME_CONFIG.BEAD_BACKGROUND_COLOR);
            PS.exec( x, y, PS.DEFAULT);
        }
    },

    /**
     * Function to call back all balls
     */
    callBackBalls : function (reset=false) {

        PAINT.ball_numbers = 18;

        let coord;
        // Add coords
        for ( let col = 24 ; col < 30 ; col ++) {
            for ( let row = 2 ; row < 5 ; row ++) {

                coord = [col, row]

                PAINT.clearBead(coord);
                PAINT.ball_panel_ball_coord_list.push(coord);
                PAINT.drawBall(coord);
                PS.data(col, row, BALL.BALL_COLOR);
                PS.exec(col, row, PAINT.select);
            }
        }

        for ( let col = 24 ; col < 27 ; col ++) {
            for ( let row = 5 ; row < 8 ; row ++) {

                coord = [col, row]

                PAINT.clearBead(coord);
                PAINT.ball_panel_ball_coord_list.push(coord);
                PAINT.drawBall(coord);
                PS.data(col, row, BALL.BALL_COLOR);
                PS.exec(col, row, PAINT.select);

            }
        }

        PS.glyph(6, 28, (PAINT.ball_numbers / 10));
        PS.glyph(7, 28, (PAINT.ball_numbers % 10));

        if (!reset) BALL.destroyAll();
    },

    select : function ( x, y, data ) {
        "use strict";


        if (PAINT.current !== 9) {

        }


        if ( PAINT.isInColorPanel(x, y) ) {

            const color_index = Math.floor((y-6 ) / 3);
            console.log(color_index);

            if ( color_index !== PAINT.current  )	{
                // TODO: Needs Modification
                // PS.border(GAME_CONFIG.WIDTH - 1, PAINT.current, 0); // turn off previous border
                // PS.border( x, y, 2 );

                PAINT.current = color_index;

                console.log("Current: " + PAINT.current);

                PAINT.color = data; // set current color from color stored in bead data
                PS.audioPlay( "fx_click" );
            }
            PAINT.drawPinball(25);
        } else if ( PAINT.isInBallCountPanel(x,y)) {
            PAINT.current = 8
            PAINT.color = data; // set current color from color stored in bead data
            PS.audioPlay( "fx_click" );
            PAINT.drawPinball(25);
        } else if (PAINT.isInPinballPanel(x,y)) {
            PAINT.current = 9
            PAINT.color = PS.COLOR_BLACK; // set current color from color stored in bead data
            PS.audioPlay( "fx_click" );
        } else if (PAINT.isInEraserPanel(x,y)) {
            PAINT.current = 7
            PAINT.color = PS.COLOR_WHITE; // set current color from color stored in bead data
            PS.audioPlay( "fx_click" );
            PAINT.drawPinball(25);
        } else if (PAINT.isInSppedPanel1(x,y)) {
            PS.audioPlay( "fx_click" );
            GAME.changeGameSpeed(1);
        } else if (PAINT.isInSppedPanel2(x,y)) {
            PS.audioPlay( "fx_click" );
            GAME.changeGameSpeed(1.3);
        } else if (PAINT.isInSppedPanel3(x,y)) {
            PS.audioPlay( "fx_click" );
            GAME.changeGameSpeed(1.8);
        } else if (PAINT.isInSppedPanel4(x,y)) {
            PS.audioPlay( "fx_click" );
            GAME.changeGameSpeed(2.5);
        }  else {
            console.log("Paint.select: not selected")
        }
    },

    isInColorPanel : function (x, y) {
        return (x >= 2 && x < 8) && (y >= 6 && y < 26);
    },

    isInBallCountPanel : function (x, y) {
        return (x >= 24 && x < 30) && (y >= 2 && y < 8);
    },

    isInPinballPanel : function (x, y) {
        return (x >= 24 && x < 30) && (y >= 26 && y < 30);
    },

    isInEraserPanel : function (x, y) {
        return (x >= 2 && x < 8) && (y >= 2 && y < 4);
    },

    isInSppedPanel1 : function (x, y) {
        return (x >= 24 && x < 26) && (y >= 18 && y < 20);
    },

    isInSppedPanel2 : function (x, y) {
        return (x >= 28 && x < 30) && (y >= 18 && y < 20);
    },

    isInSppedPanel3 : function (x, y) {
        return (x >= 24 && x < 26) && (y >= 22 && y < 24);
    },

    isInSppedPanel4 : function (x, y) {
        return (x >= 28 && x < 30) && (y >= 22 && y < 24);
    },

    // PAINT.reset ()
    // Clears the canvas, except the rightmost row

    reset : function () {
        "use strict";

        debug("Called Paint::Reset!", 1);

        for ( let col = 10 ; col < 22 ; col ++) {
            for ( let row = 2 ; row < 30 ; row ++) {
                PAINT.clearBead([col, row]);
            }
        }

        BALL.ball_list = [];
        BALL.destroy_list = [];

        PAINT.callBackBalls(true);

    },
};

export default PAINT;
