/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';
import {PositionComponent} from './PositionComponent';
import {Game} from '../Game';
import {Map} from '../Map';
import {Entity} from '../Entity';

export class SightComponent extends Component {
    distance: number;
    visibleCells: {[pos: string]: boolean};
    game: Game;
    hasSeenCells: {[pos: string]: boolean};

    checkedAtTurn: number;

    constructor(options: {distance: number} = {distance: 5}) {
        super();
        this.game = new Game();
        this.distance = options.distance;
        this.visibleCells = {};
        this.hasSeenCells = {};
        this.checkedAtTurn = -1;
    }

    getDistance(): number {
        return this.distance;
    }

    getVisibleCells(): {[pos: string]: boolean} {
        this.computeVisibleCells();
        return this.visibleCells;
    }

    canSee(x: number, y: number): boolean {
        const positionComponent: PositionComponent = <PositionComponent>this.parent.getComponent('PositionComponent');
        if (positionComponent.distanceTo(x, y) > this.distance) {
            return false;
        }
        return this.isVisible(x, y);
    }

    hasSeen(x: number, y: number): boolean {
        this.computeVisibleCells();
        return this.hasSeenCells[x + ',' + y] == true;
    }

    getVisibleEntities(): Entity[] {
        const positionComponent: PositionComponent = <PositionComponent>this.parent.getComponent('PositionComponent');
        const map: Map = this.game.getMap();
        return map.getNearbyEntities(
            positionComponent,
            this.distance,
            (entity) => {
                const epos: PositionComponent = <PositionComponent>entity.getComponent('PositionComponent');
                return this.isVisible(epos.getX(), epos.getY());
            }
        );
    }

    private isVisible(x: number, y: number): boolean {
        this.computeVisibleCells();
        return this.visibleCells[x + ',' + y] === true;
    }

    private computeVisibleCells(): void {
        var currentTurn = this.game.getCurrentTurn();
        if (currentTurn === this.checkedAtTurn) {
            return;
        }
        const map: Map = this.game.getMap();
        this.visibleCells = map.getVisibleCells(this.parent, this.distance);
        this.hasSeenCells = Object.assign(this.hasSeenCells, this.visibleCells);
        this.checkedAtTurn = currentTurn;
    }

}
