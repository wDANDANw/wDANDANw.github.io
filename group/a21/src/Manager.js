// Manager.js
// Manager Base Class


class Manager {

    constructor() {
        this.type = 'Base Manager';
        this.is_started = false;
        this.event_count = 0;

        this.event_lists = {}; // Not using object list because does not want to spend time on implementing comparing events
    };

    getType(){
        return this.type;
    };

    isStarted(){
        return this.is_started;
    }

    startUp(){
        this.is_started = true;
        return true;
    };

    shutDown(){
        this.is_started = false;
        return this;
    };

    onEvent(event) {
        let count = 0;

        const event_type = event.getType();
        const event_list = this.event_lists[event_type];

        if (!event_list) {
            return; // TODO Consider about here
            throw new Error(`Trying to broadcast ${event} from ${this.type} but the event list does not exist`);
        }

        event_list.getObjectListCopy().forEach( game_object => {
            if (game_object.isActive()) {
                game_object.handleEvent(event)
                count ++;
            }
        })

        return count;
    }

    registerEvent(object, event_type){
        if (!this.isValidEvent(event_type)) {
            return false;
        }

        let event_list = this.event_lists[event_type];
        if(!event_list) {
            event_list = new ManagerEventList(event_type);
            event_list.object_list = [];
            event_list.object_list.push(object);
            this.event_count ++;
            this.event_lists[event_type] = event_list;
            return true;
        } else {
            event_list.object_list.push(object);
            return true;
        }
    }

    unregisterEvent(object, event_type){
        if (!this.isValidEvent(event_type)) {
            return false;
        }

        let event_list = this.event_lists[event_type];
        if(!event_list) {
            return false;
        } else {
            const index = event_list.object_list.indexOf(object);
            if (index === -1) {
                return false;
            }

            event_list.object_list.splice(index, 1);
        }
    }

    isValidEvent(event) {
        return false; // Because this is base class
        // return event instanceof BaseEvent;
    }
}

class ManagerEventList{

    constructor(event_type) {
        this.event_type = event_type;
        this.object_list = [];
    }

    getEventType(){
        return this.event_type;
    }

    getObjectListCopy(){
        return [... this.object_list];
    }
}

export default Manager;
