import {Glyph} from './Glyph';
import {Tile} from './Tile';

export module create {
    export function nullTile() {
        return new Tile(new Glyph(' ', 'black', '#111'), false);
    }
    export function floorTile() {
        return new Tile(new Glyph('.', '#222', '#111'));
    }
    export function wallTile() {
        return new Tile(new Glyph('#', '#ccc', '#111'), false);
    }
}
