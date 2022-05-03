// Game Manager

import Manager from "./Manager.js";
import { EventKeyboard } from "./Events.js";
import globals from "./globals.js";

class InputManager extends Manager{

    constructor() {
        super();
        this.type = 'Input Manager';

        this.buffered_input = {};

    };

    broadcastInput(key, status){
        const new_event = new EventKeyboard(key, status);
        this.onEvent(new_event);
    }

    broadcastBufferedInputs(){
        Object.entries(this.buffered_input).forEach(([key, status]) => {
            this.broadcastInput(key, status);
        })
        this.buffered_input = {};
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
