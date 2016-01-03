declare var ROT: any;

import {Game} from './Game';
import {Tile} from './Tile';
import {Glyph} from './Glyph';
import {Entity} from './Entity';
import * as Tiles from './Tiles';

import {ActorComponent} from './components/ActorComponent';
import {GlyphComponent} from './components/GlyphComponent';
import {PositionComponent} from './components/PositionComponent';
import {InputComponent} from './components/InputComponent';

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

        var g = new Game();
        g.addListener('entityMoved', this.entityMovedListener.bind(this));
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

        var g = new Game();

        var player = new Entity();
        player.addComponent(new ActorComponent());
        player.addComponent(new GlyphComponent({
            glyph: new Glyph('@', 'white', 'black')
        }));
        player.addComponent(new PositionComponent());
        player.addComponent(new InputComponent());

        this.addEntityAtRandomPosition(player);

        g.addEntity(player);

        var enemy = new Entity();
        enemy.addComponent(new ActorComponent());
        enemy.addComponent(new GlyphComponent({
            glyph: new Glyph('n', 'cyan', 'black')
        }));
        enemy.addComponent(new PositionComponent());

        this.addEntityAtRandomPosition(enemy);

        g.addEntity(enemy);
    }

    addEntityAtRandomPosition(entity: Entity): boolean {
        if (!entity.hasComponent('PositionComponent')) {
            return false;
        }
        var found = false;
        var maxTries = this.width * this.height * 10;
        var i = 0;
        while (!found && i < maxTries) {
            var x = Math.floor(Math.random() * this.width);
            var y = Math.floor(Math.random() * this.height);
            i++;
            if (this.getTile(x, y).isWalkable() && !this.positionHasEntity(x, y)) {
                found = true;
            }
        }
        if (!found) {
            console.error('No free spot found for', entity);
            throw 'No free spot found for a new entity';
        }

        var component: PositionComponent = <PositionComponent>entity.getComponent('PositionComponent');
        component.setPosition(x, y);
        this.entities[entity.getGuid()] = entity;
        this.getTile(x, y).setEntityGuid(entity.getGuid());
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
                tiles[x].push(Tiles.create.nullTile());
            }
        }

        var generator = new ROT.Map.Cellular(this.width, this.height);
        generator.randomize(0.5);
        for (var i = 0; i < 4; i++) {
            generator.create();
        }

        generator.create((x, y, v) => {
            if (v === 1) {
                tiles[x][y] = Tiles.create.floorTile();
            } else {
                tiles[x][y] = Tiles.create.wallTile();
            }
        });

        return tiles;
    }

    private entityMovedListener(data: any): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var oldPosition = data.oldPosition;
            var entity = data.entity;
            if (!entity.hasComponent('PositionComponent')) {
                reject(data);
                return;
            }
            var positionComponent = <PositionComponent>entity.getComponent('PositionComponent');
            this.getTile(oldPosition.x, oldPosition.y).setEntityGuid('');
            this.getTile(positionComponent.getX(), positionComponent.getY()).setEntityGuid(entity.getGuid());
            resolve(data);
        });
    }
}
