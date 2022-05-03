import FakeActor from "./FakeActor.js";
import Vector2 from "../Vector.js";

class Ground extends FakeActor {

    constructor(x, y, layers) {
        super();

        this.name = 'ground';
        this.tags = ['ground'];

        this.setPosition( new Vector2( x , y ) );
        this.setColor( 0x444444 );

        this.layers = layers;
        this.state = 'init';
        this.animate_state = 'not started';
        this.animate_counter = -1;
        this.animate_threashold = 3;
        this.animate_stage = 0;
    }

    animate(animation_name){


        this.state = 'animate';
        this.animate_state = animation_name;

        this.animate_stage = -1;
        this.animate_counter = -1;
    }

    updateBehaviors() {

        if (this.state === 'animate') {

            if (!isNaN(this.animate_counter)) {
                if (this.animate_counter++ > this.animate_threashold) {

                    this.animate_counter = 0;
                    this.animate_stage ++;

                    if (this.animate_state === 'disappear'){

                        if (this.animate_stage < this.layers - 1) {
                            const vectors = this.geometry.vectors.inner_list;
                            const deletion_arr = [];

                            let vector;
                            for (let i = 0; i < vectors.length; i++){
                                vector = vectors[i];

                                if (vector.y === this.animate_stage && ((vector.x + this.getPosition().x) >= 0) && (vector.x + this.getPosition().x) < 16) {
                                    deletion_arr.push(vector);
                                }
                            }

                            for (let i = 0; i < deletion_arr.length; i++){
                                this.removeVector(deletion_arr[i]);
                            }

                            this.draw();
                        } else {
                            this.state = 'init';
                            this.animate_state = 'finished';
                        }
                    }

                }
            }


        }

    }
}

export default Ground;
