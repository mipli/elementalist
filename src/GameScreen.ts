/// <reference path="../typings/lib.es6.d.ts" />

import {Map} from './Map';
import {Game} from './Game';
import {Glyph} from './Glyph';
import {Entity} from './Entity';

import {ActorComponent} from './components/ActorComponent';
import {GlyphComponent} from './components/GlyphComponent';
import {PositionComponent} from './components/PositionComponent';

import {MouseButtonType} from './MouseButtonType';
import {MouseClickEvent} from './MouseClickEvent';
import {KeyboardEventType} from './KeyboardEventType';
import {KeyboardEvent} from './KeyboardEvent';

export class GameScreen {
    display: any;
    map: Map;
    height: number;
    width: number;
    game: Game;

    constructor(display: any, width: number, height: number) {
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = new Map(this.width, this.height - 1);
        this.map.generate();
        this.game = new Game();

        this.game.addListener('canMoveTo', this.canMoveTo.bind(this));
    }

    render() {
        var b = this.getRenderableBoundary();

        for (var x = b.x; x < b.x + b.w; x++) {
            for (var y = b.y; y < b.y + b.h; y++) {
                var glyph: Glyph = this.map.getTile(x, y).getGlyph();
                this.renderGlyph(glyph, x, y);
            }
        }

        this.map.mapEntities(this.renderEntity);
    }

    handleInput(eventData: any) {
        if (eventData.getClassName() === 'MouseClickEvent') {
            this.handleMouseClickEvent(<MouseClickEvent>eventData);
        } else if (eventData.getClassName() === 'KeyboardEvent') {
            this.handleKeyboardEvent(<KeyboardEvent>eventData);
        }
    }

    handleMouseClickEvent(event: MouseClickEvent) {
        var tile = this.map.getTile(event.getX(), event.getY());
        console.debug('clicked', event.getX(), event.getY(), tile);
    }

    handleKeyboardEvent(event: KeyboardEvent) {
    }

    private getRenderableBoundary() {
        return {
            x: 0,
            y: 0,
            w: this.map.getWidth(),
            h: this.map.getHeight()
        };
    }

    private isRenderable(x: number, y: number) {
        var b = this.getRenderableBoundary();

        return x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
    }

    private renderGlyph(glyph: Glyph, x: number, y: number) {
        var b = this.getRenderableBoundary();

        this.display.draw(x - b.x, y - b.y, glyph.char, glyph.foreground, glyph.background);
    }

    private renderEntity = (entity: Entity) => {
        var positionComponent: PositionComponent = <PositionComponent>entity.getComponent('PositionComponent');
        var glyphComponent: GlyphComponent = <GlyphComponent>entity.getComponent('GlyphComponent');

        var position = positionComponent.getPosition();
        var glyph = glyphComponent.getGlyph();

        if (!this.isRenderable(position.x, position.y)) {
            return false;
        }

        this.renderGlyph(glyph, position.x, position.y);

        return true;
    }

    private canMoveTo(position: {x: number, y: number}, acc: boolean = true): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var tile = this.map.getTile(position.x, position.y);
            if (tile.isWalkable() && tile.getEntityGuid() === '') {
                resolve(position);
            } else {
                reject(position);
            }
        });
    }
}
