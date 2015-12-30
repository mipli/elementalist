declare var ROT: any;

import {Game} from './Game';
import {Tile} from './Tile';
import {Glyph} from './Glyph';
import {Entity} from './Entity';
import * as Tiles from './Tiles';

import {ActorComponent} from './components/ActorComponent';
import {GlyphComponent} from './components/GlyphComponent';
import {PositionComponent} from './components/PositionComponent';

export class Map {
    width: number;
    height: number;
    tiles: Tile[][];

    entities: {[guid: string]: Entity};

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
        this.tiles = [];
        this.entities = {};
    }

    mapEntities(callback: (item: Entity) => any) {
        for (var entityGuid in this.entities) {
            var entity = this.entities[entityGuid];
            callback(entity);
        }
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getTile(x: number, y: number) {
        return this.tiles[x][y];
    }


    generate() {
        this.tiles = this.generateLevel();

        var player = new Entity();
        player.addComponent(new ActorComponent());
        player.addComponent(new GlyphComponent({
            glyph: new Glyph('@', 'white', 'black')
        }));
        player.addComponent(new PositionComponent());

        this.addEntityAtRandomPosition(player);
    }

    addEntityAtRandomPosition(entity: Entity): boolean {
        if (!entity.hasComponent(PositionComponent.getName())) {
            return false;
        }
        var found = false;
        while (!found) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            if (this.getTile(x, y) === Tiles.floorTile && !this.positionHasEntity(x, y)) {
                found = true;
            }
        }

        var component: PositionComponent = <PositionComponent>entity.getComponent(PositionComponent.getName());
        component.setPosition(x, y);
        this.entities[entity.getGuid()] = entity;
        return true;
    }

    addEntity(entity: Entity) {
        var game = new Game();
        game.addEntity(entity);
        this.entities[entity.getGuid()] = entity;
    }

    positionHasEntity(x: number, y: number) {
        var tile = this.getTile(x, y);
        var entityGuid = tile.getEntityGuid();
        return entityGuid !== '';
    }

    private generateLevel(): Tile[][] {
        var tiles = [];

        for (var x = 0; x < this.width; x++) {
            tiles.push([]);
            for (var y = 0; y < this.height; y++) {
                tiles[x].push(Tiles.nullTile);
            }
        }

        var generator = new ROT.Map.Cellular(this.width, this.height);
        generator.randomize(0.5);
        for (var i = 0; i < 4; i++) {
            generator.create();
        }

        generator.create((x, y, v) => {
            if (v === 1) {
                tiles[x][y] = Tiles.floorTile;
            } else {
                tiles[x][y] = Tiles.wallTile;
            }
        });

        return tiles;
    }
}
