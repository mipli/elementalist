import {Glyph} from './Glyph';
import {Tile} from './Tile';

export const nullTile = new Tile(new Glyph(' ', 'black', '#111'));
export const floorTile = new Tile(new Glyph('.', '#222', '#111'));
export const wallTile = new Tile(new Glyph('#', '#ccc', '#111'));
