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
        Bottom: 19 ,
        LEFT: 1 ,
        RIGHT: 12 ,
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
    colors: [] ,                           // The array for colors
    arrows: {                             // The dictionary for arrows
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

    /**
     * Function to render buttons
     * @param button_data
     */
    renderButtons : function (button_data) {

        // Draw the reset button
        BM.drawResetButton();

        // Draw the unlocked buttons
        const unlocked_button_data = button_data["unlocked"];

        if ( unlocked_button_data["arrows"] ) {
            unlocked_button_data["arrows"].forEach( (arrow) => {
                BM.drawArrows(BM.arrows[arrow],BM.BUTTON_STATUS.INACTIVE);
                Player.unlocked.push(arrow);
            })
        }


        // for (let [ , platform_data] of Object.entries(platforms))
    }

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


//endregion

export default BM;
