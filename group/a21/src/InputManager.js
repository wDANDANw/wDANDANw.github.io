// Game Manager

import Manager from "./Manager.js";
import { EventKeyboard } from "./Events.js";
import globals from "./globals.js";

class InputManager extends Manager{

    constructor() {
        super();
        this.type = 'Input Manager';
    };

    broadcastInput(key, status){
        const new_event = new EventKeyboard(key, status);
        this.onEvent(new_event);
    }

    static getInstance(){
        return instance;
    }

    isValidEvent(event) {
        if (event === globals.EVENTS.KEYBOARD_EVENT) {
            return true;
        }

        return false
    }
}
let instance = new InputManager();

export default InputManager;
