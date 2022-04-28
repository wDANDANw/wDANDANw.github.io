// Actor Class Definition
import GameObject from "./GameObject.js";
import globals from "./globals.js";

class Actor extends GameObject{

    constructor() {
        super();

        // region super
        // Tags of the actor
        this.tags = [globals.TAGS.ACTOR];

        // endregion

        // Text related configurations
        this.text = {

        };

        // Audio related configurations
        this.audio = {

        };

        // Rules of the actor
        this.rules = [];
    };

}

export default Actor;
