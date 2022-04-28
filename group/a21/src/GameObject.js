// Game Object Class Definition
import BaseObject from "./BaseObject.js";
import Vector2 from "./Vector.js";
import globals from "./globals.js";
import ObjectList from "./ObjectList.js";

class GameObject extends BaseObject{

    constructor() {

        // region super
        super();

        // Type and tags
        // A game object should have tags
        this.type = globals.TAGS.GAME_OBJECT;
        this.tags = [globals.TAGS.GAME_OBJECT];

        // endregion

        // Shape of the game object
        this.geometry = {
            position: new Vector2(0, 0),
            vectors: new ObjectList(globals.TAGS.VECTOR2),
            scale: 1,
        };

        // Render Information of the game object
        this.mesh = {
            color: '#000000',
            opacity: 1,
        }

        // Physics related configurations
        this.physics = {
            velocity : new Vector2(0, 0),
            acceleration: new Vector2(0, 0),
        }

        // Layer of the game object
        this.layer = 1;

    };

    render() {

    };

    getPosition(){
        return this.geometry.position;
    }

}

export default GameObject;
