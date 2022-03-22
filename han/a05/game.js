// Hanwen XU
// Team Hot Table
// Mod 1: changed the grid size to 16 x 9
// Mod 2: changed the background color to white
// Mod 3: changed the status color and text
// Mod 4: let the beads generate a random yellow mosaic when initiated
// Mod 5: let the beads change to a cyan color when clicked on the first time
// Mod 6: let the beads change to a different cyan color when clicked on the second time
// Mod 7: changed the sound when clicking
// Mod 8: removed the border
// Mod 9: added a grid shadow
// Mod 10: added 2 types of status text after each bead is clicked
// Mod 11: added a sound effect after the cursor leave the grid
// Mod 12: added a status text after the cursor leave the grid




/*
game.js for Perlenspiel 3.3.x
Last revision: 2022-03-15 (BM)

/* jshint browser : true, devel : true, esversion : 6, freeze : true */
/* globals PS : true */

"use strict"; // Do NOT remove this directive!

PS.init = function( system, options ) {
	var x,y,r,g,b;
	// Establish grid dimensions of 16 : 9

	PS.gridSize( 16, 9 );

	// Set background color to a white-ish yellow

	PS.gridColor( 0xFFFFC5 );

	// Cast a yellow shadow under the grid
	PS.gridShadow( 1, 0xECCC67);

	// Change status line color and text

	PS.statusColor( 0xFFC018 );
	PS.statusText( "Touch those beads and unyellow me." );

	// no border between each bead
	PS.border( PS.ALL, PS.ALL, 0);



    // randomly fill each grid with a yellow-ish color
	for ( y = 0; y < 9; y += 1 ) {
		for ( x = 0; x < 16; x += 1 ) {
			r = 255; // red 255
			g = PS.random(60) + 190; // random green
			b = PS.random(167) - 1; // random blue
			PS.color( x, y, r, g, b ); // set bead color
		}
	}
	// mosaic

	//preload hoot sound
	PS.audioLoad( "fx_hoot");

	//preload coin sound
	PS.audioLoad( "fx_coin1");
};

PS.touch = function( x, y, data, options ) {

	let next; // variable to save next color

	// if the color is cyan, change next to a whiter cyan
	if ( data === 0x1BFFFD ) {
		next = 0xACFDFF;
		// show status text
		PS.statusText( "Bead (" + x + ", " + y + ") lightly cyaned.")
	}
	// else change next to a cyan color
	else {
		next = 0x1BFFFD;
		// show status text
		PS.statusText( "Bead (" + x + ", " + y + ") carefully cyaned.")
	}

	// update the data
	PS.data( x, y, next );

	// color the grid using data
	PS.color( x, y, next );



	// play a coin sound
	PS.audioPlay( "fx_coin1" );
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
	// play hoot sound
	PS.audioPlay( "fx_hoot" );

	// show status text
	PS.statusText( "Back to the grid, now.")
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

