import FakeActor from "./FakeActor.js";
import Vector2 from "../Vector.js";
import globals from "../globals.js";

class PlayerBead extends FakeActor {
    constructor(x, y, unlocked) {
        super();

        this.name = "player_bead";
        this.tags = ["player_bead"];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( 0xFFFFFF );

        this.registerEvent(globals.EVENTS.KEYBOARD_EVENT);
        this.unlocked = unlocked;
    }

    setUnlocked(unlocked) {
        this.unlocked = unlocked;
    }


    handleEvent(event) {

        if ( event.getType() === globals.EVENTS.COLLISION_EVENT ) {

        } else if ( event.getType() === globals.EVENTS.KEYBOARD_EVENT ) {

            if ( event.getStatus() === globals.KEYBOARD.STATUS.KEYDOWN ) {
                switch ( event.getKey() ) {
                    case globals.KEYBOARD.KEYS.DOWN:
                        if (this.unlocked) this.setVelocityY( 1 );
                        break;
                    case globals.KEYBOARD.KEYS.UP:
                        if (this.unlocked) this.setVelocityY( -1 );
                        break;
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
                    case globals.KEYBOARD.KEYS.DOWN:
                        this.setVelocityY( 0 );
                        break;
                    case globals.KEYBOARD.KEYS.UP:
                        this.setVelocityY( 0 );
                        break;
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

export default PlayerBead;
