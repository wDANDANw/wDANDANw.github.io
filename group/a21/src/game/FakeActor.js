// Actor Class Definition
import GameObject from "../GameObject.js";
import globals from "../globals.js";

import LevelManager from "../LevelManager.js";
import Vector2 from "../Vector.js";

class FakeActor extends GameObject{

    constructor() {
        super();

        // region super
        // Tags of the actor
        this.tags = [globals.TAGS.ACTOR];
        this.type = globals.TAGS.ACTOR;

        // endregion

        // Text related configurations
        this.text = {

        };

        // Audio related configurations
        this.audio = {

        };

        this.can_update = true;

    };
}

export default FakeActor;
