// Actor Class Definition
import GameObject from "./GameObject.js";
import globals from "./globals.js";

import LevelManager from "./LevelManager.js";

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

        // Rules of the actor
        this.rules = [];
    };

    update() {

        // Update Kinematics
        super.update();

        // Need to return self for chaining
        return this;
    }

    handleEvent(event) {
        if (event.getType() === globals.EVENTS.COLLISION_EVENT) {

            if (this.tags.includes(globals.TAGS.PLAYER)) {
                const another = event.getObject2();

                if (another.tags.includes(globals.TAGS.LOAD_LEVEL)) {

                    // Hardcoded
                    PS.color(this.getPosition().x, this.getPosition().y, PS.COLOR_BLACK);

                    const level_name_to_load = another.tags.filter(tag => tag.startsWith('level-'))[0];

                    // TODO Hardcoded using level manager. Should not.
                    LevelManager.getInstance().loadLevel(level_name_to_load);
                }

                if (another.tags.includes("platform_trigger")) {
                    this.tags.push("platform_mode");
                }
            }

        } else if (event.getType() === globals.EVENTS.KEYBOARD_EVENT) {

            if (this.tags.includes(globals.TAGS.PLAYER)) {

                // Update Velocity Related
                if (event.getStatus() === globals.KEYBOARD.STATUS.KEYDOWN) {
                    switch (event.getKey()){
                        case globals.KEYBOARD.KEYS.DOWN:
                            if (this.tags.includes("platform_mode")) {
                                return;
                            }

                            if (this.tags.includes('unlocked')) {
                                this.setVelocityY(1);
                            }
                            break;
                        case globals.KEYBOARD.KEYS.UP:
                            if (this.tags.includes("platform_mode")) {
                                return;
                            }

                            if (this.tags.includes('unlocked')) {
                                this.setVelocityY(-1);
                            }
                            break;
                        case globals.KEYBOARD.KEYS.RIGHT:
                            if (this.tags.includes("platform_mode")) {
                                LevelManager.getInstance().getCurrentLevel().actors.forEach(actor => {
                                    if (actor.tags.includes('platform')) {
                                        actor.setVelocityX(1);
                                    }
                                })
                                return;
                            }

                            this.setVelocityX(1);
                            break;
                        case globals.KEYBOARD.KEYS.LEFT:
                            if (this.tags.includes("platform_mode")) {
                                LevelManager.getInstance().getCurrentLevel().actors.forEach(actor => {
                                    if (actor.tags.includes('platform')) {
                                        actor.setVelocityX(-1);
                                    }
                                })
                                return;
                            }

                            this.setVelocityX(-1);
                            break;
                        default:
                            break;
                    }
                }

                if (event.getStatus() === globals.KEYBOARD.STATUS.KEYUP) {
                    switch (event.getKey()){
                        case globals.KEYBOARD.KEYS.DOWN:
                            this.setVelocityY(0);
                            break;
                        case globals.KEYBOARD.KEYS.UP:
                            this.setVelocityY(0);
                            break;
                        case globals.KEYBOARD.KEYS.RIGHT:
                            this.setVelocityX(0);
                            break;
                        case globals.KEYBOARD.KEYS.LEFT:
                            this.setVelocityX(0);
                            break;
                        default:
                            break;
                    }
                }

            }
        }
    }

    static isActor(object){
        return object.prototype instanceof Actor;
    }

}


export default Actor;
