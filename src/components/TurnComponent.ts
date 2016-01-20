/// <reference path="../../typings/lib.es6.d.ts" />

declare var ROT: any;

import {Component} from './Component';
import {Game} from '../Game';

export class TurnComponent extends Component {
    private turnResolved: any;

    private game: Game;

    constructor(options: {} = {}) {
        super();
        this.game = new Game();
    }

    setListeners() {
        this.parent.addListener('nextTurn', this.nextTurn.bind(this));
        this.parent.addListener('turnFinished', this.turnFinished.bind(this));
    }

    private nextTurn(): Promise<any> {
        this.game.lockEngine();
        return new Promise<any>((resolve, reject) => {
            this.turnResolved = resolve;
            this.parent.act();
        });
    }

    private turnFinished(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.turnResolved();
            this.game.unlockEngine();
            resolve();
        });
    }
}
