// File that contains all intended events in this demo version
import globals from "./globals.js";
import GameObject from "./GameObject.js";
import Vector2 from "./Vector.js";

export class BaseEvent {

    constructor(type) {
        this.event_type = type;
    }

    getType(){
        return this.event_type;
    }

    setType(event_type){
        if (!(event_type in globals.EVENTS)) {
            throw new Error(`Trying to set event type as ${event_type} but this is not a recognizable event in the event list`);
        }
        this.event_type = event_type;
    }

}

export class EventStep extends BaseEvent {

    constructor(step_count) {
        super( globals.EVENTS.STEP_EVENT );
        this.step_count = step_count || 0;
    }

    setStepCount(step_count){
        this.step_count = step_count;
    }

    getStepCount(){
        return this.step_count;
    }
}

export class EventCollision extends BaseEvent {

    constructor(position, object1, object2) {
        super(globals.EVENTS.COLLISION_EVENT);
        this.position = position;
        this.object1 = object1;
        this.object2 = object2;
    }

    setObject1(object){
        if (!(object instanceof GameObject)){
            throw new Error(`Trying to set object 1 as ${object} but this is not a valid game object`);
        }

        this.object1 = object;
    }

    getObject1(){
        return this.object1;
    }

    setObject2(object){
        if (!(object instanceof GameObject)){
            throw new Error(`Trying to set object 2 as ${object} but this is not a valid game object`);
        }

        this.object2 = object;
    }

    getObject2(){
        return this.object2;
    }

    setPosition(position){
        if (!(position instanceof Vector2)){
            throw new Error(`Trying to set position as ${position} but this is not a valid vector2`);
        }

        this.position = position;
    }

    getPosition(){
        return this.position;
    }

}

export class EventKeyboard extends BaseEvent{

    constructor(key, status) {
        super(globals.EVENTS.KEYBOARD_EVENT);

        if (!key in globals.KEYBOARD.KEYS || !status in globals.KEYBOARD.STATUS) {
            throw new Error(`Trying to set invalid event key as ${key} and status as ${status} while creating new keyboard event`);
        }

        this.key = key;
        this.status = status;
    }

    setKey(key){
        if (!(key in globals.KEYBOARD.KEYS)){
            throw new Error(`Trying to set event key as ${key} but this is not a recognizable key type in the keys list`);
        }

        this.key = key;
    }

    getKey(){
        return this.key;
    }

    setStatus(status){
        if (!(status in globals.KEYBOARD.STATUS)){
            throw new Error(`Trying to set key status as ${status} but this is not a recognizable key status in the key status list`);
        }

        this.status = status;
    }

    getStatus(){
        return this.status;
    }

}
