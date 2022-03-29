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
/* globals PS : true*/

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

import BALL from "./src/ball.js";
import GAME_CONFIG from "./src/config.js";
import PAINT from "./src/paint.js";
import {debug as UtilsDebug} from "./src/utils.js";

const GAME_DEBUG_MASK = true;
const debug = (message, message_debug_level) => { if (GAME_DEBUG_MASK) UtilsDebug(message, message_debug_level)};

/**
 * Core Loop Related Fields and Functions
 */
const GAME = {

	// Global Variables
	MAIN_LOOP_ID : null,

	// Functions

	/**
	 * Function to initialize the grid
	 */
	initializeGrid : function () {

		PS.gridSize( GAME_CONFIG.WIDTH, GAME_CONFIG.HEIGHT );
		PS.gridColor( GAME_CONFIG.GRID_BACKGROUND_COLOR );
		PS.border( PS.ALL, PS.ALL, 0 ); // disable all borders
		PS.statusColor( GAME_CONFIG.STATUS_COLOR );
		PS.statusText("OvO");

	},

	/**
	 * Function to load sound assets to game
	 */
	loadSounds : function () {

		// Load and lock sounds
		PS.audioLoad( "fx_click", { lock : true } );
		PS.audioLoad( "fx_pop", { lock : true } );
	},

	/**
	 * The main loop of the game that is being updated each frame
	 */
	tick : function () {

		// Update and redraw balls
		BALL.updateAllBalls();

		// The only function that needs update
		PAINT.drawMusicBar();

		PAINT.updateBallCountPanel();
	},

	changeGameSpeed : function (speed_multiplier) {
		PS.timerStop(GAME.MAIN_LOOP_ID);
		GAME.MAIN_LOOP_ID = PS.timerStart( GAME_CONFIG.FRAME_RATE / speed_multiplier, GAME.tick );
	}
};

PS.init = function( system, options ) {
	"use strict";

	// Initialize assets
	GAME.initializeGrid();
	GAME.loadSounds();

	PAINT.init();

	// Start the game loop
	GAME.MAIN_LOOP_ID = PS.timerStart( GAME_CONFIG.FRAME_RATE, GAME.tick );
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

	if (PAINT.current < 0) { // Error

		debug("PS.touch::Error: current < 0");

	} else if (PAINT.current <= 7) { // Color Mode

		debug(("Color " + PAINT.current + " selected"), 1);

		// First check if in playground area
		if (BALL.isInPlaygroundArea(x,y)){



			// If yes, dragging turn on
			PAINT.dragging = true;

			// No use because PAINT.color is assigned to both eraser and color in PAINT::Select
			// const current_color = (PAINT.current === 7) ? GAME_CONFIG.BEAD_BACKGROUND_COLOR : PAINT.color;

			// Eraser special handling
			if (PAINT.current === 7)  PAINT.clearBead([x,y]);

			// General Handling
			PAINT.underColor = PAINT.color;
			PS.color( x, y, PAINT.color );
			PS.data( x, y, PAINT.color);

		}

	} else {

		debug("PS::touch:Error: curren > 7")

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

	// Only process when the ball is in playground area
	if (BALL.isInPlaygroundArea(x,y)) {

		PAINT.underColor = PS.color( x, y );
		PS.color( x, y, PAINT.color );

		if ( PAINT.dragging )
		{
			PS.data ( x, y, PAINT.color);
			PAINT.underColor = PAINT.color;
		}

	} else {

		PAINT.dragging = false;

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
	if ( BALL.isInPlaygroundArea(x,y))
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

export default GAME;
