import {Component} from './Component';
import {Glyph} from '../Glyph';

export class GlyphComponent implements Component {
    public name: string;
    private glyph: Glyph;

    public static getName(): string {
        return GlyphComponent.prototype.constructor.toString().match(/\w+/g)[1];
    }

    constructor(options: {glyph: Glyph}) {
        this.name = GlyphComponent.getName();
        this.glyph = options.glyph;
    }

    getGlyph(): Glyph {
        return this.glyph;
    }
}
