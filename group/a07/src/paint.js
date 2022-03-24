// Paint.js
import GAME_CONFIG from "./config.js";

/**
 * The paint module for the canvas and drawing functionalities of the toy
 */
const PAINT = {

    // CONSTANTS
    // Constant names are all upper-case to make them easy to distinguish

    PALETTE_COLUM: 8, // column occupied by palette
    WHITE: 0, // y-position of white in palette
    ERASE_X: 16, // y-position of X in palette

    // The palette colors, scientifically chosen! :)

    COLORS: [
        0xFFFFFF, 0xE3C72D, 0x68CBCB, 0x2CA53E,
        0xD14444, 0x8A1181, 0x1F246A, 0x000000
    ],

    // VARIABLES
    // Variable names are lower-case with camelCaps

    current: 15, // y-pos of current palette selection
    color: 0xDCF5FF, // color of current palette selection
    underColor: 0xDCF5FF, // color of bead under the brush
    dragging: false, // true if dragging brush

    // FUNCTIONS

    // PAINT.select ( x, y, data )
    // Selects a new color for painting

    /**
     * Paint function to initialize paint related functionalities
     */
    init : function () {

        let color;

        // Draw palette
        const lastx = PAINT.PALETTE_COLUM;
        const lasty = GAME_CONFIG.HEIGHT - 1; // faster if saved in local var

        for ( let i = 0; i < lasty; i += 1 ) {
            color = PAINT.COLORS[ i ];
            PS.color( lastx, i, color ); // set visible color
            PS.data( lastx, i, color ); // also store color as bead data
            PS.exec( lastx, i, PAINT.select ); // call PAINT.select when clicked

            // Set border color according to palette position

            PS.borderColor( lastx, i, 0xC0C0C0 );
        }

        // Set up reset button

        PAINT.ERASE_Y = lasty; // remember the x-position
        PS.glyphColor( lastx, lasty, PS.COLOR_BLACK );
        PS.glyph( lastx, lasty, "X" );
        PS.exec( lastx, lasty, PAINT.reset ); // call PAINT.Reset when clicked

        // Start with white selected

        PS.border( PAINT.PALETTE_COLUM, PAINT.WHITE, 2 );
        PAINT.current = PAINT.WHITE;
        PAINT.color = PS.COLOR_WHITE;

        PAINT.reset();
    },

    select : function ( x, y, data ) {
        "use strict";

        // activate border if changing selection

        if ( y !== PAINT.current & y < 8 )	{
            PS.border(GAME_CONFIG.WIDTH - 1, PAINT.current, 0); // turn off previous border
            PS.border( x, y, 2 );
            PAINT.current = y;
            PAINT.color = data; // set current color from color stored in bead data
            PS.audioPlay( "fx_click" );
        }
    },

    // PAINT.reset ()
    // Clears the canvas, except the rightmost row

    reset : function () {
        "use strict";
        var i;

        PAINT.dragging = false;
        PAINT.underColor = 0xDCF5FF;
        for ( i = 7; i > -1; i -= 1 )	{
            PS.color( i, PS.ALL, PS.COLOR_WHITE );
        }
        PS.audioPlay( "fx_pop" );
    },
};

export default PAINT;
