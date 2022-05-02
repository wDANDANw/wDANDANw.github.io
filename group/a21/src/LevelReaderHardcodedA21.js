// Level Reader
// Reads the level files and return
// Currently, it is hardcoded because the project does not use jquery, node, and similar stuff

// Super hardcoded version for A21: to ensure that there is a working stuff

import globals from "./globals.js";

// const LV1_JSON = fetch('./src/levels/level-1.json').then(res => res.json()).then(json => {return json});
import LV1_JSON from './levels/level-1.json' assert { type: "json" }
import LV2_JSON from './levels/level-2.json' assert { type: "json" }

import Level from "./Level.js";
import Vector2 from "./Vector.js";

let levels = {}


const LV1 = new Level();
LV1.readLevelFile(LV1_JSON);
levels[globals.LEVELS.LV1] = LV1;

const LV2 = new Level();
LV2.readLevelFile(LV2_JSON);
levels[globals.LEVELS.LV2] = LV2;

// const LV3 = new Level();
// const LV4 = new Level();
// const LV5 = new Level();

export function getLevels(){
    return levels;
}
