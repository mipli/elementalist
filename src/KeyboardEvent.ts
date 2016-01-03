import {KeyboardEventType} from './KeyboardEventType';

export class KeyboardEvent {
    keyCode: number;
    altKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    metaKey: boolean;
    eventType: KeyboardEventType;

    getClassName() {
        return KeyboardEvent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor(keyCode: number, eventType: KeyboardEventType, altKey: boolean, ctrlKey: boolean, shiftKey: boolean, metaKey: boolean) {
        this.keyCode = keyCode;
        this.eventType = eventType;
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.metaKey = metaKey;
    }

    getEventType(): KeyboardEventType {
        return this.eventType;
    }

    getKeyCode(): number {
        return this.keyCode;
    }

    hasAltKey(): boolean {
        return this.altKey;
    }

    hasShiftKey(): boolean {
        return this.shiftKey;
    }

    hasCtrlKey(): boolean {
        return this.ctrlKey;
    }

    hasMetaKey(): boolean {
        return this.metaKey;
    }
}
