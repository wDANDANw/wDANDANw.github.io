// Actor Class Definition
import GameObject from "./GameObject.js";
import globals from "./globals.js";

class EnvironmentObject extends GameObject{

    constructor() {
        super();

        // Type and tags of the environment object
        this.type = globals.TAGS.ENVIRONMENT;
        this.tags = [globals.TAGS.ENVIRONMENT];
    };

}

export default EnvironmentObject;
