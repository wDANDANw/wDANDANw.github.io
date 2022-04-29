// Game Manager

import Manager from "./Manager.js";

class SoundManager extends Manager{

    constructor() {
        super();
        this.type = 'Sound Manager';
    };

    static getInstance(){
        return instance;
    }
}
let instance = new SoundManager();

export default SoundManager;
