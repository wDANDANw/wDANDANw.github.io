// A12 Button Panel Manager
// Author: Raphael Liu
/* globals PS : true */

import CONFIG from "./config.js";
import LevelManager from "./LevelManager.js";
import Player from "./Player.js";

const BM = {

    //region Constants
    GENERAL_AREA: {
        TOP: 17 ,
        Bottom: 20 ,
        LEFT: 0 ,
        RIGHT: 20 ,
    } ,

    COLOR_AREA: {
        TOP: 18 ,
        BOTTOM: 19 ,
        LEFT: 2 ,
        RIGHT: 11 ,
    } ,

    ARROW_AREA: {
        TOP: 17 ,
        Bottom: 20 ,
        LEFT: 14 ,
        RIGHT: 19 ,
    } ,

    BUTTON_STATUS: Object.freeze( {

        LOCKED: Symbol( "locked" ) ,
        INACTIVE: Symbol( "inactive" ) ,
        ACTIVE: Symbol( "active" ) ,

    } ) ,

    BUTTON_COLORS: {

        ARROW: {
            LOCKED: 0x9E9E9E ,
            INACTIVE: 0xFFEBEE ,
            ACTIVE: 0xEF9A9A ,
        } ,

        COLOR_BAR: {

            BLUE: [ 0x4fc8ff, 0x3ebeff, 0x29b3ff, 0x03a9f4, 0x009fe9, 0x0095d3, 0x008bd3 ],
            YELLOW: [0xffd454, 0xffce3a, 0xffc721, 0xffc107, 0xedb100, 0xd39e00, 0xba8b00 ],
            PURPLE: [ 0xb03dc4, 0xaa36bd, 0xa32fb7, 0x9c27b0, 0x951ea9, 0x8f15a3, 0x88079d ],
            DEFAULT: PS.COLOR_WHITE

        }

    } ,

    RESET_BUTTON: {
        position:{
            x: 19 ,
            y: 1 ,
        },
        exec: LevelManager.resetLevel ,
        color: PS.COLOR_BLACK,
    } ,

    //endregion

    //region Variables

    //The dictionary for arrows
    arrows: {
        up: {
            coords: [ [ 16 , 17 ] , [ 17 , 17 ] , [ 16 , 18 ] , [ 17 , 18 ] ] ,
        } ,
        left: {
            coords: [ [ 14 , 19 ] , [ 15 , 19 ] , [ 14 , 20 ] , [ 15 , 20 ] ] ,
        } ,
        right: {
            coords: [ [ 18 , 19 ] , [ 19 , 19 ] , [ 18 , 20 ] , [ 19 , 20 ] ] ,
        } ,
    } ,

    color_bar_boarder : [],
    color_bar_content : {

        blue : [],
        yellow : [],
        purple : [],
        default : []

    },
    color_bar_content_length : 0,
    color_bar_current_color : "",
    color_bar_current_content_index : 0,
    color_bar_current_boarder_index : 0,

    color_animation_limiter : 0,         // Animation Limiter. Number to be updated.
    color_animation_limiter_mod : 2,     // Animation Limiter. Number to be mod.
    color_animation_limiter_comp : 0,    // Animation Limiter. Number to be compared.
    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the background [then overwrite]
        initBackground();

        // Initialize the Arrows
        initArrows();

        // Init the color bar
        initColorBar();

    } ,

    /**
     * The function to update arrow colors in the button panel
     * @param arrow
     * @param status
     */
    drawArrows: function (button , status) {

        if ( !button.coords ) {
            console.log( "BM::drawButton: called by non-buttons" );
        }

        let update_coords = button.coords;
        let update_color = BM.BUTTON_COLORS.ARROW.LOCKED;

        switch ( status ) {
            case BM.BUTTON_STATUS.ACTIVE:
                update_color = BM.BUTTON_COLORS.ARROW.ACTIVE;
                break;
            case BM.BUTTON_STATUS.INACTIVE:
                update_color = BM.BUTTON_COLORS.ARROW.INACTIVE;
                break;
            case BM.BUTTON_STATUS.LOCKED:
                update_color = BM.BUTTON_COLORS.ARROW.LOCKED;
                break;
            default:
                break;
        }


        update_coords.forEach( coord => {

            PS.color( coord[0] , coord[1] , update_color );

        } )

    } ,

    drawResetButton: function () {
        PS.glyph( BM.RESET_BUTTON.position.x , BM.RESET_BUTTON.position.y , 0x2B6F );
        PS.glyphColor(BM.RESET_BUTTON.position.x , BM.RESET_BUTTON.position.y,BM.RESET_BUTTON.color);
        PS.exec( BM.RESET_BUTTON.position.x , BM.RESET_BUTTON.position.y , BM.RESET_BUTTON.exec );
    } ,

    drawColorBar : function (color) {

        // Draw the boarder
        BM.color_bar_boarder.forEach( coord => {

            PS.color(coord[0], coord[1], CONFIG.BOARDER_COLOR);

        })

        // Draw the content
        if (color !== BM.color_bar_current_color){
            BM.color_bar_current_color = color;
            BM.color_bar_current_content_index = 0;
            drawColorBarContent();
            // drawColorBoarder();
        }

    },

    update : function () {

        if (BM.color_bar_current_color !== "default"){

            if ( ((BM.color_animation_limiter += 1) % BM.color_animation_limiter_mod) > BM.color_animation_limiter_comp ){
                BM.color_bar_current_content_index += 1;
                drawColorBarContent();

                // BM.color_bar_current_boarder_index += 1;
                // drawColorBoarder();
            }

            if (BM.color_animation_limiter >= BM.color_animation_limiter_mod){
                BM.color_animation_limiter = 0;
            }

        }

    },

    /**
     * Function to render buttons
     * @param button_data
     */
    renderButtons : function (button_data) {

        // Can be used as reset
        BM.init();

        // Draw the reset button
        BM.drawResetButton();

        // Draw the unlocked buttons
        const unlocked_button_data = button_data["unlocked"];

        if ( unlocked_button_data["arrows"] ) {
            unlocked_button_data["arrows"].forEach( (arrow) => {
                BM.drawArrows(BM.arrows[arrow],BM.BUTTON_STATUS.INACTIVE);
                Player.unlocked_arrow.push(arrow);
            })
        }

        // Draw the color bar
        BM.color_bar_current_color = "";
        BM.drawColorBar("default");
    },

    //endregion

}

//region Local Helpers

// Initialize Boarders
function initBackground() {

    for ( let i = BM.GENERAL_AREA.LEFT ; i < BM.GENERAL_AREA.RIGHT + 1 ; i ++ ) {
        for ( let j = BM.GENERAL_AREA.TOP ; j < BM.GENERAL_AREA.Bottom + 1 ; j ++ ) {
            PS.color( i , j , CONFIG.BOARDER_COLOR );
        }
    }

}

// Initialize Arrows
function initArrows() {

    // Call draw function for each arrow
    Object.values( BM.arrows ).forEach( arrow => {

        BM.drawArrows( arrow , BM.BUTTON_STATUS.LOCKED );

    } )

}

// Initialize Color Bar
function initColorBar() {

    // Init the boarder array
    initColorBarBoarderArray();

    // Fill the color content array with default color
    BM.color_bar_content_length = BM.COLOR_AREA.RIGHT - BM.COLOR_AREA.LEFT + 1;
    initColorBarContentArray();

}

function initColorBarBoarderArray(){
    // Init the color bar boarder array
    // Top
    for ( let col = BM.COLOR_AREA.LEFT - 1; col < BM.COLOR_AREA.RIGHT + 1; col ++) {
        BM.color_bar_boarder.push([col , BM.COLOR_AREA.TOP-1]);
    }

    // Right
    for ( let row = BM.COLOR_AREA.TOP-1; row < BM.COLOR_AREA.BOTTOM + 1; row ++) {
        BM.color_bar_boarder.push([BM.COLOR_AREA.RIGHT+1 , row]);
    }

    // Bottom
    for ( let col = BM.COLOR_AREA.RIGHT + 1; col > BM.COLOR_AREA.LEFT - 1; col --) {
        BM.color_bar_boarder.push([col , BM.COLOR_AREA.BOTTOM+1]);
    }

    // Left
    for ( let row = BM.COLOR_AREA.BOTTOM+1; row > BM.COLOR_AREA.TOP - 1; row --) {
        BM.color_bar_boarder.push([BM.COLOR_AREA.LEFT-1 , row]);
    }
}

function initColorBarContentArray(){

    for (let i = 0; i < BM.color_bar_content_length ; i ++){
        BM.color_bar_content.default.push(BM.BUTTON_COLORS.COLOR_BAR.DEFAULT);
    }

    for (let i = 0; i < BM.color_bar_content_length ; i ++){
        BM.color_bar_content.blue.push(BM.BUTTON_COLORS.COLOR_BAR.BLUE[i % (BM.BUTTON_COLORS.COLOR_BAR.BLUE.length - 1)]);
    }

}

function drawColorBarContent(){

    const current_color_array = BM.color_bar_content[BM.color_bar_current_color];
    const current_color_array_length = current_color_array.length;

    for (let col = 0; col < BM.color_bar_content_length ; col ++){
        for (let row = BM.COLOR_AREA.TOP; row < BM.COLOR_AREA.BOTTOM + 1; row ++) {

            const index = Math.abs((BM.color_bar_current_content_index - col - row) % (current_color_array_length-1));
            PS.color(BM.COLOR_AREA.LEFT + col, row, current_color_array[index])
        }
    }
}

function drawColorBoarder(){

    if (BM.color_bar_current_color === "default") return;

    let x, y;
    for (let i = 0; i < BM.color_bar_boarder.length; i ++){

        const index = Math.abs((BM.color_bar_current_boarder_index + i) % (BM.color_bar_boarder.length-1));

        x = BM.color_bar_boarder[index][0];
        y = BM.color_bar_boarder[index][1];

        if (i % 4 === 0) {
            PS.color(x, y, BM.BUTTON_COLORS.ARROW.ACTIVE);
        } else {
            PS.color(x,y, BM.BUTTON_COLORS.ARROW.INACTIVE);
        }

    }

}

//endregion

export default BM;
