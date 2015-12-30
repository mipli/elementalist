declare var ROT: any;

import {GameScreen} from './GameScreen';
import {ActorComponent} from './components/ActorComponent';
import {Entity} from './Entity';

export class Game {
    screenWidth: number;
    screenHeight: number;

    activeScreen: GameScreen;

    display: any;
    scheduler: any;
    engine: any;

    private static instance: Game;

    constructor() {
        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
    }

    public init(width: number, height: number) {
        this.screenWidth = width;
        this.screenHeight = height;

        this.display = new ROT.Display({
            width: this.screenWidth,
            height: this.screenHeight
        });

        var container = this.display.getContainer();
        document.body.appendChild(container);

        this.scheduler = new ROT.Scheduler.Simple();
        this.engine = new ROT.Engine(this.scheduler);

        var gameScreen = new GameScreen(this.display, this.screenWidth, this.screenHeight);
        this.activeScreen = gameScreen;

        this.engine.start();

        this.render();
    }

    public lockEngine() {
        this.engine.lock();
    }

    public unlockEngine() {
        this.engine.unlock();
    }

    public addEntity(entity: Entity) {
        if (entity.hasComponent(ActorComponent.getName())) {
            this.scheduler.add(entity, true);
        }
    }

    public render() {
        this.activeScreen.render();
    }
}
