import {Glyph} from './Glyph';

export class Tile {
    glyph: Glyph;
    entityGuid: string;

    constructor(glyph: Glyph, entityGuid: string = '') {
        this.glyph = glyph;
        this.entityGuid = entityGuid;
    }

    getGlyph(): Glyph {
        return this.glyph;
    }

    getEntityGuid(): string {
        return this.entityGuid;
    }

    setEntityGuid(entityGuid: string): boolean {
        if (this.entityGuid !== '') {
            return false;
        }
        this.entityGuid = entityGuid;
        return true;
    }
}
