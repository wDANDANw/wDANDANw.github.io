import Level from "../Level.js";
import Vector2 from "../Vector.js";
import FakeActor from "./FakeActor.js";
import globals from "../globals.js";
import EnvironmentObject from "../EnvironmentObject.js";

import PlayerBead from "./PlayerBead.js";
import Ground from "./Ground.js";
import LevelLoader from "./LevelLoader.js";

class Level1 extends Level {

    constructor() {
        super();

        this.info = {
            width: 16 ,
            height: 16 ,
            name: "level-1" ,
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

        // Initiate Ground
        this.ground = new Ground(0, 14, 2);
        const vectors = [];
        vectors.push( [ 0 , 1 ] );
        for ( let i = 0 ; i < 2 ; i ++ ) {
            for ( let j = 1 ; j < 16 ; j ++ ) {
                vectors.push( [ j , i ] );
            }
        }
        this.ground.setVectors(vectors);
        this.addObject( this.ground );

        // Initiate Player
        this.player = new PlayerBead(2, 13, this.unlocked);
        this.addObject(this.player);

        // Add a level loader to level 2
        this.to_lv2 = new LevelLoader(16, 13, globals.LEVELS.LV2);
        this.addObject(this.to_lv2);

        // Add easter egg trigger
        this.easter_trigger = new EasterEggTrigger(2, 1);
        this.addObject(this.easter_trigger);
    }

}

class EasterEggTrigger extends FakeActor {
    constructor(x, y) {
        super();

        this.name = 'easter_egg_trigger';
        this.tags = ['easter_egg_trigger'];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( 0x999999 );

        this.setVectors([[1,1],[-1,1],[0,2]]);
        this.registerEvent(globals.EVENTS.COLLISION_EVENT);
    }

    handleEvent(event) {
        console.log('1')
    }
}

export default Level1;
