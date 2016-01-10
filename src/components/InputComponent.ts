/// <reference path="../../typings/lib.es6.d.ts" />

declare var ROT: any;

import {Component} from './Component';
import {Entity} from '../Entity';

import {MouseButtonType} from '../MouseButtonType';
import {MouseClickEvent} from '../MouseClickEvent';
import {KeyboardEventType} from '../KeyboardEventType';
import {KeyboardEvent} from '../KeyboardEvent';

export class InputComponent extends Component {
    private waiting: boolean;

    private resolve: any;
    private reject: any;

    constructor(options: {} = {}) {
        super();
        this.waiting = false;
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
                case ROT.VK_J:
                    this.parent.sendEvent('attemptMove', {x: 0, y: 1})
                        .then((a) => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_K:
                    this.parent.sendEvent('attemptMove', {x: 0, y: -1})
                        .then((a) => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_H:
                    this.parent.sendEvent('attemptMove', {x: -1, y: 0})
                        .then((a) => {
                            resolve(true);
                        })
                        .catch(() => {
                            resolve(false);
                        });
                    break;
                case ROT.VK_L:
                    this.parent.sendEvent('attemptMove', {x: 1, y: 0})
                        .then((a) => {
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
}
