import {Guid} from './Guid';
import {Game} from './Game';
import {Map} from './Map';
import {Component} from './components/Component';
import {InputComponent} from './components/InputComponent';
import {TurnComponent} from './components/TurnComponent';
import {SightComponent} from './components/SightComponent';
import {RandomWalkComponent} from './components/RandomWalkComponent';
import {AIFactionComponent} from './components/AIFactionComponent';

export class Entity {
    guid: string;
    components: {[name: string]: Component};
    acting: boolean;

    listeners: {[name: string]: any[]};

    constructor() {
        this.guid = Guid.generate();
        this.acting = false;
        this.components = {};
        this.listeners = {};

    }

    getGuid(): string {
        return this.guid;
    }

    act() {
        if (this.acting) {
            return;
        }
        this.acting = true;
        var g = new Game();
        this.sendEvent('nextTurn').then().catch();

        if (this.hasComponent('PlayerComponent')) {
            for (var componentName in this.components) {
                const component = this.components[componentName];
                const state = component.describeState();
                if (state) {
                    console.log(state);
                }
            }
            g.render();
        }

        if (this.hasComponent('InputComponent')) {
            this.handleInputComponent();
        } else if (this.hasComponent('RandomWalkComponent')) {
            this.handleRandomWalkComponent();
        } else if (this.hasComponent('AIFactionComponent')) {
            this.handleAIFactionComponent();
        } else {
            this.acting = false;
        }
    }

    kill(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const g = new Game();
            this.sendEvent('killed')
                .then(() => {
                    g.sendEvent('entityKilled', this)
                        .then(resolve)
                        .catch(resolve);
                })
                .catch(() => {
                    g.sendEvent('entityKilled', this)
                        .then(resolve)
                        .catch(resolve);
                });
        });
    }

    private handleAIFactionComponent() {
        var component = <AIFactionComponent>this.getComponent('AIFactionComponent');
        component.act()
            .then(() => {
                this.acting = false;
                this.sendEvent('turnFinished').then().catch();
            });
    }

    private handleRandomWalkComponent() {
        var component = <RandomWalkComponent>this.getComponent('RandomWalkComponent');
        component.randomWalk()
            .then(() => {
                this.acting = false;
                this.sendEvent('turnFinished').then().catch();
            });
    }

    private handleInputComponent() {
        var component = <InputComponent>this.getComponent('InputComponent');
        component.waitForInput()
            .then(() => {
                this.acting = false;
                this.sendEvent('turnFinished').then().catch();
            });
    }

    addComponent(component: Component) {
        component.setParentEntity(this);
        component.setListeners();
        this.components[component.getName()] = component;
    }

    hasComponent(name: string) {
        return typeof this.components[name] !== 'undefined';
    }

    getComponent(name: string): Component {
        return this.components[name];
    }

    sendEvent(name: string, data: any = null): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            if (!this.listeners[name]) {
                reject();
            }
            var returnData;

            var listeners = this.listeners[name];
            if (!listeners || listeners.length === 0) {
                reject();
            }
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

    addListener<T>(name: string, callback: (data: any) => Promise<T>) {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }
}
