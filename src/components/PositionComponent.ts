import {Component} from './Component';

export class PositionComponent implements Component {
    public name: string;
    private x: number;
    private y: number;

    public static getName(): string {
        return PositionComponent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor(options: {x: number, y: number} = {x: 0, y: 0}) {
        this.name = PositionComponent.getName();

        this.x = options.x;
        this.y = options.y;
    }

    getPosition(): {x: number, y: number} {
        return {x: this.x, y: this.y};
    }

    setPosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
}
