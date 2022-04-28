// Base Object class
import globals from "./globals.js";

class BaseObject{

    constructor() {
        // The type of the object, for iteration
        this.type = globals.TAGS.BASE_OBJECT;
    };

    getType(){
        return this.type;
    }

    setType(type){
        if (typeof (type) !== 'string') {
            throw new Error(`Setting invalid ${type} to the object ${this.type}`);
        }

        this.type = type;
        return this;
    }


}

export default BaseObject;
