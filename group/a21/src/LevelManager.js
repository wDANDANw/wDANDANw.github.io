// Level Manager

import Manager from "./Manager.js";
import Level from "./Level.js";
import ObjectList from "./ObjectList.js";
import globals from "./globals.js";

class LevelManager extends Manager{

    constructor() {

        // Manager Related
        super();
        this.type = 'Level Manager';

        // Global Level Info
        this.current_level = null;
        this.levels = new ObjectList(globals.TAGS.LEVEL);

        // Runtime Current Level Related
        this.deletion_list = new ObjectList(globals.TAGS.GAME_OBJECT);

        // TODO Future
        this.camera = null;
    };

    startUp() {
        super.startUp();

    }

}

const a = new Level();
console.log()

export default LevelManager;
