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

        this.hardcoded_collision_registration_list = [];
        this.collision_registered = false;

    };

    // includes previous level to hardcode solve the player rendering issue
    loadLevel(){

        if (!this.collision_registered) {
            this.hardcoded_collision_registration_list.forEach(actor=>{actor.registerEvent(globals.EVENTS.COLLISION_EVENT)});
        }

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

        for (let i = 0; i < this.actors.inner_list.length; i++) {
            if (this.actors.inner_list[i].isActive()) {
                temp_array.add(this.actors.inner_list[i]);
            }
        }

        return temp_array;
    }

    getActorsWithTag(tag){
        const temp_array = new ObjectList(globals.TAGS.ACTOR);
        for (let i = 0; i < this.actors.inner_list.length; i++) {
            if (this.actors.inner_list[i].tags.includes(tag)) {
                temp_array.add(this.actors.inner_list[i]);
            }
        }

        return temp_array;
    }

    getActorWithName(name){
        let actor = null;
        for (let i = 0; i < this.actors.inner_list.length; i++) {
            if (this.actors.inner_list[i].getName() === name) {
                actor = this.actors.inner_list[i];
                break;
            }
        }

        return actor;
    }

    createTestActors(){

        // TODO: This code is placed here because I do not want to import actors in level manager
        const test1 = new Actor();
        const test2 = new Actor();

        test1.setPosition(new Vector2(5,5));
        test2.setPosition(new Vector2(3,5));

        test2.handleEvent = (evt) => {
            if (evt.getType() === globals.EVENTS.KEYBOARD_EVENT) {
                if (evt.getKey() === globals.KEYBOARD.KEYS.RIGHT) {
                    if (evt.getStatus() === globals.KEYBOARD.STATUS.KEYDOWN) {
                        console.log(this.actors.inner_list);
                        this.actors.inner_list[1].setVelocityX(1);
                    } else {
                        this.actors.inner_list[1].setVelocityX(0);
                    }
                }
            }
        }

        test1.can_update = true;
        test2.can_update = true;
        test1.setColor(0xFFFFFF);
        test2.setColor(0xFFFFFF);
        test1.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
        test2.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
        this.actors.add(test1);
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

        const prefab_list = level_file.prefabs;
        const name_list = {} // For avoiding name conflicts

        // Update Environment
        const new_env_list = new ObjectList(globals.TAGS.ENVIRONMENT);
        let temp_prefab = null;
        let current_prefab = null;
        level_file.background.forEach( env => {
            const new_env = new EnvironmentObject();
            temp_prefab = prefab_list[env.prefab_name];
            if (!temp_prefab) {
                throw new Error(`Trying to read prefab ${env.prefab_name} during level environment init but this prefab does not exist in the level file`);
            }
            current_prefab = temp_prefab;

            // From the env object in list
            new_env.setPosition(new Vector2(env.position.x, env.position.y));

            // TODO: If needed, can add support for adding vectors (extra vectors)

            // From the prefab
            new_env.setType(globals.TAGS.ENVIRONMENT);

            if (!name_list[current_prefab.name]) name_list[current_prefab.name] = 1;
            else name_list[current_prefab.name] ++;
            new_env.setName((current_prefab.name + '_' +  name_list[current_prefab.name]));

            if ( current_prefab.tags ) {
                current_prefab.tags.forEach(tag => new_env.addTag(tag));
            }

            new_env.setColor(current_prefab.mesh.color);
            new_env.setOpacity(current_prefab.mesh.opacity);
            new_env.setActive(current_prefab.status.is_active);
            new_env.setVisibility(current_prefab.status.is_visible);
            new_env.can_update = false;

            new_env_list.add(new_env);
        })
        this.environments = new_env_list;

        // Update Actors
        const new_actor_list = new ObjectList(globals.TAGS.ACTOR);
        const parent_child_pairs = {};
        level_file.actors.forEach( actor => {
            const new_actor = new Actor();

            if (!prefab_list[actor.prefab_name]){
                throw new Error(`Trying to read prefab ${actor.prefab_name} during level actor init but this prefab does not exist in the level file`);
            }
            current_prefab = prefab_list[actor.prefab_name];

            // From the actor object in actor list
            // Geometry: Position
            new_actor.setPosition(new Vector2(actor.position.x, actor.position.y));

            // From the prefab
            // Type
            new_actor.setType(globals.TAGS.ACTOR);

            // Name
            if (!name_list[current_prefab.name]) name_list[current_prefab.name] = 1;
            else name_list[current_prefab.name] ++;
            new_actor.setName((current_prefab.name + '_' +  name_list[current_prefab.name]));

            // Tags
            if ( current_prefab.tags ) {
                current_prefab.tags.forEach(tag => new_actor.addTag(tag));
            }

            // Geometry: Vector + Scale (Not supported so not adding)
            new_actor.setVectors(current_prefab.geometry.vectors);

            // Mesh
            new_actor.setColor(current_prefab.mesh.color);
            new_actor.setOpacity(current_prefab.mesh.opacity);

            // Status
            new_actor.setActive(current_prefab.status.is_active);
            new_actor.setVisibility(current_prefab.status.is_visible);

            // Parent
            if (current_prefab.parent !== 'self') {

                // Push to buffer and execute this after the whole actor list is constructed
                // TODO: Currently only support parent tag, because parent name has _id at the end
                // Try to think about structure
                parent_child_pairs[new_actor.getName()] = {
                    child_name: new_actor.getName(),
                    child_ref: new_actor,
                    parent_tag: current_prefab.parent
                };
            }

            // Behavior System Related
            if (Object.keys(current_prefab.update.states).length > 1) {
                new_actor.setStates(current_prefab.update.states);
            }

            let should_register_collision = false;
            let should_register_keyboard = false;

            if (Object.keys(current_prefab.update.rules).length > 0) {
                Object.entries(current_prefab.update.rules).forEach(([rule_name, rule]) => {
                    if (!should_register_collision && rule.includes('COLLIDE')) should_register_collision = true;
                    if (!should_register_keyboard && rule.includes('KEYBOARD')) should_register_keyboard = true;
                    new_actor.rules[rule_name] = parseRuleToPredicateChain(rule);
                });
            }
            new_actor.new_knowledge = current_prefab.update.new_knowledge;


            // TODO: Hardcoded
            // Simulate giving users ability to do sth when the object is initialized (especially reverting default settings)
            if (current_prefab.init) {
                if (current_prefab.init.unregister_event) {
                    if (current_prefab.init.unregister_event === 'keyboard') {
                        new_actor.unregisterEvent(globals.EVENTS.KEYBOARD_EVENT);
                    }
                }

            }


            if (should_register_collision) this.hardcoded_collision_registration_list.push(new_actor);
            if (should_register_keyboard) new_actor.registerEvent(globals.EVENTS.KEYBOARD_EVENT);

            new_actor.can_update = true;
            new_actor_list.add(new_actor);
        })
        this.actors = new_actor_list;

        // Set parents
        if (Object.keys(parent_child_pairs).length > 0) {
            Object.values(parent_child_pairs).forEach( pair => {
                pair.child_ref.setParent(this.getActorsWithTag(pair.parent_tag).inner_list[0]);
            })
        }

    }


}

const RULE_PATTERN = /^((IF)\((\w+)\((.*|\-)\)\)->)((IF|DO)\((\w+)\((.*|\-)\)\)(->)*)*$/
function parseRuleToPredicateChain(str){
    const no_space_str = str.replace(/\s/g, '');
    if (!RULE_PATTERN.test(no_space_str)) {
        throw new Error(`Trying to convert ${no_space_str} to predicate chain but failed regex test`);
    }
    const predicates = no_space_str.split('->');
    if (predicates.length < 2) {
        throw new Error(`Trying to convert ${str} to array of predicates but failed.`);
    }

    const head_predicate_obj = predicateStrToObject(predicates[0]);
    let prev = head_predicate_obj;
    let new_predicate_node = null;
    for (let i = 1; i < predicates.length; i++){
        new_predicate_node = predicateStrToObject(predicates[i])
        prev.next = new_predicate_node;
        prev = new_predicate_node;
    }

    // Set the last one's next to null
    prev.next = null;

    if (head_predicate_obj.next === null) {
        console.log("Failing Predicate Chain:");
        console.log(head_predicate_obj);
        console.log("Last Predicate:");
        console.log(prev);
        throw new Error(`Parsing predicate string ${str} to logic chain, but failed because there is no next expression after if predicate`);
    }

    if (prev.predicate !== 'DO') {
        console.log("Failing Predicate Chain:");
        console.log(head_predicate_obj);
        console.log("Last Predicate:");
        console.log(prev);
        throw new Error(`Parsing predicate string ${str} to logic chain, but the last expression ${prev} is not a do predicate`);
    }

    return head_predicate_obj;
}

const PREDICATE_TEST_PATTERN = /(IF|DO)\((KEYBOARD|UPDATE|COMPARE|COLLIDE|PRINT|SPECIAL)\(((\w+(\.[\w\d\-]+)*)(,[\w\d\-]+(\.[\w\d\-]+)*){0,3})\)\)/
const PREDICATE_GROUP_PATTERN = /(IF|DO)\((KEYBOARD|UPDATE|COMPARE|COLLIDE|PRINT|SPECIAL)\(([^\)]*)\)\)/

function predicateStrToObject(str){

    if (!PREDICATE_TEST_PATTERN.test(str)) {
        throw new Error(`Trying to convert ${str} to predicate node but failed regex test`);
    }

    const match = str.match(PREDICATE_GROUP_PATTERN);

    // Processing parameters
    match[3] = match[3].split(',');
    if (match[2] === 'KEYBOARD') {
        if (match[3][0] === 'RIGHT') match[3][0] = globals.KEYBOARD.KEYS.RIGHT;
        else if (match[3][0] === 'LEFT') match[3][0] = globals.KEYBOARD.KEYS.LEFT;
        else if (match[3][0] === 'UP') match[3][0] = globals.KEYBOARD.KEYS.UP;
        else if (match[3][0] === 'DOWN') match[3][0] = globals.KEYBOARD.KEYS.DOWN;
        else if (match[3][0] === 'SPACE') match[3][0] = globals.KEYBOARD.KEYS.SPACE;

        if (match[3][1] === 'UP') match[3][1] = globals.KEYBOARD.STATUS.KEYUP;
        else if (match[3][1] === 'DOWN') match[3][1] = globals.KEYBOARD.STATUS.KEYDOWN;
    }

    const structure = {
        full_sentence: match[0],
        predicate: match[1],
        function: match[2],
        parameters: match[3],
        next: null,
    }

    return structure;
}

export default Level;
