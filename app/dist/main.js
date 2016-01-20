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
            if (this.acting) {
                return;
            }
            this.acting = true;
            var g = new _Game.Game();
            this.sendEvent('nextTurn').then().catch();
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

            var component = this.getComponent('AIFactionComponent');
            component.act().then(function () {
                _this2.acting = false;
                _this2.sendEvent('turnFinished').then().catch();
            });
        }
    }, {
        key: 'handleRandomWalkComponent',
        value: function handleRandomWalkComponent() {
            var _this3 = this;

            var component = this.getComponent('RandomWalkComponent');
            component.randomWalk().then(function () {
                _this3.acting = false;
                _this3.sendEvent('turnFinished').then().catch();
            });
        }
    }, {
        key: 'handleInputComponent',
        value: function handleInputComponent() {
            var _this4 = this;

            var component = this.getComponent('InputComponent');
            component.waitForInput().then(function () {
                _this4.acting = false;
                _this4.sendEvent('turnFinished').then().catch();
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
            if (entity.hasComponent('TurnComponent')) {
                this.scheduler.remove(entity);
            }
        }
    }, {
        key: 'addEntity',
        value: function addEntity(entity) {
            if (entity.hasComponent('TurnComponent')) {
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
        key: 'getActiveScreen',
        value: function getActiveScreen() {
            return this.activeScreen;
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

var _Glyph = require('./Glyph');

var _Entity = require('./Entity');

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _Spawn = require('./Spawn');

var Spawn = _interopRequireWildcard(_Spawn);

var _ActorComponent = require('./components/ActorComponent');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

var _InputComponent = require('./components/InputComponent');

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
        key: 'startAimMove',
        value: function startAimMove() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var aimer = new _Entity.Entity();
                aimer.addComponent(new _ActorComponent.ActorComponent());
                aimer.addComponent(new _GlyphComponent.GlyphComponent({
                    glyph: new _Glyph.Glyph('+', 'white', 'black')
                }));
                aimer.addComponent(new _PositionComponent.PositionComponent());
                aimer.addComponent(new _InputComponent.InputComponent());
                _this2.map.addEntity(aimer);
                aimer.act();
            });
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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Spawn":11,"./Tiles":13,"./components/ActorComponent":17,"./components/GlyphComponent":21,"./components/InputComponent":23,"./components/PositionComponent":26}],4:[function(require,module,exports){
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

var _TurnComponent = require('./components/TurnComponent');

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
        enemy.addComponent(new _TurnComponent.TurnComponent());
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
        enemy.addComponent(new _TurnComponent.TurnComponent());
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
        player.addComponent(new _TurnComponent.TurnComponent());
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

},{"./Entity":1,"./Glyph":4,"./components/AIFactionComponent":14,"./components/AbilityFireboltComponent":15,"./components/AbilityIceLanceComponent":16,"./components/ActorComponent":17,"./components/FactionComponent":19,"./components/FireAffinityComponent":20,"./components/GlyphComponent":21,"./components/IceAffinityComponent":22,"./components/InputComponent":23,"./components/MeleeAttackComponent":24,"./components/PlayerComponent":25,"./components/PositionComponent":26,"./components/SightComponent":27,"./components/TurnComponent":28}],12:[function(require,module,exports){
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
        var description = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

        _classCallCheck(this, Tile);

        this.glyph = glyph;
        this.walkable = walkable;
        this.blockingLight = blockingLight;
        this.description = description;
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
        key: 'describe',
        value: function describe() {
            return this.description;
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
        return new _Tile.Tile(new _Glyph.Glyph('.', '#222', '#444'), true, false, 'Stone floor');
    }
    create.floorTile = floorTile;
    function wallTile() {
        return new _Tile.Tile(new _Glyph.Glyph('#', '#ccc', '#444'), false, true, 'Stone wall');
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
                    case ROT.VK_X:
                        var screen = _this4.game.getActiveScreen();
                        screen.startAimMove().then(function () {
                            resolve(true);
                        }).catch(function () {
                            resolve(true);
                        });
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.TurnComponent = undefined;

var _Component2 = require('./Component');

var _Game = require('../Game');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var TurnComponent = exports.TurnComponent = (function (_Component) {
    _inherits(TurnComponent, _Component);

    function TurnComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

        _classCallCheck(this, TurnComponent);

        var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(TurnComponent).call(this));

        _this.game = new _Game.Game();
        return _this;
    }

    _createClass(TurnComponent, [{
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('nextTurn', this.nextTurn.bind(this));
            this.parent.addListener('turnFinished', this.turnFinished.bind(this));
        }
    }, {
        key: 'nextTurn',
        value: function nextTurn() {
            var _this2 = this;

            this.game.lockEngine();
            return new Promise(function (resolve, reject) {
                _this2.turnResolved = resolve;
                _this2.parent.act();
            });
        }
    }, {
        key: 'turnFinished',
        value: function turnFinished() {
            var _this3 = this;

            return new Promise(function (resolve, reject) {
                _this3.turnResolved();
                _this3.game.unlockEngine();
                resolve();
            });
        }
    }]);

    return TurnComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":18}],29:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[29])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvU3Bhd24udHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL1R1cm5Db21wb25lbnQudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNpQkk7OztBQUNJLFlBQUksQ0FBQyxJQUFJLEdBQUcsQUFBSSxNQWxCaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQWlCa0IsUUFBUSxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQUFFeEI7S0FBQyxBQUVELEFBQU87Ozs7O0FBQ0gsQUFBTSxtQkFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQ3JCO1NBQUMsQUFFRCxBQUFHOzs7O0FBQ0MsQUFBRSxBQUFDLGdCQUFDLElBQUksQ0FBQyxNQUFNLEFBQUMsRUFBQyxBQUFDO0FBQ2QsQUFBTSx1QkFBQyxBQUNYO2FBQUM7QUFDRCxnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUM7QUFDbkIsZ0JBQUksQ0FBQyxHQUFHLEFBQUksQUFBSSxVQWpDaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQVMzQixFQXdCMEIsQ0FBQztBQUNuQixnQkFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUUxQyxBQUFFLEFBQUMsZ0JBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN2QyxBQUFHLEFBQUMscUJBQUMsQUFBRyxJQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsVUFBVSxBQUFDLEVBQUMsQUFBQztBQUN4Qyx3QkFBTSxTQUFT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LE1BQU0sQ0FBQyxXQUFXLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQUFDMUU7U0FBQyxBQUVPLEFBQVE7Ozs7OztBQUNaLGdCQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ3ZCLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFJLHVCQUFDLFlBQVksR0FBRyxPQUFPLENBQUM7QUFDNUIsQUFBSSx1QkFBQyxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQUFDdEI7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRU8sQUFBWTs7Ozs7O0FBQ2hCLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFJLHVCQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3BCLEFBQUksdUJBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQ3pCLHVCQUFPLEVBQUUsQ0FBQyxBQUNkO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUNMLEFBQUM7Ozs7ZUFqQ08sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUM5Qjs7Ozs7OztBQ0hQLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDWixRQUFJLElBQUksR0FBRyxBQUFJLEFBQUksVUFIZixJQUFJLEFBQUMsQUFBTSxBQUFRLEVBR0YsQ0FBQztBQUN0QixRQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUN0QjtDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtHdWlkfSBmcm9tICcuL0d1aWQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge1R1cm5Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9UdXJuQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEVudGl0eSB7XG4gICAgZ3VpZDogc3RyaW5nO1xuICAgIGNvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogQ29tcG9uZW50fTtcbiAgICBhY3Rpbmc6IGJvb2xlYW47XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG5cbiAgICB9XG5cbiAgICBnZXRHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWQ7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICBpZiAodGhpcy5hY3RpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ25leHRUdXJuJykudGhlbigpLmNhdGNoKCk7XG5cbiAgICAgICAgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdQbGF5ZXJDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgZm9yICh2YXIgY29tcG9uZW50TmFtZSBpbiB0aGlzLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBjb21wb25lbnQuZGVzY3JpYmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5yZW5kZXIoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dENvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdBSUZhY3Rpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVBSUZhY3Rpb25Db21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBraWxsKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ2tpbGxlZCcpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQUlGYWN0aW9uQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPEFJRmFjdGlvbkNvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnQUlGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5hY3QoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ3R1cm5GaW5pc2hlZCcpLnRoZW4oKS5jYXRjaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVSYW5kb21XYWxrQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPFJhbmRvbVdhbGtDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ1JhbmRvbVdhbGtDb21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnJhbmRvbVdhbGsoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ3R1cm5GaW5pc2hlZCcpLnRoZW4oKS5jYXRjaCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVJbnB1dENvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxJbnB1dENvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LndhaXRGb3JJbnB1dCgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNlbmRFdmVudCgndHVybkZpbmlzaGVkJykudGhlbigpLmNhdGNoKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50LnNldFBhcmVudEVudGl0eSh0aGlzKTtcbiAgICAgICAgY29tcG9uZW50LnNldExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgaGFzQ29tcG9uZW50KG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuY29tcG9uZW50c1tuYW1lXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNbbmFtZV07XG4gICAgfVxuXG4gICAgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVycyB8fCBsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFByb21pc2U8VD4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZVNjcmVlbn0gZnJvbSAnLi9HYW1lU2NyZWVuJztcbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge1R1cm5Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9UdXJuQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuXG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgc2NyZWVuV2lkdGg6IG51bWJlcjtcbiAgICBzY3JlZW5IZWlnaHQ6IG51bWJlcjtcblxuICAgIGNhbnZhczogYW55O1xuXG4gICAgYWN0aXZlU2NyZWVuOiBHYW1lU2NyZWVuO1xuICAgIG1hcDogTWFwO1xuXG4gICAgZGlzcGxheTogYW55O1xuICAgIHNjaGVkdWxlcjogYW55O1xuICAgIGVuZ2luZTogYW55O1xuXG4gICAgdHVybkNvdW50OiBudW1iZXI7XG4gICAgdHVyblRpbWU6IG51bWJlcjtcbiAgICBtaW5UdXJuVGltZTogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChHYW1lLmluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gR2FtZS5pbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgdGhpcy50dXJuQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnR1cm5UaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5taW5UdXJuVGltZSA9IDEwMDtcbiAgICAgICAgd2luZG93WydHYW1lJ10gPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gbmV3IFJPVC5EaXNwbGF5KHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNjcmVlbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNjcmVlbkhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IHRoaXMuZGlzcGxheS5nZXRDb250YWluZXIoKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgUk9ULlNjaGVkdWxlci5TaW1wbGUoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKHtcbiAgICAgICAgICAgIGFjdDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybkNvdW50Kys7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygndHVybicsIHRoaXMudHVybkNvdW50KTtcbiAgICAgICAgICAgIH19LCB0cnVlKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgUk9ULkVuZ2luZSh0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG5cbiAgICAgICAgdmFyIGdhbWVTY3JlZW4gPSBuZXcgR2FtZVNjcmVlbih0aGlzLmRpc3BsYXksIHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0LCB0aGlzLm1hcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gZ2FtZVNjcmVlbjtcblxuICAgICAgICBjb25zdCBwbGF5ZXIgPSBnYW1lU2NyZWVuLmdldFBsYXllcigpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbiA9IDxQb3NpdGlvbkNvbXBvbmVudD5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgIHRoaXMubWFwLmFkZEVuZW1pZXMoe1xuICAgICAgICAgICAgeDogcG9zaXRpb24uZ2V0WCgpLFxuICAgICAgICAgICAgeTogcG9zaXRpb24uZ2V0WSgpLFxuICAgICAgICAgICAgcjogNVxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmJpbmRJbnB1dEhhbmRsaW5nKCk7XG5cbiAgICAgICAgdGhpcy5lbmdpbmUuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKCdlbnRpdHlLaWxsZWQnLCB0aGlzLmVudGl0eURlYXRoTGlzdGVuZXIuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVudGl0eURlYXRoTGlzdGVuZXIoZW50aXR5OiBFbnRpdHkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnUGxheWVyQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIHBsYXllciBpcyBkZWFkIScpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZEV2ZW50KGV2ZW50TmFtZTogc3RyaW5nLCBjb252ZXJ0ZXI6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kSW5wdXRIYW5kbGluZygpIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudHNUb1NjcmVlbiA9IChldmVudE5hbWUsIGNvbnZlcnRlcikgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTY3JlZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4uaGFuZGxlSW5wdXQoY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdjbGljaycsIHRoaXMuY29udmVydE1vdXNlRXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEtleUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IEtleWJvYXJkRXZlbnQgPT4ge1xuICAgICAgICB2YXIgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLlBSRVNTO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudChcbiAgICAgICAgICAgIGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICBldmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBldmVudC5tZXRhS2V5XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0TW91c2VFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBNb3VzZUNsaWNrRXZlbnQgPT4ge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmRpc3BsYXkuZXZlbnRUb1Bvc2l0aW9uKGV2ZW50KTtcblxuICAgICAgICB2YXIgYnV0dG9uVHlwZTogTW91c2VCdXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLkxFRlQ7XG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMikge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5NSURETEU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQud2ljaCA9PT0gMykge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5SSUdIVFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VDbGlja0V2ZW50KFxuICAgICAgICAgICAgcG9zaXRpb25bMF0sXG4gICAgICAgICAgICBwb3NpdGlvblsxXSxcbiAgICAgICAgICAgIGJ1dHRvblR5cGVcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ1R1cm5Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdUdXJuQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbnRpdHksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZW5kRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TWFwKCk6IE1hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcDtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0QWN0aXZlU2NyZWVuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5hY3RpdmVTY3JlZW47XG4gICAgfVxuXG4gICAgcHVibGljIGdldEN1cnJlbnRUdXJuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50dXJuQ291bnQ7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcbmltcG9ydCAqIGFzIFRpbGVzIGZyb20gJy4vVGlsZXMnO1xuaW1wb3J0ICogYXMgU3Bhd24gZnJvbSAnLi9TcGF3bic7XG5cbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge1BsYXllckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1BsYXllckNvbXBvbmVudCc7XG5pbXBvcnQge1NpZ2h0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCc7XG5pbXBvcnQge01lbGVlQXR0YWNrQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvTWVsZWVBdHRhY2tDb21wb25lbnQnO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZVNjcmVlbiB7XG4gICAgZGlzcGxheTogYW55O1xuICAgIG1hcDogTWFwO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgcGxheWVyOiBFbnRpdHk7XG4gICAgZ2FtZTogR2FtZTtcbiAgICBudWxsVGlsZTogVGlsZTtcblxuICAgIGNvbnN0cnVjdG9yKGRpc3BsYXk6IGFueSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG1hcDogTWFwKSB7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgICAgIHRoaXMubnVsbFRpbGUgPSBUaWxlcy5jcmVhdGUubnVsbFRpbGUoKTtcblxuICAgICAgICB0aGlzLnBsYXllciA9IFNwYXduLmVudGl0eS5QbGF5ZXIoKTtcblxuICAgICAgICB0aGlzLm1hcC5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKHRoaXMucGxheWVyKTtcblxuICAgICAgICB0aGlzLmdhbWUuYWRkRW50aXR5KHRoaXMucGxheWVyKTtcbiAgICB9XG5cbiAgICBnZXRQbGF5ZXIoKTogRW50aXR5IHtcbiAgICAgICAgcmV0dXJuIHRoaXMucGxheWVyO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIGZvciAodmFyIHggPSBiLng7IHggPCBiLnggKyBiLnc7IHgrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IGIueTsgeSA8IGIueSArIGIuaDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdseXBoOiBHbHlwaCA9IHRoaXMubWFwLmdldFRpbGUoeCwgeSkuZ2V0R2x5cGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1hcEdseXBoKGdseXBoLCB4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwLm1hcEVudGl0aWVzKHRoaXMucmVuZGVyRW50aXR5KTtcbiAgICB9XG5cbiAgICBoYW5kbGVJbnB1dChldmVudERhdGE6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnREYXRhLmdldENsYXNzTmFtZSgpID09PSAnTW91c2VDbGlja0V2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNb3VzZUNsaWNrRXZlbnQoPE1vdXNlQ2xpY2tFdmVudD5ldmVudERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleWJvYXJkRXZlbnQoPEtleWJvYXJkRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlQ2xpY2tFdmVudChldmVudDogTW91c2VDbGlja0V2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5nZXRYKCkgPT09IC0xIHx8IGV2ZW50LmdldFkoKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2NsaWNrZWQgb3V0c2lkZSBvZiBjYW52YXMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShldmVudC5nZXRYKCksIGV2ZW50LmdldFkoKSk7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkJywgZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCksIHRpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIH1cblxuICAgIGdldE1hcCgpOiBNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXA7XG4gICAgfVxuXG4gICAgc3RhcnRBaW1Nb3ZlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGxldCBhaW1lciA9IG5ldyBFbnRpdHkoKTtcbiAgICAgICAgICAgIGFpbWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgICAgICBhaW1lci5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCcrJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIGFpbWVyLmFkZENvbXBvbmVudChuZXcgUG9zaXRpb25Db21wb25lbnQoKSk7XG4gICAgICAgICAgICBhaW1lci5hZGRDb21wb25lbnQobmV3IElucHV0Q29tcG9uZW50KCkpO1xuICAgICAgICAgICAgdGhpcy5tYXAuYWRkRW50aXR5KGFpbWVyKTtcbiAgICAgICAgICAgIGFpbWVyLmFjdCgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbmRlcmFibGVCb3VuZGFyeSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgdzogdGhpcy5tYXAuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGg6IHRoaXMubWFwLmdldEhlaWdodCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1JlbmRlcmFibGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHJldHVybiB4ID49IGIueCAmJiB4IDwgYi54ICsgYi53ICYmIHkgPj0gYi55ICYmIHkgPCBiLnkgKyBiLmg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJNYXBHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcbiAgICAgICAgY29uc3Qgc2lnaHRDb21wb25lbnQ6IFNpZ2h0Q29tcG9uZW50ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGxheWVyLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcblxuICAgICAgICBpZiAoc2lnaHRDb21wb25lbnQuY2FuU2VlKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgZ2x5cGguYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaWdodENvbXBvbmVudC5oYXNTZWVuKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgJyMxMTEnXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZzogR2x5cGggPSB0aGlzLm51bGxUaWxlLmdldEdseXBoKCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZy5jaGFyLFxuICAgICAgICAgICAgICAgIGcuZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuICAgICAgICBjb25zdCBzaWdodENvbXBvbmVudDogU2lnaHRDb21wb25lbnQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuXG4gICAgICAgIGlmIChzaWdodENvbXBvbmVudC5jYW5TZWUoeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnbHlwaC5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJFbnRpdHkgPSAoZW50aXR5OiBFbnRpdHkpID0+IHtcbiAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICB2YXIgZ2x5cGhDb21wb25lbnQ6IEdseXBoQ29tcG9uZW50ID0gPEdseXBoQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0dseXBoQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gcG9zaXRpb25Db21wb25lbnQuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGdseXBoID0gZ2x5cGhDb21wb25lbnQuZ2V0R2x5cGgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNSZW5kZXJhYmxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgR2x5cGgge1xuICAgIHB1YmxpYyBjaGFyOiBzdHJpbmc7XG4gICAgcHVibGljIGZvcmVncm91bmQ6IHN0cmluZztcbiAgICBwdWJsaWMgYmFja2dyb3VuZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2hhcjogc3RyaW5nLCBmb3JlZ3JvdW5kOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNoYXIgPSBjaGFyO1xuICAgICAgICB0aGlzLmZvcmVncm91bmQgPSBmb3JlZ3JvdW5kO1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIEd1aWQge1xuICAgIHN0YXRpYyBnZW5lcmF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcblxuZXhwb3J0IGNsYXNzIEtleWJvYXJkRXZlbnQge1xuICAgIGtleUNvZGU6IG51bWJlcjtcbiAgICBhbHRLZXk6IGJvb2xlYW47XG4gICAgY3RybEtleTogYm9vbGVhbjtcbiAgICBzaGlmdEtleTogYm9vbGVhbjtcbiAgICBtZXRhS2V5OiBib29sZWFuO1xuICAgIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBLZXlib2FyZEV2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGtleUNvZGU6IG51bWJlciwgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSwgYWx0S2V5OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgbWV0YUtleTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmtleUNvZGUgPSBrZXlDb2RlO1xuICAgICAgICB0aGlzLmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcbiAgICAgICAgdGhpcy5hbHRLZXkgPSBhbHRLZXk7XG4gICAgICAgIHRoaXMuY3RybEtleSA9IGN0cmxLZXk7XG4gICAgICAgIHRoaXMuc2hpZnRLZXkgPSBzaGlmdEtleTtcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0gbWV0YUtleTtcbiAgICB9XG5cbiAgICBnZXRFdmVudFR5cGUoKTogS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudFR5cGU7XG4gICAgfVxuXG4gICAgZ2V0S2V5Q29kZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlDb2RlO1xuICAgIH1cblxuICAgIGhhc0FsdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx0S2V5O1xuICAgIH1cblxuICAgIGhhc1NoaWZ0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGlmdEtleTtcbiAgICB9XG5cbiAgICBoYXNDdHJsS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdHJsS2V5O1xuICAgIH1cblxuICAgIGhhc01ldGFLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFLZXk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgIERPV04sXG4gICAgVVAsXG4gICAgUFJFU1Ncbn07XG4iLCJkZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5pbXBvcnQgKiBhcyBTcGF3biBmcm9tICcuL1NwYXduJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGaXJlQWZmaW5pdHlDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GaXJlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtJY2VBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ljZUFmZmluaXR5Q29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBNYXAge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgdGlsZXM6IFRpbGVbXVtdO1xuXG4gICAgZW50aXRpZXM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXR5fTtcbiAgICBtYXhFbmVtaWVzOiBudW1iZXI7XG5cbiAgICBmb3Y6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYXhFbmVtaWVzOiBudW1iZXIgPSAxMCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1heEVuZW1pZXMgPSBtYXhFbmVtaWVzO1xuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcblxuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2VudGl0eU1vdmVkJywgdGhpcy5lbnRpdHlNb3ZlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdlbnRpdHlLaWxsZWQnLCB0aGlzLmVudGl0eUtpbGxlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdjYW5Nb3ZlVG8nLCB0aGlzLmNhbk1vdmVUby5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXR1cEZvdigpIHtcbiAgICAgICAgdGhpcy5mb3YgPSBuZXcgUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcoXG4gICAgICAgICAgICAoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aWxlLmJsb2Nrc0xpZ2h0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge3RvcG9sb2d5OiA0fVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscyhlbnRpdHk6IEVudGl0eSwgZGlzdGFuY2U6IG51bWJlcik6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIGxldCB2aXNpYmxlQ2VsbHM6IGFueSA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdGhpcy5mb3YuY29tcHV0ZShcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAgICAgKHgsIHksIHJhZGl1cywgdmlzaWJpbGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHZpc2libGVDZWxsc1t4ICsgXCIsXCIgKyB5XSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZpc2libGVDZWxscztcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIGdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcbiAgICB9XG5cbiAgICBnZXRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmdlbmVyYXRlTGV2ZWwoKTtcbiAgICAgICAgdGhpcy5zZXR1cEZvdigpO1xuXG4gICAgfVxuXG4gICAgYWRkRW5lbWllcyhhdm9pZDoge3g6IG51bWJlciwgeTogbnVtYmVyLCByOiBudW1iZXJ9ID0ge3g6IC0xLCB5OiAtMSwgcjogLTF9KSB7XG4gICAgICAgIGNvbnN0IGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBsZXQgZW5lbXk6IEVudGl0eTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgZW5lbXkgPSBTcGF3bi5lbnRpdHkuRmlyZUltcCgpO1xuICAgICAgICAgICAgdGhpcy5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVuZW15LCBhdm9pZCk7XG4gICAgICAgICAgICBnLmFkZEVudGl0eShlbmVteSk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF4RW5lbWllczsgaSsrKSB7XG4gICAgICAgICAgICBlbmVteSA9IFNwYXduLmVudGl0eS5JY2VJbXAoKTtcbiAgICAgICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSwgYXZvaWQpO1xuICAgICAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbnRpdHk6IEVudGl0eSwgYXZvaWQ6IHt4OiBudW1iZXIsIHk6IG51bWJlciwgcjogbnVtYmVyfSA9IHt4OiAtMSwgeTogLTEsIHI6IC0xfSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1heFRyaWVzID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogMTA7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgbGV0IHggPSAtMTtcbiAgICAgICAgbGV0IHkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiBpIDwgbWF4VHJpZXMpIHtcbiAgICAgICAgICAgIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAoYXZvaWQueCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHggLSBhdm9pZC54KTtcbiAgICAgICAgICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHkgLSBhdm9pZC55KTtcblxuICAgICAgICAgICAgICAgIGlmIChkeCArIGR5IDw9IGF2b2lkLnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ2F2b2lkaW5nICcsIGR4ICsgZHkpO1xuICAgICAgICAgICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0VGlsZSh4LCB5KS5pc1dhbGthYmxlKCkgJiYgIXRoaXMucG9zaXRpb25IYXNFbnRpdHkoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gZnJlZSBzcG90IGZvdW5kIGZvcicsIGVudGl0eSk7XG4gICAgICAgICAgICB0aHJvdyAnTm8gZnJlZSBzcG90IGZvdW5kIGZvciBhIG5ldyBlbnRpdHknO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgICAgICB0aGlzLmdldFRpbGUoeCwgeSkuc2V0RW50aXR5R3VpZChlbnRpdHkuZ2V0R3VpZCgpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZ2FtZS5hZGRFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IGVudGl0eTtcbiAgICB9XG5cbiAgICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGdhbWUucmVtb3ZlRW50aXR5KGVudGl0eSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBudWxsXG4gICAgICAgIHRoaXMuZ2V0VGlsZShwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCksIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgfVxuXG4gICAgcG9zaXRpb25IYXNFbnRpdHkoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIHZhciBlbnRpdHlHdWlkID0gdGlsZS5nZXRFbnRpdHlHdWlkKCk7XG4gICAgICAgIHJldHVybiBlbnRpdHlHdWlkICE9PSAnJztcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlBdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IEVudGl0eSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdGllc1tlbnRpdHlHdWlkXTtcbiAgICB9XG5cbiAgICBnZXROZWFyYnlFbnRpdGllcyhvcmlnaW5Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50LCByYWRpdXM6IG51bWJlciwgZmlsdGVyOiAoZW50aXR5OiBFbnRpdHkpID0+IGJvb2xlYW4gPSAoZSkgPT4ge3JldHVybiB0cnVlO30pOiBFbnRpdHlbXSB7XG4gICAgICAgIGxldCBlbnRpdGllcyA9IFtdO1xuICAgICAgICB0aGlzLm1hcEVudGl0aWVzKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGlmICghZmlsdGVyKGVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uQ29tcG9uZW50ID09PSBvcmlnaW5Db21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHBvc2l0aW9uQ29tcG9uZW50LmRpc3RhbmNlVG8ob3JpZ2luQ29tcG9uZW50LmdldFgoKSwgb3JpZ2luQ29tcG9uZW50LmdldFkoKSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPD0gcmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMucHVzaCh7ZGlzdGFuY2U6IGRpc3RhbmNlLCBlbnRpdHk6IGVudGl0eX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMgPSBlbnRpdGllcy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuZW50aXR5OyB9KTtcbiAgICAgICAgcmV0dXJuIGVudGl0aWVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVMZXZlbCgpOiBUaWxlW11bXSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdLnB1c2goVGlsZXMuY3JlYXRlLm51bGxUaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG5ldyBST1QuTWFwLkNlbGx1bGFyKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgZ2VuZXJhdG9yLnJhbmRvbWl6ZSgwLjUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgoeCwgeSwgdikgPT4ge1xuICAgICAgICAgICAgaWYgKHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS5mbG9vclRpbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF1beV0gPSBUaWxlcy5jcmVhdGUud2FsbFRpbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW50aXR5TW92ZWRMaXN0ZW5lcihkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBkYXRhLm9sZFBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGRhdGEuZW50aXR5O1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKG9sZFBvc2l0aW9uLngsIG9sZFBvc2l0aW9uLnkpLnNldEVudGl0eUd1aWQoJycpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlLaWxsZWRMaXN0ZW5lcihkYXRhOiBFbnRpdHkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVudGl0eShkYXRhKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuTW92ZVRvKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBhY2M6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICAgICAgICBpZiAodGlsZS5pc1dhbGthYmxlKCkgJiYgdGlsZS5nZXRFbnRpdHlHdWlkKCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwb3NpdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChwb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIE1vdXNlQnV0dG9uVHlwZSB7XG4gICAgTEVGVCxcbiAgICBNSURETEUsXG4gICAgUklHSFRcbn07XG5cbiIsImltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBNb3VzZUNsaWNrRXZlbnQge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBNb3VzZUNsaWNrRXZlbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGJ1dHRvbjogTW91c2VCdXR0b25UeXBlKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMuYnV0dG9uID0gYnV0dG9uO1xuICAgIH1cblxuICAgIGdldFgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICB9XG5cbiAgICBnZXRZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgfVxuXG4gICAgZ2V0QnV0dG9uVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7VHVybkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1R1cm5Db21wb25lbnQnO1xuaW1wb3J0IHtQbGF5ZXJDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9QbGF5ZXJDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UmFuZG9tV2Fsa0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1JhbmRvbVdhbGtDb21wb25lbnQnO1xuaW1wb3J0IHtBSUZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BSUZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0ZpcmVBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZpcmVBZmZpbml0eUNvbXBvbmVudCc7XG5pbXBvcnQge0ljZUFmZmluaXR5Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtNZWxlZUF0dGFja0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL01lbGVlQXR0YWNrQ29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUZpcmVib2x0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUljZUxhbmNlQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50JztcblxuZXhwb3J0IG1vZHVsZSBlbnRpdHkge1xuICAgIGV4cG9ydCBmdW5jdGlvbiBGaXJlSW1wKCkge1xuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgVHVybkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdmJywgJ3JlZCcsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBSUZhY3Rpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmlyZUFmZmluaXR5Q29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFNpZ2h0Q29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IE1lbGVlQXR0YWNrQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEZhY3Rpb25Db21wb25lbnQoIHtcbiAgICAgICAgICAgIGZpcmU6IDEsXG4gICAgICAgICAgICBpY2U6IDAsXG4gICAgICAgICAgICBoZXJvOiAtMVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgcmV0dXJuIGVuZW15O1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBJY2VJbXAoKSB7XG4gICAgICAgIHZhciBlbmVteSA9IG5ldyBFbnRpdHkoKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBY3RvckNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBUdXJuQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2knLCAnY3lhbicsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBSUZhY3Rpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgTWVsZWVBdHRhY2tDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgSWNlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMCxcbiAgICAgICAgICAgIGljZTogMSxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgcmV0dXJuIGVuZW15O1xuICAgIH1cblxuICAgIGV4cG9ydCBmdW5jdGlvbiBQbGF5ZXIoKSB7XG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IFBsYXllckNvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgVHVybkNvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAnd2hpdGUnLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBJbnB1dENvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoe1xuICAgICAgICAgICAgZGlzdGFuY2U6IDUwXG4gICAgICAgIH0pKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCh7XG4gICAgICAgICAgICBoZXJvOiAxLFxuICAgICAgICAgICAgaWNlOiAtMSxcbiAgICAgICAgICAgIGZpcmU6IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBYmlsaXR5SWNlTGFuY2VDb21wb25lbnQoKSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IE1lbGVlQXR0YWNrQ29tcG9uZW50KCkpO1xuXG4gICAgICAgIHJldHVybiBwbGF5ZXI7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcbiAgICBwcml2YXRlIGVudGl0eUd1aWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHdhbGthYmxlOiBib29sZWFuO1xuICAgIHByaXZhdGUgYmxvY2tpbmdMaWdodDogYm9vbGVhbjtcbiAgICBwcml2YXRlIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihnbHlwaDogR2x5cGgsIHdhbGthYmxlOiBib29sZWFuID0gdHJ1ZSwgYmxvY2tpbmdMaWdodDogYm9vbGVhbiA9IGZhbHNlLCBkZXNjcmlwdGlvbjogc3RyaW5nID0gJycpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG4gICAgICAgIHRoaXMuYmxvY2tpbmdMaWdodCA9IGJsb2NraW5nTGlnaHQ7XG4gICAgICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvbjtcblxuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSAnJztcblxuICAgIH1cblxuICAgIGlzV2Fsa2FibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGthYmxlO1xuICAgIH1cblxuICAgIGJsb2Nrc0xpZ2h0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja2luZ0xpZ2h0O1xuICAgIH1cblxuICAgIGRlc2NyaWJlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmRlc2NyaXB0aW9uO1xuICAgIH1cblxuICAgIGdldEdseXBoKCk6IEdseXBoIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0RW50aXR5R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdHlHdWlkO1xuICAgIH1cblxuICAgIHNldEVudGl0eUd1aWQoZW50aXR5R3VpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZW50aXR5R3VpZCA9IGVudGl0eUd1aWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5cbmV4cG9ydCBtb2R1bGUgY3JlYXRlIHtcbiAgICBleHBvcnQgZnVuY3Rpb24gbnVsbFRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJyAnLCAnYmxhY2snLCAnIzAwMCcpLCBmYWxzZSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gZmxvb3JUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcuJywgJyMyMjInLCAnIzQ0NCcpLCB0cnVlLCBmYWxzZSwgJ1N0b25lIGZsb29yJyk7XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnIycsICcjY2NjJywgJyM0NDQnKSwgZmFsc2UsIHRydWUsICdTdG9uZSB3YWxsJyk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vU2lnaHRDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0ZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBSUZhY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHRhcmdldFBvczogYW55O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgfVxuXG4gICAgYWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNpZ2h0ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IGZhY3Rpb24gPSA8RmFjdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ0ZhY3Rpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBzaWdodC5nZXRWaXNpYmxlRW50aXRpZXMoKTtcblxuICAgICAgICAgICAgbGV0IGZlYXJpbmc6IEVudGl0eSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgZW5lbXk6IEVudGl0eSA9IG51bGw7XG5cbiAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVmID0gPEZhY3Rpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIGlmIChmYWN0aW9uLmlzRW5lbXkoZWYuZ2V0U2VsZkZhY3Rpb24oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbXkgPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmZWFyaW5nID09PSBudWxsICYmIGZhY3Rpb24uaXNGZWFyaW5nKGVmLmdldFNlbGZGYWN0aW9uKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXJpbmcgPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChlbmVteSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW5lbXkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiB0LmdldFgoKSxcbiAgICAgICAgICAgICAgICAgICAgeTogdC5nZXRZKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXRQb3MgIT09IG51bGwgJiYgKHRoaXMudGFyZ2V0UG9zLnggIT09IHBvc2l0aW9uLmdldFgoKSB8fCB0aGlzLnRhcmdldFBvcy55ICE9PSBwb3NpdGlvbi5nZXRZKCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1Rvd2FyZHNUYXJnZXQocG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5kb21XYWxrKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnb1Rvd2FyZHNUYXJnZXQocG9zaXRpb246IFBvc2l0aW9uQ29tcG9uZW50KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnModGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSk7XG4gICAgICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKTtcbiAgICAgICAgICAgIGxldCBkaXJlY3Rpb246IGFueTtcblxuICAgICAgICAgICAgaWYgKGR4ICsgZHkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGR4ID09IDAgPyAwIDogTWF0aC5mbG9vcigodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCksXG4gICAgICAgICAgICAgICAgICAgIHk6IGR5ID09IDAgPyAwIDogTWF0aC5mbG9vcigodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0cnlpbmcgdG8gYXR0YWNrIScsIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0QXR0YWNrKGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZHggPiBkeSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpIC8gZHlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dGVtcHRBdHRhY2soZGlyZWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TWVsZWVBdHRhY2snLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByYW5kb21XYWxrKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zOiBhbnkgPSBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDF9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAtMX0sXG4gICAgICAgICAgICAgICAge3g6IDEsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAtMSwgeTogMH0sXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBkaXJlY3Rpb25zID0gZGlyZWN0aW9ucy5yYW5kb21pemUoKTtcblxuICAgICAgICAgICAgdmFyIHRlc3REaXJlY3Rpb24gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRlc3REaXJlY3Rpb24oZGlyZWN0aW9ucy5wb3AoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByYW5nZTogbnVtYmVyO1xuICAgIGNvb2xkb3duOiBudW1iZXI7XG4gICAgbGFzdFVzZWQ6IG51bWJlcjtcbiAgICBkYW1hZ2VUeXBlOiBzdHJpbmc7XG5cbiAgICBnYW1lOiBHYW1lO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLnJhbmdlID0gNTtcbiAgICAgICAgdGhpcy5jb29sZG93biA9IDEwMDtcbiAgICAgICAgdGhpcy5sYXN0VXNlZCA9IC10aGlzLmNvb2xkb3duO1xuICAgICAgICB0aGlzLmRhbWFnZVR5cGUgPSAnZmlyZSc7XG4gICAgfVxuXG4gICAgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBjb25zdCBjb29sZG93biA9ICh0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93bikgLSBjdXJyZW50VHVybjtcbiAgICAgICAgcmV0dXJuICdGaXJlYm9sdCwgY29vbGRvd246ICcgKyBNYXRoLm1heCgwLCBjb29sZG93bik7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdEFiaWxpdHlGaXJlYm9sdCcsIHRoaXMudXNlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignY29uc3VtZUZpcmUnLCB0aGlzLmNvbnN1bWVGaXJlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUZpcmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCAtPSB0aGlzLmNvb2xkb3duO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1c2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQXZhaWxhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudGl0aWVzID0gbWFwLmdldE5lYXJieUVudGl0aWVzKHBvc2l0aW9uQ29tcG9uZW50LCB0aGlzLnJhbmdlKTtcblxuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRpdGllcy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc0NvbXBvbmVudCgnSWNlQWZmaW5pdHlDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2NvbnN1bWVJY2UnKTtcbiAgICAgICAgICAgIHRhcmdldC5raWxsKCk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBYmlsaXR5SWNlTGFuY2VDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJhbmdlOiBudW1iZXI7XG4gICAgY29vbGRvd246IG51bWJlcjtcbiAgICBsYXN0VXNlZDogbnVtYmVyO1xuICAgIGRhbWFnZVR5cGU6IHN0cmluZztcblxuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMucmFuZ2UgPSA1O1xuICAgICAgICB0aGlzLmNvb2xkb3duID0gMTAwO1xuICAgICAgICB0aGlzLmxhc3RVc2VkID0gLXRoaXMuY29vbGRvd247XG4gICAgICAgIHRoaXMuZGFtYWdlVHlwZSA9ICdpY2UnO1xuICAgIH1cblxuICAgIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgY29uc3QgY29vbGRvd24gPSAodGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24pIC0gY3VycmVudFR1cm47XG4gICAgICAgIHJldHVybiAnSWNlIExhbmNlLCBjb29sZG93bjogJyArIE1hdGgubWF4KDAsIGNvb2xkb3duKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0QWJpbGl0eUljZUxhbmNlJywgdGhpcy51c2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdjb25zdW1lSWNlJywgdGhpcy5jb25zdW1lSWNlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUljZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkIC09IHRoaXMuY29vbGRvd247XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVzZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMoXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQsXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZSxcbiAgICAgICAgICAgICAgICAoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHkuaGFzQ29tcG9uZW50KCdGaXJlQWZmaW5pdHlDb21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoZW50aXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25vIGVudGl0aWVzIG5lYXJieScpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRpdGllcy5wb3AoKTtcblxuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdjb25zdW1lRmlyZScpO1xuICAgICAgICAgICAgdGFyZ2V0LmtpbGwoKTtcblxuICAgICAgICAgICAgcmVzb2x2ZSh0YXJnZXQpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEFjdG9yQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhY3QnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gICAgcHJvdGVjdGVkIHBhcmVudDogRW50aXR5O1xuXG4gICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGFyZW50RW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZW50aXR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgRmFjdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgZmlyZTogbnVtYmVyO1xuICAgIGljZTogbnVtYmVyO1xuICAgIGhlcm86IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtmaXJlOiBudW1iZXIsIGljZTogbnVtYmVyLCBoZXJvOiBudW1iZXJ9ID0ge2ZpcmU6IDAsIGljZTogMCwgaGVybzogMH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5maXJlID0gb3B0aW9ucy5maXJlO1xuICAgICAgICB0aGlzLmljZSA9IG9wdGlvbnMuaWNlO1xuICAgICAgICB0aGlzLmhlcm8gPSBvcHRpb25zLmhlcm87XG4gICAgfVxuXG4gICAgaXNGcmllbmRseShmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlzRmVhcmluZyhmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlzRW5lbXkoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0U2VsZkZhY3Rpb24oKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuaWNlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ljZSc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5maXJlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZpcmUnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGVybyA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdoZXJvJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEZpcmVBZmZpbml0eUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgYWZmaW5pdHk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZmZpbml0eSA9ICdmaXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBHbHlwaENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBnbHlwaDogR2x5cGg7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7Z2x5cGg6IEdseXBofSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdseXBoID0gb3B0aW9ucy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBJY2VBZmZpbml0eUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgYWZmaW5pdHk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZmZpbml0eSA9ICdpY2UnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4uL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4uL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSB3YWl0aW5nOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSByZXNvbHZlOiBhbnk7XG4gICAgcHJpdmF0ZSByZWplY3Q6IGFueTtcblxuICAgIGdhbWU6IEdhbWU7XG4gICAgbWFwOiBNYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLm1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICB9XG5cbiAgICB3YWl0Rm9ySW5wdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLndhaXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0RXZlbnRUeXBlKCkgPT09IEtleWJvYXJkRXZlbnRUeXBlLkRPV04pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBrZXlib2FyZCBpbnB1dCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldElucHV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldEtleUNvZGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX1BFUklPRDpcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfWDpcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNjcmVlbiA9IHRoaXMuZ2FtZS5nZXRBY3RpdmVTY3JlZW4oKTtcbiAgICAgICAgICAgICAgICAgICAgc2NyZWVuLnN0YXJ0QWltTW92ZSgpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuXG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0o6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMCwgeTogMX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0s6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMCwgeTogLTF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19IOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IC0xLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfTDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAxLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfMTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0QWJpbGl0eUZpcmVib2x0Jywge30pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLXzI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdEFiaWxpdHlJY2VMYW5jZScsIHt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdrZXlDb2RlIG5vdCBtYXRjaGVkJywgZXZlbnQuZ2V0S2V5Q29kZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpcmVjdGlvblByZXNzZWQoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uQWZ0ZXJEaXJlY3Rpb24oZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMubWFwLmdldEVudGl0eUF0KG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKGVudGl0eSkge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1lbGVlQXR0YWNrJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRQb3NpdGlvbkFmdGVyRGlyZWN0aW9uKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCkgKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICAgIHk6IHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSArIGRpcmVjdGlvbi55XG4gICAgICAgIH07XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgTWVsZWVBdHRhY2tDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIG1hcDogTWFwO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICBjb25zdCBnYW1lID0gbmV3IEdhbWUoKTtcblxuICAgICAgICB0aGlzLm1hcCA9IGdhbWUuZ2V0TWFwKCk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdE1lbGVlQXR0YWNrJywgdGhpcy5hdHRlbXB0TWVsZWVBdHRhY2suYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1lbGVlQXR0YWNrKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IHRoaXMubWFwLmdldEVudGl0eUF0KHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSArIGRpcmVjdGlvbi54LCBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkgKyBkaXJlY3Rpb24ueSk7XG5cbiAgICAgICAgICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRhcmdldC5raWxsKClcbiAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKTtcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2tpbGxlZCcsIHRhcmdldCk7XG5cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIFBsYXllckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgeDogbnVtYmVyO1xuICAgIHByaXZhdGUgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnggPSBvcHRpb25zLng7XG4gICAgICAgIHRoaXMueSA9IG9wdGlvbnMueTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbigpOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX07XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNb3ZlJywgdGhpcy5hdHRlbXB0TW92ZUxpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlTGlzdGVuZXIoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMueCArIGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSArIGRpcmVjdGlvbi55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZy5zZW5kRXZlbnQoJ2Nhbk1vdmVUbycsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2VUbyh4OiBudW1iZXIsIHk6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoeCAtIHRoaXMueCk7XG4gICAgICAgIGNvbnN0IGR5ID0gTWF0aC5hYnMoeSAtIHRoaXMueSk7XG5cbiAgICAgICAgcmV0dXJuIGR4ICsgZHk7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogdGhpcy54LFxuICAgICAgICAgICAgeTogdGhpcy55XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlNb3ZlZCcsIHtlbnRpdHk6IHRoaXMucGFyZW50LCBvbGRQb3NpdGlvbjogb2xkUG9zaXRpb259KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIFNpZ2h0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBkaXN0YW5jZTogbnVtYmVyO1xuICAgIHZpc2libGVDZWxsczoge1twb3M6IHN0cmluZ106IGJvb2xlYW59O1xuICAgIGdhbWU6IEdhbWU7XG4gICAgaGFzU2VlbkNlbGxzOiB7W3Bvczogc3RyaW5nXTogYm9vbGVhbn07XG5cbiAgICBjaGVja2VkQXRUdXJuOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7ZGlzdGFuY2U6IG51bWJlcn0gPSB7ZGlzdGFuY2U6IDV9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMuZGlzdGFuY2UgPSBvcHRpb25zLmRpc3RhbmNlO1xuICAgICAgICB0aGlzLnZpc2libGVDZWxscyA9IHt9O1xuICAgICAgICB0aGlzLmhhc1NlZW5DZWxscyA9IHt9O1xuICAgICAgICB0aGlzLmNoZWNrZWRBdFR1cm4gPSAtMTtcbiAgICB9XG5cbiAgICBnZXREaXN0YW5jZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXN0YW5jZTtcbiAgICB9XG5cbiAgICBnZXRWaXNpYmxlQ2VsbHMoKToge1twb3M6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgICAgICAgdGhpcy5jb21wdXRlVmlzaWJsZUNlbGxzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2libGVDZWxscztcbiAgICB9XG5cbiAgICBjYW5TZWUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgaWYgKHBvc2l0aW9uQ29tcG9uZW50LmRpc3RhbmNlVG8oeCwgeSkgPiB0aGlzLmRpc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWaXNpYmxlKHgsIHkpO1xuICAgIH1cblxuICAgIGhhc1NlZW4oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5jb21wdXRlVmlzaWJsZUNlbGxzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmhhc1NlZW5DZWxsc1t4ICsgJywnICsgeV0gPT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBnZXRWaXNpYmxlRW50aXRpZXMoKTogRW50aXR5W10ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb25zdCBtYXA6IE1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgcmV0dXJuIG1hcC5nZXROZWFyYnlFbnRpdGllcyhcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LFxuICAgICAgICAgICAgdGhpcy5kaXN0YW5jZSxcbiAgICAgICAgICAgIChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlcG9zOiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZShlcG9zLmdldFgoKSwgZXBvcy5nZXRZKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNWaXNpYmxlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpYmxlQ2VsbHNbeCArICcsJyArIHldID09PSB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29tcHV0ZVZpc2libGVDZWxscygpOiB2b2lkIHtcbiAgICAgICAgdmFyIGN1cnJlbnRUdXJuID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgIGlmIChjdXJyZW50VHVybiA9PT0gdGhpcy5jaGVja2VkQXRUdXJuKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWFwOiBNYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgIHRoaXMudmlzaWJsZUNlbGxzID0gbWFwLmdldFZpc2libGVDZWxscyh0aGlzLnBhcmVudCwgdGhpcy5kaXN0YW5jZSk7XG4gICAgICAgIHRoaXMuaGFzU2VlbkNlbGxzID0gT2JqZWN0LmFzc2lnbih0aGlzLmhhc1NlZW5DZWxscywgdGhpcy52aXNpYmxlQ2VsbHMpO1xuICAgICAgICB0aGlzLmNoZWNrZWRBdFR1cm4gPSBjdXJyZW50VHVybjtcbiAgICB9XG5cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIFR1cm5Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgdHVyblJlc29sdmVkOiBhbnk7XG5cbiAgICBwcml2YXRlIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignbmV4dFR1cm4nLCB0aGlzLm5leHRUdXJuLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcigndHVybkZpbmlzaGVkJywgdGhpcy50dXJuRmluaXNoZWQuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBuZXh0VHVybigpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLmdhbWUubG9ja0VuZ2luZSgpO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnR1cm5SZXNvbHZlZCA9IHJlc29sdmU7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5hY3QoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSB0dXJuRmluaXNoZWQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy50dXJuUmVzb2x2ZWQoKTtcbiAgICAgICAgICAgIHRoaXMuZ2FtZS51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgIGdhbWUuaW5pdCg5MCwgNTApO1xufVxuXG4iXX0=
