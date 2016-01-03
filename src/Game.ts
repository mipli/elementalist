/// <reference path="../typings/lib.es6.d.ts" />

declare var ROT: any;

import {GameScreen} from './GameScreen';
import {ActorComponent} from './components/ActorComponent';
import {InputComponent} from './components/InputComponent';

import {Entity} from './Entity';

import {MouseButtonType} from './MouseButtonType';
import {MouseClickEvent} from './MouseClickEvent';
import {KeyboardEventType} from './KeyboardEventType';
import {KeyboardEvent} from './KeyboardEvent';

export class Game {
    screenWidth: number;
    screenHeight: number;

    canvas: any;

    activeScreen: GameScreen;

    display: any;
    scheduler: any;
    engine: any;

    private static instance: Game;

    listeners: {[name: string]: any[]};

    constructor() {
        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
        this.listeners = {};
    }

    public init(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        this.display = new ROT.Display({
            width: this.screenWidth,
            height: this.screenHeight
        });

        this.canvas = this.display.getContainer();
        document.body.appendChild(this.canvas);

        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);

        var gameScreen = new GameScreen(this.display, this.screenWidth, this.screenHeight);
        this.activeScreen = gameScreen;

        this.bindInputHandling();

        this.engine.start();

        this.render();
    }

    private bindEvent(eventName: string, converter: any, callback: any) {
        window.addEventListener(eventName, (event) => {
            callback(converter(eventName, event));
        });
    }

    private bindInputHandling() {
        var bindEventsToScreen = (eventName, converter) => {
            window.addEventListener(eventName, (event) => {
                if (this.activeScreen !== null) {
                    this.activeScreen.handleInput(converter(eventName, event));
                }
            })
        };

        bindEventsToScreen('keydown', this.convertKeyEvent);
        bindEventsToScreen('keypress', this.convertKeyEvent);
        bindEventsToScreen('click', this.convertMouseEvent);
    }

    private convertKeyEvent = (name: string, event: any): KeyboardEvent => {
        var eventType: KeyboardEventType = KeyboardEventType.PRESS;
        if (name === 'keydown') {
            eventType = KeyboardEventType.DOWN;
        }
        return new KeyboardEvent(
            event.keyCode,
            eventType,
            event.altKey,
            event.ctrlKey,
            event.shiftKey,
            event.metaKey
        );
    }

    private convertMouseEvent = (name: string, event: any): MouseClickEvent => {
        let position = this.display.eventToPosition(event);

        var buttonType: MouseButtonType = MouseButtonType.LEFT;
        if (event.which === 2) {
            buttonType = MouseButtonType.MIDDLE;
        } else if (event.wich === 3) {
            buttonType = MouseButtonType.RIGHT
        }
        return new MouseClickEvent(
            position[0],
            position[1],
            buttonType
        );
    }

    public lockEngine() {
        this.engine.lock();
    }

    public unlockEngine() {
        this.engine.unlock();
    }

    public addEntity(entity: Entity) {
        if (entity.hasComponent('ActorComponent')) {
            this.scheduler.add(entity, true);
        }
        if (entity.hasComponent('InputComponent')) {
            var component = <InputComponent>entity.getComponent('InputComponent');
            this.bindEvent('keypress', this.convertKeyEvent, component.handleEvent.bind(component));
            this.bindEvent('keydown', this.convertKeyEvent, component.handleEvent.bind(component));


        }
    }

    public sendEvent(name: string, data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.listeners[name]) {
                return false;
            }
            var returnData;

            var listeners = this.listeners[name];
            var i = 0;

            var callNext = (data) => {
                var listener = listeners[i];
                i++;

                var p = listener(data);
                p.then((result) => {
                    if (i === listeners.length) {
                        resolve(result);
                    } else {
                        callNext(result);
                    }
                }).catch((result) => {
                    reject(result);
                });
            };

            callNext(data);
        });
    }

    public addListener<T>(name: string, callback: (data: any) => T) {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }

    public render() {
        this.activeScreen.render();
    }
}
