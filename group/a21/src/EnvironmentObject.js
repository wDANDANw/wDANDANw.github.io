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

    draw() {

        // Draw
        PS.color(this.geometry.position.x, this.geometry.position.y, this.mesh.color);

        // Update Data
        let current_data = PS.data(this.geometry.position.x, this.geometry.position.y);
        if (!current_data) {
            current_data = {};
        }

        current_data['environment'] = this;
        PS.data(this.geometry.position.x, this.geometry.position.y, current_data);

        return this;
    };

    static isEnvironmentObject(object){
        return object.prototype instanceof EnvironmentObject;
    }

}

export default EnvironmentObject;
