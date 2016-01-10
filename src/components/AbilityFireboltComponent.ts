/// <reference path="../../typings/lib.es6.d.ts" />

import {Map} from '../Map';
import {Component} from './Component';
import {PositionComponent} from './PositionComponent';
import {Entity} from '../Entity';
import {Game} from '../Game';

export class AbilityFireboltComponent extends Component {
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
        this.damageType = 'fire';
    }

    describeState(): string {
        const currentTurn = this.game.getCurrentTurn();
        const cooldown = (this.lastUsed + this.cooldown) - currentTurn;
        return 'Firebolt, cooldown: ' + Math.max(0, cooldown);
    }

    setListeners() {
        this.parent.addListener('attemptAbilityFirebolt', this.use.bind(this));
        this.parent.addListener('consumeFire', this.consumeFire.bind(this));
    }

    isAvailable(): boolean {
        return this.lastUsed + this.cooldown <= this.game.getCurrentTurn();
    }

    consumeFire(): Promise<any> {
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

            const entities = map.getNearbyEntities(positionComponent, this.range);

            if (entities.length === 0) {
                resolve(null);
                return;
            }

            const target = entities.pop();
            if (!target.hasComponent('IceAffinityComponent')) {
                resolve(null);
                return;
            }

            this.lastUsed = this.game.getCurrentTurn();
            this.parent.sendEvent('consumeIce');
            target.kill();

            resolve(target);
        });
    }
}
