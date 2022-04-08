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
    AUDIO_PATH : "../assets/sound/",

    FX : {
        JUMP_1 : "Jump1.wav",
        JUMP_2 : "Jump2.wav",
        // JUMP_3 : "Jump3",
        // LAND : "Land",
        // PASS_LEVEL : "Pass_Level",
        // POWER_UP_1 : "PU1",
        // POWER_UP_2 : "PU2",
        // POWER_UP_3 : "PU3",
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
        const file_ext = file_path.split('.').pop();
        const filename = file_path.substr(0,file_path.lastIndexOf('.'));

        PS.audioLoad(filename, { lock:true, fileTypes : [file_ext], path: SM.AUDIO_PATH, onload : (data) => {
                console.log(file_path);
            }});
    });

}

export default SM;
