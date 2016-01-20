import {Glyph} from './Glyph';
import {Tile} from './Tile';

export module create {
    export function nullTile() {
        return new Tile(new Glyph(' ', 'black', '#000'), false, false);
    }
    export function floorTile() {
        return new Tile(new Glyph('.', '#222', '#444'), true, false, 'Stone floor');
    }
    export function wallTile() {
        return new Tile(new Glyph('#', '#ccc', '#444'), false, true, 'Stone wall');
    }
}
