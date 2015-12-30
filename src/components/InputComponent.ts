declare var ROT: any;

import {Component} from './Component';

export class InputComponent implements Component {
    public name: string;
    private x: number;
    private y: number;

    public static getName(): string {
        return InputComponent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor(options: {} = {}) {
        this.name = InputComponent.getName();
        /*
        window.addEventListener(eventName, (event) => {
                if (Game.currentScreen !== null) {
                    Game.currentScreen.handleInput(eventName, event);
                }
            })

            */
    }

    getInput(): boolean {

        return true;
    }
}
