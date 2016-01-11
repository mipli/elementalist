/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';
import {SightComponent} from './SightComponent';
import {PositionComponent} from './PositionComponent';
import {FactionComponent} from './FactionComponent';
import {Entity} from '../Entity';
import {Game} from '../Game';

export class AIFactionComponent extends Component {
    targetPos: any;

    constructor(options: {} = {}) {
        super();
        this.targetPos = null;
    }

    act(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const sight = <SightComponent>this.parent.getComponent('SightComponent');
            const faction = <FactionComponent>this.parent.getComponent('FactionComponent');
            const position = <PositionComponent>this.parent.getComponent('PositionComponent');

            const entities = sight.getVisibleEntities();

            let fearing: Entity = null;
            let enemy: Entity = null;

            entities.forEach((entity) => {
                const ef = <FactionComponent>entity.getComponent('FactionComponent');
                if (faction.isEnemy(ef.getSelfFaction())) {
                    enemy = entity;
                } else if (fearing === null && faction.isFearing(ef.getSelfFaction())) {
                    fearing = entity;
                }
            });

            if (enemy !== null) {
                const t = <PositionComponent>enemy.getComponent('PositionComponent');
                this.targetPos = {
                    x: t.getX(),
                    y: t.getY()
                };
            }

            if (this.targetPos !== null && (this.targetPos.x !== position.getX() || this.targetPos.y !== position.getY())) {
                this.goTowardsTarget(position)
                    .then(() => {
                        resolve(true);
                    })
                    .catch(() => {
                        resolve(false);
                    })
            } else {
                this.randomWalk()
                    .then(() => {
                        resolve(true);
                    })
                    .catch(() => {
                        resolve(false);
                    })
            }
        });
    }

    goTowardsTarget(position: PositionComponent): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var dx = Math.abs(this.targetPos.x - position.getX());
            var dy = Math.abs(this.targetPos.y - position.getY());
            let direction: any;

            if (dx + dy === 1) {
                direction = {
                    x: dx == 0 ? 0 : Math.floor((this.targetPos.x - position.getX()) / dx),
                    y: dy == 0 ? 0 : Math.floor((this.targetPos.y - position.getY()) / dy)
                };
                console.log('trying to attack!', direction);
                this.attemptAttack(direction)
                    .then(resolve)
                    .catch(reject)
            } else if (dx > dy) {
                direction = {
                    x: (this.targetPos.x - position.getX()) / dx,
                    y: 0
                };
                this.attemptMove(direction)
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        direction = {
                            x: 0,
                            y: (this.targetPos.y - position.getY()) / dy
                        };
                        this.attemptMove(direction)
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                this.targetPos = null;
                                reject();
                            });
                    });
            } else {
                direction = {
                    x: 0,
                    y: (this.targetPos.y - position.getY()) / dy
                };
                this.attemptMove(direction)
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        direction = {
                            x: (this.targetPos.x - position.getX()) / dx,
                            y: 0
                        };
                        this.attemptMove(direction)
                            .then(() => {
                                resolve();
                            })
                            .catch(() => {
                                this.targetPos = null;
                                reject();
                            });
                    });
            }
        });
    }

    attemptAttack(direction): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.parent.sendEvent('attemptMeleeAttack', direction)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    reject();
                })
            ;
        });
    }

    attemptMove(direction): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.parent.sendEvent('attemptMove', direction)
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    reject();
                })
            ;
        });
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
