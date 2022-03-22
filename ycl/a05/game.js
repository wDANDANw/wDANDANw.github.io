/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

/*
Learned from rain game
 */
const GAME = {

	// CONSTANTS
	// Constant names are all upper-case to make them easy to distinguish

	GRID_WIDTH: 7, // width of grid
	GRID_HEIGHT: 7, // height of grid
	BOTTOM_ROW: 7, // last row of grid
	FRAME_RATE: 30,	// animation frame rate; 6/60ths = 10 fps // Now to be static. If wants more interesting, can change this to simulate speed change
	BG_COLOR: PS.COLOR_WHITE, // background color
	BLOCK_COLOR: PS.COLOR_BLACK, // block color

	CURRENT_ID: 0,
	ALIVE: true,
	MAIN_LOOP_ID: null,

	DEBUG: true,

	// VARIABLES
	// Variable names are lower-case with camelCaps

	// These two arrays store the X and Y positions of active drops

	blocks: [], // The array for blocks
	destroyList: [], // The list of block ids that is going to be destroyed
	touchList: [],

	// FUNCTIONS
	// Function names are lower case with camelCaps

	// GAME.splash()
	// "Splash" a bead when it reaches bottom row

	splash : function ( x, y ) {
		"use strict";

		// Paint using background color

		if (y >= GAME.BOTTOM_ROW) return;

		PS.color( x, y, GAME.BG_COLOR );

		// Play splash sound

		PS.audioPlay( "fx_drip2" ); // TODO: Modify
	},

	// GAME.drawBlock()
	// Update function for each block
	drawBlock : function (block) {

		// Store the old values
		const index = GAME.blocks.indexOf(block);
		var id = block[0]
		var x = block[1];
		var y = block[2];

		// Debug line
		if (GAME.DEBUG) {
			console.log ("Printing block id " + block[0])
		}

		// Erase old block
		// If bead is above last row, erase it and redraw one bead lower

		if ( y < GAME.BOTTOM_ROW )
		{
			// erase the existing block
			PS.color( x, y, GAME.BG_COLOR );

			// add 1 to y position
			y += 1;

			// update its y position in the array
			GAME.blocks[index][2] = y;

			// Has drop reached the bottom row yet?
			if ( y < GAME.BOTTOM_ROW ) // nope
			{
				// Repaint the drop one bead lower
				PS.color( x, y, GAME.BLOCK_COLOR );
			}

			// Drop has reached bottom! Splash it!
			else
			{
				GAME.ALIVE = false;
				GAME.splash( x, y );
			}
		}

		// Bead has already been splashed, so remove it from animation list
		else
		{
			if (GAME.DEBUG) {console.log( "Added " + id + " to destroy list!")}
			GAME.destroyList.push(id); // Add this block to destroy list
		}

	},


	// GAME.destroyBlocks()
	// Destory blocks
	destroyBlocks : function () {

		for (var i = GAME.destroyList.length -1; i >= 0; i--) {
			// FINAL PROCESS OF THE BLOCK
			const currentID = GAME.destroyList.pop(); // ID in the blocks array

			if (GAME.DEBUG) {console.log( "Removing " + currentID)}

			GAME.blocks = GAME.blocks.filter( (e) => {return e[0] !== currentID })

			console.log(GAME.blocks)
		}

		if (GAME.DEBUG) {
			if (GAME.destroyList.length != 0) {
				console.error( "Destroy List Not Emptied!" );
			}
		}
	},

	// GAME.tick()
	// Called on every clock tick
	// Used to animate the blocks

	tick : function () {
		"use strict";
		var len;

		// First check game status: if the player died.
		if (!GAME.ALIVE) { // If dead
			if (GAME.MAIN_LOOP_ID) { // If active game session (valid loop id)
				PS.timerStop( GAME.MAIN_LOOP_ID ); // Stop the loop
			}
		}

		// The length of the GAME.blocks array is the current number of blocks
		len = GAME.blocks.length; // number of drops

		// Generate a new block
		// Shouldnt use push because id will change
		GAME.blocks.push([GAME.CURRENT_ID++, PS.random(GAME.GRID_WIDTH - 1), 0]) // Add a block at random location at the top row

		// Process touches
		GAME.touchList.forEach( (coord) => GAME.touch(coord[0], coord[1]))
		GAME.destroyBlocks();
		GAME.touchList = [];

		// Update Blocks
		GAME.blocks.forEach( (block) => {GAME.drawBlock(block)} )

		// Delete Blocks in the Destroy List
		GAME.destroyBlocks();

	},

	// GAME.splash()
	// "Splash" a bead when it reaches bottom row

	touch : function ( x, y ) {
		"use strict";

		for (var i = 0; i < GAME.blocks.length; i++) {
			var block = GAME.blocks[i];

			if (block[1] == x && block[2] == y) {
				GAME.destroyList.push(block[0]);
				PS.color( x, y, GAME.BG_COLOR );
				PS.audioPlay( "fx_drip2" ); // TODO: Modify

			}
		}
	},

}

PS.init = function( system, options ) {
// Set up the grid

	PS.gridSize( GAME.GRID_WIDTH, GAME.GRID_HEIGHT );

	// Change background color

	PS.gridColor( GAME.BG_COLOR );


	// Set all beads to background color

	PS.color( PS.ALL, PS.ALL, GAME.BG_COLOR );

	// Load and lock audio files

	PS.audioLoad( "fx_drip1", { lock : true } );
	PS.audioLoad( "fx_drip2", { lock : true } ); // TODO: Modify

	// Set color and text of title

	PS.statusColor( PS.COLOR_BLACK );
	PS.statusText( "Don't let it get last row!" );

	// Start the animation timer

	GAME.MAIN_LOOP_ID = PS.timerStart( GAME.FRAME_RATE, GAME.tick );
};

PS.touch = function( x, y, data, options ) {
	"use strict";

	// Process if above the bottom row

	if ( y < GAME.BOTTOM_ROW )
	{
		GAME.touchList.push([x, y]);
		PS.audioPlay( "fx_drip1" ); // play drip sound
	}

	// Otherwise do nothing

	else
	{
		// Nothing
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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.release() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse button/touch is released over a bead.
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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.enter() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch enters a bead.
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
	// Uncomment the following code line to inspect x/y parameters:

	// PS.debug( "PS.exit() @ " + x + ", " + y + "\n" );

	// Add code here for when the mouse cursor/touch exits a bead.
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

