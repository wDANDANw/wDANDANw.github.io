import FakeActor from "./FakeActor.js";
import Vector2 from "../Vector.js";
import globals from "../globals.js";
import LevelManager from "../LevelManager.js";

class LevelLoader extends FakeActor {

    constructor(x, y, level_name) {
        super();

        this.name = "level_loader";
        this.tags = ["level_loader"];

        this.setPosition( new Vector2( x , y ) );
        this.setVisibility(false);

        this.level_to_load = level_name;
        this.registerEvent(globals.EVENTS.COLLISION_EVENT);
    }

    handleEvent(event) {
        if (event.getType() === globals.EVENTS.COLLISION_EVENT){
            const another = event.getObject1().name === this.name ? event.getObject2() : event.getObject1();
            if (another.tags.includes('player_bead')){
                LevelManager.getInstance().loadLevel(this.level_to_load);
            }
        }
    }
}

export default LevelLoader;
