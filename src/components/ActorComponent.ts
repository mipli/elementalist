import {Component} from './Component';

export class ActorComponent implements Component {
    //public static name: string;
    public name: string;

    public static getName(): string {
        return ActorComponent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor() {
        //ActorComponent.name = 'ActorComponent';
        this.name = ActorComponent.getName();
    }

    act() {
        console.log('act');
    }
}
