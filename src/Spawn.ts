import {Glyph} from './Glyph';
import {Entity} from './Entity';

import {ActorComponent} from './components/ActorComponent';
import {PlayerComponent} from './components/PlayerComponent';
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
import {AbilityFireboltComponent} from './components/AbilityFireboltComponent';
import {AbilityIceLanceComponent} from './components/AbilityIceLanceComponent';

export module entity {
    export function FireImp() {
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

        return enemy;
    }

    export function IceImp() {
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
        return enemy;
    }

    export function Player() {
        var player = new Entity();
        player.addComponent(new PlayerComponent());
        player.addComponent(new ActorComponent());
        player.addComponent(new GlyphComponent({
            glyph: new Glyph('@', 'white', 'black')
        }));
        player.addComponent(new PositionComponent());
        player.addComponent(new InputComponent());
        player.addComponent(new SightComponent({
            distance: 50
        }));
        player.addComponent(new FactionComponent({
            hero: 1,
            ice: -1,
            fire: -1
        }));
        player.addComponent(new AbilityFireboltComponent());
        player.addComponent(new AbilityIceLanceComponent());
        player.addComponent(new MeleeAttackComponent());

        return player;
    }
}
