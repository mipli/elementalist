import {Glyph} from './Glyph';

export class Tile {
    private glyph: Glyph;
    private entityGuid: string;
    private walkable: boolean;
    private blockingLight: boolean;
    private description: string;

    constructor(glyph: Glyph, walkable: boolean = true, blockingLight: boolean = false, description: string = '') {
        this.glyph = glyph;
        this.walkable = walkable;
        this.blockingLight = blockingLight;
        this.description = description;

        this.entityGuid = '';

    }

    isWalkable(): boolean {
        return this.walkable;
    }

    blocksLight(): boolean {
        return this.blockingLight;
    }

    describe(): string {
        return this.description;
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
