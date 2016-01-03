/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';
import {Entity} from '../Entity';
import {Game} from '../Game';

export class PositionComponent extends Component {
    private x: number;
    private y: number;

    constructor(options: {x: number, y: number} = {x: 0, y: 0}) {
        super();
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

    setListeners() {
        this.parent.addListener('attemptMove', this.attemptMove.bind(this));
    }

    attemptMove(direction: {x: number, y: number}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var g = new Game();
            var position = {
                x: this.x + direction.x,
                y: this.y + direction.y
            };
            g.sendEvent('canMoveTo', position)
                .then((position) => {
                    this.move(direction);
                    resolve(direction);
                })
                .catch((position) => {
                    reject(direction);
                });
        });
    }

    move(direction: {x: number, y: number}) {
        this.x += direction.x;
        this.y += direction.y;
    }
}
