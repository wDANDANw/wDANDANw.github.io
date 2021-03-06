// A12 Sound Manager
// Author: Raphael Liu
/* globals PS : true */

// TODO: Credit

const SM = {

    //region Constants
    AUDIO_PATH : "assets/sound/",

    FX : {
        JUMP_1 : "Jump1",
        JUMP_2 : "Jump2",
        JUMP_3 : "Jump3",
        LAND : "Land",
        PASS_LEVEL : "Pass_Level",
        POWER_UP_1 : "Powerup1",
        POWER_UP_2 : "Powerup2",
        POWER_UP_3 : "Powerup3",
    },

    BGM : {
       BGM : "BGM",
    },

    //endregion

    //region Variables


    //endregion


    //region Functions


    /**
     * The initialization function of the whole game
     */
    init: function () {

        // Load Sounds
        loadSounds()
    } ,

    play : function (audio_name) {
        PS.audioPlay(audio_name, {fileTypes : ["wav"], path: SM.AUDIO_PATH});
    }

    //endregion

}

function loadSounds(){

    // for (const [key, value] of Object.entries(AUDIO_FILENAME_LIST)) {
    //     console.log(`${key}: ${value}`);
    // }

    Object.entries(SM.FX).forEach(([sm_name, filename]) => {

        PS.audioLoad(filename, { lock:true, fileTypes : ["wav"], path: SM.AUDIO_PATH, onload : (data) => {

            }});
    });

    Object.entries(SM.BGM).forEach(([sm_name, filename]) => {

        PS.audioLoad(filename, { lock:true, fileTypes : ["wav"], path: SM.AUDIO_PATH, onload : (data) => {

            }});
    });

}

export default SM;
