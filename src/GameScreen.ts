import {Map} from './Map';
import {Glyph} from './Glyph';
import {Entity} from './Entity';

import {ActorComponent} from './components/ActorComponent';
import {GlyphComponent} from './components/GlyphComponent';
import {PositionComponent} from './components/PositionComponent';

export class GameScreen {
    display: any;
    map: Map;
    height: number;
    width: number;

    constructor(display: any, width: number, height: number) {
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = new Map(this.width, this.height - 1);
        this.map.generate();
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
        var positionComponent: PositionComponent = <PositionComponent>entity.getComponent(PositionComponent.getName());
        var glyphComponent: GlyphComponent = <GlyphComponent>entity.getComponent(GlyphComponent.getName());

        var position = positionComponent.getPosition();
        var glyph = glyphComponent.getGlyph();

        if (!this.isRenderable(position.x, position.y)) {
            return false;
        }

        this.renderGlyph(glyph, position.x, position.y);

        return true;
    }
}
