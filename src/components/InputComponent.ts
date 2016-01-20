/// <reference path="../../typings/lib.es6.d.ts" />

declare var ROT: any;

import {Component} from './Component';
import {PositionComponent} from './PositionComponent';
import {Entity} from '../Entity';
import {Game} from '../Game';
import {Map} from '../Map';

import {MouseButtonType} from '../MouseButtonType';
import {MouseClickEvent} from '../MouseClickEvent';
import {KeyboardEventType} from '../KeyboardEventType';
import {KeyboardEvent} from '../KeyboardEvent';

export class InputComponent extends Component {
    private waiting: boolean;

    private resolve: any;
    private reject: any;

    game: Game;
    map: Map;

    constructor(options: {} = {}) {
        super();
        this.waiting = false;
        this.game = new Game();
        this.map = this.game.getMap();
    }

    waitForInput(): Promise<any> {
        this.waiting = true;
        return new Promise<any>((resolve, reject) => {
            this.resolve = resolve;
            this.reject = reject;
        });
    }

    handleEvent(event: any) {
        if (this.waiting) {
            if (event.getClassName() === 'KeyboardEvent') {
                event = <KeyboardEvent>event;
                if (event.getEventType() === KeyboardEventType.DOWN) {
                    this.handleKeyDown(event)
                        .then((result) => {
                            console.log('result', result);
                            if (result) {
                                this.waiting = false;
                                this.resolve();
                            }
                        }).catch((result) => {
                            console.log('Invalid keyboard input', event);
                        });
                }
            }
        }
    }

    getInput(): boolean {
        return true;
    }

    handleKeyDown(event: KeyboardEvent): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            switch (event.getKeyCode()) {
                case ROT.VK_PERIOD:
                    resolve(true);
                    break;
                case ROT.VK_X:
                    var screen = this.game.getActiveScreen();
                    screen.startAimMove()
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(true);
                        })

                    break;
                case ROT.VK_J:
                    this.directionPressed({x: 0, y: 1})
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_K:
                    this.directionPressed({x: 0, y: -1})
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_H:
                    this.directionPressed({x: -1, y: 0})
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_L:
                    this.directionPressed({x: 1, y: 0})
                        .then(() => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_1:
                    this.parent.sendEvent('attemptAbilityFirebolt', {})
                        .then((result) => {
                            console.log('result', result);
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_2:
                    this.parent.sendEvent('attemptAbilityIceLance', {})
                        .then((result) => {
                            console.log('result', result);
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                default:
                    console.debug('keyCode not matched', event.getKeyCode());
                    reject();
                    break;
            }
        });
    }

    private directionPressed(direction: {x: number, y: number}): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const newPosition = this.getPositionAfterDirection(direction);
            const entity = this.map.getEntityAt(newPosition.x, newPosition.y);
            if (entity) {
                this.parent.sendEvent('attemptMeleeAttack', direction)
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            } else {
                this.parent.sendEvent('attemptMove', direction)
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            }
        });
    }

    private getPositionAfterDirection(direction: {x: number, y: number}): {x: number, y: number} {
        const positionComponent = <PositionComponent>this.parent.getComponent('PositionComponent');
        return {
            x: positionComponent.getX() + direction.x,
            y: positionComponent.getY() + direction.y
        };
    }
}
