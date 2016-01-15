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
            var g = new _Game.Game();
            if (this.hasComponent('PlayerComponent')) {
                for (var componentName in this.components) {
                    var component = this.components[componentName];
                    var state = component.describeState();
                    if (state) {
                        console.log(state);
                    }
                }
                g.render();
            }
            this.acting = true;
            if (this.hasComponent('InputComponent')) {
                this.handleInputComponent();
            } else if (this.hasComponent('RandomWalkComponent')) {
                this.handleRandomWalkComponent();
            } else if (this.hasComponent('AIFactionComponent')) {
                this.handleAIFactionComponent();
            } else {
                this.acting = false;
            }
        }
    }, {
        key: 'kill',
        value: function kill() {
            var _this = this;

            return new Promise(function (resolve, reject) {
                var g = new _Game.Game();
                _this.sendEvent('killed').then(function () {
                    g.sendEvent('entityKilled', _this).then(resolve).catch(resolve);
                }).catch(function () {
                    g.sendEvent('entityKilled', _this).then(resolve).catch(resolve);
                });
            });
        }
    }, {
        key: 'handleAIFactionComponent',
        value: function handleAIFactionComponent() {
            var _this2 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('AIFactionComponent');
            component.act().then(function () {
                _this2.acting = false;
                g.unlockEngine();
            });
        }
    }, {
        key: 'handleRandomWalkComponent',
        value: function handleRandomWalkComponent() {
            var _this3 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('RandomWalkComponent');
            component.randomWalk().then(function () {
                _this3.acting = false;
                g.unlockEngine();
            });
        }
    }, {
        key: 'handleInputComponent',
        value: function handleInputComponent() {
            var _this4 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('InputComponent');
            component.waitForInput().then(function () {
                g.unlockEngine();
                _this4.acting = false;
            });
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
        value: function sendEvent(name) {
            var _this5 = this;

            var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return new Promise(function (resolve, reject) {
                if (!_this5.listeners[name]) {
                    reject();
                }
                var returnData;
                var listeners = _this5.listeners[name];
                if (!listeners || listeners.length === 0) {
                    reject();
                }
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

var _Map = require('./Map');

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
        this.turnCount = 0;
        this.turnTime = new Date().getTime();
        this.minTurnTime = 100;
        window['Game'] = this;
    }

    _createClass(Game, [{
        key: 'init',
        value: function init(width, height) {
            var _this2 = this;

            this.screenWidth = width;
            this.screenHeight = height;
            this.display = new ROT.Display({
                width: this.screenWidth,
                height: this.screenHeight
            });
            this.canvas = this.display.getContainer();
            document.body.appendChild(this.canvas);
            this.scheduler = new ROT.Scheduler.Simple();
            this.scheduler.add({
                act: function act() {
                    _this2.turnCount++;
                    console.debug('turn', _this2.turnCount);
                } }, true);
            this.engine = new ROT.Engine(this.scheduler);
            this.map = new _Map.Map(this.screenWidth, this.screenHeight - 1);
            this.map.generate();
            var gameScreen = new _GameScreen.GameScreen(this.display, this.screenWidth, this.screenHeight, this.map);
            this.activeScreen = gameScreen;
            var player = gameScreen.getPlayer();
            var position = player.getComponent('PositionComponent');
            this.map.addEnemies({
                x: position.getX(),
                y: position.getY(),
                r: 5
            });
            this.bindInputHandling();
            this.engine.start();
            this.addListener('entityKilled', this.entityDeathListener.bind(this));
            this.render();
        }
    }, {
        key: 'entityDeathListener',
        value: function entityDeathListener(entity) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (entity.hasComponent('PlayerComponent')) {
                    console.log('The player is dead!');
                    _this3.render();
                    _this3.lockEngine();
                }
                resolve();
            });
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
            var _this4 = this;

            var bindEventsToScreen = function bindEventsToScreen(eventName, converter) {
                window.addEventListener(eventName, function (event) {
                    if (_this4.activeScreen !== null) {
                        _this4.activeScreen.handleInput(converter(eventName, event));
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
        key: 'removeEntity',
        value: function removeEntity(entity) {
            if (entity.hasComponent('ActorComponent')) {
                this.scheduler.remove(entity);
            }
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
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                if (!_this5.listeners[name]) {
                    return false;
                }
                var returnData;
                var listeners = _this5.listeners[name];
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
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
        }
    }, {
        key: 'getCurrentTurn',
        value: function getCurrentTurn() {
            return this.turnCount;
        }
    }]);

    return Game;
})();

},{"./GameScreen":3,"./KeyboardEvent":6,"./KeyboardEventType":7,"./Map":8,"./MouseButtonType":9,"./MouseClickEvent":10}],3:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })(); /// <reference path="../typings/lib.es6.d.ts" />

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.GameScreen = undefined;

var _Game = require('./Game');

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _Spawn = require('./Spawn');

var Spawn = _interopRequireWildcard(_Spawn);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var GameScreen = exports.GameScreen = (function () {
    function GameScreen(display, width, height, map) {
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
        this.game = new _Game.Game();
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = map;
        this.nullTile = Tiles.create.nullTile();
        this.player = Spawn.entity.Player();
        this.map.addEntityAtRandomPosition(this.player);
        this.game.addEntity(this.player);
    }

    _createClass(GameScreen, [{
        key: 'getPlayer',
        value: function getPlayer() {
            return this.player;
        }
    }, {
        key: 'render',
        value: function render() {
            var b = this.getRenderableBoundary();
            for (var x = b.x; x < b.x + b.w; x++) {
                for (var y = b.y; y < b.y + b.h; y++) {
                    var glyph = this.map.getTile(x, y).getGlyph();
                    this.renderMapGlyph(glyph, x, y);
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
            if (event.getX() === -1 || event.getY() === -1) {
                console.debug('clicked outside of canvas');
            } else {
                var tile = this.map.getTile(event.getX(), event.getY());
                console.debug('clicked', event.getX(), event.getY(), tile);
            }
        }
    }, {
        key: 'handleKeyboardEvent',
        value: function handleKeyboardEvent(event) {}
    }, {
        key: 'getMap',
        value: function getMap() {
            return this.map;
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
        key: 'renderMapGlyph',
        value: function renderMapGlyph(glyph, x, y) {
            var b = this.getRenderableBoundary();
            var sightComponent = this.player.getComponent('SightComponent');
            if (sightComponent.canSee(x, y)) {
                this.display.draw(x - b.x, y - b.y, glyph.char, glyph.foreground, glyph.background);
            } else if (sightComponent.hasSeen(x, y)) {
                this.display.draw(x - b.x, y - b.y, glyph.char, glyph.foreground, '#111');
            } else {
                var g = this.nullTile.getGlyph();
                this.display.draw(x - b.x, y - b.y, g.char, g.foreground, g.background);
            }
        }
    }, {
        key: 'renderGlyph',
        value: function renderGlyph(glyph, x, y) {
            var b = this.getRenderableBoundary();
            var sightComponent = this.player.getComponent('SightComponent');
            if (sightComponent.canSee(x, y)) {
                this.display.draw(x - b.x, y - b.y, glyph.char, glyph.foreground, glyph.background);
            }
        }
    }]);

    return GameScreen;
})();

},{"./Game":2,"./Spawn":11,"./Tiles":13}],4:[function(require,module,exports){
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

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _Spawn = require('./Spawn');

var Spawn = _interopRequireWildcard(_Spawn);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Map = exports.Map = (function () {
    function Map(width, height) {
        var maxEnemies = arguments.length <= 2 || arguments[2] === undefined ? 10 : arguments[2];

        _classCallCheck(this, Map);

        this.width = width;
        this.height = height;
        this.maxEnemies = maxEnemies;
        this.tiles = [];
        this.entities = {};
        var g = new _Game.Game();
        g.addListener('entityMoved', this.entityMovedListener.bind(this));
        g.addListener('entityKilled', this.entityKilledListener.bind(this));
        g.addListener('canMoveTo', this.canMoveTo.bind(this));
    }

    _createClass(Map, [{
        key: 'setupFov',
        value: function setupFov() {
            var _this = this;

            this.fov = new ROT.FOV.DiscreteShadowcasting(function (x, y) {
                var tile = _this.getTile(x, y);
                if (!tile) {
                    return false;
                }
                return !tile.blocksLight();
            }, { topology: 4 });
        }
    }, {
        key: 'getVisibleCells',
        value: function getVisibleCells(entity, distance) {
            var visibleCells = {};
            var positionComponent = entity.getComponent('PositionComponent');
            this.fov.compute(positionComponent.getX(), positionComponent.getY(), distance, function (x, y, radius, visibility) {
                visibleCells[x + "," + y] = true;
            });
            return visibleCells;
        }
    }, {
        key: 'mapEntities',
        value: function mapEntities(callback) {
            for (var entityGuid in this.entities) {
                var entity = this.entities[entityGuid];
                if (entity) {
                    callback(entity);
                }
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
            if (x < 0 || y < 0 || x >= this.width || y >= this.height) {
                return null;
            }
            return this.tiles[x][y];
        }
    }, {
        key: 'generate',
        value: function generate() {
            this.tiles = this.generateLevel();
            this.setupFov();
        }
    }, {
        key: 'addEnemies',
        value: function addEnemies() {
            var avoid = arguments.length <= 0 || arguments[0] === undefined ? { x: -1, y: -1, r: -1 } : arguments[0];

            var g = new _Game.Game();
            var enemy = undefined;
            for (var i = 0; i < this.maxEnemies; i++) {
                enemy = Spawn.entity.FireImp();
                this.addEntityAtRandomPosition(enemy, avoid);
                g.addEntity(enemy);
            }
            for (var i = 0; i < this.maxEnemies; i++) {
                enemy = Spawn.entity.IceImp();
                this.addEntityAtRandomPosition(enemy, avoid);
                g.addEntity(enemy);
            }
        }
    }, {
        key: 'addEntityAtRandomPosition',
        value: function addEntityAtRandomPosition(entity) {
            var avoid = arguments.length <= 1 || arguments[1] === undefined ? { x: -1, y: -1, r: -1 } : arguments[1];

            if (!entity.hasComponent('PositionComponent')) {
                return false;
            }
            var found = false;
            var maxTries = this.width * this.height * 10;
            var i = 0;
            var x = -1;
            var y = -1;
            while (!found && i < maxTries) {
                x = Math.floor(Math.random() * this.width);
                y = Math.floor(Math.random() * this.height);
                i++;
                if (avoid.x !== -1) {
                    var dx = Math.abs(x - avoid.x);
                    var dy = Math.abs(y - avoid.y);
                    if (dx + dy <= avoid.r) {
                        console.log('avoiding ', dx + dy);
                        continue;
                    }
                }
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
        key: 'removeEntity',
        value: function removeEntity(entity) {
            var game = new _Game.Game();
            var positionComponent = entity.getComponent('PositionComponent');
            game.removeEntity(entity);
            this.entities[entity.getGuid()] = null;
            this.getTile(positionComponent.getX(), positionComponent.getY()).setEntityGuid('');
        }
    }, {
        key: 'positionHasEntity',
        value: function positionHasEntity(x, y) {
            var tile = this.getTile(x, y);
            var entityGuid = tile.getEntityGuid();
            return entityGuid !== '';
        }
    }, {
        key: 'getEntityAt',
        value: function getEntityAt(x, y) {
            var tile = this.getTile(x, y);
            var entityGuid = tile.getEntityGuid();
            return this.entities[entityGuid];
        }
    }, {
        key: 'getNearbyEntities',
        value: function getNearbyEntities(originComponent, radius) {
            var filter = arguments.length <= 2 || arguments[2] === undefined ? function (e) {
                return true;
            } : arguments[2];

            var entities = [];
            this.mapEntities(function (entity) {
                if (!filter(entity)) {
                    return;
                }
                var positionComponent = entity.getComponent('PositionComponent');
                if (positionComponent === originComponent) {
                    return;
                }
                var distance = positionComponent.distanceTo(originComponent.getX(), originComponent.getY());
                if (distance <= radius) {
                    entities.push({ distance: distance, entity: entity });
                }
            });
            entities.sort(function (a, b) {
                return a.distance - b.distance;
            });
            entities = entities.map(function (a) {
                return a.entity;
            });
            return entities;
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
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var oldPosition = data.oldPosition;
                var entity = data.entity;
                if (!entity.hasComponent('PositionComponent')) {
                    reject(data);
                    return;
                }
                var positionComponent = entity.getComponent('PositionComponent');
                _this2.getTile(oldPosition.x, oldPosition.y).setEntityGuid('');
                _this2.getTile(positionComponent.getX(), positionComponent.getY()).setEntityGuid(entity.getGuid());
                resolve(data);
            });
        }
    }, {
        key: 'entityKilledListener',
        value: function entityKilledListener(data) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.removeEntity(data);
                resolve(data);
            });
        }
    }, {
        key: 'canMoveTo',
        value: function canMoveTo(position) {
            var _this4 = this;

            var acc = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

            return new Promise(function (resolve, reject) {
                var tile = _this4.getTile(position.x, position.y);
                if (tile.isWalkable() && tile.getEntityGuid() === '') {
                    resolve(position);
                } else {
                    reject(position);
                }
            });
        }
    }]);

    return Map;
})();

},{"./Game":2,"./Spawn":11,"./Tiles":13}],9:[function(require,module,exports){
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

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.entity = undefined;

var _Glyph = require('./Glyph');

var _Entity = require('./Entity');

var _ActorComponent = require('./components/ActorComponent');

var _PlayerComponent = require('./components/PlayerComponent');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

var _InputComponent = require('./components/InputComponent');

var _SightComponent = require('./components/SightComponent');

var _AIFactionComponent = require('./components/AIFactionComponent');

var _FactionComponent = require('./components/FactionComponent');

var _FireAffinityComponent = require('./components/FireAffinityComponent');

var _IceAffinityComponent = require('./components/IceAffinityComponent');

var _MeleeAttackComponent = require('./components/MeleeAttackComponent');

var _AbilityFireboltComponent = require('./components/AbilityFireboltComponent');

var _AbilityIceLanceComponent = require('./components/AbilityIceLanceComponent');

var entity = exports.entity = undefined;
(function (entity) {
    function FireImp() {
        var enemy = new _Entity.Entity();
        enemy.addComponent(new _ActorComponent.ActorComponent());
        enemy.addComponent(new _GlyphComponent.GlyphComponent({
            glyph: new _Glyph.Glyph('f', 'red', 'black')
        }));
        enemy.addComponent(new _PositionComponent.PositionComponent());
        enemy.addComponent(new _AIFactionComponent.AIFactionComponent());
        enemy.addComponent(new _FireAffinityComponent.FireAffinityComponent());
        enemy.addComponent(new _SightComponent.SightComponent());
        enemy.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
        enemy.addComponent(new _FactionComponent.FactionComponent({
            fire: 1,
            ice: 0,
            hero: -1
        }));
        return enemy;
    }
    entity.FireImp = FireImp;
    function IceImp() {
        var enemy = new _Entity.Entity();
        enemy.addComponent(new _ActorComponent.ActorComponent());
        enemy.addComponent(new _GlyphComponent.GlyphComponent({
            glyph: new _Glyph.Glyph('i', 'cyan', 'black')
        }));
        enemy.addComponent(new _PositionComponent.PositionComponent());
        enemy.addComponent(new _AIFactionComponent.AIFactionComponent());
        enemy.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
        enemy.addComponent(new _IceAffinityComponent.IceAffinityComponent());
        enemy.addComponent(new _SightComponent.SightComponent());
        enemy.addComponent(new _FactionComponent.FactionComponent({
            fire: 0,
            ice: 1,
            hero: -1
        }));
        return enemy;
    }
    entity.IceImp = IceImp;
    function Player() {
        var player = new _Entity.Entity();
        player.addComponent(new _PlayerComponent.PlayerComponent());
        player.addComponent(new _ActorComponent.ActorComponent());
        player.addComponent(new _GlyphComponent.GlyphComponent({
            glyph: new _Glyph.Glyph('@', 'white', 'black')
        }));
        player.addComponent(new _PositionComponent.PositionComponent());
        player.addComponent(new _InputComponent.InputComponent());
        player.addComponent(new _SightComponent.SightComponent({
            distance: 50
        }));
        player.addComponent(new _FactionComponent.FactionComponent({
            hero: 1,
            ice: -1,
            fire: -1
        }));
        player.addComponent(new _AbilityFireboltComponent.AbilityFireboltComponent());
        player.addComponent(new _AbilityIceLanceComponent.AbilityIceLanceComponent());
        player.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
        return player;
    }
    entity.Player = Player;
})(entity || (exports.entity = entity = {}));

},{"./Entity":1,"./Glyph":4,"./components/AIFactionComponent":14,"./components/AbilityFireboltComponent":15,"./components/AbilityIceLanceComponent":16,"./components/ActorComponent":17,"./components/FactionComponent":19,"./components/FireAffinityComponent":20,"./components/GlyphComponent":21,"./components/IceAffinityComponent":22,"./components/InputComponent":23,"./components/MeleeAttackComponent":24,"./components/PlayerComponent":25,"./components/PositionComponent":26,"./components/SightComponent":27}],12:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tile = exports.Tile = (function () {
    function Tile(glyph) {
        var walkable = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];
        var blockingLight = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.walkable = walkable;
        this.blockingLight = blockingLight;
        this.entityGuid = '';
    }

    _createClass(Tile, [{
        key: 'isWalkable',
        value: function isWalkable() {
            return this.walkable;
        }
    }, {
        key: 'blocksLight',
        value: function blocksLight() {
            return this.blockingLight;
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

},{}],13:[function(require,module,exports){
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
        return new _Tile.Tile(new _Glyph.Glyph(' ', 'black', '#000'), false, false);
    }
    create.nullTile = nullTile;
    function floorTile() {
        return new _Tile.Tile(new _Glyph.Glyph('.', '#222', '#444'), true, false);
    }
    create.floorTile = floorTile;
    function wallTile() {
        return new _Tile.Tile(new _Glyph.Glyph('#', '#ccc', '#444'), false, true);
    }
    create.wallTile = wallTile;
})(create || (exports.create = create = {}));

},{"./Glyph":4,"./Tile":12}],14:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AIFactionComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var AIFactionComponent = exports.AIFactionComponent = (function (_Component) {
    _inherits(AIFactionComponent, _Component);

    function AIFactionComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, AIFactionComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AIFactionComponent).call(this));

        _this.targetPos = null;
        return _this;
    }

    _createClass(AIFactionComponent, [{
        key: 'act',
        value: function act() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var sight = _this2.parent.getComponent('SightComponent');
                var faction = _this2.parent.getComponent('FactionComponent');
                var position = _this2.parent.getComponent('PositionComponent');
                var entities = sight.getVisibleEntities();
                var fearing = null;
                var enemy = null;
                entities.forEach(function (entity) {
                    var ef = entity.getComponent('FactionComponent');
                    if (faction.isEnemy(ef.getSelfFaction())) {
                        enemy = entity;
                    } else if (fearing === null && faction.isFearing(ef.getSelfFaction())) {
                        fearing = entity;
                    }
                });
                if (enemy !== null) {
                    var t = enemy.getComponent('PositionComponent');
                    _this2.targetPos = {
                        x: t.getX(),
                        y: t.getY()
                    };
                }
                if (_this2.targetPos !== null && (_this2.targetPos.x !== position.getX() || _this2.targetPos.y !== position.getY())) {
                    _this2.goTowardsTarget(position).then(function () {
                        resolve(true);
                    }).catch(function () {
                        resolve(false);
                    });
                } else {
                    _this2.randomWalk().then(function () {
                        resolve(true);
                    }).catch(function () {
                        resolve(false);
                    });
                }
            });
        }
    }, {
        key: 'goTowardsTarget',
        value: function goTowardsTarget(position) {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                var dx = Math.abs(_this3.targetPos.x - position.getX());
                var dy = Math.abs(_this3.targetPos.y - position.getY());
                var direction = undefined;
                if (dx + dy === 1) {
                    direction = {
                        x: dx == 0 ? 0 : Math.floor((_this3.targetPos.x - position.getX()) / dx),
                        y: dy == 0 ? 0 : Math.floor((_this3.targetPos.y - position.getY()) / dy)
                    };
                    console.log('trying to attack!', direction);
                    _this3.attemptAttack(direction).then(resolve).catch(reject);
                } else if (dx > dy) {
                    direction = {
                        x: (_this3.targetPos.x - position.getX()) / dx,
                        y: 0
                    };
                    _this3.attemptMove(direction).then(function () {
                        resolve();
                    }).catch(function () {
                        direction = {
                            x: 0,
                            y: (_this3.targetPos.y - position.getY()) / dy
                        };
                        _this3.attemptMove(direction).then(function () {
                            resolve();
                        }).catch(function () {
                            _this3.targetPos = null;
                            reject();
                        });
                    });
                } else {
                    direction = {
                        x: 0,
                        y: (_this3.targetPos.y - position.getY()) / dy
                    };
                    _this3.attemptMove(direction).then(function () {
                        resolve();
                    }).catch(function () {
                        direction = {
                            x: (_this3.targetPos.x - position.getX()) / dx,
                            y: 0
                        };
                        _this3.attemptMove(direction).then(function () {
                            resolve();
                        }).catch(function () {
                            _this3.targetPos = null;
                            reject();
                        });
                    });
                }
            });
        }
    }, {
        key: 'attemptAttack',
        value: function attemptAttack(direction) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.parent.sendEvent('attemptMeleeAttack', direction).then(function () {
                    resolve(true);
                }).catch(function () {
                    reject();
                });
            });
        }
    }, {
        key: 'attemptMove',
        value: function attemptMove(direction) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                _this5.parent.sendEvent('attemptMove', direction).then(function () {
                    resolve(true);
                }).catch(function () {
                    reject();
                });
            });
        }
    }, {
        key: 'randomWalk',
        value: function randomWalk() {
            var _this6 = this;

            return new Promise(function (resolve, reject) {
                var directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
                directions = directions.randomize();
                var testDirection = function testDirection(direction) {
                    _this6.parent.sendEvent('attemptMove', direction).then(function (a) {
                        resolve(true);
                    }).catch(function () {
                        if (directions.length > 0) {
                            testDirection(directions.pop());
                        } else {
                            resolve(false);
                        }
                    });
                };
                testDirection(directions.pop());
            });
        }
    }]);

    return AIFactionComponent;
})(_Component2.Component);

},{"./Component":18}],15:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AbilityFireboltComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var AbilityFireboltComponent = exports.AbilityFireboltComponent = (function (_Component) {
    _inherits(AbilityFireboltComponent, _Component);

    function AbilityFireboltComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, AbilityFireboltComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AbilityFireboltComponent).call(this));

        _this.game = new _Game.Game();
        _this.range = 5;
        _this.cooldown = 100;
        _this.lastUsed = -_this.cooldown;
        _this.damageType = 'fire';
        return _this;
    }

    _createClass(AbilityFireboltComponent, [{
        key: 'describeState',
        value: function describeState() {
            var currentTurn = this.game.getCurrentTurn();
            var cooldown = this.lastUsed + this.cooldown - currentTurn;
            return 'Firebolt, cooldown: ' + Math.max(0, cooldown);
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('attemptAbilityFirebolt', this.use.bind(this));
            this.parent.addListener('consumeFire', this.consumeFire.bind(this));
        }
    }, {
        key: 'isAvailable',
        value: function isAvailable() {
            return this.lastUsed + this.cooldown <= this.game.getCurrentTurn();
        }
    }, {
        key: 'consumeFire',
        value: function consumeFire() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.lastUsed -= _this2.cooldown;
                resolve();
            });
        }
    }, {
        key: 'use',
        value: function use() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (!_this3.isAvailable()) {
                    reject();
                    return;
                }
                var map = _this3.game.getMap();
                var positionComponent = _this3.parent.getComponent('PositionComponent');
                var entities = map.getNearbyEntities(positionComponent, _this3.range);
                if (entities.length === 0) {
                    resolve(null);
                    return;
                }
                var target = entities.pop();
                if (!target.hasComponent('IceAffinityComponent')) {
                    resolve(null);
                    return;
                }
                _this3.lastUsed = _this3.game.getCurrentTurn();
                _this3.parent.sendEvent('consumeIce');
                target.kill();
                resolve(target);
            });
        }
    }]);

    return AbilityFireboltComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":18}],16:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.AbilityIceLanceComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var AbilityIceLanceComponent = exports.AbilityIceLanceComponent = (function (_Component) {
    _inherits(AbilityIceLanceComponent, _Component);

    function AbilityIceLanceComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, AbilityIceLanceComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(AbilityIceLanceComponent).call(this));

        _this.game = new _Game.Game();
        _this.range = 5;
        _this.cooldown = 100;
        _this.lastUsed = -_this.cooldown;
        _this.damageType = 'ice';
        return _this;
    }

    _createClass(AbilityIceLanceComponent, [{
        key: 'describeState',
        value: function describeState() {
            var currentTurn = this.game.getCurrentTurn();
            var cooldown = this.lastUsed + this.cooldown - currentTurn;
            return 'Ice Lance, cooldown: ' + Math.max(0, cooldown);
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('attemptAbilityIceLance', this.use.bind(this));
            this.parent.addListener('consumeIce', this.consumeIce.bind(this));
        }
    }, {
        key: 'isAvailable',
        value: function isAvailable() {
            return this.lastUsed + this.cooldown <= this.game.getCurrentTurn();
        }
    }, {
        key: 'consumeIce',
        value: function consumeIce() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                _this2.lastUsed -= _this2.cooldown;
                resolve();
            });
        }
    }, {
        key: 'use',
        value: function use() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                if (!_this3.isAvailable()) {
                    reject();
                    return;
                }
                var map = _this3.game.getMap();
                var positionComponent = _this3.parent.getComponent('PositionComponent');
                var entities = map.getNearbyEntities(positionComponent, _this3.range, function (entity) {
                    return entity.hasComponent('FireAffinityComponent');
                });
                if (entities.length === 0) {
                    console.log('no entities nearby');
                    resolve(null);
                    return;
                }
                var target = entities.pop();
                _this3.lastUsed = _this3.game.getCurrentTurn();
                _this3.parent.sendEvent('consumeFire');
                target.kill();
                resolve(target);
            });
        }
    }]);

    return AbilityIceLanceComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":18}],17:[function(require,module,exports){
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

},{"./Component":18}],18:[function(require,module,exports){
'use strict';

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
        key: 'getName',
        value: function getName() {
            return this.constructor.toString().match(/\w+/g)[1];
        }
    }, {
        key: 'setParentEntity',
        value: function setParentEntity(entity) {
            this.parent = entity;
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {}
    }, {
        key: 'describeState',
        value: function describeState() {
            return '';
        }
    }]);

    return Component;
})();

},{}],19:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FactionComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var FactionComponent = exports.FactionComponent = (function (_Component) {
    _inherits(FactionComponent, _Component);

    function FactionComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { fire: 0, ice: 0, hero: 0 } : arguments[0];

        _classCallCheck(this, FactionComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FactionComponent).call(this));

        _this.fire = options.fire;
        _this.ice = options.ice;
        _this.hero = options.hero;
        return _this;
    }

    _createClass(FactionComponent, [{
        key: 'isFriendly',
        value: function isFriendly(faction) {
            if (typeof this[faction] === 'undefined') {
                throw 'Asking for info on undefined faction';
            }
            if (this[faction] === 1) {
                return true;
            }
            return false;
        }
    }, {
        key: 'isFearing',
        value: function isFearing(faction) {
            if (typeof this[faction] === 'undefined') {
                throw 'Asking for info on undefined faction';
            }
            if (this[faction] === 0) {
                return true;
            }
            return false;
        }
    }, {
        key: 'isEnemy',
        value: function isEnemy(faction) {
            if (typeof this[faction] === 'undefined') {
                throw 'Asking for info on undefined faction';
            }
            if (this[faction] === -1) {
                return true;
            }
            return false;
        }
    }, {
        key: 'getSelfFaction',
        value: function getSelfFaction() {
            if (this.ice === 1) {
                return 'ice';
            } else if (this.fire === 1) {
                return 'fire';
            } else if (this.hero === 1) {
                return 'hero';
            }
            return '';
        }
    }]);

    return FactionComponent;
})(_Component2.Component);

},{"./Component":18}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FireAffinityComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var FireAffinityComponent = exports.FireAffinityComponent = (function (_Component) {
    _inherits(FireAffinityComponent, _Component);

    function FireAffinityComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, FireAffinityComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FireAffinityComponent).call(this));

        _this.affinity = 'fire';
        return _this;
    }

    return FireAffinityComponent;
})(_Component2.Component);

},{"./Component":18}],21:[function(require,module,exports){
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

},{"./Component":18}],22:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.IceAffinityComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var IceAffinityComponent = exports.IceAffinityComponent = (function (_Component) {
    _inherits(IceAffinityComponent, _Component);

    function IceAffinityComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, IceAffinityComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(IceAffinityComponent).call(this));

        _this.affinity = 'ice';
        return _this;
    }

    return IceAffinityComponent;
})(_Component2.Component);

},{"./Component":18}],23:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.InputComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

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
        _this.game = new _Game.Game();
        _this.map = _this.game.getMap();
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
                            console.log('result', result);
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
                    case ROT.VK_PERIOD:
                        resolve(true);
                        break;
                    case ROT.VK_J:
                        _this4.directionPressed({ x: 0, y: 1 }).then(function () {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_K:
                        _this4.directionPressed({ x: 0, y: -1 }).then(function () {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_H:
                        _this4.directionPressed({ x: -1, y: 0 }).then(function () {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_L:
                        _this4.directionPressed({ x: 1, y: 0 }).then(function () {
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_1:
                        _this4.parent.sendEvent('attemptAbilityFirebolt', {}).then(function (result) {
                            console.log('result', result);
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    case ROT.VK_2:
                        _this4.parent.sendEvent('attemptAbilityIceLance', {}).then(function (result) {
                            console.log('result', result);
                            resolve(true);
                        }).catch(function () {
                            resolve(false);
                        });
                        break;
                    default:
                        console.debug('keyCode not matched', event.getKeyCode());
                        reject();
                        break;
                }
            });
        }
    }, {
        key: 'directionPressed',
        value: function directionPressed(direction) {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var newPosition = _this5.getPositionAfterDirection(direction);
                var entity = _this5.map.getEntityAt(newPosition.x, newPosition.y);
                if (entity) {
                    _this5.parent.sendEvent('attemptMeleeAttack', direction).then(function () {
                        resolve();
                    }).catch(function () {
                        reject();
                    });
                } else {
                    _this5.parent.sendEvent('attemptMove', direction).then(function () {
                        resolve();
                    }).catch(function () {
                        reject();
                    });
                }
            });
        }
    }, {
        key: 'getPositionAfterDirection',
        value: function getPositionAfterDirection(direction) {
            var positionComponent = this.parent.getComponent('PositionComponent');
            return {
                x: positionComponent.getX() + direction.x,
                y: positionComponent.getY() + direction.y
            };
        }
    }]);

    return InputComponent;
})(_Component2.Component);

},{"../Game":2,"../KeyboardEventType":7,"./Component":18}],24:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MeleeAttackComponent = undefined;

var _Game = require('../Game');

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var MeleeAttackComponent = exports.MeleeAttackComponent = (function (_Component) {
    _inherits(MeleeAttackComponent, _Component);

    function MeleeAttackComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, MeleeAttackComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(MeleeAttackComponent).call(this));

        var game = new _Game.Game();
        _this.map = game.getMap();
        return _this;
    }

    _createClass(MeleeAttackComponent, [{
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('attemptMeleeAttack', this.attemptMeleeAttack.bind(this));
        }
    }, {
        key: 'attemptMeleeAttack',
        value: function attemptMeleeAttack(direction) {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var positionComponent = _this2.parent.getComponent('PositionComponent');
                var target = _this2.map.getEntityAt(positionComponent.getX() + direction.x, positionComponent.getY() + direction.y);
                if (!target) {
                    reject();
                }
                target.kill().then(resolve);
                console.log('killed', target);
            });
        }
    }]);

    return MeleeAttackComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":18}],25:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PlayerComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var PlayerComponent = exports.PlayerComponent = (function (_Component) {
  _inherits(PlayerComponent, _Component);

  function PlayerComponent() {
    _classCallCheck(this, PlayerComponent);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(PlayerComponent).apply(this, arguments));
  }

  return PlayerComponent;
})(_Component2.Component);

},{"./Component":18}],26:[function(require,module,exports){
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
        key: 'distanceTo',
        value: function distanceTo(x, y) {
            var dx = Math.abs(x - this.x);
            var dy = Math.abs(y - this.y);
            return dx + dy;
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

},{"../Game":2,"./Component":18}],27:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.SightComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var SightComponent = exports.SightComponent = (function (_Component) {
    _inherits(SightComponent, _Component);

    function SightComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { distance: 5 } : arguments[0];

        _classCallCheck(this, SightComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SightComponent).call(this));

        _this.game = new _Game.Game();
        _this.distance = options.distance;
        _this.visibleCells = {};
        _this.hasSeenCells = {};
        _this.checkedAtTurn = -1;
        return _this;
    }

    _createClass(SightComponent, [{
        key: 'getDistance',
        value: function getDistance() {
            return this.distance;
        }
    }, {
        key: 'getVisibleCells',
        value: function getVisibleCells() {
            this.computeVisibleCells();
            return this.visibleCells;
        }
    }, {
        key: 'canSee',
        value: function canSee(x, y) {
            var positionComponent = this.parent.getComponent('PositionComponent');
            if (positionComponent.distanceTo(x, y) > this.distance) {
                return false;
            }
            return this.isVisible(x, y);
        }
    }, {
        key: 'hasSeen',
        value: function hasSeen(x, y) {
            this.computeVisibleCells();
            return this.hasSeenCells[x + ',' + y] == true;
        }
    }, {
        key: 'getVisibleEntities',
        value: function getVisibleEntities() {
            var _this2 = this;

            var positionComponent = this.parent.getComponent('PositionComponent');
            var map = this.game.getMap();
            return map.getNearbyEntities(positionComponent, this.distance, function (entity) {
                var epos = entity.getComponent('PositionComponent');
                return _this2.isVisible(epos.getX(), epos.getY());
            });
        }
    }, {
        key: 'isVisible',
        value: function isVisible(x, y) {
            this.computeVisibleCells();
            return this.visibleCells[x + ',' + y] === true;
        }
    }, {
        key: 'computeVisibleCells',
        value: function computeVisibleCells() {
            var currentTurn = this.game.getCurrentTurn();
            if (currentTurn === this.checkedAtTurn) {
                return;
            }
            var map = this.game.getMap();
            this.visibleCells = map.getVisibleCells(this.parent, this.distance);
            this.hasSeenCells = Object.assign(this.hasSeenCells, this.visibleCells);
            this.checkedAtTurn = currentTurn;
        }
    }]);

    return SightComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":18}],28:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[28])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvU3Bhd24udHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNnQkk7OztBQUNJLFlBQUksQ0FBQyxJQUFJLEdBQUcsQUFBSSxNQWpCaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQWdCa0IsUUFBUSxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQUFDeEI7S0FBQyxBQUVELEFBQU87Ozs7O0FBQ0gsQUFBTSxtQkFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQ3JCO1NBQUMsQUFFRCxBQUFHOzs7O0FBQ0MsZ0JBQUksQ0FBQyxHQUFHLEFBQUksQUFBSSxVQTNCaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQVEzQixFQW1CMEIsQ0FBQztBQUNuQixBQUFFLEFBQUMsZ0JBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN2QyxBQUFHLEFBQUMscUJBQUMsQUFBRyxJQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsVUFBVSxBQUFDLEVBQUMsQUFBQztBQUN4Qyx3QkFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCx3QkFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3hDLEFBQUUsQUFBQyx3QkFBQyxLQUFLLEFBQUMsRUFBQyxBQUFDO0FBQ1IsK0JBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDdkI7cUJBQUMsQUFDTDtpQkFBQztBQUNELGlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQUFDZjth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QUFBQyxBQUFNLEFBQWEsQUFFOUI7Ozs7Ozs7QUNGUCxNQUFNLENBQUMsTUFBTSxHQUFHO0FBQ1osUUFBSSxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBSGYsSUFBSSxBQUFDLEFBQU0sQUFBUSxFQUdGLENBQUM7QUFDdEIsUUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFDdEI7Q0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7R3VpZH0gZnJvbSAnLi9HdWlkJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0NvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UmFuZG9tV2Fsa0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1JhbmRvbVdhbGtDb21wb25lbnQnO1xuaW1wb3J0IHtBSUZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BSUZhY3Rpb25Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IHtcbiAgICBndWlkOiBzdHJpbmc7XG4gICAgY29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBDb21wb25lbnR9O1xuICAgIGFjdGluZzogYm9vbGVhbjtcblxuICAgIGxpc3RlbmVyczoge1tuYW1lOiBzdHJpbmddOiBhbnlbXX07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ndWlkID0gR3VpZC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXRHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWQ7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnUGxheWVyQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbXBvbmVudE5hbWUgaW4gdGhpcy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gY29tcG9uZW50LmRlc2NyaWJlU3RhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcucmVuZGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dENvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdBSUZhY3Rpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVBSUZhY3Rpb25Db21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBraWxsKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ2tpbGxlZCcpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQUlGYWN0aW9uQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPEFJRmFjdGlvbkNvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnQUlGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5hY3QoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxSYW5kb21XYWxrQ29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5yYW5kb21XYWxrKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUlucHV0Q29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQud2FpdEZvcklucHV0KClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50LnNldFBhcmVudEVudGl0eSh0aGlzKTtcbiAgICAgICAgY29tcG9uZW50LnNldExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgaGFzQ29tcG9uZW50KG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuY29tcG9uZW50c1tuYW1lXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNbbmFtZV07XG4gICAgfVxuXG4gICAgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVycyB8fCBsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFByb21pc2U8VD4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZVNjcmVlbn0gZnJvbSAnLi9HYW1lU2NyZWVuJztcbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcblxuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIHNjcmVlbldpZHRoOiBudW1iZXI7XG4gICAgc2NyZWVuSGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjYW52YXM6IGFueTtcblxuICAgIGFjdGl2ZVNjcmVlbjogR2FtZVNjcmVlbjtcbiAgICBtYXA6IE1hcDtcblxuICAgIGRpc3BsYXk6IGFueTtcbiAgICBzY2hlZHVsZXI6IGFueTtcbiAgICBlbmdpbmU6IGFueTtcblxuICAgIHR1cm5Db3VudDogbnVtYmVyO1xuICAgIHR1cm5UaW1lOiBudW1iZXI7XG4gICAgbWluVHVyblRpbWU6IG51bWJlcjtcblxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBHYW1lO1xuXG4gICAgbGlzdGVuZXJzOiB7W25hbWU6IHN0cmluZ106IGFueVtdfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoR2FtZS5pbnN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIEdhbWUuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgR2FtZS5pbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgICAgIHRoaXMudHVybkNvdW50ID0gMDtcbiAgICAgICAgdGhpcy50dXJuVGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG4gICAgICAgIHRoaXMubWluVHVyblRpbWUgPSAxMDA7XG4gICAgICAgIHdpbmRvd1snR2FtZSddID0gdGhpcztcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZGlzcGxheSA9IG5ldyBST1QuRGlzcGxheSh7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5zY3JlZW5XaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRpc3BsYXkuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFJPVC5TY2hlZHVsZXIuU2ltcGxlKCk7XG4gICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZCh7XG4gICAgICAgICAgICBhY3Q6ICgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnR1cm5Db3VudCsrO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ3R1cm4nLCB0aGlzLnR1cm5Db3VudCk7XG4gICAgICAgICAgICB9fSwgdHJ1ZSk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IFJPVC5FbmdpbmUodGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgIHRoaXMubWFwID0gbmV3IE1hcCh0aGlzLnNjcmVlbldpZHRoLCB0aGlzLnNjcmVlbkhlaWdodCAtIDEpO1xuICAgICAgICB0aGlzLm1hcC5nZW5lcmF0ZSgpO1xuXG4gICAgICAgIHZhciBnYW1lU2NyZWVuID0gbmV3IEdhbWVTY3JlZW4odGhpcy5kaXNwbGF5LCB0aGlzLnNjcmVlbldpZHRoLCB0aGlzLnNjcmVlbkhlaWdodCwgdGhpcy5tYXApO1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbiA9IGdhbWVTY3JlZW47XG5cbiAgICAgICAgY29uc3QgcGxheWVyID0gZ2FtZVNjcmVlbi5nZXRQbGF5ZXIoKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb24gPSA8UG9zaXRpb25Db21wb25lbnQ+cGxheWVyLmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICB0aGlzLm1hcC5hZGRFbmVtaWVzKHtcbiAgICAgICAgICAgIHg6IHBvc2l0aW9uLmdldFgoKSxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uLmdldFkoKSxcbiAgICAgICAgICAgIHI6IDVcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5iaW5kSW5wdXRIYW5kbGluZygpO1xuXG4gICAgICAgIHRoaXMuZW5naW5lLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5hZGRMaXN0ZW5lcignZW50aXR5S2lsbGVkJywgdGhpcy5lbnRpdHlEZWF0aExpc3RlbmVyLmJpbmQodGhpcykpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlEZWF0aExpc3RlbmVyKGVudGl0eTogRW50aXR5KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ1BsYXllckNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ1RoZSBwbGF5ZXIgaXMgZGVhZCEnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIHRoaXMubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRFdmVudChldmVudE5hbWU6IHN0cmluZywgY29udmVydGVyOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZElucHV0SGFuZGxpbmcoKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnRzVG9TY3JlZW4gPSAoZXZlbnROYW1lLCBjb252ZXJ0ZXIpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU2NyZWVuICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLmhhbmRsZUlucHV0KGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcblxuICAgICAgICBiaW5kRXZlbnRzVG9TY3JlZW4oJ2tleWRvd24nLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbignY2xpY2snLCB0aGlzLmNvbnZlcnRNb3VzZUV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRLZXlFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBLZXlib2FyZEV2ZW50ID0+IHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5QUkVTUztcbiAgICAgICAgaWYgKG5hbWUgPT09ICdrZXlkb3duJykge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleWJvYXJkRXZlbnQoXG4gICAgICAgICAgICBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICAgICAgZXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgZXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgZXZlbnQubWV0YUtleVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydE1vdXNlRXZlbnQgPSAobmFtZTogc3RyaW5nLCBldmVudDogYW55KTogTW91c2VDbGlja0V2ZW50ID0+IHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5kaXNwbGF5LmV2ZW50VG9Qb3NpdGlvbihldmVudCk7XG5cbiAgICAgICAgdmFyIGJ1dHRvblR5cGU6IE1vdXNlQnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5MRUZUO1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDIpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuTUlERExFO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LndpY2ggPT09IDMpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuUklHSFRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IE1vdXNlQ2xpY2tFdmVudChcbiAgICAgICAgICAgIHBvc2l0aW9uWzBdLFxuICAgICAgICAgICAgcG9zaXRpb25bMV0sXG4gICAgICAgICAgICBidXR0b25UeXBlXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5sb2NrRW5naW5lKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS51bmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdBY3RvckNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbnRpdHksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZW5kRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TWFwKCk6IE1hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q3VycmVudFR1cm4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5Db3VudDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5pbXBvcnQgKiBhcyBTcGF3biBmcm9tICcuL1NwYXduJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7UGxheWVyQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge0ZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUZpcmVib2x0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUljZUxhbmNlQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2NyZWVuIHtcbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgbWFwOiBNYXA7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBwbGF5ZXI6IEVudGl0eTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIG51bGxUaWxlOiBUaWxlO1xuXG4gICAgY29uc3RydWN0b3IoZGlzcGxheTogYW55LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbWFwOiBNYXApIHtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICAgICAgdGhpcy5udWxsVGlsZSA9IFRpbGVzLmNyZWF0ZS5udWxsVGlsZSgpO1xuXG4gICAgICAgIHRoaXMucGxheWVyID0gU3Bhd24uZW50aXR5LlBsYXllcigpO1xuXG4gICAgICAgIHRoaXMubWFwLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24odGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5hZGRFbnRpdHkodGhpcy5wbGF5ZXIpO1xuICAgIH1cblxuICAgIGdldFBsYXllcigpOiBFbnRpdHkge1xuICAgICAgICByZXR1cm4gdGhpcy5wbGF5ZXI7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IGIueDsgeCA8IGIueCArIGIudzsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gYi55OyB5IDwgYi55ICsgYi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2x5cGg6IEdseXBoID0gdGhpcy5tYXAuZ2V0VGlsZSh4LCB5KS5nZXRHbHlwaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTWFwR2x5cGgoZ2x5cGgsIHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXAubWFwRW50aXRpZXModGhpcy5yZW5kZXJFbnRpdHkpO1xuICAgIH1cblxuICAgIGhhbmRsZUlucHV0KGV2ZW50RGF0YTogYW55KSB7XG4gICAgICAgIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdNb3VzZUNsaWNrRXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1vdXNlQ2xpY2tFdmVudCg8TW91c2VDbGlja0V2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnREYXRhLmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5Ym9hcmRFdmVudCg8S2V5Ym9hcmRFdmVudD5ldmVudERhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VDbGlja0V2ZW50KGV2ZW50OiBNb3VzZUNsaWNrRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmdldFgoKSA9PT0gLTEgfHwgZXZlbnQuZ2V0WSgpID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xpY2tlZCBvdXRzaWRlIG9mIGNhbnZhcycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2NsaWNrZWQnLCBldmVudC5nZXRYKCksIGV2ZW50LmdldFkoKSwgdGlsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgfVxuXG4gICAgZ2V0TWFwKCk6IE1hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbmRlcmFibGVCb3VuZGFyeSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgdzogdGhpcy5tYXAuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGg6IHRoaXMubWFwLmdldEhlaWdodCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1JlbmRlcmFibGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHJldHVybiB4ID49IGIueCAmJiB4IDwgYi54ICsgYi53ICYmIHkgPj0gYi55ICYmIHkgPCBiLnkgKyBiLmg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJNYXBHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcbiAgICAgICAgY29uc3Qgc2lnaHRDb21wb25lbnQ6IFNpZ2h0Q29tcG9uZW50ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGxheWVyLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcblxuICAgICAgICBpZiAoc2lnaHRDb21wb25lbnQuY2FuU2VlKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgZ2x5cGguYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaWdodENvbXBvbmVudC5oYXNTZWVuKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgJyMxMTEnXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZzogR2x5cGggPSB0aGlzLm51bGxUaWxlLmdldEdseXBoKCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZy5jaGFyLFxuICAgICAgICAgICAgICAgIGcuZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuICAgICAgICBjb25zdCBzaWdodENvbXBvbmVudDogU2lnaHRDb21wb25lbnQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuXG4gICAgICAgIGlmIChzaWdodENvbXBvbmVudC5jYW5TZWUoeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnbHlwaC5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJFbnRpdHkgPSAoZW50aXR5OiBFbnRpdHkpID0+IHtcbiAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICB2YXIgZ2x5cGhDb21wb25lbnQ6IEdseXBoQ29tcG9uZW50ID0gPEdseXBoQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0dseXBoQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gcG9zaXRpb25Db21wb25lbnQuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGdseXBoID0gZ2x5cGhDb21wb25lbnQuZ2V0R2x5cGgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNSZW5kZXJhYmxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgR2x5cGgge1xuICAgIHB1YmxpYyBjaGFyOiBzdHJpbmc7XG4gICAgcHVibGljIGZvcmVncm91bmQ6IHN0cmluZztcbiAgICBwdWJsaWMgYmFja2dyb3VuZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2hhcjogc3RyaW5nLCBmb3JlZ3JvdW5kOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNoYXIgPSBjaGFyO1xuICAgICAgICB0aGlzLmZvcmVncm91bmQgPSBmb3JlZ3JvdW5kO1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIEd1aWQge1xuICAgIHN0YXRpYyBnZW5lcmF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcblxuZXhwb3J0IGNsYXNzIEtleWJvYXJkRXZlbnQge1xuICAgIGtleUNvZGU6IG51bWJlcjtcbiAgICBhbHRLZXk6IGJvb2xlYW47XG4gICAgY3RybEtleTogYm9vbGVhbjtcbiAgICBzaGlmdEtleTogYm9vbGVhbjtcbiAgICBtZXRhS2V5OiBib29sZWFuO1xuICAgIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBLZXlib2FyZEV2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGtleUNvZGU6IG51bWJlciwgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSwgYWx0S2V5OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgbWV0YUtleTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmtleUNvZGUgPSBrZXlDb2RlO1xuICAgICAgICB0aGlzLmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcbiAgICAgICAgdGhpcy5hbHRLZXkgPSBhbHRLZXk7XG4gICAgICAgIHRoaXMuY3RybEtleSA9IGN0cmxLZXk7XG4gICAgICAgIHRoaXMuc2hpZnRLZXkgPSBzaGlmdEtleTtcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0gbWV0YUtleTtcbiAgICB9XG5cbiAgICBnZXRFdmVudFR5cGUoKTogS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudFR5cGU7XG4gICAgfVxuXG4gICAgZ2V0S2V5Q29kZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlDb2RlO1xuICAgIH1cblxuICAgIGhhc0FsdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx0S2V5O1xuICAgIH1cblxuICAgIGhhc1NoaWZ0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGlmdEtleTtcbiAgICB9XG5cbiAgICBoYXNDdHJsS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdHJsS2V5O1xuICAgIH1cblxuICAgIGhhc01ldGFLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFLZXk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgIERPV04sXG4gICAgVVAsXG4gICAgUFJFU1Ncbn07XG4iLCJkZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5pbXBvcnQgKiBhcyBTcGF3biBmcm9tICcuL1NwYXduJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGaXJlQWZmaW5pdHlDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GaXJlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtJY2VBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ljZUFmZmluaXR5Q29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBNYXAge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgdGlsZXM6IFRpbGVbXVtdO1xuXG4gICAgZW50aXRpZXM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXR5fTtcbiAgICBtYXhFbmVtaWVzOiBudW1iZXI7XG5cbiAgICBmb3Y6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYXhFbmVtaWVzOiBudW1iZXIgPSAxMCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1heEVuZW1pZXMgPSBtYXhFbmVtaWVzO1xuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcblxuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2VudGl0eU1vdmVkJywgdGhpcy5lbnRpdHlNb3ZlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdlbnRpdHlLaWxsZWQnLCB0aGlzLmVudGl0eUtpbGxlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdjYW5Nb3ZlVG8nLCB0aGlzLmNhbk1vdmVUby5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXR1cEZvdigpIHtcbiAgICAgICAgdGhpcy5mb3YgPSBuZXcgUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcoXG4gICAgICAgICAgICAoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aWxlLmJsb2Nrc0xpZ2h0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge3RvcG9sb2d5OiA0fVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscyhlbnRpdHk6IEVudGl0eSwgZGlzdGFuY2U6IG51bWJlcik6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIGxldCB2aXNpYmxlQ2VsbHM6IGFueSA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdGhpcy5mb3YuY29tcHV0ZShcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAgICAgKHgsIHksIHJhZGl1cywgdmlzaWJpbGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHZpc2libGVDZWxsc1t4ICsgXCIsXCIgKyB5XSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZpc2libGVDZWxscztcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIGdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcbiAgICB9XG5cbiAgICBnZXRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmdlbmVyYXRlTGV2ZWwoKTtcbiAgICAgICAgdGhpcy5zZXR1cEZvdigpO1xuXG4gICAgfVxuXG4gICAgYWRkRW5lbWllcyhhdm9pZDoge3g6IG51bWJlciwgeTogbnVtYmVyLCByOiBudW1iZXJ9ID0ge3g6IC0xLCB5OiAtMSwgcjogLTF9KSB7XG4gICAgICAgIGNvbnN0IGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBsZXQgZW5lbXk6IEVudGl0eTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgZW5lbXkgPSBTcGF3bi5lbnRpdHkuRmlyZUltcCgpO1xuICAgICAgICAgICAgdGhpcy5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVuZW15LCBhdm9pZCk7XG4gICAgICAgICAgICBnLmFkZEVudGl0eShlbmVteSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF4RW5lbWllczsgaSsrKSB7XG4gICAgICAgICAgICBlbmVteSA9IFNwYXduLmVudGl0eS5JY2VJbXAoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSwgYXZvaWQpO1xuICAgICAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbnRpdHk6IEVudGl0eSwgYXZvaWQ6IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcjogbnVtYmVyfSA9IHt4OiAtMSwgeTogLTEsIHI6IC0xfSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1heFRyaWVzID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogMTA7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgbGV0IHggPSAtMTtcbiAgICAgICAgbGV0IHkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiBpIDwgbWF4VHJpZXMpIHtcbiAgICAgICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAoYXZvaWQueCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHggLSBhdm9pZC54KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHkgLSBhdm9pZC55KTtcblxuICAgICAgICAgICAgICAgIGlmIChkeCArIGR5IDw9IGF2b2lkLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F2b2lkaW5nICcsIGR4ICsgZHkpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0VGlsZSh4LCB5KS5pc1dhbGthYmxlKCkgJiYgIXRoaXMucG9zaXRpb25IYXNFbnRpdHkoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gZnJlZSBzcG90IGZvdW5kIGZvcicsIGVudGl0eSk7XG4gICAgICAgICAgICB0aHJvdyAnTm8gZnJlZSBzcG90IGZvdW5kIGZvciBhIG5ldyBlbnRpdHknO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgICAgICB0aGlzLmdldFRpbGUoeCwgeSkuc2V0RW50aXR5R3VpZChlbnRpdHkuZ2V0R3VpZCgpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZ2FtZS5hZGRFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IGVudGl0eTtcbiAgICB9XG5cbiAgICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGdhbWUucmVtb3ZlRW50aXR5KGVudGl0eSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBudWxsXG4gICAgICAgIHRoaXMuZ2V0VGlsZShwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCksIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgfVxuXG4gICAgcG9zaXRpb25IYXNFbnRpdHkoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIHZhciBlbnRpdHlHdWlkID0gdGlsZS5nZXRFbnRpdHlHdWlkKCk7XG4gICAgICAgIHJldHVybiBlbnRpdHlHdWlkICE9PSAnJztcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlBdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IEVudGl0eSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdGllc1tlbnRpdHlHdWlkXTtcbiAgICB9XG5cbiAgICBnZXROZWFyYnlFbnRpdGllcyhvcmlnaW5Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50LCByYWRpdXM6IG51bWJlciwgZmlsdGVyOiAoZW50aXR5OiBFbnRpdHkpID0+IGJvb2xlYW4gPSAoZSkgPT4ge3JldHVybiB0cnVlO30pOiBFbnRpdHlbXSB7XG4gICAgICAgIGxldCBlbnRpdGllcyA9IFtdO1xuICAgICAgICB0aGlzLm1hcEVudGl0aWVzKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGlmICghZmlsdGVyKGVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uQ29tcG9uZW50ID09PSBvcmlnaW5Db21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHBvc2l0aW9uQ29tcG9uZW50LmRpc3RhbmNlVG8ob3JpZ2luQ29tcG9uZW50LmdldFgoKSwgb3JpZ2luQ29tcG9uZW50LmdldFkoKSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPD0gcmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMucHVzaCh7ZGlzdGFuY2U6IGRpc3RhbmNlLCBlbnRpdHk6IGVudGl0eX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMgPSBlbnRpdGllcy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuZW50aXR5OyB9KTtcbiAgICAgICAgcmV0dXJuIGVudGl0aWVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVMZXZlbCgpOiBUaWxlW11bXSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdLnB1c2goVGlsZXMuY3JlYXRlLm51bGxUaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG5ldyBST1QuTWFwLkNlbGx1bGFyKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgZ2VuZXJhdG9yLnJhbmRvbWl6ZSgwLjUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgoeCwgeSwgdikgPT4ge1xuICAgICAgICAgICAgaWYgKHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS5mbG9vclRpbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF1beV0gPSBUaWxlcy5jcmVhdGUud2FsbFRpbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW50aXR5TW92ZWRMaXN0ZW5lcihkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBkYXRhLm9sZFBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGRhdGEuZW50aXR5O1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKG9sZFBvc2l0aW9uLngsIG9sZFBvc2l0aW9uLnkpLnNldEVudGl0eUd1aWQoJycpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlLaWxsZWRMaXN0ZW5lcihkYXRhOiBFbnRpdHkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVudGl0eShkYXRhKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuTW92ZVRvKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBhY2M6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICAgICAgICBpZiAodGlsZS5pc1dhbGthYmxlKCkgJiYgdGlsZS5nZXRFbnRpdHlHdWlkKCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwb3NpdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChwb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIE1vdXNlQnV0dG9uVHlwZSB7XG4gICAgTEVGVCxcbiAgICBNSURETEUsXG4gICAgUklHSFRcbn07XG5cbiIsImltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBNb3VzZUNsaWNrRXZlbnQge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBNb3VzZUNsaWNrRXZlbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGJ1dHRvbjogTW91c2VCdXR0b25UeXBlKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMuYnV0dG9uID0gYnV0dG9uO1xuICAgIH1cblxuICAgIGdldFgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICB9XG5cbiAgICBnZXRZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgfVxuXG4gICAgZ2V0QnV0dG9uVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7UGxheWVyQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGaXJlQWZmaW5pdHlDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GaXJlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtJY2VBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ljZUFmZmluaXR5Q29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCc7XG5cbmV4cG9ydCBtb2R1bGUgZW50aXR5IHtcbiAgICBleHBvcnQgZnVuY3Rpb24gRmlyZUltcCgpIHtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2YnLCAncmVkJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFJRmFjdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGaXJlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgTWVsZWVBdHRhY2tDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMSxcbiAgICAgICAgICAgIGljZTogMCxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcblxuICAgICAgICByZXR1cm4gZW5lbXk7XG4gICAgfVxuXG4gICAgZXhwb3J0IGZ1bmN0aW9uIEljZUltcCgpIHtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2knLCAnY3lhbicsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBSUZhY3Rpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgTWVsZWVBdHRhY2tDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgSWNlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMCxcbiAgICAgICAgICAgIGljZTogMSxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGVuZW15O1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IFBsYXllckNvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAnd2hpdGUnLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBJbnB1dENvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoe1xuICAgICAgICAgICAgZGlzdGFuY2U6IDUwXG4gICAgICAgIH0pKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCh7XG4gICAgICAgICAgICBoZXJvOiAxLFxuICAgICAgICAgICAgaWNlOiAtMSxcbiAgICAgICAgICAgIGZpcmU6IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBYmlsaXR5SWNlTGFuY2VDb21wb25lbnQoKSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IE1lbGVlQXR0YWNrQ29tcG9uZW50KCkpO1xuXG4gICAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcbiAgICBwcml2YXRlIGVudGl0eUd1aWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHdhbGthYmxlOiBib29sZWFuO1xuICAgIHByaXZhdGUgYmxvY2tpbmdMaWdodDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4gPSB0cnVlLCBibG9ja2luZ0xpZ2h0OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG4gICAgICAgIHRoaXMuYmxvY2tpbmdMaWdodCA9IGJsb2NraW5nTGlnaHQ7XG5cbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gJyc7XG4gICAgfVxuXG4gICAgaXNXYWxrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2FibGU7XG4gICAgfVxuXG4gICAgYmxvY2tzTGlnaHQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NraW5nTGlnaHQ7XG4gICAgfVxuXG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cblxuICAgIGdldEVudGl0eUd1aWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5R3VpZDtcbiAgICB9XG5cbiAgICBzZXRFbnRpdHlHdWlkKGVudGl0eUd1aWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuXG5leHBvcnQgbW9kdWxlIGNyZWF0ZSB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIG51bGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcgJywgJ2JsYWNrJywgJyMwMDAnKSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZsb29yVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnLicsICcjMjIyJywgJyM0NDQnKSwgdHJ1ZSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FsbFRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJyMnLCAnI2NjYycsICcjNDQ0JyksIGZhbHNlLCB0cnVlKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFJRmFjdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdGFyZ2V0UG9zOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0UG9zID0gbnVsbDtcbiAgICB9XG5cbiAgICBhY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2lnaHQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgZmFjdGlvbiA9IDxGYWN0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IHNpZ2h0LmdldFZpc2libGVFbnRpdGllcygpO1xuXG4gICAgICAgICAgICBsZXQgZmVhcmluZzogRW50aXR5ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBlbmVteTogRW50aXR5ID0gbnVsbDtcblxuICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWYgPSA8RmFjdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGZhY3Rpb24uaXNFbmVteShlZi5nZXRTZWxmRmFjdGlvbigpKSkge1xuICAgICAgICAgICAgICAgICAgICBlbmVteSA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZlYXJpbmcgPT09IG51bGwgJiYgZmFjdGlvbi5pc0ZlYXJpbmcoZWYuZ2V0U2VsZkZhY3Rpb24oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhcmluZyA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGVuZW15ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbmVteS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHQuZ2V0WCgpLFxuICAgICAgICAgICAgICAgICAgICB5OiB0LmdldFkoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldFBvcyAhPT0gbnVsbCAmJiAodGhpcy50YXJnZXRQb3MueCAhPT0gcG9zaXRpb24uZ2V0WCgpIHx8IHRoaXMudGFyZ2V0UG9zLnkgIT09IHBvc2l0aW9uLmdldFkoKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG93YXJkc1RhcmdldChwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmRvbVdhbGsoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdvVG93YXJkc1RhcmdldChwb3NpdGlvbjogUG9zaXRpb25Db21wb25lbnQpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh0aGlzLnRhcmdldFBvcy54IC0gcG9zaXRpb24uZ2V0WCgpKTtcbiAgICAgICAgICAgIHZhciBkeSA9IE1hdGguYWJzKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpO1xuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbjogYW55O1xuXG4gICAgICAgICAgICBpZiAoZHggKyBkeSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogZHggPT0gMCA/IDAgOiBNYXRoLmZsb29yKCh0aGlzLnRhcmdldFBvcy54IC0gcG9zaXRpb24uZ2V0WCgpKSAvIGR4KSxcbiAgICAgICAgICAgICAgICAgICAgeTogZHkgPT0gMCA/IDAgOiBNYXRoLmZsb29yKCh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKSAvIGR5KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RyeWluZyB0byBhdHRhY2shJywgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGVtcHRBdHRhY2soZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgICAgICAgICAgfSBlbHNlIGlmIChkeCA+IGR5KSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKSAvIGR5XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdEF0dGFjayhkaXJlY3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhdHRlbXB0TW92ZShkaXJlY3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJhbmRvbVdhbGsoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnM6IGFueSA9IFtcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMX0sXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IC0xfSxcbiAgICAgICAgICAgICAgICB7eDogMSwgeTogMH0sXG4gICAgICAgICAgICAgICAge3g6IC0xLCB5OiAwfSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXG4gICAgICAgICAgICB2YXIgdGVzdERpcmVjdGlvbiA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0RGlyZWN0aW9uKGRpcmVjdGlvbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBYmlsaXR5RmlyZWJvbHRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJhbmdlOiBudW1iZXI7XG4gICAgY29vbGRvd246IG51bWJlcjtcbiAgICBsYXN0VXNlZDogbnVtYmVyO1xuICAgIGRhbWFnZVR5cGU6IHN0cmluZztcblxuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMucmFuZ2UgPSA1O1xuICAgICAgICB0aGlzLmNvb2xkb3duID0gMTAwO1xuICAgICAgICB0aGlzLmxhc3RVc2VkID0gLXRoaXMuY29vbGRvd247XG4gICAgICAgIHRoaXMuZGFtYWdlVHlwZSA9ICdmaXJlJztcbiAgICB9XG5cbiAgICBkZXNjcmliZVN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUdXJuID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgIGNvbnN0IGNvb2xkb3duID0gKHRoaXMubGFzdFVzZWQgKyB0aGlzLmNvb2xkb3duKSAtIGN1cnJlbnRUdXJuO1xuICAgICAgICByZXR1cm4gJ0ZpcmVib2x0LCBjb29sZG93bjogJyArIE1hdGgubWF4KDAsIGNvb2xkb3duKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0QWJpbGl0eUZpcmVib2x0JywgdGhpcy51c2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdjb25zdW1lRmlyZScsIHRoaXMuY29uc3VtZUZpcmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaXNBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93biA8PSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICB9XG5cbiAgICBjb25zdW1lRmlyZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkIC09IHRoaXMuY29vbGRvd247XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVzZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMocG9zaXRpb25Db21wb25lbnQsIHRoaXMucmFuZ2UpO1xuXG4gICAgICAgICAgICBpZiAoZW50aXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGVudGl0aWVzLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQuaGFzQ29tcG9uZW50KCdJY2VBZmZpbml0eUNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnY29uc3VtZUljZScpO1xuICAgICAgICAgICAgdGFyZ2V0LmtpbGwoKTtcblxuICAgICAgICAgICAgcmVzb2x2ZSh0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcmFuZ2U6IG51bWJlcjtcbiAgICBjb29sZG93bjogbnVtYmVyO1xuICAgIGxhc3RVc2VkOiBudW1iZXI7XG4gICAgZGFtYWdlVHlwZTogc3RyaW5nO1xuXG4gICAgZ2FtZTogR2FtZTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5yYW5nZSA9IDU7XG4gICAgICAgIHRoaXMuY29vbGRvd24gPSAxMDA7XG4gICAgICAgIHRoaXMubGFzdFVzZWQgPSAtdGhpcy5jb29sZG93bjtcbiAgICAgICAgdGhpcy5kYW1hZ2VUeXBlID0gJ2ljZSc7XG4gICAgfVxuXG4gICAgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBjb25zdCBjb29sZG93biA9ICh0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93bikgLSBjdXJyZW50VHVybjtcbiAgICAgICAgcmV0dXJuICdJY2UgTGFuY2UsIGNvb2xkb3duOiAnICsgTWF0aC5tYXgoMCwgY29vbGRvd24pO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRBYmlsaXR5SWNlTGFuY2UnLCB0aGlzLnVzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2NvbnN1bWVJY2UnLCB0aGlzLmNvbnN1bWVJY2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaXNBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93biA8PSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICB9XG5cbiAgICBjb25zdW1lSWNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgLT0gdGhpcy5jb29sZG93bjtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0F2YWlsYWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IG1hcC5nZXROZWFyYnlFbnRpdGllcyhcbiAgICAgICAgICAgICAgICBwb3NpdGlvbkNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlLFxuICAgICAgICAgICAgICAgIChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eS5oYXNDb21wb25lbnQoJ0ZpcmVBZmZpbml0eUNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChlbnRpdGllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gZW50aXRpZXMgbmVhcmJ5Jyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGVudGl0aWVzLnBvcCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2NvbnN1bWVGaXJlJyk7XG4gICAgICAgICAgICB0YXJnZXQua2lsbCgpO1xuXG4gICAgICAgICAgICByZXNvbHZlKHRhcmdldCk7XG5cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQWN0b3JDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FjdCcpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgICBwcm90ZWN0ZWQgcGFyZW50OiBFbnRpdHk7XG5cbiAgICBwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQYXJlbnRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBlbnRpdHk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldExpc3RlbmVycygpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBGYWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBmaXJlOiBudW1iZXI7XG4gICAgaWNlOiBudW1iZXI7XG4gICAgaGVybzogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2ZpcmU6IG51bWJlciwgaWNlOiBudW1iZXIsIGhlcm86IG51bWJlcn0gPSB7ZmlyZTogMCwgaWNlOiAwLCBoZXJvOiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZpcmUgPSBvcHRpb25zLmZpcmU7XG4gICAgICAgIHRoaXMuaWNlID0gb3B0aW9ucy5pY2U7XG4gICAgICAgIHRoaXMuaGVybyA9IG9wdGlvbnMuaGVybztcbiAgICB9XG5cbiAgICBpc0ZyaWVuZGx5KGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNGZWFyaW5nKGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNFbmVteShmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRTZWxmRmFjdGlvbigpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5pY2UgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWNlJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZpcmUgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmlyZSc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oZXJvID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2hlcm8nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRmlyZUFmZmluaXR5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBhZmZpbml0eTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFmZmluaXR5ID0gJ2ZpcmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4uL0dseXBoJztcblxuZXhwb3J0IGNsYXNzIEdseXBoQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2x5cGggPSBvcHRpb25zLmdseXBoO1xuICAgIH1cblxuICAgIGdldEdseXBoKCk6IEdseXBoIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2x5cGg7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEljZUFmZmluaXR5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBhZmZpbml0eTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFmZmluaXR5ID0gJ2ljZSc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHdhaXRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIHJlc29sdmU6IGFueTtcbiAgICBwcml2YXRlIHJlamVjdDogYW55O1xuXG4gICAgZ2FtZTogR2FtZTtcbiAgICBtYXA6IE1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMubWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHdhaXRGb3JJbnB1dCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdGluZykge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5nZXRFdmVudFR5cGUoKSA9PT0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd24oZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGtleWJvYXJkIGlucHV0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5wdXQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQuZ2V0S2V5Q29kZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfUEVSSU9EOlxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19KOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IDAsIHk6IDF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19LOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IDAsIHk6IC0xfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAtMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0w6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLXzE6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdEFiaWxpdHlGaXJlYm9sdCcsIHt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS18yOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRBYmlsaXR5SWNlTGFuY2UnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zygna2V5Q29kZSBub3QgbWF0Y2hlZCcsIGV2ZW50LmdldEtleUNvZGUoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXJlY3Rpb25QcmVzc2VkKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkFmdGVyRGlyZWN0aW9uKGRpcmVjdGlvbik7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLm1hcC5nZXRFbnRpdHlBdChuZXdQb3NpdGlvbi54LCBuZXdQb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmIChlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb25BZnRlckRpcmVjdGlvbihkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcG9zaXRpb25Db21wb25lbnQuZ2V0WCgpICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgICB5OiBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkgKyBkaXJlY3Rpb24ueVxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1lbGVlQXR0YWNrQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBtYXA6IE1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBnYW1lLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIHRoaXMuYXR0ZW1wdE1lbGVlQXR0YWNrLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNZWxlZUF0dGFjayhkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm1hcC5nZXRFbnRpdHlBdChwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCkgKyBkaXJlY3Rpb24ueCwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpICsgZGlyZWN0aW9uLnkpO1xuXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQua2lsbCgpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdraWxsZWQnLCB0YXJnZXQpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHg6IG51bWJlcjtcbiAgICBwcml2YXRlIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0gPSB7eDogMCwgeTogMH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy54ID0gb3B0aW9ucy54O1xuICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnk7XG4gICAgfVxuXG4gICAgZ2V0UG9zaXRpb24oKToge3g6IG51bWJlciwgeTogbnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9O1xuICAgIH1cblxuICAgIGdldFgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICB9XG5cbiAgICBnZXRZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0TW92ZScsIHRoaXMuYXR0ZW1wdE1vdmVMaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhdHRlbXB0TW92ZUxpc3RlbmVyKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLnggKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnkgKyBkaXJlY3Rpb24ueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGcuc2VuZEV2ZW50KCdjYW5Nb3ZlVG8nLCBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlKGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3RhbmNlVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHggLSB0aGlzLngpO1xuICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHkgLSB0aGlzLnkpO1xuXG4gICAgICAgIHJldHVybiBkeCArIGR5O1xuICAgIH1cblxuICAgIG1vdmUoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KSB7XG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgICAgIHk6IHRoaXMueVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnggKz0gZGlyZWN0aW9uLng7XG4gICAgICAgIHRoaXMueSArPSBkaXJlY3Rpb24ueTtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5TW92ZWQnLCB7ZW50aXR5OiB0aGlzLnBhcmVudCwgb2xkUG9zaXRpb246IG9sZFBvc2l0aW9ufSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBTaWdodENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgZGlzdGFuY2U6IG51bWJlcjtcbiAgICB2aXNpYmxlQ2VsbHM6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIGhhc1NlZW5DZWxsczoge1twb3M6IHN0cmluZ106IGJvb2xlYW59O1xuXG4gICAgY2hlY2tlZEF0VHVybjogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2Rpc3RhbmNlOiBudW1iZXJ9ID0ge2Rpc3RhbmNlOiA1fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLmRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5oYXNTZWVuQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gLTE7XG4gICAgfVxuXG4gICAgZ2V0RGlzdGFuY2UoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUNlbGxzKCk6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpYmxlQ2VsbHM7XG4gICAgfVxuXG4gICAgY2FuU2VlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGlmIChwb3NpdGlvbkNvbXBvbmVudC5kaXN0YW5jZVRvKHgsIHkpID4gdGhpcy5kaXN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZSh4LCB5KTtcbiAgICB9XG5cbiAgICBoYXNTZWVuKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTZWVuQ2VsbHNbeCArICcsJyArIHldID09IHRydWU7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUVudGl0aWVzKCk6IEVudGl0eVtdIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29uc3QgbWFwOiBNYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgIHJldHVybiBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMoXG4gICAgICAgICAgICBwb3NpdGlvbkNvbXBvbmVudCxcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UsXG4gICAgICAgICAgICAoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXBvczogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoZXBvcy5nZXRYKCksIGVwb3MuZ2V0WSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmlzaWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzW3ggKyAnLCcgKyB5XSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbXB1dGVWaXNpYmxlQ2VsbHMoKTogdm9pZCB7XG4gICAgICAgIHZhciBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBpZiAoY3VycmVudFR1cm4gPT09IHRoaXMuY2hlY2tlZEF0VHVybikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcDogTWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICB0aGlzLnZpc2libGVDZWxscyA9IG1hcC5nZXRWaXNpYmxlQ2VsbHModGhpcy5wYXJlbnQsIHRoaXMuZGlzdGFuY2UpO1xuICAgICAgICB0aGlzLmhhc1NlZW5DZWxscyA9IE9iamVjdC5hc3NpZ24odGhpcy5oYXNTZWVuQ2VsbHMsIHRoaXMudmlzaWJsZUNlbGxzKTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gY3VycmVudFR1cm47XG4gICAgfVxuXG59XG4iLCJpbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgZ2FtZS5pbml0KDkwLCA1MCk7XG59XG5cbiJdfQ==
