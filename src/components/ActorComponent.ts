import {Component} from './Component';
import {Entity} from '../Entity';

export class ActorComponent extends Component {
    constructor() {
        super();
    }

    act() {
        console.log('act');
    }
}
