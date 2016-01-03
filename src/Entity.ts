import {Guid} from './Guid';
import {Game} from './Game';
import {Component} from './components/Component';
import {InputComponent} from './components/InputComponent';

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
        var g = new Game();
        g.render();
        this.acting = true;
        if (this.hasComponent('InputComponent')) {
            g.lockEngine();
            var component = <InputComponent>this.getComponent('InputComponent');
            component.waitForInput()
                .then(() => {
                    g.render();
                    g.unlockEngine();
                    this.acting = false;
                });
        } else {
            this.acting = false;
        }
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

    sendEvent(name: string, data: any): Promise<any> {
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

    addListener<T>(name: string, callback: (data: any) => Promise<T>) {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        this.listeners[name].push(callback);
    }
}
