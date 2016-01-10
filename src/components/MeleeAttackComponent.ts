/// <reference path="../../typings/lib.es6.d.ts" />

import {Map} from '../Map';
import {Game} from '../Game';
import {Component} from './Component';
import {PositionComponent} from './PositionComponent';

export class MeleeAttackComponent extends Component {
    map: Map;

    constructor(options: {} = {}) {
        super();
        const game = new Game();

        this.map = game.getMap();
    }

    setListeners() {
        this.parent.addListener('attemptMeleeAttack', this.attemptMeleeAttack.bind(this));
    }

    attemptMeleeAttack(direction: {x: number, y: number}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const positionComponent = <PositionComponent>this.parent.getComponent('PositionComponent');
            const target = this.map.getEntityAt(positionComponent.getX() + direction.x, positionComponent.getY() + direction.y);
            console.log(target);

            resolve();

        });
    }
}
