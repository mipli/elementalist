import {Component} from './Component';
import {Entity} from '../Entity';
import {Glyph} from '../Glyph';

export class GlyphComponent extends Component {
    private glyph: Glyph;

    constructor(options: {glyph: Glyph}) {
        super();
        this.glyph = options.glyph;
    }

    getGlyph(): Glyph {
        return this.glyph;
    }
}
