import {MouseButtonType} from './MouseButtonType';

export class MouseClickEvent {
    x: number;
    y: number;
    button: MouseButtonType;

    getClassName() {
        return MouseClickEvent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor(x: number, y: number, button: MouseButtonType) {
        this.x = x;
        this.y = y;
        this.button = button;
    }

    getX(): number {
        return this.x;
    }

    getY(): number {
        return this.y;
    }

    getButtonType() {
        return this.button;
    }
}
