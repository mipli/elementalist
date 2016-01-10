/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';
import {PositionComponent} from './PositionComponent';
import {Game} from '../Game';
import {Map} from '../Map';
import {Entity} from '../Entity';

export class FactionComponent extends Component {
    fire: number;
    ice: number;
    hero: number;

    constructor(options: {fire: number, ice: number, hero: number} = {fire: 0, ice: 0, hero: 0}) {
        super();
        this.fire = options.fire;
        this.ice = options.ice;
        this.hero = options.hero;
    }

    isFriendly(faction: string): boolean {
        if (typeof this[faction] === 'undefined') {
            throw 'Asking for info on undefined faction';
        }

        if (this[faction] === 1) {
            return true;
        }
        return false;
    }

    isFearing(faction: string): boolean {
        if (typeof this[faction] === 'undefined') {
            throw 'Asking for info on undefined faction';
        }

        if (this[faction] === 0) {
            return true;
        }
        return false;
    }

    isEnemy(faction: string): boolean {
        if (typeof this[faction] === 'undefined') {
            throw 'Asking for info on undefined faction';
        }

        if (this[faction] === -1) {
            return true;
        }
        return false;
    }

    getSelfFaction(): string {
        if (this.ice === 1) {
            return 'ice';
        } else if (this.fire === 1) {
            return 'fire';
        } else if (this.hero === 1) {
            return 'hero';
        }
        return '';
    }
}
