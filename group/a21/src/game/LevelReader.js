
import Level1 from "./Level1.js";
import Level2 from "./Level2.js";
import Level3 from "./Level3.js";
import Level4 from "./Level4.js";
import Level5 from "./Level5.js";
import globals from "../globals.js";

class LevelReader {

    constructor() {

        this.levels = {};

        const lv1 = new Level1();
        this.levels[globals.LEVELS.LV1] = lv1;

        const lv2 = new Level2();
        this.levels[globals.LEVELS.LV2] = lv2;

        const lv3 = new Level3();
        this.levels[globals.LEVELS.LV3] = lv3;

        const lv4 = new Level4();
        this.levels[globals.LEVELS.LV4] = lv4;

        const lv5 = new Level5();
        this.levels[globals.LEVELS.LV5] = lv5;


    }

    getLevels(){
        return this.levels;
    }

}

export default LevelReader;
