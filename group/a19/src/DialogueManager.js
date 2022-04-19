// A12 Dialogue Manager
// Author: Raphael Liu
/* globals PS : true */

const DM = {

    //region Constants
    DEFAULT_TEXT: "The Resit" ,                                 // Default status text
    STATUS_COLOR: PS.COLOR_YELLOW,                               // Default status text color
    RESET_TIME: 10,                                             // Time to reset fully displayed message to default text
    DISPLAY_SPEED: 2,                                            // Updates of index of message each frame

    //endregion

    //region Variables
    current_dialogue : "",
    current_index: 0,
    current_display_disappear_timer: 0,

    dialogue_limiter : 0,         // Animation Limiter. Number to be updated.
    dialogue_limiter_mod : 3,     // Animation Limiter. Number to be mod.
    dialogue_limiter_comp : 0,    // Animation Limiter. Number to be compared.
    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

    } ,

    update : function () {

        if ( ((DM.dialogue_limiter += 1) % DM.dialogue_limiter_mod) > DM.dialogue_limiter_comp ){
            if (DM.current_dialogue.normalize() !== DM.DEFAULT_TEXT.normalize()) {
                if (DM.current_index < DM.current_dialogue.length) {
                    DM.current_index = ((DM.current_index += DM.DISPLAY_SPEED) <= DM.current_dialogue.length) ? DM.current_index : DM.current_dialogue.length;
                    updateStatusText();
                } else {
                    if ( (DM.current_display_disappear_timer += 1) > DM.RESET_TIME) {
                        DM.current_display_disappear_timer = 0;
                        DM.current_index = DM.DEFAULT_TEXT.length;
                        DM.current_dialogue = DM.DEFAULT_TEXT;
                    }
                }
            }
        }

        if (DM.dialogue_limiter >= DM.dialogue_limiter_mod){
            DM.dialogue_limiter = 0;
        }
    },

    reset : function () {
        DM.current_dialogue = DM.DEFAULT_TEXT;
        DM.current_display_disappear_timer = 0;
        DM.current_index = DM.DEFAULT_TEXT.length;
        DM.dialogue_limiter = 0;
        updateStatusText();
    },

    showMessage : function (message) {
        DM.current_dialogue = message;
        DM.current_index = 0;
    },

    showDialogue : function (dialogue_data) {

        const visited = Number(dialogue_data.visited);

        // No need to make local copy because will not modify this
        for ( let [ visit_trigger_number , dialogue_message ] of Object.entries( dialogue_data.dialogue_dict ) ){

            if (visited === Number(visit_trigger_number)) {
                DM.showMessage(dialogue_message);
            }
        }
    },

    renderDialoguesInLevel: function (level_dialogues) {

        DM.reset();

        if (!level_dialogues) {
            console.log("No Level Dialogue")
            return
        }

        const local_copy = JSON.parse( JSON.stringify( level_dialogues ) ); // Deep Copy

        if ( Object.keys( local_copy ).length > 0 ) {

            // Values are the position + data dict
            Object.values( local_copy ).forEach( dialogue_point => {

                const x = dialogue_point.position.x;
                const y = dialogue_point.position.y;
                const data = dialogue_point.data;

                renderOneDialoguePoint( x , y , data );
            } )
        }
    }

    //endregion

}

function renderOneDialoguePoint(x , y , data) {
    let temp_data = PS.data( x , y );

    if ( temp_data ) {
        temp_data.tags = temp_data.tags.concat(data.tags);
        temp_data.dialogue_data = data.dialogue_data;
    } else {
        temp_data = data;
    }

    PS.data( x , y , temp_data );
}

function updateStatusText(){
    const text = DM.current_dialogue.substr(0,DM.current_index);
    PS.statusText(text);
}

export default DM;
