// Game Object Class Definition
import BaseObject from "./BaseObject.js";
import Vector2 from "./Vector.js";
import globals from "./globals.js";
import ObjectList from "./ObjectList.js";

import GameManager from "./GameManager.js";
import InputManager from "./InputManager.js";
import LevelManager from "./LevelManager.js";

import { BaseEvent, EventCollision, EventKeyboard } from "./Events.js";

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
            color: 0x000000,
            opacity: 1,
        }

        // Physics related configurations
        this.physics = {
            velocity : new Vector2(0, 0),
            acceleration: new Vector2(0, 0),
        }

        // Layer of the game object
        this.layer = 1;

        // Active Status of the game object
        this.is_active = true;
        this.is_visible = true;

        // Update Related
        this.predicted = false;
        this.updated = false;
        this.unupdated_geometry = this.geometry;
        this.predicted_geometry = null;

        // Event Related
        this.event_lists = {};

    };

    draw() {

        // TODO: Add a display manager, or there is a possibility that sprites will get overdrawn
        if (!this.isActive() || !this.isVisible()) {
            return;
        }

        // Draw Positions
        PSDraw(this.geometry.position.x, this.geometry.position.y, this.mesh.color);

        if (this.geometry.vectors) {
            this.geometry.vectors.forEach(vector => {
                PSDraw(vector.x, vector.y, this.mesh.color);
            })
        }

        // If draw after predicted / updated, then need to recover previous bead
        if (this.updated) {

            const data = PSData(this.unupdated_geometry.position.x, this.unupdated_geometry.position.y);
            if (data === -1) {return this;} // Out of bound

            const color = data['environment'].getColor();
            PSDraw(this.unupdated_geometry.position.x, this.unupdated_geometry.position.y, color);

            if (this.unupdated_geometry.vectors) {
                this.unupdated_geometry.vectors.forEach(vector => {
                    PSDraw(vector.x, vector.y, color);
                })
            }
        }

        return this;
    };

    finishUpdate(){
        this.predicted = false;
        this.updated = false;
        return this;
    }

    setPosition(position){
        if (!position instanceof Vector2) {
            throw new Error (`${this.type} is trying to set position but the position is not a vector`);
        }

        this.geometry.position = position;
    }

    getPosition(){
        return this.geometry.position;
    }

    isActive(){
        return this.is_active;
    }

    setActive(active){
        if (!typeof (active) === 'bool') {
            throw new Error (`${this.type} is trying to set activeness but the new parameter is not a bool`);
        }

        this.is_active = active;
    }

    isVisible() {
        return this.is_visible;
    }

    setVisibility(visible){
        if (!typeof (visible) === 'bool') {
            throw new Error (`${this.type} is trying to set visibility but the new parameter is not a bool`);
        }

        this.is_visible = visible;
    }

    getVelocity(){
        return this.physics.velocity;
    }

    setVelocity(velocity){
        // Currently hard set velocity cannot exceed 1
        if (velocity.x > 1 || velocity.x < -1 || velocity.y > 1 || velocity.y < -1) {
            throw new Error (`${this.type} is trying to set velocity of ${velocity} but only velocity lower than 1 is supported now`);
        }

        this.physics.velocity = velocity;
    }

    setVelocityX(number){
        if (number > 1 || number < -1) {
            throw new Error (`${this.type} is trying to set velocity.x of ${number} but only x lower than 1 is supported now`);
        }

        this.physics.velocity.setX(number);
    }

    setVelocityY(number){
        if (number > 1 || number < -1) {
            throw new Error (`${this.type} is trying to set velocity.y of ${number} but only x lower than 1 is supported now`);
        }

        this.physics.velocity.setY(number);
    }

    setColor(color) {

        if (/^#[0-9A-F]{6}$/i.test(color)) { // This is a hex color
             color = this.hexColorToNumber(color)
        }

        if (Number.isNaN(color)) {
            throw new Error(`Trying to set unsupported color ${color} to the object`);
        }

        this.mesh.color = color;
    }

    hexColorToNumber (color) {
        return color.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i
            , (m, r, g, b) => "#" + r + r + g + g + b + b)
            .substring(1).match(/.{2}/g)
            .map(x => parseInt(x, 16));
    }

    getColor(){
        return this.mesh.color;
    }

    predictPosition(){
        return this.getPosition().add(this.getVelocity());
    }

    // A vector update function that can be overwritten. Will help the case that geometry is not in normal shape.
    vectorUpdate(vector){
        return vector.add(this.getVelocity());
    }

    predictGeometry(){
        if (this.isActive()) {
            if (!this.predicted) {
                this.predicted = true;
                this.unupdated_geometry = this.geometry;

                // Predict
                // Predict vectors
                const new_vector_list = new ObjectList(globals.TAGS.VECTOR2);
                this.geometry.vectors.forEach( vector => {
                    new_vector_list.add(this.vectorUpdate(vector));
                })

                this.predicted_geometry = {
                    position: this.predictPosition(),
                    vectors: new_vector_list,
                    scale: 1, // Will not change in this version
                }
                return this.predicted_geometry;
            } else {
                return this.predicted_geometry;
            }
        }

        return null;
    }

    update() {

        // The base game object updates the positions of the object
        if (this.isActive()) {
            if (!this.updated) {
                // Has to predict geometry first
                if (!this.predicted) {
                    this.predictGeometry();
                }

                // Update Geometry
                this.geometry = this.predictGeometry();

                // Update Rules

                // Mark as updated
                this.updated = true;
            }

            return this;
        }

        return this;
    }

    hasVectorAt(position) {
        let answer = false;

        if (!this.predicted) {
            this.predictGeometry();
        }

        if (this.getPosition().equal(position)) {
            return true;
        }

        // Still, need an iterator.
        for ( let i = 0; i < this.predicted_geometry.vectors.size; i++){
            if (this.predicted_geometry.vectors[i].equal(position)) {
                answer = true;
                break;
            }
        }

        return answer;
    }

    registerEvent(event_name) {

        if (this.event_lists[event_name]) return ;

        if (!event_name in globals.EVENTS) {
            throw new Error(`Trying to register ${event_name} but this is not a recognizable event`);
        }

        if (event_name === globals.EVENTS.KEYBOARD_EVENT) {
            if (!InputManager.getInstance().registerEvent(this, event_name)){
                console.log(`${this.type} failed to register keyboard event`);
                return false;
            }
        } else {
            if(!LevelManager.getInstance().registerEvent(this, event_name)){
                console.log(`${this.type} failed to register ${event_name} event`);
                return false;
            }
        }

        this.event_lists[event_name] = event_name;
        return true;
    }

    unregisterEvent(event_name){

        if (!this.event_lists[event_name]) return;

        if (event_name === globals.EVENTS.KEYBOARD_EVENT) {
            if (!InputManager.getInstance().unregisterEvent(this, event_name)){
                console.log(`${this.type} failed to register keyboard event`);
                return false;
            }
        } else {
            if(!LevelManager.getInstance().unregisterEvent(this, event_name)){
                console.log(`${this.type} failed to register ${event_name} event`);
                return false;
            }
        }

        delete this.event_lists[event_name];
    }

    handleEvent(event) {
        // if (this.event_list.includes(event)) {
        //
        // }
        // No handle because this is a base class
    }

    static isGameObject(object){
        return object.prototype instanceof GameObject;
    }

}

// A21 Hardcoded substitute to display manager
function PSDraw(x, y, color){

    if (x < 0 || x > 15 || y < 0 || y > 15) {
        return;
    }

    PS.color(x, y, color);
}

function PSData(x, y) {
    if (x < 0 || x > 15 || y < 0 || y > 15) {
        return -1;
    }

    return PS.data(x,y);
}

export default GameObject;
