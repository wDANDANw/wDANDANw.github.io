// A12 Dialogue Manager
// Author: Raphael Liu
/* globals PS : true */

const DM = {

    //region Constants
    DEFAULT_TEXT: "That Year, That Scene, That Choice" ,        // Default status text
    STATUS_COLOR: PS.COLOR_BLACK,                               // Default status text color

    //endregion

    //region Variables


    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Initialize the grid

        // Initialize the boarders
        initBoarders();
    } ,

    //endregion

}

export default DM;
