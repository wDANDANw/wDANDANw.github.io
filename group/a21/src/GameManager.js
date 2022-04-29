// Game Manager

import Manager from "./Manager.js";
import LevelManager from "./LevelManager.js";
import SoundManager from "./SoundManager.js";
import InputManager from "./InputManager.js";
import globals from "./globals.js";

class GameManager extends Manager{

    constructor() {
        super();
        this.type = 'Game Manager';

        this.game_over = false;
        this.main_loop_id = null;
    };

    startUp() {

        if (!LevelManager.getInstance().startUp()) {
            return false;
        }

        if (!InputManager.getInstance().startUp()) {
            return false;
        }

        if (!SoundManager.getInstance().startUp()) {
            return false;
        }

        LevelManager.getInstance().loadLevel('level-1');

        super.startUp();
        return true;
    }

    run(){
        // Perlenspiel way of starting the loop
        GameManager.getInstance().main_loop_id = PS.timerStart(globals.FRAME_RATE, GameManager.getInstance().main_loop);
    }

    stop(){
        PS.timerStop(GameManager.getInstance().main_loop_id);
    }

    main_loop(){

        // Handle Input : This is already handled by outside loop event-based perlenspiel engine and input manager

        // Then update level
        LevelManager.getInstance().update();

        // Then draw the level
        LevelManager.getInstance().draw();

        // TODO: Add display manager in future versions
        // DM.swapBuffers()

        if (GameManager.getInstance().game_over) {
            GameManager.getInstance().stop();
        }
    }

    static getInstance(){
        return instance;
    }

}
let instance = new GameManager();

export default GameManager;
