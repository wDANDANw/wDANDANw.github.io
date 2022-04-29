// Level Class Definition
import Actor from "./Actor.js";
import EnvironmentObject from "./EnvironmentObject.js";
import GameObject from "./GameObject.js";
import BaseObject from "./BaseObject.js";
import globals from "./globals.js";
import ObjectList from "./ObjectList.js";

import { EventKeyboard } from "./Events.js";
import Vector2 from "./Vector.js";

/* globals PS : true */

class Level extends BaseObject{

    constructor() {

        // region super
        super();
        this.type = globals.TAGS.LEVEL;

        // endregion

        this.info = {
            width: 0,
            height: 0,
            name: "default",
            grid_background_color: globals.LEVEL_GRID_BACKGROUND_COLOR,
            status_text_color: globals.LEVEL_STATUS_TEXT_COLOR,
            default_env_color: PS.COLOR_BLACK,
        };

        this.environments = new ObjectList(globals.TAGS.ENVIRONMENT);
        this.actors = new ObjectList(globals.TAGS.ACTOR);
        this.hardcode_bead = null;
    };

    // includes previous level to hardcode solve the player rendering issue
    loadLevel(){

        // First need to set grid
        // TODO: Need Display Manager
        PS.gridSize( this.info.width , this.info.height );
        PS.gridColor(  this.info.grid_background_color );
        PS.border( PS.ALL , PS.ALL , 0 ); // can add to info
        PS.statusColor( this.info.status_text_color );
        PS.bgColor(PS.ALL, PS.ALL, this.info.default_env_color);
        PS.color(PS.ALL, PS.ALL, this.info.default_env_color);

        // Draw all environments
        this.environments.forEach( env => {
            env.draw();
        })

        // Draw all actors
        this.actors.forEach( actor => {
            actor.draw();
        })

        if (this.hardcode_bead){
            PS.color(this.hardcode_bead.x, this.hardcode_bead.y, PS.COLOR_BLACK);
        }
    }

    addObject(object) {
        if (!GameObject.isGameObject(object)) {
            throw new Error(`Cannot add ${object} to level because it is not a game object`);
        }

        if (Actor.isGameObject(object)) {
           this.actors.add(object);
        } else if (EnvironmentObject.isEnvironmentObject(object)) {
            this.environments.add(object);
        } else {
            throw new Error(`Pure Game Objects are not supported in current version`);
        }
    }

    removeObject(object) {
        if (!GameObject.isGameObject(object)) {
            throw new Error(`Cannot remove ${object} to level because it is not a game object`);
        }

        if (Actor.isGameObject(object)) {
            this.actors.remove(object);
        } else if (EnvironmentObject.isEnvironmentObject(object)) {
            this.environments.remove(object);
        } else {
            throw new Error(`Pure Game Objects are not supported in current version`);
        }
    }

    getEnvironments(){
        return this.environments;
    }

    getAllActors(){
        return this.actors;
    }

    getActorAtPosition(position){
        let actor = null;

        // This is a really hardcoded solution because if using forEach, then cannot break
        // In the future, use iterators instead
        for (let i = 0; i < this.actors.size; i++){
            if (this.actors.inner_list[i].getPosition().equal(position)) {
                actor = this.actors.inner_list[i];
                break;
            }
        }

        return actor;
    }

    getEnvironmentAtPosition(position){
        let env = null;

        // This is a really hardcoded solution because if using forEach, then cannot break
        // In the future, use iterators instead
        for (let i = 0; i < this.environments.size; i++){
            if (this.environments.inner_list[i].getPosition().equal(position)) {
                env = this.environments.inner_list[i];
                break;
            }
        }

        return env;
    }

    getActiveActors(){
        const temp_array = new ObjectList(globals.TAGS.ACTOR);
        this.actors.forEach( actor => {
            if (actor.isActive()) {
                temp_array.add(actor);
            }
        })

        return temp_array;
    }

    createTestActors(){

        const test1 = new Actor();

        // Test Keyboard Event
        test1.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
        this.actors.add(test1);

        // Test Collision Event and Move
        const test2 = new Actor();

        test1.setPosition(new Vector2(5,5));
        test2.setPosition(new Vector2(3,5));

        test2.setVelocity(new Vector2(1,0));
        this.actors.add(test2);
    }

    getLevelInfo(){
        return `Level ${this.info.name} with dimension of [${this.info.width},${this.info.height}]`
    }

    readLevelFile(level_file){
        // Update Level Info
        this.info['width'] = level_file["level-info"].dimensions.width;
        this.info['height'] = level_file["level-info"].dimensions.height;
        this.info['name'] = level_file["level-info"]['level-name'];

        // Update environment and actors
        const new_actor_list = new ObjectList(globals.TAGS.ACTOR);
        level_file.actors.forEach( actor => {
            const new_actor = new Actor();
            new_actor.setPosition(new Vector2(actor.position.x, actor.position.y));
            new_actor.setColor(actor.color);
            new_actor.rules = new_actor.rules.concat(actor.rules);
            new_actor.tags = new_actor.tags.concat(actor.tags);

            if (new_actor.tags.includes(globals.TAGS.PLAYER)) {
                new_actor.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
            }

            if (new_actor.tags.includes(globals.TAGS.INVISIBLE)) {
                new_actor.setVisibility(false);
            }

            new_actor_list.add(new_actor);
        })
        this.actors = new_actor_list;


        const new_env_list = new ObjectList(globals.TAGS.ENVIRONMENT);
        level_file.background.forEach( env => {
            const new_env = new EnvironmentObject();
            new_env.setPosition(new Vector2(env.position.x, env.position.y));
            new_env.setColor(env.color);
            new_env_list.add(new_env);
        })
        this.environments = new_env_list;

        this.hardcode_bead = level_file.hardcode_bead;
    }


}

export default Level;
