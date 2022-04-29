// Level Manager

import Manager from "./Manager.js";
import Level from "./Level.js";
import ObjectList from "./ObjectList.js";

import globals from "./globals.js";
import { EventCollision } from "./Events.js";

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
        // this.createTestLevel();

        this.levels = getLevels();

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
        this.current_level.loadLevel(this.current_level);


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
        let current_actor = null;
        let new_position = null;
        for (let i = 0; i < this.getActiveActors().size; i++) {

            current_actor = this.getActiveActors().inner_list[i];
            new_position = current_actor.predictPosition();

            if (!new_position.equal(current_actor.getPosition())){
                this.moveObject(current_actor, new_position);
                current_actor.update().draw().finishUpdate();
            } else {
                current_actor.update().finishUpdate();
            }


        }


    }

    moveObject(object, position) {

        // Assuming non-visible object does not need updates
        if ( !object.isVisible() ) {
            return;
        }

        // First update predicted geometry if not predicted
        if ( !object.predictGeometry() ) {
            throw new Error( `${ object } predicted geometry as null.` )
        }

        // Then process collisions
        if ( !this.processCollisions( object , position ) ) {
            return;
        }
    }


    processCollisions(object, position){
        let should_move = true;

        // Ask all actors if collision
        // Need iterator
        let current_actor = null;
        let new_position = null;
        let new_collision_event = null;
        for (let i = 0; i < this.getActiveActors().size; i++) {

            current_actor = this.getActiveActors().inner_list[i];

            if (current_actor === object) {
                continue;
            }

            // Update geometry if haven't
            current_actor.predictGeometry();

            // Then check if collide
            if (current_actor.hasVectorAt(position)) {
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

        return should_move;
    }

    createTestLevel(){
        // Test Function
        this.levels['1'] = new Level();
        this.current_level = '1';

        this.levels['1'].createTestActors();
    }

    static getInstance(){
        return instance;
    }
}
let instance = new LevelManager();

export default LevelManager;
