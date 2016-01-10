import {Entity} from '../Entity';

export class Component {
    protected parent: Entity;

    public getName(): string {
        return this.constructor.toString().match(/\w+/g)[1];
    }

    public setParentEntity(entity: Entity) {
        this.parent = entity;
    }

    public setListeners() {
    }

    public describeState(): string {
        return '';
    }
}
