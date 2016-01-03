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
        this.acting = false;
        this.components = {};
        this.listeners = {};
    }

    _createClass(Entity, [{
        key: 'getGuid',
        value: function getGuid() {
            return this.guid;
        }
    }, {
        key: 'act',
        value: function act() {
            var _this = this;

            var g = new _Game.Game();
            g.render();
            this.acting = true;
            if (this.hasComponent('InputComponent')) {
                g.lockEngine();
                var component = this.getComponent('InputComponent');
                component.waitForInput().then(function () {
                    g.render();
                    g.unlockEngine();
                    _this.acting = false;
                });
            } else {
                this.acting = false;
            }
        }
    }, {
        key: 'addComponent',
        value: function addComponent(component) {
            component.setParentEntity(this);
            component.setListeners();
            this.components[component.getName()] = component;
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
        key: 'sendEvent',
        value: function sendEvent(name, data) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                if (!_this2.listeners[name]) {
                    return false;
                }
                var returnData;
                var listeners = _this2.listeners[name];
                var i = 0;
                var callNext = function callNext(data) {
                    var listener = listeners[i];
                    i++;
                    var p = listener(data);
                    p.then(function (result) {
                        if (i === listeners.length) {
                            resolve(result);
                        } else {
                            callNext(result);
                        }
                    }).catch(function (result) {
                        reject(result);
                    });
                };
                callNext(data);
            });
        }
    }, {
        key: 'addListener',
        value: function addListener(name, callback) {
            if (!this.listeners[name]) {
                this.listeners[name] = [];
            }
            this.listeners[name].push(callback);
        }
    }]);

    return Entity;
})();

},{"./Game":2,"./Guid":5}],2:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /// <reference path="../typings/lib.es6.d.ts" />

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.Game = undefined;

var _GameScreen = require('./GameScreen');

var _MouseButtonType = require('./MouseButtonType');

var _MouseClickEvent = require('./MouseClickEvent');

var _KeyboardEventType = require('./KeyboardEventType');

var _KeyboardEvent = require('./KeyboardEvent');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Game = exports.Game = (function () {
    function Game() {
        var _this = this;

        _classCallCheck(this, Game);

        this.convertKeyEvent = function (name, event) {
            var eventType = _KeyboardEventType.KeyboardEventType.PRESS;
            if (name === 'keydown') {
                eventType = _KeyboardEventType.KeyboardEventType.DOWN;
            }
            return new _KeyboardEvent.KeyboardEvent(event.keyCode, eventType, event.altKey, event.ctrlKey, event.shiftKey, event.metaKey);
        };
        this.convertMouseEvent = function (name, event) {
            var position = _this.display.eventToPosition(event);
            var buttonType = _MouseButtonType.MouseButtonType.LEFT;
            if (event.which === 2) {
                buttonType = _MouseButtonType.MouseButtonType.MIDDLE;
            } else if (event.wich === 3) {
                buttonType = _MouseButtonType.MouseButtonType.RIGHT;
            }
            return new _MouseClickEvent.MouseClickEvent(position[0], position[1], buttonType);
        };
        if (Game.instance) {
            return Game.instance;
        }
        Game.instance = this;
        this.listeners = {};
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
            this.canvas = this.display.getContainer();
            document.body.appendChild(this.canvas);
            this.scheduler = new ROT.Scheduler.Simple();
            this.engine = new ROT.Engine(this.scheduler);
            var gameScreen = new _GameScreen.GameScreen(this.display, this.screenWidth, this.screenHeight);
            this.activeScreen = gameScreen;
            this.bindInputHandling();
            this.engine.start();
            this.render();
        }
    }, {
        key: 'bindEvent',
        value: function bindEvent(eventName, converter, callback) {
            window.addEventListener(eventName, function (event) {
                callback(converter(eventName, event));
            });
        }
    }, {
        key: 'bindInputHandling',
        value: function bindInputHandling() {
            var _this2 = this;

            var bindEventsToScreen = function bindEventsToScreen(eventName, converter) {
                window.addEventListener(eventName, function (event) {
                    if (_this2.activeScreen !== null) {
                        _this2.activeScreen.handleInput(converter(eventName, event));
                    }
                });
            };
            bindEventsToScreen('keydown', this.convertKeyEvent);
            bindEventsToScreen('keypress', this.convertKeyEvent);
            bindEventsToScreen('click', this.convertMouseEvent);
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
            if (entity.hasComponent('ActorComponent')) {
                this.scheduler.add(entity, true);
            }
            if (entity.hasComponent('InputComponent')) {
                var component = entity.getComponent('InputComponent');
                this.bindEvent('keypress', this.convertKeyEvent, component.handleEvent.bind(component));
                this.bindEvent('keydown', this.convertKeyEvent, component.handleEvent.bind(component));
            }
        }
    }, {
        key: 'sendEvent',
        value: function sendEvent(name, data) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (!_this3.listeners[name]) {
                    return false;
                }
                var returnData;
                var listeners = _this3.listeners[name];
                var i = 0;
                var callNext = function callNext(data) {
                    var listener = listeners[i];
                    i++;
                    var p = listener(data);
                    p.then(function (result) {
                        if (i === listeners.length) {
                            resolve(result);
                        } else {
                            callNext(result);
                        }
                    }).catch(function (result) {
                        reject(result);
                    });
                };
                callNext(data);
            });
        }
    }, {
        key: 'addListener',
        value: function addListener(name, callback) {
            if (!this.listeners[name]) {
                this.listeners[name] = [];
            }
            this.listeners[name].push(callback);
        }
    }, {
        key: 'render',
        value: function render() {
            this.activeScreen.render();
        }
    }]);

    return Game;
})();

},{"./GameScreen":3,"./KeyboardEvent":6,"./KeyboardEventType":7,"./MouseButtonType":9,"./MouseClickEvent":10}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /// <reference path="../typings/lib.es6.d.ts" />

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GameScreen = undefined;

var _Map = require('./Map');

var _Game = require('./Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameScreen = exports.GameScreen = (function () {
    function GameScreen(display, width, height) {
        var _this = this;

        _classCallCheck(this, GameScreen);

        this.renderEntity = function (entity) {
            var positionComponent = entity.getComponent('PositionComponent');
            var glyphComponent = entity.getComponent('GlyphComponent');
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
        this.game = new _Game.Game();
        this.game.addListener('canMoveTo', this.canMoveTo.bind(this));
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
        key: 'handleInput',
        value: function handleInput(eventData) {
            if (eventData.getClassName() === 'MouseClickEvent') {
                this.handleMouseClickEvent(eventData);
            } else if (eventData.getClassName() === 'KeyboardEvent') {
                this.handleKeyboardEvent(eventData);
            }
        }
    }, {
        key: 'handleMouseClickEvent',
        value: function handleMouseClickEvent(event) {
            var tile = this.map.getTile(event.getX(), event.getY());
            console.debug('clicked', event.getX(), event.getY(), tile);
        }
    }, {
        key: 'handleKeyboardEvent',
        value: function handleKeyboardEvent(event) {}
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
    }, {
        key: 'canMoveTo',
        value: function canMoveTo(position) {
            var _this2 = this;

            var acc = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            return new Promise(function (resolve, reject) {
                var tile = _this2.map.getTile(position.x, position.y);
                if (tile.isWalkable() && tile.getEntityGuid() === '') {
                    resolve(position);
                } else {
                    reject(position);
                }
            });
        }
    }]);

    return GameScreen;
})();

},{"./Game":2,"./Map":8}],4:[function(require,module,exports){
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
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var KeyboardEvent = exports.KeyboardEvent = (function () {
    function KeyboardEvent(keyCode, eventType, altKey, ctrlKey, shiftKey, metaKey) {
        _classCallCheck(this, KeyboardEvent);

        this.keyCode = keyCode;
        this.eventType = eventType;
        this.altKey = altKey;
        this.ctrlKey = ctrlKey;
        this.shiftKey = shiftKey;
        this.metaKey = metaKey;
    }

    _createClass(KeyboardEvent, [{
        key: "getClassName",
        value: function getClassName() {
            return KeyboardEvent.prototype.constructor.toString().match(/\w+/g)[1];
        }
    }, {
        key: "getEventType",
        value: function getEventType() {
            return this.eventType;
        }
    }, {
        key: "getKeyCode",
        value: function getKeyCode() {
            return this.keyCode;
        }
    }, {
        key: "hasAltKey",
        value: function hasAltKey() {
            return this.altKey;
        }
    }, {
        key: "hasShiftKey",
        value: function hasShiftKey() {
            return this.shiftKey;
        }
    }, {
        key: "hasCtrlKey",
        value: function hasCtrlKey() {
            return this.ctrlKey;
        }
    }, {
        key: "hasMetaKey",
        value: function hasMetaKey() {
            return this.metaKey;
        }
    }]);

    return KeyboardEvent;
})();

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var KeyboardEventType = exports.KeyboardEventType = undefined;
(function (KeyboardEventType) {
    KeyboardEventType[KeyboardEventType["DOWN"] = 0] = "DOWN";
    KeyboardEventType[KeyboardEventType["UP"] = 1] = "UP";
    KeyboardEventType[KeyboardEventType["PRESS"] = 2] = "PRESS";
})(KeyboardEventType || (exports.KeyboardEventType = KeyboardEventType = {}));
;

},{}],8:[function(require,module,exports){
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

var _InputComponent = require('./components/InputComponent');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Map = exports.Map = (function () {
    function Map(width, height) {
        _classCallCheck(this, Map);

        this.width = width;
        this.height = height;
        this.tiles = [];
        this.entities = {};
        var g = new _Game.Game();
        g.addListener('entityMoved', this.entityMovedListener.bind(this));
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
            var g = new _Game.Game();
            var player = new _Entity.Entity();
            player.addComponent(new _ActorComponent.ActorComponent());
            player.addComponent(new _GlyphComponent.GlyphComponent({
                glyph: new _Glyph.Glyph('@', 'white', 'black')
            }));
            player.addComponent(new _PositionComponent.PositionComponent());
            player.addComponent(new _InputComponent.InputComponent());
            this.addEntityAtRandomPosition(player);
            g.addEntity(player);
            var enemy = new _Entity.Entity();
            enemy.addComponent(new _ActorComponent.ActorComponent());
            enemy.addComponent(new _GlyphComponent.GlyphComponent({
                glyph: new _Glyph.Glyph('n', 'cyan', 'black')
            }));
            enemy.addComponent(new _PositionComponent.PositionComponent());
            this.addEntityAtRandomPosition(enemy);
            g.addEntity(enemy);
        }
    }, {
        key: 'addEntityAtRandomPosition',
        value: function addEntityAtRandomPosition(entity) {
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
            var component = entity.getComponent('PositionComponent');
            component.setPosition(x, y);
            this.entities[entity.getGuid()] = entity;
            this.getTile(x, y).setEntityGuid(entity.getGuid());
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
                    tiles[x].push(Tiles.create.nullTile());
                }
            }
            var generator = new ROT.Map.Cellular(this.width, this.height);
            generator.randomize(0.5);
            for (var i = 0; i < 4; i++) {
                generator.create();
            }
            generator.create(function (x, y, v) {
                if (v === 1) {
                    tiles[x][y] = Tiles.create.floorTile();
                } else {
                    tiles[x][y] = Tiles.create.wallTile();
                }
            });
            return tiles;
        }
    }, {
        key: 'entityMovedListener',
        value: function entityMovedListener(data) {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var oldPosition = data.oldPosition;
                var entity = data.entity;
                if (!entity.hasComponent('PositionComponent')) {
                    reject(data);
                    return;
                }
                var positionComponent = entity.getComponent('PositionComponent');
                _this.getTile(oldPosition.x, oldPosition.y).setEntityGuid('');
                _this.getTile(positionComponent.getX(), positionComponent.getY()).setEntityGuid(entity.getGuid());
                resolve(data);
            });
        }
    }]);

    return Map;
})();

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/ActorComponent":13,"./components/GlyphComponent":15,"./components/InputComponent":16,"./components/PositionComponent":17}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var MouseButtonType = exports.MouseButtonType = undefined;
(function (MouseButtonType) {
    MouseButtonType[MouseButtonType["LEFT"] = 0] = "LEFT";
    MouseButtonType[MouseButtonType["MIDDLE"] = 1] = "MIDDLE";
    MouseButtonType[MouseButtonType["RIGHT"] = 2] = "RIGHT";
})(MouseButtonType || (exports.MouseButtonType = MouseButtonType = {}));
;

},{}],10:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MouseClickEvent = exports.MouseClickEvent = (function () {
    function MouseClickEvent(x, y, button) {
        _classCallCheck(this, MouseClickEvent);

        this.x = x;
        this.y = y;
        this.button = button;
    }

    _createClass(MouseClickEvent, [{
        key: "getClassName",
        value: function getClassName() {
            return MouseClickEvent.prototype.constructor.toString().match(/\w+/g)[1];
        }
    }, {
        key: "getX",
        value: function getX() {
            return this.x;
        }
    }, {
        key: "getY",
        value: function getY() {
            return this.y;
        }
    }, {
        key: "getButtonType",
        value: function getButtonType() {
            return this.button;
        }
    }]);

    return MouseClickEvent;
})();

},{}],11:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = exports.Tile = (function () {
    function Tile(glyph) {
        var walkable = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.walkable = walkable;
        this.entityGuid = '';
    }

    _createClass(Tile, [{
        key: 'isWalkable',
        value: function isWalkable() {
            return this.walkable;
        }
    }, {
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
            this.entityGuid = entityGuid;
        }
    }]);

    return Tile;
})();

},{}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.create = undefined;

var _Glyph = require('./Glyph');

var _Tile = require('./Tile');

var create = exports.create = undefined;
(function (create) {
    function nullTile() {
        return new _Tile.Tile(new _Glyph.Glyph(' ', 'black', '#111'), false);
    }
    create.nullTile = nullTile;
    function floorTile() {
        return new _Tile.Tile(new _Glyph.Glyph('.', '#222', '#111'));
    }
    create.floorTile = floorTile;
    function wallTile() {
        return new _Tile.Tile(new _Glyph.Glyph('#', '#ccc', '#111'), false);
    }
    create.wallTile = wallTile;
})(create || (exports.create = create = {}));

},{"./Glyph":4,"./Tile":11}],13:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.ActorComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ActorComponent = exports.ActorComponent = (function (_Component) {
    _inherits(ActorComponent, _Component);

    function ActorComponent() {
        _classCallCheck(this, ActorComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(ActorComponent).call(this));
    }

    _createClass(ActorComponent, [{
        key: 'act',
        value: function act() {
            console.log('act');
        }
    }]);

    return ActorComponent;
})(_Component2.Component);

},{"./Component":14}],14:[function(require,module,exports){
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Component = exports.Component = (function () {
    function Component() {
        _classCallCheck(this, Component);
    }

    _createClass(Component, [{
        key: "getName",
        value: function getName() {
            return this.constructor.toString().match(/\w+/g)[1];
        }
    }, {
        key: "setParentEntity",
        value: function setParentEntity(entity) {
            this.parent = entity;
        }
    }, {
        key: "setListeners",
        value: function setListeners() {}
    }]);

    return Component;
})();

},{}],15:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GlyphComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var GlyphComponent = exports.GlyphComponent = (function (_Component) {
    _inherits(GlyphComponent, _Component);

    function GlyphComponent(options) {
        _classCallCheck(this, GlyphComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(GlyphComponent).call(this));

        _this.glyph = options.glyph;
        return _this;
    }

    _createClass(GlyphComponent, [{
        key: 'getGlyph',
        value: function getGlyph() {
            return this.glyph;
        }
    }]);

    return GlyphComponent;
})(_Component2.Component);

},{"./Component":14}],16:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InputComponent = undefined;

var _Component2 = require('./Component');

var _KeyboardEventType = require('../KeyboardEventType');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var InputComponent = exports.InputComponent = (function (_Component) {
    _inherits(InputComponent, _Component);

    function InputComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, InputComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(InputComponent).call(this));

        _this.waiting = false;
        return _this;
    }

    _createClass(InputComponent, [{
        key: 'waitForInput',
        value: function waitForInput() {
            var _this2 = this;

            this.waiting = true;
            return new Promise(function (resolve, reject) {
                _this2.resolve = resolve;
                _this2.reject = reject;
            });
        }
    }, {
        key: 'handleEvent',
        value: function handleEvent(event) {
            var _this3 = this;

            if (this.waiting) {
                if (event.getClassName() === 'KeyboardEvent') {
                    event = event;
                    if (event.getEventType() === _KeyboardEventType.KeyboardEventType.DOWN) {
                        this.handleKeyDown(event).then(function (result) {
                            if (result) {
                                _this3.waiting = false;
                                _this3.resolve();
                            }
                        }).catch(function (result) {
                            console.log('Invalid keyboard input', event);
                        });
                    }
                }
            }
        }
    }, {
        key: 'getInput',
        value: function getInput() {
            return true;
        }
    }, {
        key: 'handleKeyDown',
        value: function handleKeyDown(event) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                switch (event.getKeyCode()) {
                    case ROT.VK_J:
                        _this4.parent.sendEvent('attemptMove', { x: 0, y: 1 }).then(function (a) {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_K:
                        _this4.parent.sendEvent('attemptMove', { x: 0, y: -1 }).then(function (a) {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_H:
                        _this4.parent.sendEvent('attemptMove', { x: -1, y: 0 }).then(function (a) {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_L:
                        _this4.parent.sendEvent('attemptMove', { x: 1, y: 0 }).then(function (a) {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    default:
                        reject();
                        break;
                }
            });
        }
    }]);

    return InputComponent;
})(_Component2.Component);

},{"../KeyboardEventType":7,"./Component":14}],17:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.PositionComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var PositionComponent = exports.PositionComponent = (function (_Component) {
    _inherits(PositionComponent, _Component);

    function PositionComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { x: 0, y: 0 } : arguments[0];

        _classCallCheck(this, PositionComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(PositionComponent).call(this));

        _this.x = options.x;
        _this.y = options.y;
        return _this;
    }

    _createClass(PositionComponent, [{
        key: 'getPosition',
        value: function getPosition() {
            return { x: this.x, y: this.y };
        }
    }, {
        key: 'getX',
        value: function getX() {
            return this.x;
        }
    }, {
        key: 'getY',
        value: function getY() {
            return this.y;
        }
    }, {
        key: 'setPosition',
        value: function setPosition(x, y) {
            this.x = x;
            this.y = y;
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('attemptMove', this.attemptMoveListener.bind(this));
        }
    }, {
        key: 'attemptMoveListener',
        value: function attemptMoveListener(direction) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var g = new _Game.Game();
                var position = {
                    x: _this2.x + direction.x,
                    y: _this2.y + direction.y
                };
                g.sendEvent('canMoveTo', position).then(function (position) {
                    _this2.move(direction);
                    resolve(direction);
                }).catch(function (position) {
                    reject(direction);
                });
            });
        }
    }, {
        key: 'move',
        value: function move(direction) {
            var oldPosition = {
                x: this.x,
                y: this.y
            };
            this.x += direction.x;
            this.y += direction.y;
            var g = new _Game.Game();
            g.sendEvent('entityMoved', { entity: this.parent, oldPosition: oldPosition });
        }
    }]);

    return PositionComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":14}],18:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[18])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ1lJOzs7QUFDSSxZQUFJLENBQUMsSUFBSSxHQUFHLEFBQUksTUFiaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQVlrQixRQUFRLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixZQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxBQUN4QjtLQUFDLEFBRUQsQUFBTzs7Ozs7QUFDSCxBQUFNLG1CQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFDckI7U0FBQyxBQUVELEFBQUc7Ozs7OztBQUNDLGdCQUFJLENBQUMsR0FBRyxBQUFJLEFBQUksVUF2QmhCLElB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SSxDQUFDLENBQUMsSUFBSSxTQUFTLENBQUMsQ0FBQyxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsR0FBRyxBQUFJLEFBQUksVUExRGhCLElBQUksQUFBQyxBQUFNLEFBQVMsQUFFNUIsRUF3RDBCLENBQUM7QUFDbkIsYUFBQyxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsRUFBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFDLENBQUMsQ0FBQyxBQUNoRjtTQUFDLEFBQ0wsQUFBQzs7OztlQS9ETyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRTlCOzs7Ozs7O0FDRlAsTUFBTSxDQUFDLE1BQU0sR0FBRztBQUNaLFFBQUksSUFBSSxHQUFHLEFBQUksQUFBSSxVQUhmLElBQUksQUFBQyxBQUFNLEFBQVEsRUFHRixDQUFDO0FBQ3RCLFFBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQ3RCO0NBQUMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0d1aWR9IGZyb20gJy4vR3VpZCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0NvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IHtcbiAgICBndWlkOiBzdHJpbmc7XG4gICAgY29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBDb21wb25lbnR9O1xuICAgIGFjdGluZzogYm9vbGVhbjtcblxuICAgIGxpc3RlbmVyczoge1tuYW1lOiBzdHJpbmddOiBhbnlbXX07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ndWlkID0gR3VpZC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXRHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWQ7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcucmVuZGVyKCk7XG4gICAgICAgIHRoaXMuYWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSA8SW5wdXRDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb21wb25lbnQud2FpdEZvcklucHV0KClcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGcucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXRQYXJlbnRFbnRpdHkodGhpcyk7XG4gICAgICAgIGNvbXBvbmVudC5zZXRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH1cblxuICAgIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmNvbXBvbmVudHNbbmFtZV0gIT09ICd1bmRlZmluZWQnO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xuICAgIH1cblxuICAgIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBQcm9taXNlPFQ+KSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7R2FtZVNjcmVlbn0gZnJvbSAnLi9HYW1lU2NyZWVuJztcbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuXG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgc2NyZWVuV2lkdGg6IG51bWJlcjtcbiAgICBzY3JlZW5IZWlnaHQ6IG51bWJlcjtcblxuICAgIGNhbnZhczogYW55O1xuXG4gICAgYWN0aXZlU2NyZWVuOiBHYW1lU2NyZWVuO1xuXG4gICAgZGlzcGxheTogYW55O1xuICAgIHNjaGVkdWxlcjogYW55O1xuICAgIGVuZ2luZTogYW55O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChHYW1lLmluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gR2FtZS5pbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZGlzcGxheSA9IG5ldyBST1QuRGlzcGxheSh7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5zY3JlZW5XaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRpc3BsYXkuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFJPVC5TY2hlZHVsZXIuU2ltcGxlKCk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IFJPVC5FbmdpbmUodGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgIHZhciBnYW1lU2NyZWVuID0gbmV3IEdhbWVTY3JlZW4odGhpcy5kaXNwbGF5LCB0aGlzLnNjcmVlbldpZHRoLCB0aGlzLnNjcmVlbkhlaWdodCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gZ2FtZVNjcmVlbjtcblxuICAgICAgICB0aGlzLmJpbmRJbnB1dEhhbmRsaW5nKCk7XG5cbiAgICAgICAgdGhpcy5lbmdpbmUuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZEV2ZW50KGV2ZW50TmFtZTogc3RyaW5nLCBjb252ZXJ0ZXI6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kSW5wdXRIYW5kbGluZygpIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudHNUb1NjcmVlbiA9IChldmVudE5hbWUsIGNvbnZlcnRlcikgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTY3JlZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4uaGFuZGxlSW5wdXQoY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdjbGljaycsIHRoaXMuY29udmVydE1vdXNlRXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEtleUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IEtleWJvYXJkRXZlbnQgPT4ge1xuICAgICAgICB2YXIgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLlBSRVNTO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudChcbiAgICAgICAgICAgIGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICBldmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBldmVudC5tZXRhS2V5XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0TW91c2VFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBNb3VzZUNsaWNrRXZlbnQgPT4ge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmRpc3BsYXkuZXZlbnRUb1Bvc2l0aW9uKGV2ZW50KTtcblxuICAgICAgICB2YXIgYnV0dG9uVHlwZTogTW91c2VCdXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLkxFRlQ7XG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMikge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5NSURETEU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQud2ljaCA9PT0gMykge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5SSUdIVFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VDbGlja0V2ZW50KFxuICAgICAgICAgICAgcG9zaXRpb25bMF0sXG4gICAgICAgICAgICBwb3NpdGlvblsxXSxcbiAgICAgICAgICAgIGJ1dHRvblR5cGVcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbnRpdHksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcblxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBUKSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4ucmVuZGVyKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZVNjcmVlbiB7XG4gICAgZGlzcGxheTogYW55O1xuICAgIG1hcDogTWFwO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgZ2FtZTogR2FtZTtcblxuICAgIGNvbnN0cnVjdG9yKGRpc3BsYXk6IGFueSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdGhpcy5nYW1lLmFkZExpc3RlbmVyKCdjYW5Nb3ZlVG8nLCB0aGlzLmNhbk1vdmVUby5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gYi54OyB4IDwgYi54ICsgYi53OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBiLnk7IHkgPCBiLnkgKyBiLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciBnbHlwaDogR2x5cGggPSB0aGlzLm1hcC5nZXRUaWxlKHgsIHkpLmdldEdseXBoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChnbHlwaCwgeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcC5tYXBFbnRpdGllcyh0aGlzLnJlbmRlckVudGl0eSk7XG4gICAgfVxuXG4gICAgaGFuZGxlSW5wdXQoZXZlbnREYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ01vdXNlQ2xpY2tFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VDbGlja0V2ZW50KDxNb3VzZUNsaWNrRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlib2FyZEV2ZW50KDxLZXlib2FyZEV2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZUNsaWNrRXZlbnQoZXZlbnQ6IE1vdXNlQ2xpY2tFdmVudCkge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCkpO1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkJywgZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCksIHRpbGUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbmRlcmFibGVCb3VuZGFyeSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgdzogdGhpcy5tYXAuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGg6IHRoaXMubWFwLmdldEhlaWdodCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1JlbmRlcmFibGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHJldHVybiB4ID49IGIueCAmJiB4IDwgYi54ICsgYi53ICYmIHkgPj0gYi55ICYmIHkgPCBiLnkgKyBiLmg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyh4IC0gYi54LCB5IC0gYi55LCBnbHlwaC5jaGFyLCBnbHlwaC5mb3JlZ3JvdW5kLCBnbHlwaC5iYWNrZ3JvdW5kKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckVudGl0eSA9IChlbnRpdHk6IEVudGl0eSkgPT4ge1xuICAgICAgICB2YXIgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIHZhciBnbHlwaENvbXBvbmVudDogR2x5cGhDb21wb25lbnQgPSA8R2x5cGhDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnR2x5cGhDb21wb25lbnQnKTtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZ2x5cGggPSBnbHlwaENvbXBvbmVudC5nZXRHbHlwaCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1JlbmRlcmFibGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuTW92ZVRvKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBhY2M6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKHRpbGUuaXNXYWxrYWJsZSgpICYmIHRpbGUuZ2V0RW50aXR5R3VpZCgpID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocG9zaXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QocG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgR2x5cGgge1xuICAgIHB1YmxpYyBjaGFyOiBzdHJpbmc7XG4gICAgcHVibGljIGZvcmVncm91bmQ6IHN0cmluZztcbiAgICBwdWJsaWMgYmFja2dyb3VuZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2hhcjogc3RyaW5nLCBmb3JlZ3JvdW5kOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNoYXIgPSBjaGFyO1xuICAgICAgICB0aGlzLmZvcmVncm91bmQgPSBmb3JlZ3JvdW5kO1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIEd1aWQge1xuICAgIHN0YXRpYyBnZW5lcmF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcblxuZXhwb3J0IGNsYXNzIEtleWJvYXJkRXZlbnQge1xuICAgIGtleUNvZGU6IG51bWJlcjtcbiAgICBhbHRLZXk6IGJvb2xlYW47XG4gICAgY3RybEtleTogYm9vbGVhbjtcbiAgICBzaGlmdEtleTogYm9vbGVhbjtcbiAgICBtZXRhS2V5OiBib29sZWFuO1xuICAgIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBLZXlib2FyZEV2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGtleUNvZGU6IG51bWJlciwgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSwgYWx0S2V5OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgbWV0YUtleTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmtleUNvZGUgPSBrZXlDb2RlO1xuICAgICAgICB0aGlzLmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcbiAgICAgICAgdGhpcy5hbHRLZXkgPSBhbHRLZXk7XG4gICAgICAgIHRoaXMuY3RybEtleSA9IGN0cmxLZXk7XG4gICAgICAgIHRoaXMuc2hpZnRLZXkgPSBzaGlmdEtleTtcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0gbWV0YUtleTtcbiAgICB9XG5cbiAgICBnZXRFdmVudFR5cGUoKTogS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudFR5cGU7XG4gICAgfVxuXG4gICAgZ2V0S2V5Q29kZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlDb2RlO1xuICAgIH1cblxuICAgIGhhc0FsdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx0S2V5O1xuICAgIH1cblxuICAgIGhhc1NoaWZ0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGlmdEtleTtcbiAgICB9XG5cbiAgICBoYXNDdHJsS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdHJsS2V5O1xuICAgIH1cblxuICAgIGhhc01ldGFLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFLZXk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgIERPV04sXG4gICAgVVAsXG4gICAgUFJFU1Ncbn07XG4iLCJkZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5cbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBNYXAge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgdGlsZXM6IFRpbGVbXVtdO1xuXG4gICAgZW50aXRpZXM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXR5fTtcblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuXG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5hZGRMaXN0ZW5lcignZW50aXR5TW92ZWQnLCB0aGlzLmVudGl0eU1vdmVkTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgbWFwRW50aXRpZXMoY2FsbGJhY2s6IChpdGVtOiBFbnRpdHkpID0+IGFueSkge1xuICAgICAgICBmb3IgKHZhciBlbnRpdHlHdWlkIGluIHRoaXMuZW50aXRpZXMpIHtcbiAgICAgICAgICAgIHZhciBlbnRpdHkgPSB0aGlzLmVudGl0aWVzW2VudGl0eUd1aWRdO1xuICAgICAgICAgICAgY2FsbGJhY2soZW50aXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIGdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcbiAgICB9XG5cbiAgICBnZXRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRpbGVzW3hdW3ldO1xuICAgIH1cblxuICAgIGdlbmVyYXRlKCkge1xuICAgICAgICB0aGlzLnRpbGVzID0gdGhpcy5nZW5lcmF0ZUxldmVsKCk7XG5cbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuXG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgSW5wdXRDb21wb25lbnQoKSk7XG5cbiAgICAgICAgdGhpcy5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKHBsYXllcik7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkocGxheWVyKTtcblxuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnbicsICdjeWFuJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuXG4gICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSk7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgIH1cblxuICAgIGFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHZhciBtYXhUcmllcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIDEwO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlICghZm91bmQgJiYgaSA8IG1heFRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRUaWxlKHgsIHkpLmlzV2Fsa2FibGUoKSAmJiAhdGhpcy5wb3NpdGlvbkhhc0VudGl0eSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBmcmVlIHNwb3QgZm91bmQgZm9yJywgZW50aXR5KTtcbiAgICAgICAgICAgIHRocm93ICdObyBmcmVlIHNwb3QgZm91bmQgZm9yIGEgbmV3IGVudGl0eSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBlbnRpdHk7XG4gICAgICAgIHRoaXMuZ2V0VGlsZSh4LCB5KS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnYW1lLmFkZEVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgIH1cblxuICAgIHBvc2l0aW9uSGFzRW50aXR5KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gZW50aXR5R3VpZCAhPT0gJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxldmVsKCk6IFRpbGVbXVtdIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF0ucHVzaChUaWxlcy5jcmVhdGUubnVsbFRpbGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbmV3IFJPVC5NYXAuQ2VsbHVsYXIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBnZW5lcmF0b3IucmFuZG9taXplKDAuNSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCh4LCB5LCB2KSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuY3JlYXRlLmZsb29yVGlsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS53YWxsVGlsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlNb3ZlZExpc3RlbmVyKGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IGRhdGEub2xkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gZGF0YS5lbnRpdHk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUob2xkUG9zaXRpb24ueCwgb2xkUG9zaXRpb24ueSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUocG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLCBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkpLnNldEVudGl0eUd1aWQoZW50aXR5LmdldEd1aWQoKSk7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBNb3VzZUJ1dHRvblR5cGUge1xuICAgIExFRlQsXG4gICAgTUlERExFLFxuICAgIFJJR0hUXG59O1xuXG4iLCJpbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuXG5leHBvcnQgY2xhc3MgTW91c2VDbGlja0V2ZW50IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIGJ1dHRvbjogTW91c2VCdXR0b25UeXBlO1xuXG4gICAgZ2V0Q2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gTW91c2VDbGlja0V2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBidXR0b246IE1vdXNlQnV0dG9uVHlwZSkge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IGJ1dHRvbjtcbiAgICB9XG5cbiAgICBnZXRYKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLng7XG4gICAgfVxuXG4gICAgZ2V0WSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy55O1xuICAgIH1cblxuICAgIGdldEJ1dHRvblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbjtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuICAgIHByaXZhdGUgZW50aXR5R3VpZDogc3RyaW5nO1xuICAgIHByaXZhdGUgd2Fsa2FibGU6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihnbHlwaDogR2x5cGgsIHdhbGthYmxlOiBib29sZWFuID0gdHJ1ZSkge1xuICAgICAgICB0aGlzLmdseXBoID0gZ2x5cGg7XG4gICAgICAgIHRoaXMud2Fsa2FibGUgPSB3YWxrYWJsZTtcblxuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSAnJztcbiAgICB9XG5cbiAgICBpc1dhbGthYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrYWJsZTtcbiAgICB9XG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cblxuICAgIGdldEVudGl0eUd1aWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5R3VpZDtcbiAgICB9XG5cbiAgICBzZXRFbnRpdHlHdWlkKGVudGl0eUd1aWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuXG5leHBvcnQgbW9kdWxlIGNyZWF0ZSB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIG51bGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcgJywgJ2JsYWNrJywgJyMxMTEnKSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gZmxvb3JUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcuJywgJyMyMjInLCAnIzExMScpKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIHdhbGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcjJywgJyNjY2MnLCAnIzExMScpLCBmYWxzZSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQWN0b3JDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FjdCcpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgICBwcm90ZWN0ZWQgcGFyZW50OiBFbnRpdHk7XG5cbiAgICBwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQYXJlbnRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBlbnRpdHk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldExpc3RlbmVycygpIHtcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBHbHlwaENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBnbHlwaDogR2x5cGg7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7Z2x5cGg6IEdseXBofSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdseXBoID0gb3B0aW9ucy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4uL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4uL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgd2FpdGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgcmVzb2x2ZTogYW55O1xuICAgIHByaXZhdGUgcmVqZWN0OiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIHdhaXRGb3JJbnB1dCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdGluZykge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5nZXRFdmVudFR5cGUoKSA9PT0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd24oZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGtleWJvYXJkIGlucHV0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5wdXQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQuZ2V0S2V5Q29kZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAwLCB5OiAxfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0s6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogMCwgeTogLTF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAtMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19MOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywge3g6IDEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgeDogbnVtYmVyO1xuICAgIHByaXZhdGUgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnggPSBvcHRpb25zLng7XG4gICAgICAgIHRoaXMueSA9IG9wdGlvbnMueTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbigpOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX07XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNb3ZlJywgdGhpcy5hdHRlbXB0TW92ZUxpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlTGlzdGVuZXIoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMueCArIGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSArIGRpcmVjdGlvbi55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZy5zZW5kRXZlbnQoJ2Nhbk1vdmVUbycsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogdGhpcy54LFxuICAgICAgICAgICAgeTogdGhpcy55XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlNb3ZlZCcsIHtlbnRpdHk6IHRoaXMucGFyZW50LCBvbGRQb3NpdGlvbjogb2xkUG9zaXRpb259KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgZ2FtZS5pbml0KDkwLCA1MCk7XG59XG4iXX0=
