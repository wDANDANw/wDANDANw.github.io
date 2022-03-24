/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

Perlenspiel is a scheme by Professor Moriarty (bmoriarty@wpi.edu).
This version of Perlenspiel (3.3.x) is hosted at <https://ps3.perlenspiel.net>
Perlenspiel is Copyright © 2009-22 Brian Moriarty.
This file is part of the standard Perlenspiel 3.3.x devkit distribution.

Perlenspiel is free software: you can redistribute it and/or modify
it under the terms of the GNU Lesser General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

Perlenspiel is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Lesser General Public License for more details.

You may have received a copy of the GNU Lesser General Public License
along with the Perlenspiel devkit. If not, see <http://www.gnu.org/licenses/>.
*/

/*
This JavaScript file is a template for creating new Perlenspiel 3.3.x games.
Any unused event-handling function templates can be safely deleted.
Refer to the tutorials and documentation at <https://ps3.perlenspiel.net> for details.
*/

/*
The following comment lines are for JSHint <https://jshint.com>, a tool for monitoring code quality.
You may find them useful if your development environment is configured to support JSHint.
If you don't use JSHint (or are using it with a configuration file), you can safely delete these two lines.
*/

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
PS.init( system, options )
Called once after engine is initialized but before event-polling begins.
This function doesn't have to do anything, although initializing the grid dimensions with PS.gridSize() is recommended.
If PS.grid() is not called, the default grid dimensions (8 x 8 beads) are applied.
Any value returned is ignored.
[system : Object] = A JavaScript object containing engine and host platform information properties; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

var PAINT = {

	// CONSTANTS
	// Constant names are all upper-case to make them easy to distinguish

	WIDTH: 9, // width of grid (one extra column for palette)
	HEIGHT: 17, // height of grid
	PALETTE_COLUM: 8, // column occupied by palette
	WHITE: 15, // y-position of white in palette
	ERASE_X: 16, // y-position of X in palette

	// The palette colors, scientifically chosen! :)

	COLORS: [
		0x000000, 0x1F246A, 0x8A1181, 0xD14444,
		0x2CA53E, 0x68CBCB, 0xE3C72D, 0xDCF5FF,
	],

	// VARIABLES
	// Variable names are lower-case with camelCaps

	current: 7, // x-pos of current palette selection
	color: 0xDCF5FF, // color of current palette selection
	underColor: 0xDCF5FF, // color of bead under the brush
	dragging: false, // true if dragging brush
	prompt: false, // true if instructions displayed

	// FUNCTIONS
	// Function names are lower case with camelCaps

	// PAINT.select ( x, y, data )
	// Selects a new color for painting

	select : function ( x, y, data ) {
		"use strict";

		// activate border if changing selection

		if ( y !== PAINT.current )	{
			PS.border(PAINT.current, PAINT.HEIGHT - 1, 0); // turn off previous border
			PS.border( x, y, 2 );
			PAINT.current = x;
			PAINT.color = data; // set current color from color stored in bead data
			PS.audioPlay( "fx_click" );
		}
	},

	// PAINT.reset ()
	// Clears the canvas, except the bottom row

	reset : function () {
		"use strict";
		var i;

		PAINT.dragging = false;
		PAINT.underColor = 0xDCF5FF;
		for ( i = 0; i < PAINT.PALETTE_COLUM; i += 1 )	{
			PS.color( PS.ALL, i, PS.COLOR_WHITE );
		}
		PS.audioPlay( "fx_pop" );
	}
};




PS.init = function( system, options ) {
	"use strict";
	var i, lastx, lasty, color;

	PS.gridSize( PAINT.WIDTH, PAINT.HEIGHT );
	PS.gridColor( 0x303030 );
	PS.border( PS.ALL, PS.ALL, 0 ); // disable all borders

	// Load and lock sounds

	PS.audioLoad( "fx_click", { lock : true } );
	PS.audioLoad( "fx_pop", { lock : true } );

	// Draw palette

	lastx = PAINT.PALETTE_COLUM;
	lasty = PAINT.HEIGHT - 1; // faster if saved in local var
	for ( i = 0; i < lasty; i += 1 ) {
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

	PS.border( PAINT.WHITE, PAINT.PALETTE_COLUM, 2 );
	PAINT.current = PAINT.WHITE;
	PAINT.color = PS.COLOR_WHITE;

	PAINT.reset();

	PS.statusColor( PS.COLOR_WHITE );


	// This is also a good place to display
	// your game title or a welcome message
	// in the status line above the grid.
	// Uncomment the following code line and
	// change the string parameter as needed.

	// PS.statusText( "Game" );

	// Add any other initialization code you need here.
};

/*
PS.touch ( x, y, data, options )
Called when the left mouse button is clicked over bead(x, y), or when bead(x, y) is touched.
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.touch = function( x, y, data, options ) {
	"use strict";

	if ( x < PAINT.PALETTE_COLUM )
	{
		PAINT.dragging = true;
		PAINT.underColor = PAINT.color;
		PS.color( x, y, PAINT.color );
	}
};

/*
PS.release ( x, y, data, options )
Called when the left mouse button is released, or when a touch is lifted, over bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.release = function( x, y, data, options ) {
	"use strict";

	PAINT.dragging = false;
};

/*
PS.enter ( x, y, button, data, options )
Called when the mouse cursor/touch enters bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.enter = function( x, y, data, options ) {
	"use strict";

	if ( x < PAINT.PALETTE_COLUM )
	{
		PAINT.underColor = PS.color( x, y );
		PS.color( x, y, PAINT.color );
		if ( PAINT.dragging )
		{
			PAINT.underColor = PAINT.color;
		}
	}
	else
	{
		PAINT.dragging = false; // stop dragging if over palette
		if ( y === PAINT.ERASE_Y )
		{
			PAINT.prompt = false;
			PS.statusText( "Click X to erase painting" );
		}
	}
};

/*
PS.exit ( x, y, data, options )
Called when the mouse cursor/touch exits bead(x, y).
This function doesn't have to do anything. Any value returned is ignored.
[x : Number] = zero-based x-position (column) of the bead on the grid.
[y : Number] = zero-based y-position (row) of the bead on the grid.
[data : *] = The JavaScript value previously associated with bead(x, y) using PS.data(); default = 0.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exit = function( x, y, data, options ) {
	"use strict";

	// Show instructions when mouse is first moved

	if ( !PAINT.prompt )
	{
		PAINT.prompt = true;
		PS.statusText("Click to select colors, click/drag to paint");
	}

	if ( x < PAINT.PALETTE_COLUM )
	{
		PS.color( x, y, PAINT.underColor );
	}
};

/*
PS.exitGrid ( options )
Called when the mouse cursor/touch exits the grid perimeter.
This function doesn't have to do anything. Any value returned is ignored.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.exitGrid = function( options ) {
	// Uncomment the following code line to verify operation:

	// PS.debug( "PS.exitGrid() called\n" );

	// Add code here for when the mouse cursor/touch moves off the grid.
};

/*
PS.keyDown ( key, shift, ctrl, options )
Called when a key on the keyboard is pressed.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyDown = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyDown(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is pressed.
};

/*
PS.keyUp ( key, shift, ctrl, options )
Called when a key on the keyboard is released.
This function doesn't have to do anything. Any value returned is ignored.
[key : Number] = ASCII code of the released key, or one of the PS.KEY_* constants documented in the API.
[shift : Boolean] = true if shift key is held down, else false.
[ctrl : Boolean] = true if control key is held down, else false.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
*/

PS.keyUp = function( key, shift, ctrl, options ) {
	// Uncomment the following code line to inspect first three parameters:

	// PS.debug( "PS.keyUp(): key=" + key + ", shift=" + shift + ", ctrl=" + ctrl + "\n" );

	// Add code here for when a key is released.
};

/*
PS.input ( sensors, options )
Called when a supported input device event (other than those above) is detected.
This function doesn't have to do anything. Any value returned is ignored.
[sensors : Object] = A JavaScript object with properties indicating sensor status; see API documentation for details.
[options : Object] = A JavaScript object with optional data properties; see API documentation for details.
NOTE: Currently, only mouse wheel events are reported, and only when the mouse cursor is positioned directly over the grid.
*/

PS.input = function( sensors, options ) {
	// Uncomment the following code lines to inspect first parameter:

//	 var device = sensors.wheel; // check for scroll wheel
//
//	 if ( device ) {
//	   PS.debug( "PS.input(): " + device + "\n" );
//	 }

	// Add code here for when an input event is detected.
};
