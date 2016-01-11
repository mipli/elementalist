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
import {SightComponent} from './components/SightComponent';
import {RandomWalkComponent} from './components/RandomWalkComponent';
import {AIFactionComponent} from './components/AIFactionComponent';
import {FactionComponent} from './components/FactionComponent';
import {FireAffinityComponent} from './components/FireAffinityComponent';
import {IceAffinityComponent} from './components/IceAffinityComponent';
import {MeleeAttackComponent} from './components/MeleeAttackComponent';

export class Map {
    width: number;
    height: number;
    tiles: Tile[][];

    entities: {[guid: string]: Entity};
    maxEnemies: number;

    fov: any;

    constructor(width: number, height: number, maxEnemies: number = 10) {
        this.width = width;
        this.height = height;
        this.maxEnemies = maxEnemies;
        this.tiles = [];
        this.entities = {};

        var g = new Game();
        g.addListener('entityMoved', this.entityMovedListener.bind(this));
        g.addListener('entityKilled', this.entityKilledListener.bind(this));
        g.addListener('canMoveTo', this.canMoveTo.bind(this));
    }

    setupFov() {
        this.fov = new ROT.FOV.DiscreteShadowcasting(
            (x, y) => {
                const tile = this.getTile(x, y);
                if (!tile) {
                    return false;
                }
                return !tile.blocksLight();
            },
            {topology: 4}
        );
    }

    getVisibleCells(entity: Entity, distance: number): {[pos: string]: boolean} {
        let visibleCells: any = {};

        const positionComponent = <PositionComponent>entity.getComponent('PositionComponent');

        this.fov.compute(
            positionComponent.getX(),
            positionComponent.getY(),
            distance,
            (x, y, radius, visibility) => {
                visibleCells[x + "," + y] = true;
            });
        return visibleCells;
    }

    mapEntities(callback: (item: Entity) => any) {
        for (var entityGuid in this.entities) {
            var entity = this.entities[entityGuid];
            if (entity) {
                callback(entity);
            }
        }
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    getTile(x: number, y: number) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
            return null;
        }
        return this.tiles[x][y];
    }

    generate() {
        this.tiles = this.generateLevel();
        this.setupFov();

        for (var i = 0; i < this.maxEnemies; i++) {
            this.addFireImp();
        }

        for (var i = 0; i < this.maxEnemies; i++) {
            this.addIceImp();
        }
    }

    addFireImp() {
        var g = new Game();
        var enemy = new Entity();
        enemy.addComponent(new ActorComponent());
        enemy.addComponent(new GlyphComponent({
            glyph: new Glyph('f', 'red', 'black')
        }));
        enemy.addComponent(new PositionComponent());
        enemy.addComponent(new AIFactionComponent());
        enemy.addComponent(new FireAffinityComponent());
        enemy.addComponent(new SightComponent());
        enemy.addComponent(new MeleeAttackComponent());
        enemy.addComponent(new FactionComponent( {
            fire: 1,
            ice: 0,
            hero: -1
        }));

        this.addEntityAtRandomPosition(enemy);

        g.addEntity(enemy);
    }

    addIceImp() {
        var g = new Game();
        var enemy = new Entity();
        enemy.addComponent(new ActorComponent());
        enemy.addComponent(new GlyphComponent({
            glyph: new Glyph('i', 'cyan', 'black')
        }));
        enemy.addComponent(new PositionComponent());
        enemy.addComponent(new AIFactionComponent());
        enemy.addComponent(new MeleeAttackComponent());
        enemy.addComponent(new IceAffinityComponent());
        enemy.addComponent(new SightComponent());
        enemy.addComponent(new FactionComponent( {
            fire: 0,
            ice: 1,
            hero: -1
        }));

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

    removeEntity(entity: Entity) {
        const game = new Game();
        const positionComponent = <PositionComponent>entity.getComponent('PositionComponent');
        game.removeEntity(entity);
        this.entities[entity.getGuid()] = null
        this.getTile(positionComponent.getX(), positionComponent.getY()).setEntityGuid('');
    }

    positionHasEntity(x: number, y: number) {
        var tile = this.getTile(x, y);
        var entityGuid = tile.getEntityGuid();
        return entityGuid !== '';
    }

    getEntityAt(x: number, y: number): Entity {
        var tile = this.getTile(x, y);
        var entityGuid = tile.getEntityGuid();
        return this.entities[entityGuid];
    }

    getNearbyEntities(originComponent: PositionComponent, radius: number, filter: (entity: Entity) => boolean = (e) => {return true;}): Entity[] {
        let entities = [];
        this.mapEntities((entity) => {
            if (!filter(entity)) {
                return;
            }
            const positionComponent = <PositionComponent>entity.getComponent('PositionComponent');
            if (positionComponent === originComponent) {
                return;
            }
            const distance = positionComponent.distanceTo(originComponent.getX(), originComponent.getY());
            if (distance <= radius) {
                entities.push({distance: distance, entity: entity});
            }
        });
        entities.sort((a, b) => {
            return a.distance - b.distance;
        });
        entities = entities.map((a) => { return a.entity; });
        return entities;
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

    private entityKilledListener(data: Entity): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.removeEntity(data);
            resolve(data);
        });
    }

    private canMoveTo(position: {x: number, y: number}, acc: boolean = true): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            var tile = this.getTile(position.x, position.y);
            if (tile.isWalkable() && tile.getEntityGuid() === '') {
                resolve(position);
            } else {
                reject(position);
            }
        });
    }
}
