/// <reference path="../../typings/lib.es6.d.ts" />

import {Map} from '../Map';
import {Component} from './Component';
import {PositionComponent} from './PositionComponent';
import {Entity} from '../Entity';
import {Game} from '../Game';

export class AbilityIceLanceComponent extends Component {
    range: number;
    cooldown: number;
    lastUsed: number;
    damageType: string;

    game: Game;

    constructor(options: {} = {}) {
        super();
        this.game = new Game();
        this.range = 5;
        this.cooldown = 100;
        this.lastUsed = -this.cooldown;
        this.damageType = 'ice';
    }

    describeState(): string {
        const currentTurn = this.game.getCurrentTurn();
        const cooldown = (this.lastUsed + this.cooldown) - currentTurn;
        return 'Ice Lance, cooldown: ' + Math.max(0, cooldown);
    }

    setListeners() {
        this.parent.addListener('attemptAbilityIceLance', this.use.bind(this));
        this.parent.addListener('consumeIce', this.consumeIce.bind(this));
    }

    isAvailable(): boolean {
        return this.lastUsed + this.cooldown <= this.game.getCurrentTurn();
    }

    consumeIce(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.lastUsed -= this.cooldown;
            resolve();
        });
    }

    use(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.isAvailable()) {
                reject();
                return;
            }
            const map = this.game.getMap();
            const positionComponent = <PositionComponent>this.parent.getComponent('PositionComponent');

            const entities = map.getNearbyEntities(
                positionComponent,
                this.range,
                (entity) => {
                    return entity.hasComponent('FireAffinityComponent');
                }
            );

            if (entities.length === 0) {
                console.log('no entities nearby');
                resolve(null);
                return;
            }

            const target = entities.pop();

            this.lastUsed = this.game.getCurrentTurn();
            this.parent.sendEvent('consumeFire');
            target.kill();

            resolve(target);

        });
    }
}
