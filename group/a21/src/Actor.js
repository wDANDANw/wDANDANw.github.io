// Actor Class Definition
import GameObject from "./GameObject.js";
import globals from "./globals.js";

import LevelManager from "./LevelManager.js";
import Vector2 from "./Vector.js";

class Actor extends GameObject{

    constructor() {
        super();

        // region super
        // Tags of the actor
        this.tags = [globals.TAGS.ACTOR];
        this.type = globals.TAGS.ACTOR;

        // endregion

        // Text related configurations
        this.text = {

        };

        // Audio related configurations
        this.audio = {

        };

        // TODO: Hardcoded event buffer for behavior system update
        this.event_buffers = {
            'collide': [],
            'keyboard': {}
        };
    };

    update() {

        // Update Kinematics
        super.update();

        // Need to return self for chaining
        return this;
    }

    updateBehaviors() {
        // TODO: This is the MAS / Behavior interpretation module
        // TODO: Should be separated. But for this demo, put it here.
        // TODO: Currently, contains processable actions of 1) Collide, 2) Keyboard Event, 3) Compare

        // If there are no rules, return.
        if (Object.keys(this.rules).length === 0) {
            return this;
        }

        // Update based on rules
        // TODO: Currently all hardcoded

        let rule_name;
        for (rule_name in this.rules) {
            let current_rule_node = this.rules[rule_name];
            let c_predicate = current_rule_node.predicate;
            let c_function = current_rule_node.function;
            let c_params = current_rule_node.parameters;

            let should_process_next_predicate = true;
            while ( should_process_next_predicate && current_rule_node !== null ) {

                c_predicate = current_rule_node.predicate;
                c_function = current_rule_node.function;
                c_params = current_rule_node.parameters;

                if (c_predicate === 'IF') {
                    if (c_function === 'COMPARE') {

                        const comp_obj_1 = c_params[0].includes('this.') ? this.getProperty(c_params[0]) : c_params[0];
                        const comp_obj_2 = c_params[1].includes('this.') ? this.getProperty(c_params[1]) : c_params[1];

                        if (!this.compareHandler(comp_obj_1, comp_obj_2, c_params[2], this)) {
                            //TODO: this can be improved
                            should_process_next_predicate = false;
                            continue;
                        }
                    }

                    else if (c_function === 'COLLIDE') {

                        if (this.event_buffers.collide.length < 1) {
                            should_process_next_predicate = false;
                            continue
                        }

                        let collision, another;

                        while (this.event_buffers.collide.length > 0) {
                            collision = this.event_buffers.collide.shift();
                            another = collision.getObject1().name === this.name ? collision.getObject2() : collision.getObject1();

                            if (!another.tags.includes(c_params[0])){
                                should_process_next_predicate = false;
                                continue;
                            }

                        }
                    }

                    else if (c_function === 'KEYBOARD') {
                        if (this.event_buffers.keyboard[c_params[0]] !== c_params[1]) {
                            should_process_next_predicate = false;
                            continue
                        }
                    }

                    else {
                        throw new Error(`Trying to update behavior but the function ${c_function} is not recognizable`)
                    }
                }

                else if (c_predicate === 'DO') {

                    if (c_function === 'CREATE') {

                    }

                    else if (c_function === 'READ') {
                        return this.eval(c_params[0]);
                    }

                    else if (c_function === 'UPDATE') {
                        this.setProperty(c_params[0], c_params[1]);

                        if (c_params[0].includes('this.is_visible')) {
                            this.draw();
                        }
                    }

                    else if (c_function === 'DELETE') {

                    }

                    // Simulate Hardcoded External Code (Users should have some way to inject their custom code)
                    else if (c_function === 'SPECIAL') {

                        if (this.name === 'player_bead_1') {

                            if (c_params[0] === 'load_level') {
                                switch ( c_params[1] ) {
                                    case 'level_2': {
                                        LevelManager.getInstance().loadLevel(globals.LEVELS.LV2);
                                        break;
                                    }
                                    default:
                                        break;
                                }
                            }

                            else if (c_params[0] === 'switch_mode') {

                                if (this.new_knowledge.player_platform === null) {
                                    this.new_knowledge.player_platform = LevelManager.getInstance().getCurrentLevel().getActorsWithTag('player_platform').inner_list[0];
                                    this.setVelocity(new Vector2(0, 0));
                                    this.unregisterEvent(globals.EVENTS.KEYBOARD_EVENT);

                                    const brick_1 = LevelManager.getInstance().getCurrentLevel().getActorsWithTag('lv2_brick_1').inner_list[0];
                                    this.state = "waiting_animation";
                                    brick_1.state = 'set_children';

                                    const ground = LevelManager.getInstance().getCurrentLevel().getActorsWithTag('ground').inner_list[0];
                                    ground.state = "animate";

                                    // this.new_knowledge.player_platform.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
                                }
                            }

                            else if (c_params[0] === 'ball_mode') {

                                if (c_params[1] === 'platform') {
                                    this.new_knowledge.player_ball[1] = 1;
                                }

                                else if (c_params[1] === 'brick') {
                                    console.log('1')
                                }

                                if (this.new_knowledge.player_ball === null) {
                                    this.new_knowledge.player_ball = [-1,-1];
                                } else {

                                    const ref = this.new_knowledge.player_ball;

                                    if (this.getPosition().x === 0) ref[0] = 1;
                                    if (this.getPosition().x === 15) ref[0] = -1;

                                    this.setVelocity(new Vector2(ref[0], ref[1]));
                                }

                            }

                            else {
                                console.log("Player bead got a special, but dont know how to process");
                                console.log(current_rule_node);
                                console.log(c_params);
                            }

                        }

                        else if (c_params[0] === 'animate') {

                            if (c_params[1] === 'brick') {
                                if (this.new_knowledge.animate_counter === undefined) {
                                    this.new_knowledge.animate_counter = -1;
                                    this.setVisibility(true);
                                    this.draw();
                                }

                                if (!isNaN(this.new_knowledge.animate_counter)) {
                                    if (this.new_knowledge.animate_counter ++ > 3) {
                                        if (this.children.length > 0){
                                            this.children[0].state = 'set_children';
                                        }
                                        this.new_knowledge.animate_counter = 'done';
                                        this.state = 'init';
                                    }
                                }
                            }

                            if (c_params[1] === 'ground'){
                                if (this.new_knowledge.animate_counter === undefined) {
                                    this.new_knowledge.animate_state = 1;
                                    this.new_knowledge.animate_counter = -1;
                                }

                                if (!isNaN(this.new_knowledge.animate_counter)) {
                                    if (this.new_knowledge.animate_counter ++ > 3) {
                                        if (this.new_knowledge.animate_state === 1){
                                            let vector = null;
                                            let vectors_to_remove = [];
                                            for (let i = 0; i < this.geometry.vectors.size; i++){
                                                vector = this.geometry.vectors.inner_list[i];
                                                if (vector.x > 0 && vector.x < 17 && vector.y === 0) {
                                                    vectors_to_remove.push(vector);
                                                }
                                            }

                                            // Should not remove when traversing
                                            vectors_to_remove.forEach(vector => {
                                                this.removeVector(vector)
                                            })

                                            this.draw();
                                            this.new_knowledge.animate_counter = -1;
                                            this.new_knowledge.animate_state ++;
                                        } else if (this.new_knowledge.animate_state === 2) {
                                            let vector = null;
                                            let vectors_to_remove = [];
                                            for (let i = 0; i < this.geometry.vectors.size; i++){
                                                vector = this.geometry.vectors.inner_list[i];
                                                if (vector.y === 1) {
                                                    if (vector.x > 0 && vector.x < 17){
                                                        vectors_to_remove.push(vector);
                                                    }
                                                }
                                            }

                                            // Should not remove when traversing
                                            vectors_to_remove.forEach(vector => {
                                                this.removeVector(vector)
                                            })

                                            this.draw();
                                            this.new_knowledge.animate_counter = -1;
                                            this.new_knowledge.animate_state ++;
                                        } else {
                                            const player_bead = LevelManager.getInstance().getCurrentLevel().getActorsWithTag('player_bead').inner_list[0];

                                            this.new_knowledge.animate_counter = 'done';
                                            this.new_knowledge.animate_state = 'done';
                                        }



                                    }
                                }
                            }

                        }

                        else if (c_params[0] === 'set_actor_property') {
                            const ref = LevelManager.getInstance().getCurrentLevel().getActorWithName(c_params[1]);
                            ref.setProperty(c_params[2],c_params[3]);
                        }

                        else {
                            console.log("Got a special, but dont know how to process");
                            console.log(current_rule_node);
                            console.log(c_params);
                        }
                    }


                    else if (c_function === 'PRINT') {
                        console.log(this);
                    }

                    else {
                        should_process_next_predicate = false
                        continue;
                    }

                }

                else {
                    console.log(this)
                    throw new Error(`Trying to update behavior but the predicate ${c_predicate} is not recognizable`)
                }

                current_rule_node = current_rule_node.next;
            }
        }
    }

    finishUpdate() {
        this.event_buffers = {
            'collide': this.event_buffers.collide,
            'keyboard': {}
        };
        return super.finishUpdate();
    }

    // TODO: Hardcoded buffer
    handleEvent(event) {
        if (event.getType() === globals.EVENTS.KEYBOARD_EVENT) {
            this.event_buffers.keyboard[event.getKey()] = event.getStatus();
        }

        if (event.getType() === globals.EVENTS.COLLISION_EVENT) {
            this.event_buffers.collide.push(event);
        }
    }

    static isActor(object){
        return object.prototype instanceof Actor;
    }


    // Hardcoded helpers

    compareHandler(a,b,sign) {
        if (sign === 'G') return this.compareGreater(a,b);
        else if (sign === 'GorE') return this.compareGreaterEqual(a,b);
        else if (sign === 'E') return this.compareEqual(a,b);
        else if (sign === 'LorE') return this.compareGreater(a,b);
        else if (sign === 'L') return this.compareGreater(a,b);
    }


    compareGreater(a,b){
        return a > b;
    }

    compareGreaterEqual(a,b){
        return a >= b;
    }

    compareEqual(a,b){
        return a===b;
    }

    compareLessEqual(a,b){
        return a <= b;
    }

    compareLess(a,b){
        return a < b;
    }


    // Super hardcoded eval
    eval(val) {

        if (Number.isNaN(Number(val))) {
            if (typeof (val) === 'string'){
                if (val.includes('this')){
                    const dot_list = val.split('.');
                    val = this;
                    for (let i = 1; i < dot_list.length; i++) {
                        val = val[dot_list[i]]
                    }
                    return val;
                }

                if (val === 'TRUE') return true;
                if (val === 'FALSE') return false;
            }
        } else {
            return Number(val);
        }

    }

    // // Extremely brilliant solution
    // // https://stackoverflow.com/a/45322101
    // // However, there are some bugs
    // // Will just use my hardcoded version first
    // getProperty(path){
    //     return path.split('.').reduce(function(prev, curr) {
    //         return prev ? prev[curr] : null
    //     }, this || self)
    // }

    getProperty(path) {
        const dot_list = path.split('.');
        path = this;
        for (let i = 1; i < dot_list.length; i++) {
            path = path[dot_list[i]]
        }

        return path;
    }

    // https://stackoverflow.com/a/18937118
    setProperty(path, value) {
        let ref = this;
        const dot_list = path.split('.');
        for (let i = 1; i < dot_list.length-1; i++){
            if( !ref[dot_list[i]] ) {
                throw new Error(`Error resolving property ${path} by trying ${ref}[${dot_list[i]}]`)
            }
            ref = ref[dot_list[i]]
        }

        if (isNaN(value)) {

            if (value === 'TRUE') value = true;
            if (value === 'FALSE') value = false;

            ref[dot_list[dot_list.length-1]] = value;
        } else {
            ref[dot_list[dot_list.length-1]] = Number(value);
        }
    }


}



export default Actor;
