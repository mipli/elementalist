/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';
import {Entity} from '../Entity';
import {Game} from '../Game';

export class RandomWalkComponent extends Component {
    constructor(options: {x: number, y: number} = {x: 0, y: 0}) {
        super();
    }

    randomWalk(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var directions: any = [
                {x: 0, y: 1},
                {x: 0, y: -1},
                {x: 1, y: 0},
                {x: -1, y: 0},
            ];

            directions = directions.randomize();

            var testDirection = (direction) => {
                this.parent.sendEvent('attemptMove', direction)
                    .then((a) => {
                        resolve(true);
                    })
                    .catch(() => {
                        if (directions.length > 0) {
                            testDirection(directions.pop());
                        } else {
                            resolve(false);
                        }
                    });
            };
            testDirection(directions.pop());
        });
    }
}
