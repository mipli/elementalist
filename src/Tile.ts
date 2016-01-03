import {Glyph} from './Glyph';

export class Tile {
    glyph: Glyph;
    entityGuid: string;
    walkable: boolean;

    constructor(glyph: Glyph, walkable: boolean = true) {
        this.glyph = glyph;
        this.walkable = walkable;

        this.entityGuid = '';
    }

    isWalkable(): boolean {
        return this.walkable;
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
