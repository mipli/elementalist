import {Glyph} from './Glyph';

export class Tile {
    private glyph: Glyph;
    private entityGuid: string;
    private walkable: boolean;

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

    setEntityGuid(entityGuid: string) {
        this.entityGuid = entityGuid;
    }
}
