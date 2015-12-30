(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Entity = undefined;

var _Guid = require('./Guid');

var _Game = require('./Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Entity = exports.Entity = (function () {
    function Entity() {
        _classCallCheck(this, Entity);

        this.guid = _Guid.Guid.generate();
        this.components = {};
    }

    _createClass(Entity, [{
        key: 'getGuid',
        value: function getGuid() {
            return this.guid;
        }
    }, {
        key: 'addComponent',
        value: function addComponent(component) {
            this.components[component.name] = component;
        }
    }, {
        key: 'hasComponent',
        value: function hasComponent(name) {
            return typeof this.components[name] !== 'undefined';
        }
    }, {
        key: 'getComponent',
        value: function getComponent(name) {
            return this.components[name];
        }
    }, {
        key: 'act',
        value: function act() {
            console.log('act, and lock');
            var g = new _Game.Game();
            g.lockEngine();
        }
    }]);

    return Entity;
})();

},{"./Game":2,"./Guid":5}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Game = undefined;

var _GameScreen = require('./GameScreen');

var _ActorComponent = require('./components/ActorComponent');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = exports.Game = (function () {
    function Game() {
        _classCallCheck(this, Game);

        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
    }

    _createClass(Game, [{
        key: 'init',
        value: function init(width, height) {
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
            var gameScreen = new _GameScreen.GameScreen(this.display, this.screenWidth, this.screenHeight);
            this.activeScreen = gameScreen;
            this.engine.start();
            this.render();
        }
    }, {
        key: 'lockEngine',
        value: function lockEngine() {
            this.engine.lock();
        }
    }, {
        key: 'unlockEngine',
        value: function unlockEngine() {
            this.engine.unlock();
        }
    }, {
        key: 'addEntity',
        value: function addEntity(entity) {
            if (entity.hasComponent(_ActorComponent.ActorComponent.getName())) {
                this.scheduler.add(entity, true);
            }
        }
    }, {
        key: 'render',
        value: function render() {
            this.activeScreen.render();
        }
    }]);

    return Game;
})();

},{"./GameScreen":3,"./components/ActorComponent":9}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GameScreen = undefined;

var _Map = require('./Map');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameScreen = exports.GameScreen = (function () {
    function GameScreen(display, width, height) {
        var _this = this;

        _classCallCheck(this, GameScreen);

        this.renderEntity = function (entity) {
            var positionComponent = entity.getComponent(_PositionComponent.PositionComponent.getName());
            var glyphComponent = entity.getComponent(_GlyphComponent.GlyphComponent.getName());
            var position = positionComponent.getPosition();
            var glyph = glyphComponent.getGlyph();
            if (!_this.isRenderable(position.x, position.y)) {
                return false;
            }
            _this.renderGlyph(glyph, position.x, position.y);
            return true;
        };
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = new _Map.Map(this.width, this.height - 1);
        this.map.generate();
    }

    _createClass(GameScreen, [{
        key: 'render',
        value: function render() {
            var b = this.getRenderableBoundary();
            for (var x = b.x; x < b.x + b.w; x++) {
                for (var y = b.y; y < b.y + b.h; y++) {
                    var glyph = this.map.getTile(x, y).getGlyph();
                    this.renderGlyph(glyph, x, y);
                }
            }
            this.map.mapEntities(this.renderEntity);
        }
    }, {
        key: 'getRenderableBoundary',
        value: function getRenderableBoundary() {
            return {
                x: 0,
                y: 0,
                w: this.map.getWidth(),
                h: this.map.getHeight()
            };
        }
    }, {
        key: 'isRenderable',
        value: function isRenderable(x, y) {
            var b = this.getRenderableBoundary();
            return x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h;
        }
    }, {
        key: 'renderGlyph',
        value: function renderGlyph(glyph, x, y) {
            var b = this.getRenderableBoundary();
            this.display.draw(x - b.x, y - b.y, glyph.char, glyph.foreground, glyph.background);
        }
    }]);

    return GameScreen;
})();

},{"./Map":6,"./components/GlyphComponent":10,"./components/PositionComponent":11}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Glyph = exports.Glyph = function Glyph(char, foreground, background) {
    _classCallCheck(this, Glyph);

    this.char = char;
    this.foreground = foreground;
    this.background = background;
};

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Guid = exports.Guid = (function () {
    function Guid() {
        _classCallCheck(this, Guid);
    }

    _createClass(Guid, null, [{
        key: 'generate',
        value: function generate() {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : r & 0x3 | 0x8;
                return v.toString(16);
            });
        }
    }]);

    return Guid;
})();

},{}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Map = undefined;

var _Game = require('./Game');

var _Glyph = require('./Glyph');

var _Entity = require('./Entity');

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _ActorComponent = require('./components/ActorComponent');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Map = exports.Map = (function () {
    function Map(width, height) {
        _classCallCheck(this, Map);

        this.width = width;
        this.height = height;
        this.tiles = [];
        this.entities = {};
    }

    _createClass(Map, [{
        key: 'mapEntities',
        value: function mapEntities(callback) {
            for (var entityGuid in this.entities) {
                var entity = this.entities[entityGuid];
                callback(entity);
            }
        }
    }, {
        key: 'getHeight',
        value: function getHeight() {
            return this.height;
        }
    }, {
        key: 'getWidth',
        value: function getWidth() {
            return this.width;
        }
    }, {
        key: 'getTile',
        value: function getTile(x, y) {
            return this.tiles[x][y];
        }
    }, {
        key: 'generate',
        value: function generate() {
            this.tiles = this.generateLevel();
            var player = new _Entity.Entity();
            player.addComponent(new _ActorComponent.ActorComponent());
            player.addComponent(new _GlyphComponent.GlyphComponent({
                glyph: new _Glyph.Glyph('@', 'white', 'black')
            }));
            player.addComponent(new _PositionComponent.PositionComponent());
            this.addEntityAtRandomPosition(player);
        }
    }, {
        key: 'addEntityAtRandomPosition',
        value: function addEntityAtRandomPosition(entity) {
            if (!entity.hasComponent(_PositionComponent.PositionComponent.getName())) {
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
            var component = entity.getComponent(_PositionComponent.PositionComponent.getName());
            component.setPosition(x, y);
            this.entities[entity.getGuid()] = entity;
            return true;
        }
    }, {
        key: 'addEntity',
        value: function addEntity(entity) {
            var game = new _Game.Game();
            game.addEntity(entity);
            this.entities[entity.getGuid()] = entity;
        }
    }, {
        key: 'positionHasEntity',
        value: function positionHasEntity(x, y) {
            var tile = this.getTile(x, y);
            var entityGuid = tile.getEntityGuid();
            return entityGuid !== '';
        }
    }, {
        key: 'generateLevel',
        value: function generateLevel() {
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
            generator.create(function (x, y, v) {
                if (v === 1) {
                    tiles[x][y] = Tiles.floorTile;
                } else {
                    tiles[x][y] = Tiles.wallTile;
                }
            });
            return tiles;
        }
    }]);

    return Map;
})();

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":8,"./components/ActorComponent":9,"./components/GlyphComponent":10,"./components/PositionComponent":11}],7:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = exports.Tile = (function () {
    function Tile(glyph) {
        var entityGuid = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.entityGuid = entityGuid;
    }

    _createClass(Tile, [{
        key: 'getGlyph',
        value: function getGlyph() {
            return this.glyph;
        }
    }, {
        key: 'getEntityGuid',
        value: function getEntityGuid() {
            return this.entityGuid;
        }
    }, {
        key: 'setEntityGuid',
        value: function setEntityGuid(entityGuid) {
            if (this.entityGuid !== '') {
                return false;
            }
            this.entityGuid = entityGuid;
            return true;
        }
    }]);

    return Tile;
})();

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.wallTile = exports.floorTile = exports.nullTile = undefined;

var _Glyph = require('./Glyph');

var _Tile = require('./Tile');

var nullTile = exports.nullTile = new _Tile.Tile(new _Glyph.Glyph(' ', 'black', '#111'));
var floorTile = exports.floorTile = new _Tile.Tile(new _Glyph.Glyph('.', '#222', '#111'));
var wallTile = exports.wallTile = new _Tile.Tile(new _Glyph.Glyph('#', '#ccc', '#111'));

},{"./Glyph":4,"./Tile":7}],9:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActorComponent = exports.ActorComponent = (function () {
    function ActorComponent() {
        _classCallCheck(this, ActorComponent);

        //ActorComponent.name = 'ActorComponent';
        this.name = ActorComponent.getName();
    }

    _createClass(ActorComponent, [{
        key: 'act',
        value: function act() {
            console.log('act');
        }
    }], [{
        key: 'getName',
        value: function getName() {
            return ActorComponent.prototype.constructor.toString().match(/\w+/g)[1];
        }
    }]);

    return ActorComponent;
})();

},{}],10:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GlyphComponent = exports.GlyphComponent = (function () {
    function GlyphComponent(options) {
        _classCallCheck(this, GlyphComponent);

        this.name = GlyphComponent.getName();
        this.glyph = options.glyph;
    }

    _createClass(GlyphComponent, [{
        key: "getGlyph",
        value: function getGlyph() {
            return this.glyph;
        }
    }], [{
        key: "getName",
        value: function getName() {
            return GlyphComponent.prototype.constructor.toString().match(/\w+/g)[1];
        }
    }]);

    return GlyphComponent;
})();

},{}],11:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PositionComponent = exports.PositionComponent = (function () {
    function PositionComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { x: 0, y: 0 } : arguments[0];

        _classCallCheck(this, PositionComponent);

        this.name = PositionComponent.getName();
        this.x = options.x;
        this.y = options.y;
    }

    _createClass(PositionComponent, [{
        key: "getPosition",
        value: function getPosition() {
            return { x: this.x, y: this.y };
        }
    }, {
        key: "setPosition",
        value: function setPosition(x, y) {
            this.x = x;
            this.y = y;
        }
    }], [{
        key: "getName",
        value: function getName() {
            return PositionComponent.prototype.constructor.toString().match(/\w+/g)[1];
        }
    }]);

    return PositionComponent;
})();

},{}],12:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[12])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL01hcC50cyIsInNyYy9UaWxlLnRzIiwic3JjL1RpbGVzLnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BY3RvckNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50LnRzIiwic3JjL21haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDUUk7OztBQUNJLFlBQUksQ0FBQyxJQUFJLEdBQUcsQUFBSSxNQVRoQixJQUFJLEFBQUMsQUFBTSxBQUFRLEFBQ3BCLENBUWtCLFFBQVEsRUFBRSxDQUFDO0FBQzVCLFlBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLEFBQ3pCO0tBQUMsQUFFRCxBQUFPOzs7OztBQUNILEFBQU0sbUJBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxBQUNyQjtTQUFDLEFBRUQsQUFBWTs7O3FDQUFDLFNBQW9CO0FBQzdCLGdCQUFJLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxTQUFTLENBQUMsQUFDaEQ7U0FBQyxBQUVELEFBQVk7OztxQ0FBQyxJQUFZO0FBQ3JCLEFBQU0sbUJBQUMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxLQUFLLFdBQVcsQ0FBQyxBQUN4RDtTQUFDLEFBRUQsQUFBWTs7O3FDQUFDLElBQVk7QUFDckIsQUFBTSxtQkFBQyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2pDO1NBQUMsQUFFRCxBQUFHOzs7O0FBQ0MsbUJBQU8sQ0FBQyxH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Ozs7O0FDaEJmLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDWixRQUFJLElBQUksR0FBRyxBQUFJLEFBQUksVUFIZixJQUFJLEFBQUMsQUFBTSxBQUFRLEVBR0YsQ0FBQztBQUN0QixRQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUN0QjtDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtHdWlkfSBmcm9tICcuL0d1aWQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IHtcbiAgICBndWlkOiBzdHJpbmc7XG4gICAgY29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBDb21wb25lbnR9O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgfVxuXG4gICAgZ2V0R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkO1xuICAgIH1cblxuICAgIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50Lm5hbWVdID0gY29tcG9uZW50O1xuICAgIH1cblxuICAgIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmNvbXBvbmVudHNbbmFtZV0gIT09ICd1bmRlZmluZWQnO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FjdCwgYW5kIGxvY2snKTtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICB9XG59XG4iLCJkZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtHYW1lU2NyZWVufSBmcm9tICcuL0dhbWVTY3JlZW4nO1xuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBzY3JlZW5XaWR0aDogbnVtYmVyO1xuICAgIHNjcmVlbkhlaWdodDogbnVtYmVyO1xuXG4gICAgYWN0aXZlU2NyZWVuOiBHYW1lU2NyZWVuO1xuXG4gICAgZGlzcGxheTogYW55O1xuICAgIHNjaGVkdWxlcjogYW55O1xuICAgIGVuZ2luZTogYW55O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKEdhbWUuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBHYW1lLmluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICAgIEdhbWUuaW5zdGFuY2UgPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gbmV3IFJPVC5EaXNwbGF5KHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNjcmVlbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNjcmVlbkhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY29udGFpbmVyID0gdGhpcy5kaXNwbGF5LmdldENvbnRhaW5lcigpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNvbnRhaW5lcik7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgUk9ULlNjaGVkdWxlci5TaW1wbGUoKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgUk9ULkVuZ2luZSh0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgdmFyIGdhbWVTY3JlZW4gPSBuZXcgR2FtZVNjcmVlbih0aGlzLmRpc3BsYXksIHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0KTtcbiAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4gPSBnYW1lU2NyZWVuO1xuXG4gICAgICAgIHRoaXMuZW5naW5lLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoQWN0b3JDb21wb25lbnQuZ2V0TmFtZSgpKSkge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKGVudGl0eSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXIoKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuXG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2NyZWVuIHtcbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgbWFwOiBNYXA7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKGRpc3BsYXk6IGFueSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IGIueDsgeCA8IGIueCArIGIudzsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gYi55OyB5IDwgYi55ICsgYi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2x5cGg6IEdseXBoID0gdGhpcy5tYXAuZ2V0VGlsZSh4LCB5KS5nZXRHbHlwaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXAubWFwRW50aXRpZXModGhpcy5yZW5kZXJFbnRpdHkpO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3OiB0aGlzLm1hcC5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaDogdGhpcy5tYXAuZ2V0SGVpZ2h0KClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUmVuZGVyYWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgcmV0dXJuIHggPj0gYi54ICYmIHggPCBiLnggKyBiLncgJiYgeSA+PSBiLnkgJiYgeSA8IGIueSArIGIuaDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KHggLSBiLngsIHkgLSBiLnksIGdseXBoLmNoYXIsIGdseXBoLmZvcmVncm91bmQsIGdseXBoLmJhY2tncm91bmQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRW50aXR5ID0gKGVudGl0eTogRW50aXR5KSA9PiB7XG4gICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudChQb3NpdGlvbkNvbXBvbmVudC5nZXROYW1lKCkpO1xuICAgICAgICB2YXIgZ2x5cGhDb21wb25lbnQ6IEdseXBoQ29tcG9uZW50ID0gPEdseXBoQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoR2x5cGhDb21wb25lbnQuZ2V0TmFtZSgpKTtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZ2x5cGggPSBnbHlwaENvbXBvbmVudC5nZXRHbHlwaCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1JlbmRlcmFibGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHbHlwaCB7XG4gICAgcHVibGljIGNoYXI6IHN0cmluZztcbiAgICBwdWJsaWMgZm9yZWdyb3VuZDogc3RyaW5nO1xuICAgIHB1YmxpYyBiYWNrZ3JvdW5kOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjaGFyOiBzdHJpbmcsIGZvcmVncm91bmQ6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY2hhciA9IGNoYXI7XG4gICAgICAgIHRoaXMuZm9yZWdyb3VuZCA9IGZvcmVncm91bmQ7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgR3VpZCB7XG4gICAgc3RhdGljIGdlbmVyYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQgKiBhcyBUaWxlcyBmcm9tICcuL1RpbGVzJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgTWFwIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHRpbGVzOiBUaWxlW11bXTtcblxuICAgIGVudGl0aWVzOiB7W2d1aWQ6IHN0cmluZ106IEVudGl0eX07XG5cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBjYWxsYmFjayhlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0V2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGdldFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRoaXMuZ2VuZXJhdGVMZXZlbCgpO1xuXG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24ocGxheWVyKTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghZW50aXR5Lmhhc0NvbXBvbmVudChQb3NpdGlvbkNvbXBvbmVudC5nZXROYW1lKCkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHdoaWxlICghZm91bmQpIHtcbiAgICAgICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldFRpbGUoeCwgeSkgPT09IFRpbGVzLmZsb29yVGlsZSAmJiAhdGhpcy5wb3NpdGlvbkhhc0VudGl0eSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoUG9zaXRpb25Db21wb25lbnQuZ2V0TmFtZSgpKTtcbiAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnYW1lLmFkZEVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgIH1cblxuICAgIHBvc2l0aW9uSGFzRW50aXR5KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gZW50aXR5R3VpZCAhPT0gJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxldmVsKCk6IFRpbGVbXVtdIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF0ucHVzaChUaWxlcy5udWxsVGlsZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbmV3IFJPVC5NYXAuQ2VsbHVsYXIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBnZW5lcmF0b3IucmFuZG9taXplKDAuNSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCh4LCB5LCB2KSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuZmxvb3JUaWxlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLndhbGxUaWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBnbHlwaDogR2x5cGg7XG4gICAgZW50aXR5R3VpZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCBlbnRpdHlHdWlkOiBzdHJpbmcgPSAnJykge1xuICAgICAgICB0aGlzLmdseXBoID0gZ2x5cGg7XG4gICAgICAgIHRoaXMuZW50aXR5R3VpZCA9IGVudGl0eUd1aWQ7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eUd1aWQ7XG4gICAgfVxuXG4gICAgc2V0RW50aXR5R3VpZChlbnRpdHlHdWlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuZW50aXR5R3VpZCAhPT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcblxuZXhwb3J0IGNvbnN0IG51bGxUaWxlID0gbmV3IFRpbGUobmV3IEdseXBoKCcgJywgJ2JsYWNrJywgJyMxMTEnKSk7XG5leHBvcnQgY29uc3QgZmxvb3JUaWxlID0gbmV3IFRpbGUobmV3IEdseXBoKCcuJywgJyMyMjInLCAnIzExMScpKTtcbmV4cG9ydCBjb25zdCB3YWxsVGlsZSA9IG5ldyBUaWxlKG5ldyBHbHlwaCgnIycsICcjY2NjJywgJyMxMTEnKSk7XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgQWN0b3JDb21wb25lbnQgaW1wbGVtZW50cyBDb21wb25lbnQge1xuICAgIC8vcHVibGljIHN0YXRpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHVibGljIG5hbWU6IHN0cmluZztcblxuICAgIHB1YmxpYyBzdGF0aWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gQWN0b3JDb21wb25lbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIC8vQWN0b3JDb21wb25lbnQubmFtZSA9ICdBY3RvckNvbXBvbmVudCc7XG4gICAgICAgIHRoaXMubmFtZSA9IEFjdG9yQ29tcG9uZW50LmdldE5hbWUoKTtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhY3QnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGhDb21wb25lbnQgaW1wbGVtZW50cyBDb21wb25lbnQge1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSBnbHlwaDogR2x5cGg7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIEdseXBoQ29tcG9uZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgICAgIHRoaXMubmFtZSA9IEdseXBoQ29tcG9uZW50LmdldE5hbWUoKTtcbiAgICAgICAgdGhpcy5nbHlwaCA9IG9wdGlvbnMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db21wb25lbnQgaW1wbGVtZW50cyBDb21wb25lbnQge1xuICAgIHB1YmxpYyBuYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSB5OiBudW1iZXI7XG5cbiAgICBwdWJsaWMgc3RhdGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIFBvc2l0aW9uQ29tcG9uZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0gPSB7eDogMCwgeTogMH0pIHtcbiAgICAgICAgdGhpcy5uYW1lID0gUG9zaXRpb25Db21wb25lbnQuZ2V0TmFtZSgpO1xuXG4gICAgICAgIHRoaXMueCA9IG9wdGlvbnMueDtcbiAgICAgICAgdGhpcy55ID0gb3B0aW9ucy55O1xuICAgIH1cblxuICAgIGdldFBvc2l0aW9uKCk6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0ge1xuICAgICAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICBnYW1lLmluaXQoOTAsIDUwKTtcbn1cbiJdfQ==
