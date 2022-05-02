// Level Manager

import Manager from "./Manager.js";
import Level from "./Level.js";
import ObjectList from "./ObjectList.js";

import globals from "./globals.js";
import { EventCollision } from "./Events.js";
import Vector2 from "./Vector.js";

import { getLevels } from "./LevelReaderHardcodedA21.js";

class LevelManager extends Manager{

    constructor() {

        // Manager Related
        super();
        this.type = 'Level Manager';

        // Global Level Info
        this.current_level = null;
        this.current_level_name = null;
        this.levels = {};
        this.levels_backup = {};

        // Runtime Current Level Related
        this.deletion_list = null;

        // TODO Future
        this.camera = null;

        // Related to level changing
        this.loading_level = false;
    };

    startUp() {

        // Initialize the lists
        this.deletion_list = new ObjectList(globals.TAGS.GAME_OBJECT);

        // Test
        // this.levels = this.createTestLevel();

        this.levels_backup = getLevels();
        this.levels = {... this.levels_backup};

        // Super
        return super.startUp();
    }

    // shutDown(){} Shut down is removed because javascript does not have memory leak concern?

    getCurrentLevel(){
        return this.current_level;
    }

    addObject(object) {
        this.current_level.addObject(object);
    }

    removeObject(object) {
        this.current_level.removeObject(object);
    }

    getEnvironments(){
        return this.current_level.getEnvironments();
    }

    getActors(){
        return this.current_level.getActors();
    }

    getActiveActors(){
        return this.current_level.getActiveActors();
    }

    draw(){
        // Will need this after we have the camera
    }

    loadLevel(level_name){
        if (!(level_name in this.levels)) {
            throw new Error(`${level_name} not in levels list`);
        }

        // Is loading level
        this.loading_level = true;

        // Update level instance
        this.current_level_name = level_name;
        this.current_level = this.levels[this.current_level_name];

        // Draw all environments
        this.current_level.loadLevel();

        // Finished loading level
        this.loading_level = false;
    }

    update() {

        // Can only update when it is not loading level
        if (this.loading_level) {
            return;
        }

        // Delete objects in the deletion list
        // Currently only deleting actors because assuming environments will not change
        let current_object = null;
        while (!this.deletion_list.isEmpty()) {
            current_object = this.deletion_list.pop();

            if (current_object.type !== globals.TAGS.ACTOR) {
                throw new Error(`Got non-actor object in the deletion list`);
            }

            this.removeObject(current_object);
        }


        // Again, need iterator
        // First update behaviors, then update geometry
        // Through this, there will not be conflicts between behavior updated fields and predicted fields
        let current_actor = null;

        for (let i = 0; i < this.getActiveActors().size; i++) {
            current_actor = this.getActiveActors().inner_list[i];
            if (!current_actor.shouldUpdate()) continue;

            current_actor.updateBehaviors();
        }

        let new_position = null;
        for (let i = 0; i < this.getActiveActors().size; i++) {

            current_actor = this.getActiveActors().inner_list[i];
            if (!current_actor.shouldUpdate()) continue;

            new_position = current_actor.predictPosition();
            if (!new_position.equal(current_actor.getPosition())){
                if (this.moveObject(current_actor, new_position)) {
                    current_actor.update().draw().finishUpdate();
                    return;
                }
            }

            current_actor.update().finishUpdate();

        }


    }

    moveObject(object, position) {

        // TODO: Hardcoded
        // Assuming non-visible object does not need updates
        if ( !object.isVisible() ) {
            return;
        }

        // First update predicted geometry if not predicted
        if ( !object.predictGeometry() ) {
            throw new Error( `${ object } predicted geometry as null.` )
        }

        // Then process collisions
        object.should_move = this.processCollisions( object , position );
        return object.should_move;
    }


    processCollisions(object, position){
        let should_move = true;

        // Ask all actors if collision
        // Need iterator
        let current_actor = null;
        let new_position = null;
        let new_collision_event = null;
        const active_actor_list_inner = this.getActiveActors().inner_list;

        // TODO: Hardcoded
        // Create predicted vector list of current object with actual coords. Assumed that predicted geometry is already generated

        const predicted_vectors = object.predicted_geometry.vectors.inner_list;
        const predicted_vectors_real_coors = new ObjectList(globals.TAGS.VECTOR2);
        predicted_vectors_real_coors.add(position);

        let cur_v;
        for (let i = 0; i < predicted_vectors.length; i++){
            cur_v = predicted_vectors[i];
            predicted_vectors_real_coors.add(new Vector2(cur_v.x+position.x, cur_v.y+position.y));
        }

        for (let i = 0; i < active_actor_list_inner.length; i++) {

            current_actor = active_actor_list_inner[i];

            if (current_actor === object) {
                continue;
            }

            // Update geometry if haven't
            current_actor.predictGeometry();

            // Then check if collide
            // TODO: Should implement ways to recude redundant checks between two => The box solution => Check greater boxes
            for (let i = 0; i < predicted_vectors_real_coors.size; i++){
                if (current_actor.hasVectorAt(predicted_vectors_real_coors.inner_list[i])) {

                    new_collision_event = new EventCollision(position, object, current_actor);

                    //Send to both objects. Note that this does not go through onEvent so there's no event filtering.
                    object.handleEvent(new_collision_event);
                    current_actor.handleEvent(new_collision_event);

                    // TODO: update the comparison to a "move" comparator that contains layer, geometry, and all the stuff
                    if (object.isVisible() && current_actor.isVisible()) {
                        should_move = false;
                    }
                }
            }

        }

        return should_move;
    }

    createTestLevel(){
        // Test Function
        const levels = {};

        levels['level-1'] = new Level();
        levels['level-1'].info = {
            width: 16,
            height: 16,
            name: "test",
            grid_background_color: globals.LEVEL_GRID_BACKGROUND_COLOR,
            status_text_color: globals.LEVEL_STATUS_TEXT_COLOR,
            default_env_color: PS.COLOR_BLACK,
        };
        levels['level-1'].createTestActors();

        return levels;
    }

    static getInstance(){
        return instance;
    }
}
let instance = new LevelManager();

export default LevelManager;
