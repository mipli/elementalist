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
            player.addComponent(new _InputComponent.InputComponent());
            this.addEntityAtRandomPosition(player);
            var g = new _Game.Game();
            g.addEntity(player);
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
            if (this.entityGuid !== '') {
                return false;
            }
            this.entityGuid = entityGuid;
            return true;
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
        key: 'setPosition',
        value: function setPosition(x, y) {
            this.x = x;
            this.y = y;
        }
    }, {
        key: 'setListeners',
        value: function setListeners() {
            this.parent.addListener('attemptMove', this.attemptMove.bind(this));
        }
    }, {
        key: 'attemptMove',
        value: function attemptMove(direction) {
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
            this.x += direction.x;
            this.y += direction.y;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsInNyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztBQ1lJOzs7QUFDSSxZQUFJLENBQUMsSUFBSSxHQUFHLEFBQUksTUFiaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQVlrQixRQUFRLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixZQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxBQUN4QjtLQUFDLEFBRUQsQUFBTzs7Ozs7QUFDSCxBQUFNLG1CQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFDckI7U0FBQyxBQUVELEFBQUc7Ozs7OztBQUNDLGdCQUFJLENBQUMsR0FBRyxBQUFJLEFBQUksVUF2QmhCLElB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dCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtHdWlkfSBmcm9tICcuL0d1aWQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEVudGl0eSB7XG4gICAgZ3VpZDogc3RyaW5nO1xuICAgIGNvbXBvbmVudHM6IHtbbmFtZTogc3RyaW5nXTogQ29tcG9uZW50fTtcbiAgICBhY3Rpbmc6IGJvb2xlYW47XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuXG4gICAgZ2V0R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLnJlbmRlcigpO1xuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgZy5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29tcG9uZW50LndhaXRGb3JJbnB1dCgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnJlbmRlcigpO1xuICAgICAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQuc2V0UGFyZW50RW50aXR5KHRoaXMpO1xuICAgICAgICBjb21wb25lbnQuc2V0TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQuZ2V0TmFtZSgpXSA9IGNvbXBvbmVudDtcbiAgICB9XG5cbiAgICBoYXNDb21wb25lbnQobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5jb21wb25lbnRzW25hbWVdICE9PSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICBnZXRDb21wb25lbnQobmFtZTogc3RyaW5nKTogQ29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1tuYW1lXTtcbiAgICB9XG5cbiAgICBzZW5kRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gUHJvbWlzZTxUPikge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0dhbWVTY3JlZW59IGZyb20gJy4vR2FtZVNjcmVlbic7XG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcblxuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIHNjcmVlbldpZHRoOiBudW1iZXI7XG4gICAgc2NyZWVuSGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjYW52YXM6IGFueTtcblxuICAgIGFjdGl2ZVNjcmVlbjogR2FtZVNjcmVlbjtcblxuICAgIGRpc3BsYXk6IGFueTtcbiAgICBzY2hlZHVsZXI6IGFueTtcbiAgICBlbmdpbmU6IGFueTtcblxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBHYW1lO1xuXG4gICAgbGlzdGVuZXJzOiB7W25hbWU6IHN0cmluZ106IGFueVtdfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoR2FtZS5pbnN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIEdhbWUuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgR2FtZS5pbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLmRpc3BsYXkgPSBuZXcgUk9ULkRpc3BsYXkoe1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2NyZWVuV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc2NyZWVuSGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kaXNwbGF5LmdldENvbnRhaW5lcigpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBST1QuU2NoZWR1bGVyLlNpbXBsZSgpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyBST1QuRW5naW5lKHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICB2YXIgZ2FtZVNjcmVlbiA9IG5ldyBHYW1lU2NyZWVuKHRoaXMuZGlzcGxheSwgdGhpcy5zY3JlZW5XaWR0aCwgdGhpcy5zY3JlZW5IZWlnaHQpO1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbiA9IGdhbWVTY3JlZW47XG5cbiAgICAgICAgdGhpcy5iaW5kSW5wdXRIYW5kbGluZygpO1xuXG4gICAgICAgIHRoaXMuZW5naW5lLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRFdmVudChldmVudE5hbWU6IHN0cmluZywgY29udmVydGVyOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZElucHV0SGFuZGxpbmcoKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnRzVG9TY3JlZW4gPSAoZXZlbnROYW1lLCBjb252ZXJ0ZXIpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU2NyZWVuICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLmhhbmRsZUlucHV0KGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcblxuICAgICAgICBiaW5kRXZlbnRzVG9TY3JlZW4oJ2tleWRvd24nLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbignY2xpY2snLCB0aGlzLmNvbnZlcnRNb3VzZUV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRLZXlFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBLZXlib2FyZEV2ZW50ID0+IHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5QUkVTUztcbiAgICAgICAgaWYgKG5hbWUgPT09ICdrZXlkb3duJykge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleWJvYXJkRXZlbnQoXG4gICAgICAgICAgICBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICAgICAgZXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgZXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgZXZlbnQubWV0YUtleVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydE1vdXNlRXZlbnQgPSAobmFtZTogc3RyaW5nLCBldmVudDogYW55KTogTW91c2VDbGlja0V2ZW50ID0+IHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5kaXNwbGF5LmV2ZW50VG9Qb3NpdGlvbihldmVudCk7XG5cbiAgICAgICAgdmFyIGJ1dHRvblR5cGU6IE1vdXNlQnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5MRUZUO1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDIpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuTUlERExFO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LndpY2ggPT09IDMpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuUklHSFRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IE1vdXNlQ2xpY2tFdmVudChcbiAgICAgICAgICAgIHBvc2l0aW9uWzBdLFxuICAgICAgICAgICAgcG9zaXRpb25bMV0sXG4gICAgICAgICAgICBidXR0b25UeXBlXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5sb2NrRW5naW5lKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS51bmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdBY3RvckNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQoZW50aXR5LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxJbnB1dENvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoJ2tleXByZXNzJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQsIGNvbXBvbmVudC5oYW5kbGVFdmVudC5iaW5kKGNvbXBvbmVudCkpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoJ2tleWRvd24nLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG5cblxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gVCkge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLnJlbmRlcigpO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5cbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIEdhbWVTY3JlZW4ge1xuICAgIGRpc3BsYXk6IGFueTtcbiAgICBtYXA6IE1hcDtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihkaXNwbGF5OiBhbnksIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuZGlzcGxheSA9IGRpc3BsYXk7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubWFwID0gbmV3IE1hcCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDEpO1xuICAgICAgICB0aGlzLm1hcC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5hZGRMaXN0ZW5lcignY2FuTW92ZVRvJywgdGhpcy5jYW5Nb3ZlVG8uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IGIueDsgeCA8IGIueCArIGIudzsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gYi55OyB5IDwgYi55ICsgYi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2x5cGg6IEdseXBoID0gdGhpcy5tYXAuZ2V0VGlsZSh4LCB5KS5nZXRHbHlwaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXAubWFwRW50aXRpZXModGhpcy5yZW5kZXJFbnRpdHkpO1xuICAgIH1cblxuICAgIGhhbmRsZUlucHV0KGV2ZW50RGF0YTogYW55KSB7XG4gICAgICAgIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdNb3VzZUNsaWNrRXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1vdXNlQ2xpY2tFdmVudCg8TW91c2VDbGlja0V2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnREYXRhLmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5Ym9hcmRFdmVudCg8S2V5Ym9hcmRFdmVudD5ldmVudERhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VDbGlja0V2ZW50KGV2ZW50OiBNb3VzZUNsaWNrRXZlbnQpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpKTtcbiAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xpY2tlZCcsIGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpLCB0aWxlKTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZW5kZXJhYmxlQm91bmRhcnkoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHc6IHRoaXMubWFwLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoOiB0aGlzLm1hcC5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNSZW5kZXJhYmxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICByZXR1cm4geCA+PSBiLnggJiYgeCA8IGIueCArIGIudyAmJiB5ID49IGIueSAmJiB5IDwgYi55ICsgYi5oO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyR2x5cGgoZ2x5cGg6IEdseXBoLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoeCAtIGIueCwgeSAtIGIueSwgZ2x5cGguY2hhciwgZ2x5cGguZm9yZWdyb3VuZCwgZ2x5cGguYmFja2dyb3VuZCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJFbnRpdHkgPSAoZW50aXR5OiBFbnRpdHkpID0+IHtcbiAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICB2YXIgZ2x5cGhDb21wb25lbnQ6IEdseXBoQ29tcG9uZW50ID0gPEdseXBoQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0dseXBoQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gcG9zaXRpb25Db21wb25lbnQuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGdseXBoID0gZ2x5cGhDb21wb25lbnQuZ2V0R2x5cGgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNSZW5kZXJhYmxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbk1vdmVUbyhwb3NpdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSwgYWNjOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmICh0aWxlLmlzV2Fsa2FibGUoKSAmJiB0aWxlLmdldEVudGl0eUd1aWQoKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIEdseXBoIHtcbiAgICBwdWJsaWMgY2hhcjogc3RyaW5nO1xuICAgIHB1YmxpYyBmb3JlZ3JvdW5kOiBzdHJpbmc7XG4gICAgcHVibGljIGJhY2tncm91bmQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGNoYXI6IHN0cmluZywgZm9yZWdyb3VuZDogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jaGFyID0gY2hhcjtcbiAgICAgICAgdGhpcy5mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBHdWlkIHtcbiAgICBzdGF0aWMgZ2VuZXJhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZEV2ZW50IHtcbiAgICBrZXlDb2RlOiBudW1iZXI7XG4gICAgYWx0S2V5OiBib29sZWFuO1xuICAgIGN0cmxLZXk6IGJvb2xlYW47XG4gICAgc2hpZnRLZXk6IGJvb2xlYW47XG4gICAgbWV0YUtleTogYm9vbGVhbjtcbiAgICBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlO1xuXG4gICAgZ2V0Q2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gS2V5Ym9hcmRFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrZXlDb2RlOiBudW1iZXIsIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUsIGFsdEtleTogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIG1ldGFLZXk6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5rZXlDb2RlID0ga2V5Q29kZTtcbiAgICAgICAgdGhpcy5ldmVudFR5cGUgPSBldmVudFR5cGU7XG4gICAgICAgIHRoaXMuYWx0S2V5ID0gYWx0S2V5O1xuICAgICAgICB0aGlzLmN0cmxLZXkgPSBjdHJsS2V5O1xuICAgICAgICB0aGlzLnNoaWZ0S2V5ID0gc2hpZnRLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IG1ldGFLZXk7XG4gICAgfVxuXG4gICAgZ2V0RXZlbnRUeXBlKCk6IEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRUeXBlO1xuICAgIH1cblxuICAgIGdldEtleUNvZGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5Q29kZTtcbiAgICB9XG5cbiAgICBoYXNBbHRLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsdEtleTtcbiAgICB9XG5cbiAgICBoYXNTaGlmdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hpZnRLZXk7XG4gICAgfVxuXG4gICAgaGFzQ3RybEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3RybEtleTtcbiAgICB9XG5cbiAgICBoYXNNZXRhS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhS2V5O1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICBET1dOLFxuICAgIFVQLFxuICAgIFBSRVNTXG59O1xuIiwiZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCAqIGFzIFRpbGVzIGZyb20gJy4vVGlsZXMnO1xuXG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgTWFwIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHRpbGVzOiBUaWxlW11bXTtcblxuICAgIGVudGl0aWVzOiB7W2d1aWQ6IHN0cmluZ106IEVudGl0eX07XG5cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBjYWxsYmFjayhlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0V2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGdldFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRoaXMuZ2VuZXJhdGVMZXZlbCgpO1xuXG4gICAgICAgIHZhciBwbGF5ZXIgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIHBsYXllci5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBwbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgcGxheWVyLmFkZENvbXBvbmVudChuZXcgSW5wdXRDb21wb25lbnQoKSk7XG5cbiAgICAgICAgdGhpcy5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKHBsYXllcik7XG5cbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmFkZEVudGl0eShwbGF5ZXIpO1xuICAgIH1cblxuICAgIGFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHZhciBtYXhUcmllcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIDEwO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlICghZm91bmQgJiYgaSA8IG1heFRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRUaWxlKHgsIHkpLmlzV2Fsa2FibGUoKSAmJiAhdGhpcy5wb3NpdGlvbkhhc0VudGl0eSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBmcmVlIHNwb3QgZm91bmQgZm9yJywgZW50aXR5KTtcbiAgICAgICAgICAgIHRocm93ICdObyBmcmVlIHNwb3QgZm91bmQgZm9yIGEgbmV3IGVudGl0eSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBlbnRpdHk7XG4gICAgICAgIHRoaXMuZ2V0VGlsZSh4LCB5KS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnYW1lLmFkZEVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgIH1cblxuICAgIHBvc2l0aW9uSGFzRW50aXR5KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gZW50aXR5R3VpZCAhPT0gJyc7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxldmVsKCk6IFRpbGVbXVtdIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF0ucHVzaChUaWxlcy5jcmVhdGUubnVsbFRpbGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbmV3IFJPVC5NYXAuQ2VsbHVsYXIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBnZW5lcmF0b3IucmFuZG9taXplKDAuNSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCh4LCB5LCB2KSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuY3JlYXRlLmZsb29yVGlsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS53YWxsVGlsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gTW91c2VCdXR0b25UeXBlIHtcbiAgICBMRUZULFxuICAgIE1JRERMRSxcbiAgICBSSUdIVFxufTtcblxuIiwiaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcblxuZXhwb3J0IGNsYXNzIE1vdXNlQ2xpY2tFdmVudCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBidXR0b246IE1vdXNlQnV0dG9uVHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIE1vdXNlQ2xpY2tFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGUpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBidXR0b247XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBnZXRCdXR0b25UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5idXR0b247XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBnbHlwaDogR2x5cGg7XG4gICAgZW50aXR5R3VpZDogc3RyaW5nO1xuICAgIHdhbGthYmxlOiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCB3YWxrYWJsZTogYm9vbGVhbiA9IHRydWUpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG5cbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gJyc7XG4gICAgfVxuXG4gICAgaXNXYWxrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2FibGU7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eUd1aWQ7XG4gICAgfVxuXG4gICAgc2V0RW50aXR5R3VpZChlbnRpdHlHdWlkOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHRoaXMuZW50aXR5R3VpZCAhPT0gJycpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcblxuZXhwb3J0IG1vZHVsZSBjcmVhdGUge1xuICAgIGV4cG9ydCBmdW5jdGlvbiBudWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnICcsICdibGFjaycsICcjMTExJyksIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZsb29yVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnLicsICcjMjIyJywgJyMxMTEnKSk7XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnIycsICcjY2NjJywgJyMxMTEnKSwgZmFsc2UpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEFjdG9yQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhY3QnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gICAgcHJvdGVjdGVkIHBhcmVudDogRW50aXR5O1xuXG4gICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGFyZW50RW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZW50aXR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2dseXBoOiBHbHlwaH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbHlwaCA9IG9wdGlvbnMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHdhaXRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIHJlc29sdmU6IGFueTtcbiAgICBwcml2YXRlIHJlamVjdDogYW55O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3YWl0Rm9ySW5wdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLndhaXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0RXZlbnRUeXBlKCkgPT09IEtleWJvYXJkRXZlbnRUeXBlLkRPV04pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBrZXlib2FyZCBpbnB1dCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldElucHV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldEtleUNvZGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0o6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogMCwgeTogMX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19LOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywge3g6IDAsIHk6IC0xfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0g6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogLTEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfTDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAxLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHg6IG51bWJlcjtcbiAgICBwcml2YXRlIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0gPSB7eDogMCwgeTogMH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy54ID0gb3B0aW9ucy54O1xuICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnk7XG4gICAgfVxuXG4gICAgZ2V0UG9zaXRpb24oKToge3g6IG51bWJlciwgeTogbnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9O1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdE1vdmUnLCB0aGlzLmF0dGVtcHRNb3ZlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLnggKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnkgKyBkaXJlY3Rpb24ueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGcuc2VuZEV2ZW50KCdjYW5Nb3ZlVG8nLCBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlKGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG1vdmUoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KSB7XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcblxud2luZG93Lm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICBnYW1lLmluaXQoOTAsIDUwKTtcbn1cbiJdfQ==
