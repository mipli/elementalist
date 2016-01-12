/// <reference path="../typings/lib.es6.d.ts" />

import {Map} from './Map';
import {Game} from './Game';
import {Glyph} from './Glyph';
import {Entity} from './Entity';
import {Tile} from './Tile';
import * as Tiles from './Tiles';

import {ActorComponent} from './components/ActorComponent';
import {PlayerComponent} from './components/PlayerComponent';
import {SightComponent} from './components/SightComponent';
import {GlyphComponent} from './components/GlyphComponent';
import {PositionComponent} from './components/PositionComponent';
import {InputComponent} from './components/InputComponent';
import {FactionComponent} from './components/FactionComponent';
import {AbilityFireboltComponent} from './components/AbilityFireboltComponent';
import {AbilityIceLanceComponent} from './components/AbilityIceLanceComponent';
import {MeleeAttackComponent} from './components/MeleeAttackComponent';

import {MouseButtonType} from './MouseButtonType';
import {MouseClickEvent} from './MouseClickEvent';
import {KeyboardEventType} from './KeyboardEventType';
import {KeyboardEvent} from './KeyboardEvent';

export class GameScreen {
    display: any;
    map: Map;
    height: number;
    width: number;
    player: Entity;
    game: Game;
    nullTile: Tile;

    constructor(display: any, width: number, height: number, map: Map) {
        this.game = new Game();
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = map;
        //new Map(this.width, this.height - 1);
        //this.map.generate();

        this.nullTile = Tiles.create.nullTile();

        this.player = new Entity();
        this.player.addComponent(new PlayerComponent());
        this.player.addComponent(new ActorComponent());
        this.player.addComponent(new GlyphComponent({
            glyph: new Glyph('@', 'white', 'black')
        }));
        this.player.addComponent(new PositionComponent());
        this.player.addComponent(new InputComponent());
        this.player.addComponent(new SightComponent({
            distance: 50
        }));
        this.player.addComponent(new FactionComponent({
            hero: 1,
            ice: -1,
            fire: -1
        }));
        this.player.addComponent(new AbilityFireboltComponent());
        this.player.addComponent(new AbilityIceLanceComponent());
        this.player.addComponent(new MeleeAttackComponent());

        this.map.addEntityAtRandomPosition(this.player);

        this.game.addEntity(this.player);
    }

    render() {
        var b = this.getRenderableBoundary();

        for (var x = b.x; x < b.x + b.w; x++) {
            for (var y = b.y; y < b.y + b.h; y++) {
                var glyph: Glyph = this.map.getTile(x, y).getGlyph();
                this.renderMapGlyph(glyph, x, y);
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
        if (event.getX() === -1 || event.getY() === -1) {
            console.debug('clicked outside of canvas');
        } else {
            var tile = this.map.getTile(event.getX(), event.getY());
            console.debug('clicked', event.getX(), event.getY(), tile);
        }
    }

    handleKeyboardEvent(event: KeyboardEvent) {
    }

    getMap(): Map {
        return this.map;
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

    private renderMapGlyph(glyph: Glyph, x: number, y: number) {
        var b = this.getRenderableBoundary();
        const sightComponent: SightComponent = <SightComponent>this.player.getComponent('SightComponent');

        if (sightComponent.canSee(x,y)) {
            this.display.draw(
                x - b.x,
                y - b.y,
                glyph.char,
                glyph.foreground,
                glyph.background
            );
        } else if (sightComponent.hasSeen(x,y)) {
            this.display.draw(
                x - b.x,
                y - b.y,
                glyph.char,
                glyph.foreground,
                '#111'
            );
        } else {
            const g: Glyph = this.nullTile.getGlyph();
            this.display.draw(
                x - b.x,
                y - b.y,
                g.char,
                g.foreground,
                g.background
            );
        }
    }

    private renderGlyph(glyph: Glyph, x: number, y: number) {
        var b = this.getRenderableBoundary();
        const sightComponent: SightComponent = <SightComponent>this.player.getComponent('SightComponent');

        if (sightComponent.canSee(x,y)) {
            this.display.draw(
                x - b.x,
                y - b.y,
                glyph.char,
                glyph.foreground,
                glyph.background
            );
        }
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
}
