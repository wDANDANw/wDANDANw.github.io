// Object List

import BaseObject from "./BaseObject.js";
import globals from "./globals.js";

class ObjectList {

    constructor(type) {
        this.type = type || globals.TAGS.BASE_OBJECT;
        this.size = 0;
        this.inner_list = [];
    }

    add(object){
        if (!this.isValidObjectTypeOfList(object)) {
          throw new Error(`Adding ${object} to list of type ${this.type} failed. Unmatched types. Currently inherited types are not supported.`)
        }

        this.inner_list.push(object);
        this.size ++;
        return this;
    }

    remove(object) {
        if (!this.isValidObjectTypeOfList(object)) {
            throw new Error(`Removing ${object} from list of type ${this.type} failed. Unmatched types. Currently inherited types are not supported.`)
        }

        const index = this.inner_list.indexOf(object);

        if (index === -1) {
            throw new Error(`Removing ${object} from list of type ${this.type} failed. Cannot find object.`)
        }

        this.inner_list.splice(index, 1);
        this.size --;
        return this;
    }

    pop(){
        this.size--;
        return this.inner_list.pop();
    }

    removeAll(){
        this.inner_list = [];
        this.size = 0;
        return this;
    }

    getSize() {
        return this.size;
    }

    isEmpty() {
        return this.size === 0;
    }

    forEach(func) {
        if (!func instanceof Function ) {
            throw new Error("ObjectList::forEach: Handle is not a function");
        }

        this.inner_list.forEach(func);
    }

    fromList(list){
        // TODO
    }

    isValidObjectTypeOfList (object){
        // TODO Add support for inheritance check
        if (object instanceof BaseObject) {
            if (object.type === this.type) {
                return true;
            }
        }

        return false;
    }


}


export default ObjectList;
