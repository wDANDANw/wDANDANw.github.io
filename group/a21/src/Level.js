// Level Class Definition
import Actor from "./Actor.js";
import BaseObject from "./BaseObject.js";
import globals from "./globals.js";
import ObjectList from "./ObjectList.js";

class Level extends BaseObject{

    constructor() {

        // region super
        super();
        this.type = globals.TAGS.LEVEL;

        // endregion

        this.info = {
            width: 0,
            height: 0,
            name: "default",
        };

        this.environments = new ObjectList(globals.TAGS.ENVIRONMENT);
        this.actors = new ObjectList(globals.TAGS.ACTOR);
    };

}
export default Level;
