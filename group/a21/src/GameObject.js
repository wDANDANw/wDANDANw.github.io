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
        this.name = 'default_name';

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
        this.updated = false;

        // Geometry Update Related
        this.has_predicted_geometry = false;
        this.predicted_geometry_changes = [];
        this.unupdated_geometry = this.geometry;
        this.predicted_geometry = null;

        // Custom Update Related (these properties are the main tools for user to make customized updates)
        this.can_update = false;     // This is user defined parameter that whether this object should update in the whole game
        this.state = 'init';
        this.states = {
            init: {}
        }
        this.rules = {};
        this.new_knowledge = {};
        this.parent = this;
        this.children = []; // Not using object list to avoid potential bugs. Hardcoded

        // Event Related
        this.event_lists = {};

        // Hardcoded part of the solving collision issues: if not blocking update position, bead might got over drawn
        this.should_move = true;

        // Hardcoded solution to vector erasing another vector
        this.drawn_beads = {};
    };

    // region Setter and Getters

    setName(name){
        this.name = name;
        return this;
    }

    getName(){
        return this.name;
    }

    addTag(tag){
        this.tags.push(tag);
        return this;
    }

    getTags(){
        return this.tags;
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

    // Hardcoded array parameter
    setVectors(vectors_array){
        if (vectors_array.length > 0) {
            vectors_array.forEach(vector => {
                this.geometry.vectors.add(new Vector2(vector[0], vector[1]))
            })
        }

        return this;
    }

    getVectors(){
        return this.geometry.vectors;
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

    setOpacity(opacity){
        this.mesh.opacity = opacity;
        return this;
    }

    getOpacity(){
        return this.mesh.opacity;
    }

    setParent(parent){
        if (!parent || !parent instanceof GameObject) {
            throw new Error(`${this.name} is trying to set parent as ${parent} but this parent is not a valid game object`)
        }

        this.parent = parent;
        parent.children.push(this);
        return this;
    }

    getParent(){
        return this.parent;
    }

    setStates(states){
        if (typeof (states.init) !== "object") {
            throw new Error(`Trying to set states as ${states} but init cannot be read properly`);
        }

        this.states = states;
        return this;
    }

    getStates(){
        return this.states;
    }

    // No setters for rules because it should only be set by the level reader
    // Else need to implement predicate checker here.

    getRules(){
        return this.rules;
    }

    // endregion

    // Lowest level update loop
    update() {

        if (!this.can_update) return this;                   // If user says this object cannot update, then return
        if (!this.isActive()) return this;                   // If not active, then should not update. return
        if (this.updated) return this;                       // Already updated this frame. return

        // If has not predicted geometry, then predict it
        if (!this.has_predicted_geometry) {
            this.predictGeometry();
        }

        // Update Geometry
        if (this.should_move) this.geometry = this.predicted_geometry;

        // Mark as updated
        this.updated = true;

        return this;
    }

    shouldUpdate(){
        return this.can_update && this.is_active;
    }

    finishUpdate(){
        this.has_predicted_geometry = false;
        this.updated = false;
        this.predicted_geometry_changes = [];
        this.should_move = true;
        return this;
    }

    predictPosition(){
        return this.getPosition().add(this.getVelocity());
    }

    predictGeometry(){

        if (!this.isActive()) return null;                                      // If not active, then should not predict. return static geometry
        if (!this.can_update) return this.geometry;                             // If cannot update, then there is still geometry. Return static geometry
        if (this.has_predicted_geometry) return this.predicted_geometry;        // Already predicted. return predicted geometry

        // System Automatic Prediction Based on Kinematics

        let predicted_position = this.predictPosition();
        if (!predicted_position.equal(this.geometry.position)) {
            this.predicted_geometry_changes.push('position');
        }
        let predicted_vectors = this.geometry.vectors;
        const predicted_scale = this.scale;                                     // Does not support scale changing in this version

        // Return the prediction
        this.predicted_geometry = {
            position: predicted_position,
            vectors: predicted_vectors,
            scale: predicted_scale, // Will not change in this version
        }
        this.has_predicted_geometry = true;
        this.unupdated_geometry = this.geometry;

        return this.predicted_geometry;

    }

    updateBehaviors() {
        // Null
        // Left for the usage of actor
    }

    draw() {

        // TODO: Add a display manager, or there is a possibility that sprites will get overdrawn
        if (!this.isActive() || !this.isVisible()) {
            return;
        }

        if (this.type === globals.TAGS.ENVIRONMENT) {
            PSDraw(this.geometry.position.x, this.geometry.position.y);
            return ;
        }

        // TODO: Hardcoded
        // Solution: Layer + Display Manager
        // Assuming this is an actor here

        // Draw Positions
        PSDrawActor(this.geometry.position.x, this.geometry.position.y, this.name, this.mesh.color);
        this.drawn_beads[(this.geometry.position.x * 100 + this.geometry.position.y).toString()] = 'drawn'

        if (this.geometry.vectors) {
            const pos_x = this.getPosition().getX();
            const pos_y = this.getPosition().getY();

            let vector;
            for (let i = 0; i < this.geometry.vectors.size; i++){
                vector = this.geometry.vectors.inner_list[i];
                PSDrawActor(pos_x + vector.x, pos_y + vector.y, this.name, this.mesh.color);
                this.drawn_beads[((pos_x + vector.x) * 100 + (pos_y + vector.y)).toString()] = 'drawn'
            }
        }

        // If draw after predicted / updated, then need to recover previous bead
        if (this.updated) {

            // TODO: Hardcoded
            if (this.predicted_geometry.position.equal(this.unupdated_geometry.position)) {
                return this;
            }

            if (this.drawn_beads[(this.unupdated_geometry.position.x * 100 + this.unupdated_geometry.position.y).toString()] !== 'drawn') {
                PSEraseActor(this.unupdated_geometry.position.x, this.unupdated_geometry.position.y, this.name, this.mesh.color);
            }

            if (this.unupdated_geometry.vectors) {
                this.unupdated_geometry.vectors.forEach(vector => {
                    const pos_x = this.unupdated_geometry.position.x;
                    const pos_y = this.unupdated_geometry.position.y;
                    if (this.drawn_beads[((pos_x + vector.x) * 100 + (pos_y + vector.y)).toString()] !== 'drawn') {
                        PSEraseActor(pos_x + vector.x, pos_y + vector.y, this.name, this.mesh.color);
                    }
                })
            }

        }

        this.drawn_beads = {};

        return this;
    };

    hasVectorAt(position) {
        let answer = false;

        if (!this.has_predicted_geometry) {
            this.predictGeometry();
        }

        if (this.getPosition().equal(position)) {
            return true;
        }

        // Still, need an iterator.
        let vector_pos = null;
        const object_pos = this.predicted_geometry.position;
        for ( let i = 0; i < this.predicted_geometry.vectors.size; i++){
            vector_pos = this.predicted_geometry.vectors.inner_list[i];
            if (vector_pos.add(object_pos).equal(position)) {
                answer = true;
                break;
            }
        }

        return answer;
    }

    removeVector(vector){
        this.geometry.vectors.remove(vector);
        PSEraseActor(vector.x + this.geometry.position.x, vector.y + this.geometry.position.y, this.name, this.mesh.color); // TODO: HARDCODED COLOR
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
function PSDraw(x, y){
    if (x < 0 || x > 15 || y < 0 || y > 15) {
        return;
    }

    PS.color(x, y,  PS.data(x,y)['color']);
}

function PSDrawActor(x, y, drawer, color){

    if (x < 0 || x > 15 || y < 0 || y > 15) {
        return;
    }

    const bead_data = PS.data(x ,y);

    // TODO: Add displaymanager and layers
    let index;
    for (index = 0; index < bead_data[globals.TAGS.ACTOR].length; index++){
        if (bead_data[globals.TAGS.ACTOR][index][0] === drawer) {
            break;
        }
    }

    if (index === bead_data[globals.TAGS.ACTOR].length) {
        bead_data[globals.TAGS.ACTOR].push([drawer, color]);
    }

    if (! (bead_data[globals.TAGS.ACTOR].length > 1) ) { // There were not other actors
        bead_data['color'] = color;
    }

    PSDraw(x,y);
}

function PSEraseActor(x, y, drawer, color){

    if (x < 0 || x > 15 || y < 0 || y > 15) {
        return;
    }

    const bead_data = PS.data(x ,y);

    // TODO: Add displaymanager and layers

    let index;
    for (index = 0; index < bead_data[globals.TAGS.ACTOR].length; index++){
        if (bead_data[globals.TAGS.ACTOR][index][0] === drawer) {
            break;
        }
    }

    bead_data[globals.TAGS.ACTOR].splice(index, 1);

    if (bead_data[globals.TAGS.ACTOR].length < 1) { // There were not other actors
        bead_data['color'] = bead_data[globals.TAGS.ENVIRONMENT].getColor();
    }

    PSDraw(x,y);
}

export default GameObject;
