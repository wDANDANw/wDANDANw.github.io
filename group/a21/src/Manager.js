// Manager.js
// Manager Base Class

class Manager {

    constructor() {
        if (Manager._instance) {
            throw new Error(`Singleton Manager ${this.constructor.name} can't be instantiated more than once.`);
        }
        Manager._instance = this;

        this.type = 'Base Manager';
        this.is_started = false;
    };

    getType(){
        return this.type;
    };

    isStarted(){
        return this.is_started;
    }

    startUp(){
        this.is_started = true;
        return this;
    };

    shutDown(){
        this.is_started = false;
        return this;
    };

    static getInstance() {
        if (!this._instance) {
            this._instance = new this.prototype.constructor();
        }

        return this._instance;
    }


}

export default Manager;
