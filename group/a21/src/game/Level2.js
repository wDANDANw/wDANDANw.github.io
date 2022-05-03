import Level from "../Level.js";
import Vector2 from "../Vector.js";
import FakeActor from "./FakeActor.js";
import globals from "../globals.js";
import EnvironmentObject from "../EnvironmentObject.js";

import PlayerBead from "./PlayerBead.js";
import Ground from "./Ground.js";
import LevelLoader from "./LevelLoader.js";

class Level2 extends Level {

    constructor() {
        super();

        this.info = {
            width: 16 ,
            height: 16 ,
            name: "level-2" ,
            grid_background_color: globals.LEVEL_GRID_BACKGROUND_COLOR ,
            status_text_color: globals.LEVEL_STATUS_TEXT_COLOR ,
            default_env_color: PS.COLOR_BLACK ,
        };

        this.unlocked = false;
    }

    loadLevel() {
        this.init();
        super.loadLevel();
    }

    init() {
        this.initEnv();
        this.initActors();
    }

    initEnv() {

        let obj;
        for ( let i = 0 ; i < 16 ; i ++ ) {
            for ( let j = 0 ; j < 16 ; j ++ ) {
                obj = new EnvironmentObject();
                obj.can_update = false;
                obj.setColor( globals.ENV_DEFAULT_COLOR );
                obj.setPosition( new Vector2( j , i ) );
                this.environments.add( obj );
            }
        }

    }

    initActors() {

        // Add platform
        this.platform = new Platform(6, 14);
        this.addObject(this.platform);

        // Initiate Ground
        this.ground = new Ground(-2, 14, 6);
        const vectors = [];
        vectors.push( [ 0 , 1 ] );
        for ( let i = 0 ; i < 6 ; i ++ ) {
            for ( let j = 1 ; j < 19 ; j ++ ) {
                vectors.push( [ j , i ] );
            }
        }

        this.ground.setVectors(vectors);
        this.addObject( this.ground );

        // Initiate Player
        this.player = new PlayerBead(0, 13, this.unlocked);
        this.addObject(this.player);

        // Add a level loader to level 2
        this.to_lv2 = new LevelLoader(16, 13, globals.LEVELS.LV2);
        this.addObject(this.to_lv2);

        // Add a mode trigger
        this.mode_trigger = new ModeTrigger(7, 13, this);
        this.addObject(this.mode_trigger);

        // Add the ball
        this.ball = new Ball(7, 13);
        this.addObject(this.ball);

        // Add bricks
        this.brick = new Brick(0, 0, 1, 0x333333, null, this);
        let ref = this.brick
        while (ref !== null) {
            this.addObject(ref);
            ref = ref.children;
        }
    }

    startSwitchingToPlatform(){
        this.player.setActive(false);
        this.ball.setActive(true);
        this.brick.animate();
    }

    startBall(){
        this.ball.x_update = -1;
        this.ball.y_update = -1;

        this.platform.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
    }
}

class Platform extends FakeActor {

    constructor(x, y) {
        super();

        this.name = "platform";
        this.tags = ["platform"];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( 0xFFFFFF );

        this.setVectors([[1,0],[2,0],[3,0]]);
    }

    handleEvent(event) {

        if ( event.getType() === globals.EVENTS.KEYBOARD_EVENT ) {

            if ( event.getStatus() === globals.KEYBOARD.STATUS.KEYDOWN ) {
                switch ( event.getKey() ) {
                    case globals.KEYBOARD.KEYS.RIGHT:
                        this.setVelocityX( 1 );
                        break;
                    case globals.KEYBOARD.KEYS.LEFT:
                        this.setVelocityX( -1 );
                        break;
                    default:
                        break;
                }
            } else {
                switch ( event.getKey() ) {
                    case globals.KEYBOARD.KEYS.RIGHT:
                        this.setVelocityX( 0 );
                        break;
                    case globals.KEYBOARD.KEYS.LEFT:
                        this.setVelocityX( 0 );
                        break;
                    default:
                        break;
                }
            }
        }
    }
}

class ModeTrigger extends FakeActor {
    constructor(x, y, level) {
        super();

        this.name = "mode_trigger";
        this.tags = ["mode_trigger"];

        this.setPosition( new Vector2( x , y ) );
        this.setVisibility(false);

        this.level = level;
        this.registerEvent(globals.EVENTS.COLLISION_EVENT);
    }

    handleEvent(event) {
        if (event.getType() === globals.EVENTS.COLLISION_EVENT){
            const another = event.getObject1().name === this.name ? event.getObject2() : event.getObject1();
            if (another.tags.includes('player_bead')) {
                this.level.startSwitchingToPlatform();
            }
        }
    }
}

class Ball extends FakeActor {
    constructor(x, y) {
        super();

        this.name = "ball";
        this.tags = ["ball"];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( 0xFFFFFF );

        this.x_update = 0;
        this.y_update = 0;

        this.is_active = false;
        this.registerEvent(globals.EVENTS.COLLISION_EVENT);

        this.animate_counter = -1;
        this.animate_threashold = 2;
    }

    updateBehaviors() {
        if (this.getPosition().x === 0) {this.x_update = 1}
        if (this.getPosition().x === 15) {this.x_update = -1}

        this.setVelocity(new Vector2(this.x_update, this.y_update));

        if (this.animate_counter ++ > this.animate_threashold) {
            this.animate_counter = 0;

        } else {
            this.setVelocity(new Vector2(0, 0));
        }
    }

    handleEvent(event) {

        if (event.getType() === globals.EVENTS.COLLISION_EVENT) {
            const another = event.getObject1().name === this.name ? event.getObject2() : event.getObject1();
            if (another.tags.includes('brick')) {
                another.removeVectorAtPosition(event.getPosition());
                this.y_update = 1;
            }

            else if (another.tags.includes('platform')) {
                this.y_update = -1;
            }
        }

    }

}

class Brick extends FakeActor {

    constructor(x, y, tier, color, parent, level) {
        super();

        this.tier = tier;
        this.name = "brick_" + tier.toString();
        this.tags = ["brick"];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( color );

        this.parent = parent;
        this.children = null;

        this.is_visible = false;

        const temp_arr = [];
        for (let i = 1; i < 16; i++) {
            temp_arr.push([i, 0]);
        }
        this.setVectors(temp_arr);

        if (tier < 4) {
            this.children = new Brick(x, y+1, tier+1, color+0x222222, this, level);
        }

        this.level = level;

        this.animate_state = 'not started';
        this.animate_threashold = 3;
    }

    animate(){
        this.animate_state = -1;
        this.is_visible = true;
        this.draw();

        if (this.tier === 1) { // Also process ground
            this.level.ground.animate('disappear');
        }
    }

    updateBehaviors() {
        if (!isNaN(this.animate_state)) {
            if (this.animate_state++ > this.animate_threashold) {
                if (this.children !== null) {
                    this.children.animate();
                } else {
                    this.level.startBall();
                }
                this.animate_state = 'done';
            }
        }
    }
}

export default Level2;
