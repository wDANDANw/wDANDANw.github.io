// Vector Class Definition
import BaseObject from "./BaseObject.js";
import globals from "./globals.js";

class Vector2 extends BaseObject{

    constructor(x , y) {
        super();
        this.type = globals.TAGS.VECTOR2;

        this.x = x;
        this.y = y;

        // No need for rotation in this version
    }

    setX(x) {
        this.x = x;
        return this;
    }

    getX() {
        return this.x;
    }

    setY(y) {
        this.y = y;
        return this;
    }

    getY() {
        return this.y;
    }

    setVector(x , y) {
        this.x = x;
        this.y = y;
        return this;
    }

    getMagnitude() {
        // TODO if needed
    }

    normalize() {
        // TODO if needed
    }

    scale() {
        // TODO if needed
    }

    add(b) {
        return new Vector2(this.x + b.x, this.y + b.y);
    }

}

export default Vector2;
