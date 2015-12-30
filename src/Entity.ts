import {Guid} from './Guid';
import {Game} from './Game';
import {Component} from './components/Component';

export class Entity {
    guid: string;
    components: {[name: string]: Component};

    constructor() {
        this.guid = Guid.generate();
        this.components = {};
    }

    getGuid(): string {
        return this.guid;
    }

    addComponent(component: Component) {
        this.components[component.name] = component;
    }

    hasComponent(name: string) {
        return typeof this.components[name] !== 'undefined';
    }

    getComponent(name: string): Component {
        return this.components[name];
    }

    act() {
        console.log('act, and lock');
        var g = new Game();
        g.lockEngine();
    }
}
