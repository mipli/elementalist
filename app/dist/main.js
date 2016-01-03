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
            g.render();
            this.acting = true;
            if (this.hasComponent('InputComponent')) {
                this.handleInputComponent();
            } else if (this.hasComponent('RandomWalkComponent')) {
                this.handleRandomWalkComponent();
            } else {
                this.acting = false;
            }
        }
    }, {
        key: 'handleRandomWalkComponent',
        value: function handleRandomWalkComponent() {
            var _this = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('RandomWalkComponent');
            component.randomWalk().then(function () {
                g.render();
                g.unlockEngine();
                _this.acting = false;
            });
        }
    }, {
        key: 'handleInputComponent',
        value: function handleInputComponent() {
            var _this2 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('InputComponent');
            component.waitForInput().then(function () {
                g.render();
                g.unlockEngine();
                _this2.acting = false;
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

var _RandomWalkComponent = require('./components/RandomWalkComponent');

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
            enemy.addComponent(new _RandomWalkComponent.RandomWalkComponent());
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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/ActorComponent":13,"./components/GlyphComponent":15,"./components/InputComponent":16,"./components/PositionComponent":17,"./components/RandomWalkComponent":18}],9:[function(require,module,exports){
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
                    case ROT.VK_PERIOD:
                        resolve(true);
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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.RandomWalkComponent = undefined;

var _Component2 = require('./Component');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /// <reference path="../../typings/lib.es6.d.ts" />

var RandomWalkComponent = exports.RandomWalkComponent = (function (_Component) {
    _inherits(RandomWalkComponent, _Component);

    function RandomWalkComponent() {
        var options = arguments.length <= 0 || arguments[0] === undefined ? { x: 0, y: 0 } : arguments[0];

        _classCallCheck(this, RandomWalkComponent);

        return _possibleConstructorReturn(this, Object.getPrototypeOf(RandomWalkComponent).call(this));
    }

    _createClass(RandomWalkComponent, [{
        key: 'randomWalk',
        value: function randomWalk() {
            var _this2 = this;

            return new Promise(function (resolve, reject) {
                var directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
                directions = directions.randomize();
                var testDirection = function testDirection(direction) {
                    _this2.parent.sendEvent('attemptMove', direction).then(function (a) {
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

    return RandomWalkComponent;
})(_Component2.Component);

},{"./Component":14}],19:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[19])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUmFuZG9tV2Fsa0NvbXBvbmVudC50cyIsInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2FJOzs7QUFDSSxZQUFJLENBQUMsSUFBSSxHQUFHLEFBQUksTUFkaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQWFrQixRQUFRLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixZQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxBQUN4QjtLQUFDLEFBRUQsQUFBTzs7Ozs7QUFDSCxBQUFNLG1CQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFDckI7U0FBQyxBQUVE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QUMsQUFDcEM7eUJBQUMsQUFBQyxBQUFJLE1BQUMsQUFBQztBQUNKLG1DQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDbkI7eUJBQUMsQUFDTDtxQkFBQyxDQUFDLENBQUMsQUFDWDtpQkFBQyxDQUFDO0FBQ0YsNkJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxBQUNwQzthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFDTCxBQUFDOzs7O2VBcENPLFNBQVMsQUFBQyxBQUFNLEFBQWEsQUFJckM7Ozs7Ozs7QUNKQSxNQUFNLENBQUMsTUFBTSxHQUFHO0FBQ1osUUFBSSxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBSGYsSUFBSSxBQUFDLEFBQU0sQUFBUSxFQUdGLENBQUM7QUFDdEIsUUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFDdEI7Q0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7R3VpZH0gZnJvbSAnLi9HdWlkJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEVudGl0eSB7XG4gICAgZ3VpZDogc3RyaW5nO1xuICAgIGNvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogQ29tcG9uZW50fTtcbiAgICBhY3Rpbmc6IGJvb2xlYW47XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuXG4gICAgZ2V0R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLnJlbmRlcigpO1xuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dENvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxSYW5kb21XYWxrQ29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5yYW5kb21XYWxrKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBnLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlSW5wdXRDb21wb25lbnQoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5sb2NrRW5naW5lKCk7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSA8SW5wdXRDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC53YWl0Rm9ySW5wdXQoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGcucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXRQYXJlbnRFbnRpdHkodGhpcyk7XG4gICAgICAgIGNvbXBvbmVudC5zZXRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH1cblxuICAgIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmNvbXBvbmVudHNbbmFtZV0gIT09ICd1bmRlZmluZWQnO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xuICAgIH1cblxuICAgIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBQcm9taXNlPFQ+KSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7R2FtZVNjcmVlbn0gZnJvbSAnLi9HYW1lU2NyZWVuJztcbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuXG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgc2NyZWVuV2lkdGg6IG51bWJlcjtcbiAgICBzY3JlZW5IZWlnaHQ6IG51bWJlcjtcblxuICAgIGNhbnZhczogYW55O1xuXG4gICAgYWN0aXZlU2NyZWVuOiBHYW1lU2NyZWVuO1xuXG4gICAgZGlzcGxheTogYW55O1xuICAgIHNjaGVkdWxlcjogYW55O1xuICAgIGVuZ2luZTogYW55O1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChHYW1lLmluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gR2FtZS5pbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCh3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLnNjcmVlbldpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuc2NyZWVuSGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZGlzcGxheSA9IG5ldyBST1QuRGlzcGxheSh7XG4gICAgICAgICAgICB3aWR0aDogdGhpcy5zY3JlZW5XaWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogdGhpcy5zY3JlZW5IZWlnaHRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5jYW52YXMgPSB0aGlzLmRpc3BsYXkuZ2V0Q29udGFpbmVyKCk7XG4gICAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQodGhpcy5jYW52YXMpO1xuXG4gICAgICAgIHRoaXMuc2NoZWR1bGVyID0gbmV3IFJPVC5TY2hlZHVsZXIuU2ltcGxlKCk7XG4gICAgICAgIHRoaXMuZW5naW5lID0gbmV3IFJPVC5FbmdpbmUodGhpcy5zY2hlZHVsZXIpO1xuXG4gICAgICAgIHZhciBnYW1lU2NyZWVuID0gbmV3IEdhbWVTY3JlZW4odGhpcy5kaXNwbGF5LCB0aGlzLnNjcmVlbldpZHRoLCB0aGlzLnNjcmVlbkhlaWdodCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gZ2FtZVNjcmVlbjtcblxuICAgICAgICB0aGlzLmJpbmRJbnB1dEhhbmRsaW5nKCk7XG5cbiAgICAgICAgdGhpcy5lbmdpbmUuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZEV2ZW50KGV2ZW50TmFtZTogc3RyaW5nLCBjb252ZXJ0ZXI6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kSW5wdXRIYW5kbGluZygpIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudHNUb1NjcmVlbiA9IChldmVudE5hbWUsIGNvbnZlcnRlcikgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTY3JlZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4uaGFuZGxlSW5wdXQoY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdjbGljaycsIHRoaXMuY29udmVydE1vdXNlRXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEtleUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IEtleWJvYXJkRXZlbnQgPT4ge1xuICAgICAgICB2YXIgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLlBSRVNTO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudChcbiAgICAgICAgICAgIGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICBldmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBldmVudC5tZXRhS2V5XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0TW91c2VFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBNb3VzZUNsaWNrRXZlbnQgPT4ge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmRpc3BsYXkuZXZlbnRUb1Bvc2l0aW9uKGV2ZW50KTtcblxuICAgICAgICB2YXIgYnV0dG9uVHlwZTogTW91c2VCdXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLkxFRlQ7XG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMikge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5NSURETEU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQud2ljaCA9PT0gMykge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5SSUdIVFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VDbGlja0V2ZW50KFxuICAgICAgICAgICAgcG9zaXRpb25bMF0sXG4gICAgICAgICAgICBwb3NpdGlvblsxXSxcbiAgICAgICAgICAgIGJ1dHRvblR5cGVcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbnRpdHksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcblxuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBUKSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4ucmVuZGVyKCk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZVNjcmVlbiB7XG4gICAgZGlzcGxheTogYW55O1xuICAgIG1hcDogTWFwO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgZ2FtZTogR2FtZTtcblxuICAgIGNvbnN0cnVjdG9yKGRpc3BsYXk6IGFueSwgd2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdGhpcy5nYW1lLmFkZExpc3RlbmVyKCdjYW5Nb3ZlVG8nLCB0aGlzLmNhbk1vdmVUby5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gYi54OyB4IDwgYi54ICsgYi53OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBiLnk7IHkgPCBiLnkgKyBiLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciBnbHlwaDogR2x5cGggPSB0aGlzLm1hcC5nZXRUaWxlKHgsIHkpLmdldEdseXBoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChnbHlwaCwgeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcC5tYXBFbnRpdGllcyh0aGlzLnJlbmRlckVudGl0eSk7XG4gICAgfVxuXG4gICAgaGFuZGxlSW5wdXQoZXZlbnREYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ01vdXNlQ2xpY2tFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VDbGlja0V2ZW50KDxNb3VzZUNsaWNrRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlib2FyZEV2ZW50KDxLZXlib2FyZEV2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZUNsaWNrRXZlbnQoZXZlbnQ6IE1vdXNlQ2xpY2tFdmVudCkge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCkpO1xuICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkJywgZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCksIHRpbGUpO1xuICAgIH1cblxuICAgIGhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbmRlcmFibGVCb3VuZGFyeSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgdzogdGhpcy5tYXAuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGg6IHRoaXMubWFwLmdldEhlaWdodCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1JlbmRlcmFibGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHJldHVybiB4ID49IGIueCAmJiB4IDwgYi54ICsgYi53ICYmIHkgPj0gYi55ICYmIHkgPCBiLnkgKyBiLmg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyh4IC0gYi54LCB5IC0gYi55LCBnbHlwaC5jaGFyLCBnbHlwaC5mb3JlZ3JvdW5kLCBnbHlwaC5iYWNrZ3JvdW5kKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckVudGl0eSA9IChlbnRpdHk6IEVudGl0eSkgPT4ge1xuICAgICAgICB2YXIgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIHZhciBnbHlwaENvbXBvbmVudDogR2x5cGhDb21wb25lbnQgPSA8R2x5cGhDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnR2x5cGhDb21wb25lbnQnKTtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZ2x5cGggPSBnbHlwaENvbXBvbmVudC5nZXRHbHlwaCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1JlbmRlcmFibGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuTW92ZVRvKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBhY2M6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKHRpbGUuaXNXYWxrYWJsZSgpICYmIHRpbGUuZ2V0RW50aXR5R3VpZCgpID09PSAnJykge1xuICAgICAgICAgICAgICAgIHJlc29sdmUocG9zaXRpb24pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWplY3QocG9zaXRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJleHBvcnQgY2xhc3MgR2x5cGgge1xuICAgIHB1YmxpYyBjaGFyOiBzdHJpbmc7XG4gICAgcHVibGljIGZvcmVncm91bmQ6IHN0cmluZztcbiAgICBwdWJsaWMgYmFja2dyb3VuZDogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3IoY2hhcjogc3RyaW5nLCBmb3JlZ3JvdW5kOiBzdHJpbmcsIGJhY2tncm91bmQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNoYXIgPSBjaGFyO1xuICAgICAgICB0aGlzLmZvcmVncm91bmQgPSBmb3JlZ3JvdW5kO1xuICAgICAgICB0aGlzLmJhY2tncm91bmQgPSBiYWNrZ3JvdW5kO1xuICAgIH1cblxufVxuIiwiZXhwb3J0IGNsYXNzIEd1aWQge1xuICAgIHN0YXRpYyBnZW5lcmF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJ3h4eHh4eHh4LXh4eHgtNHh4eC15eHh4LXh4eHh4eHh4eHh4eCcucmVwbGFjZSgvW3h5XS9nLCBmdW5jdGlvbihjKSB7XG4gICAgICAgICAgICB2YXIgciA9IE1hdGgucmFuZG9tKCkqMTZ8MCwgdiA9IGMgPT0gJ3gnID8gciA6IChyJjB4M3wweDgpO1xuICAgICAgICAgICAgcmV0dXJuIHYudG9TdHJpbmcoMTYpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcblxuZXhwb3J0IGNsYXNzIEtleWJvYXJkRXZlbnQge1xuICAgIGtleUNvZGU6IG51bWJlcjtcbiAgICBhbHRLZXk6IGJvb2xlYW47XG4gICAgY3RybEtleTogYm9vbGVhbjtcbiAgICBzaGlmdEtleTogYm9vbGVhbjtcbiAgICBtZXRhS2V5OiBib29sZWFuO1xuICAgIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBLZXlib2FyZEV2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKGtleUNvZGU6IG51bWJlciwgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSwgYWx0S2V5OiBib29sZWFuLCBjdHJsS2V5OiBib29sZWFuLCBzaGlmdEtleTogYm9vbGVhbiwgbWV0YUtleTogYm9vbGVhbikge1xuICAgICAgICB0aGlzLmtleUNvZGUgPSBrZXlDb2RlO1xuICAgICAgICB0aGlzLmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcbiAgICAgICAgdGhpcy5hbHRLZXkgPSBhbHRLZXk7XG4gICAgICAgIHRoaXMuY3RybEtleSA9IGN0cmxLZXk7XG4gICAgICAgIHRoaXMuc2hpZnRLZXkgPSBzaGlmdEtleTtcbiAgICAgICAgdGhpcy5tZXRhS2V5ID0gbWV0YUtleTtcbiAgICB9XG5cbiAgICBnZXRFdmVudFR5cGUoKTogS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgICAgICByZXR1cm4gdGhpcy5ldmVudFR5cGU7XG4gICAgfVxuXG4gICAgZ2V0S2V5Q29kZSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5rZXlDb2RlO1xuICAgIH1cblxuICAgIGhhc0FsdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYWx0S2V5O1xuICAgIH1cblxuICAgIGhhc1NoaWZ0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5zaGlmdEtleTtcbiAgICB9XG5cbiAgICBoYXNDdHJsS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5jdHJsS2V5O1xuICAgIH1cblxuICAgIGhhc01ldGFLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLm1ldGFLZXk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gS2V5Ym9hcmRFdmVudFR5cGUge1xuICAgIERPV04sXG4gICAgVVAsXG4gICAgUFJFU1Ncbn07XG4iLCJkZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5cbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1hcCB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB0aWxlczogVGlsZVtdW107XG5cbiAgICBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdHl9O1xuXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xuICAgICAgICB0aGlzLmVudGl0aWVzID0ge307XG5cbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdlbnRpdHlNb3ZlZCcsIHRoaXMuZW50aXR5TW92ZWRMaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBjYWxsYmFjayhlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0V2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGdldFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmdlbmVyYXRlTGV2ZWwoKTtcblxuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdmFyIHBsYXllciA9IG5ldyBFbnRpdHkoKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ0AnLCAnd2hpdGUnLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBJbnB1dENvbXBvbmVudCgpKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24ocGxheWVyKTtcblxuICAgICAgICBnLmFkZEVudGl0eShwbGF5ZXIpO1xuXG4gICAgICAgIHZhciBlbmVteSA9IG5ldyBFbnRpdHkoKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBY3RvckNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCduJywgJ2N5YW4nLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgUG9zaXRpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgUmFuZG9tV2Fsa0NvbXBvbmVudCgpKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW5lbXkpO1xuXG4gICAgICAgIGcuYWRkRW50aXR5KGVuZW15KTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghZW50aXR5Lmhhc0NvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB2YXIgbWF4VHJpZXMgPSB0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiAxMDtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB3aGlsZSAoIWZvdW5kICYmIGkgPCBtYXhUcmllcykge1xuICAgICAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0VGlsZSh4LCB5KS5pc1dhbGthYmxlKCkgJiYgIXRoaXMucG9zaXRpb25IYXNFbnRpdHkoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gZnJlZSBzcG90IGZvdW5kIGZvcicsIGVudGl0eSk7XG4gICAgICAgICAgICB0aHJvdyAnTm8gZnJlZSBzcG90IGZvdW5kIGZvciBhIG5ldyBlbnRpdHknO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgICAgICB0aGlzLmdldFRpbGUoeCwgeSkuc2V0RW50aXR5R3VpZChlbnRpdHkuZ2V0R3VpZCgpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZ2FtZS5hZGRFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IGVudGl0eTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkhhc0VudGl0eSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZ2V0VGlsZSh4LCB5KTtcbiAgICAgICAgdmFyIGVudGl0eUd1aWQgPSB0aWxlLmdldEVudGl0eUd1aWQoKTtcbiAgICAgICAgcmV0dXJuIGVudGl0eUd1aWQgIT09ICcnO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVMZXZlbCgpOiBUaWxlW11bXSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdLnB1c2goVGlsZXMuY3JlYXRlLm51bGxUaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG5ldyBST1QuTWFwLkNlbGx1bGFyKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgZ2VuZXJhdG9yLnJhbmRvbWl6ZSgwLjUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgoeCwgeSwgdikgPT4ge1xuICAgICAgICAgICAgaWYgKHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS5mbG9vclRpbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF1beV0gPSBUaWxlcy5jcmVhdGUud2FsbFRpbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW50aXR5TW92ZWRMaXN0ZW5lcihkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBkYXRhLm9sZFBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGRhdGEuZW50aXR5O1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKG9sZFBvc2l0aW9uLngsIG9sZFBvc2l0aW9uLnkpLnNldEVudGl0eUd1aWQoJycpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gTW91c2VCdXR0b25UeXBlIHtcbiAgICBMRUZULFxuICAgIE1JRERMRSxcbiAgICBSSUdIVFxufTtcblxuIiwiaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcblxuZXhwb3J0IGNsYXNzIE1vdXNlQ2xpY2tFdmVudCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBidXR0b246IE1vdXNlQnV0dG9uVHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIE1vdXNlQ2xpY2tFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGUpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBidXR0b247XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBnZXRCdXR0b25UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5idXR0b247XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcbiAgICBwcml2YXRlIGVudGl0eUd1aWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHdhbGthYmxlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCB3YWxrYWJsZTogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG5cbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gJyc7XG4gICAgfVxuXG4gICAgaXNXYWxrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2FibGU7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eUd1aWQ7XG4gICAgfVxuXG4gICAgc2V0RW50aXR5R3VpZChlbnRpdHlHdWlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gZW50aXR5R3VpZDtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcblxuZXhwb3J0IG1vZHVsZSBjcmVhdGUge1xuICAgIGV4cG9ydCBmdW5jdGlvbiBudWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnICcsICdibGFjaycsICcjMTExJyksIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZsb29yVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnLicsICcjMjIyJywgJyMxMTEnKSk7XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnIycsICcjY2NjJywgJyMxMTEnKSwgZmFsc2UpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEFjdG9yQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhY3QnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gICAgcHJvdGVjdGVkIHBhcmVudDogRW50aXR5O1xuXG4gICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGFyZW50RW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZW50aXR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2dseXBoOiBHbHlwaH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbHlwaCA9IG9wdGlvbnMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHdhaXRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIHJlc29sdmU6IGFueTtcbiAgICBwcml2YXRlIHJlamVjdDogYW55O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3YWl0Rm9ySW5wdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLndhaXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0RXZlbnRUeXBlKCkgPT09IEtleWJvYXJkRXZlbnRUeXBlLkRPV04pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBrZXlib2FyZCBpbnB1dCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldElucHV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldEtleUNvZGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0o6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogMCwgeTogMX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19LOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywge3g6IDAsIHk6IC0xfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0g6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogLTEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfTDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAxLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX1BFUklPRDpcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgeDogbnVtYmVyO1xuICAgIHByaXZhdGUgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnggPSBvcHRpb25zLng7XG4gICAgICAgIHRoaXMueSA9IG9wdGlvbnMueTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbigpOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX07XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNb3ZlJywgdGhpcy5hdHRlbXB0TW92ZUxpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlTGlzdGVuZXIoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMueCArIGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSArIGRpcmVjdGlvbi55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZy5zZW5kRXZlbnQoJ2Nhbk1vdmVUbycsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogdGhpcy54LFxuICAgICAgICAgICAgeTogdGhpcy55XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlNb3ZlZCcsIHtlbnRpdHk6IHRoaXMucGFyZW50LCBvbGRQb3NpdGlvbjogb2xkUG9zaXRpb259KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmFuZG9tV2Fsa0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJhbmRvbVdhbGsoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnM6IGFueSA9IFtcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMX0sXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IC0xfSxcbiAgICAgICAgICAgICAgICB7eDogMSwgeTogMH0sXG4gICAgICAgICAgICAgICAge3g6IC0xLCB5OiAwfSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXG4gICAgICAgICAgICB2YXIgdGVzdERpcmVjdGlvbiA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0RGlyZWN0aW9uKGRpcmVjdGlvbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgIGdhbWUuaW5pdCg5MCwgNTApO1xufVxuXG4iXX0=
