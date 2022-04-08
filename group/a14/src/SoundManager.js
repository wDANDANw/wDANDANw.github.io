// A12 Sound Manager
// Author: Raphael Liu
/* globals PS : true */

// TODO: Credit

const AUDIO_FILENAME_LIST = {
    "BGM.wav" : "BGM",
    "Jump1.wav" : "Jump1",
    "Jump2.wav" : "Jump2",
    "Jump3.wav" : "Jump3",
    "Land.wav" : "Land",
    "Pass_Level.wav" : "Pass_Level",
    "Powerup1.wav" : "PU1",
    "Powerup2.wav" : "PU2",
    "Powerup3.wav" : "PU3",
};

const SM = {

    //region Constants
    AUDIO_PATH : "assets/sound/",

    FX : {
        JUMP_1 : "Jump1.wav",
        JUMP_2 : "Jump2.wav",
        JUMP_3 : "Jump3.wav",
        LAND : "Land.wav",
        PASS_LEVEL : "Pass_Level.wav",
        POWER_UP_1 : "Powerup1.wav",
        POWER_UP_2 : "Powerup2.wav",
        POWER_UP_3 : "Powerup3.wav",
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
        PS.audioPlay(audio_name);
    }

    //endregion

}

function loadSounds(){

    // for (const [key, value] of Object.entries(AUDIO_FILENAME_LIST)) {
    //     console.log(`${key}: ${value}`);
    // }

    Object.entries(SM.FX).forEach(([sm_name, file_path]) => {
        PS.audioLoad(file_path, { lock:true, onload : (data) => {
                console.log(file_path);
            }});
    });

    Object.entries(SM.FX).forEach(([sm_name, file_path]) => {

        PS.audioLoad(file_path, { lock:true, fileTypes : ["wav"], path: SM.AUDIO_PATH, onload : (data) => {

            }});
    });

}

export default SM;
