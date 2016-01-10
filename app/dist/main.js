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
        var name = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];

        _classCallCheck(this, Entity);

        this.name = name;
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
            if (this.name === 'player') {
                for (var componentName in this.components) {
                    var component = this.components[componentName];
                    var state = component.describeState();
                    if (state) {
                        console.log(state);
                    }
                }
                g.render();
                var c = this.getComponent('SightComponent');
                console.log('visible entities', c.getVisibleEntities());
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
            var g = new _Game.Game();
            g.sendEvent('entityKilled', this);
        }
    }, {
        key: 'handleAIFactionComponent',
        value: function handleAIFactionComponent() {
            var _this = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('AIFactionComponent');
            component.act().then(function () {
                _this.acting = false;
                g.unlockEngine();
            });
        }
    }, {
        key: 'handleRandomWalkComponent',
        value: function handleRandomWalkComponent() {
            var _this2 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('RandomWalkComponent');
            component.randomWalk().then(function () {
                _this2.acting = false;
                g.unlockEngine();
            });
        }
    }, {
        key: 'handleInputComponent',
        value: function handleInputComponent() {
            var _this3 = this;

            var g = new _Game.Game();
            g.lockEngine();
            var component = this.getComponent('InputComponent');
            component.waitForInput().then(function () {
                g.unlockEngine();
                _this3.acting = false;
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
            var _this4 = this;

            var data = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

            return new Promise(function (resolve, reject) {
                if (!_this4.listeners[name]) {
                    return false;
                }
                var returnData;
                var listeners = _this4.listeners[name];
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
        this.turnCount = 0;
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
            var _this3 = this;

            var bindEventsToScreen = function bindEventsToScreen(eventName, converter) {
                window.addEventListener(eventName, function (event) {
                    if (_this3.activeScreen !== null) {
                        _this3.activeScreen.handleInput(converter(eventName, event));
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
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                if (!_this4.listeners[name]) {
                    return false;
                }
                var returnData;
                var listeners = _this4.listeners[name];
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
            return this.activeScreen.getMap();
        }
    }, {
        key: 'getCurrentTurn',
        value: function getCurrentTurn() {
            return this.turnCount;
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

var _Glyph = require('./Glyph');

var _Entity = require('./Entity');

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _ActorComponent = require('./components/ActorComponent');

var _SightComponent = require('./components/SightComponent');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

var _InputComponent = require('./components/InputComponent');

var _FactionComponent = require('./components/FactionComponent');

var _AbilityFireboltComponent = require('./components/AbilityFireboltComponent');

var _AbilityIceLanceComponent = require('./components/AbilityIceLanceComponent');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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
        this.game = new _Game.Game();
        this.display = display;
        this.width = width;
        this.height = height;
        this.map = new _Map.Map(this.width, this.height - 1);
        this.map.generate();
        this.nullTile = Tiles.create.nullTile();
        this.player = new _Entity.Entity('player');
        this.player.addComponent(new _ActorComponent.ActorComponent());
        this.player.addComponent(new _GlyphComponent.GlyphComponent({
            glyph: new _Glyph.Glyph('@', 'white', 'black')
        }));
        this.player.addComponent(new _PositionComponent.PositionComponent());
        this.player.addComponent(new _InputComponent.InputComponent());
        this.player.addComponent(new _SightComponent.SightComponent({
            distance: 50
        }));
        this.player.addComponent(new _FactionComponent.FactionComponent({
            hero: 1,
            ice: -1,
            fire: -1
        }));
        this.player.addComponent(new _AbilityFireboltComponent.AbilityFireboltComponent());
        this.player.addComponent(new _AbilityIceLanceComponent.AbilityIceLanceComponent());
        this.map.addEntityAtRandomPosition(this.player);
        this.game.addEntity(this.player);
        this.game.addListener('canMoveTo', this.canMoveTo.bind(this));
    }

    _createClass(GameScreen, [{
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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Map":8,"./Tiles":12,"./components/AbilityFireboltComponent":14,"./components/AbilityIceLanceComponent":15,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/GlyphComponent":20,"./components/InputComponent":22,"./components/PositionComponent":23,"./components/SightComponent":25}],4:[function(require,module,exports){
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

var _SightComponent = require('./components/SightComponent');

var _RandomWalkComponent = require('./components/RandomWalkComponent');

var _AIFactionComponent = require('./components/AIFactionComponent');

var _FactionComponent = require('./components/FactionComponent');

var _FireAffinityComponent = require('./components/FireAffinityComponent');

var _IceAffinityComponent = require('./components/IceAffinityComponent');

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
            for (var i = 0; i < this.maxEnemies; i++) {
                this.addFireImp();
            }
            for (var i = 0; i < this.maxEnemies; i++) {
                this.addIceImp();
            }
        }
    }, {
        key: 'addFireImp',
        value: function addFireImp() {
            var g = new _Game.Game();
            var enemy = new _Entity.Entity();
            enemy.addComponent(new _ActorComponent.ActorComponent());
            enemy.addComponent(new _GlyphComponent.GlyphComponent({
                glyph: new _Glyph.Glyph('f', 'red', 'black')
            }));
            enemy.addComponent(new _PositionComponent.PositionComponent());
            enemy.addComponent(new _AIFactionComponent.AIFactionComponent());
            enemy.addComponent(new _FireAffinityComponent.FireAffinityComponent());
            enemy.addComponent(new _SightComponent.SightComponent());
            enemy.addComponent(new _FactionComponent.FactionComponent({
                fire: 1,
                ice: 0,
                hero: -1
            }));
            this.addEntityAtRandomPosition(enemy);
            g.addEntity(enemy);
        }
    }, {
        key: 'addIceImp',
        value: function addIceImp() {
            var g = new _Game.Game();
            var enemy = new _Entity.Entity();
            enemy.addComponent(new _ActorComponent.ActorComponent());
            enemy.addComponent(new _GlyphComponent.GlyphComponent({
                glyph: new _Glyph.Glyph('i', 'cyan', 'black')
            }));
            enemy.addComponent(new _PositionComponent.PositionComponent());
            enemy.addComponent(new _RandomWalkComponent.RandomWalkComponent());
            enemy.addComponent(new _IceAffinityComponent.IceAffinityComponent());
            enemy.addComponent(new _SightComponent.SightComponent());
            enemy.addComponent(new _FactionComponent.FactionComponent({
                fire: 0,
                ice: 1,
                hero: -1
            }));
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
    }]);

    return Map;
})();

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/AIFactionComponent":13,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/FireAffinityComponent":19,"./components/GlyphComponent":20,"./components/IceAffinityComponent":21,"./components/PositionComponent":23,"./components/RandomWalkComponent":24,"./components/SightComponent":25}],9:[function(require,module,exports){
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

},{"./Glyph":4,"./Tile":11}],13:[function(require,module,exports){
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
                if (dx > dy) {
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
        key: 'attemptMove',
        value: function attemptMove(direction) {
            var _this4 = this;

            return new Promise(function (resolve, reject) {
                _this4.parent.sendEvent('attemptMove', direction).then(function () {
                    resolve(true);
                }).catch(function () {
                    reject();
                });
            });
        }
    }, {
        key: 'randomWalk',
        value: function randomWalk() {
            var _this5 = this;

            return new Promise(function (resolve, reject) {
                var directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];
                directions = directions.randomize();
                var testDirection = function testDirection(direction) {
                    _this5.parent.sendEvent('attemptMove', direction).then(function (a) {
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

},{"./Component":17}],14:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],15:[function(require,module,exports){
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
                var entities = map.getNearbyEntities(positionComponent, _this3.range);
                if (entities.length === 0) {
                    resolve(null);
                    return;
                }
                var target = entities.pop();
                if (!target.hasComponent('FireAffinityComponent')) {
                    resolve(null);
                    return;
                }
                _this3.lastUsed = _this3.game.getCurrentTurn();
                _this3.parent.sendEvent('consumeFire');
                target.kill();
                resolve(target);
            });
        }
    }]);

    return AbilityIceLanceComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":17}],16:[function(require,module,exports){
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

},{"./Component":17}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
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

},{"./Component":17}],19:[function(require,module,exports){
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

},{"./Component":17}],20:[function(require,module,exports){
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

},{"./Component":17}],21:[function(require,module,exports){
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

},{"./Component":17}],22:[function(require,module,exports){
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
    }]);

    return InputComponent;
})(_Component2.Component);

},{"../KeyboardEventType":7,"./Component":17}],23:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],24:[function(require,module,exports){
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

},{"./Component":17}],25:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],26:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[26])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUmFuZG9tV2Fsa0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2Nv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QUM3QyxBQUFFLEFBQUMsZ0JBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxBQUFDO0FBQ3JDLEFBQU0sdUJBQUMsQUFDWDthQUFDO0FBQ0QsZ0JBQU0sR0FBRyxHQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEMsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwRSxnQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hFLGdCQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxBQUNyQztTQUFDLEFBRUwsQUFBQzs7OztlQTFFTyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRTlCOzs7Ozs7O0FDRlAsTUFBTSxDQUFDLE1BQU0sR0FBRztBQUNaLFFBQUksSUFBSSxHQUFHLEFBQUksQUFBSSxVQUhmLElBQUksQUFBQyxBQUFNLEFBQVEsRUFHRixDQUFDO0FBQ3RCLFFBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQ3RCO0NBQUMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0d1aWR9IGZyb20gJy4vR3VpZCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEVudGl0eSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGd1aWQ6IHN0cmluZztcbiAgICBjb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IENvbXBvbmVudH07XG4gICAgYWN0aW5nOiBib29sZWFuO1xuXG4gICAgbGlzdGVuZXJzOiB7W25hbWU6IHN0cmluZ106IGFueVtdfTtcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9ICcnKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuXG4gICAgZ2V0R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBpZiAodGhpcy5uYW1lID09PSAncGxheWVyJykge1xuICAgICAgICAgICAgZm9yICh2YXIgY29tcG9uZW50TmFtZSBpbiB0aGlzLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBjb21wb25lbnQuZGVzY3JpYmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgY29uc3QgYyA9IDxTaWdodENvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd2aXNpYmxlIGVudGl0aWVzJywgYy5nZXRWaXNpYmxlRW50aXRpZXMoKSk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dENvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdBSUZhY3Rpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVBSUZhY3Rpb25Db21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBraWxsKCkge1xuICAgICAgICBjb25zdCBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5zZW5kRXZlbnQoJ2VudGl0eUtpbGxlZCcsIHRoaXMpO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQUlGYWN0aW9uQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPEFJRmFjdGlvbkNvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnQUlGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5hY3QoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxSYW5kb21XYWxrQ29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5yYW5kb21XYWxrKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUlucHV0Q29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQud2FpdEZvcklucHV0KClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50LnNldFBhcmVudEVudGl0eSh0aGlzKTtcbiAgICAgICAgY29tcG9uZW50LnNldExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgaGFzQ29tcG9uZW50KG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuY29tcG9uZW50c1tuYW1lXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNbbmFtZV07XG4gICAgfVxuXG4gICAgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBQcm9taXNlPFQ+KSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0dhbWVTY3JlZW59IGZyb20gJy4vR2FtZVNjcmVlbic7XG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcblxuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIEdhbWUge1xuICAgIHNjcmVlbldpZHRoOiBudW1iZXI7XG4gICAgc2NyZWVuSGVpZ2h0OiBudW1iZXI7XG5cbiAgICBjYW52YXM6IGFueTtcblxuICAgIGFjdGl2ZVNjcmVlbjogR2FtZVNjcmVlbjtcblxuICAgIGRpc3BsYXk6IGFueTtcbiAgICBzY2hlZHVsZXI6IGFueTtcbiAgICBlbmdpbmU6IGFueTtcblxuICAgIHR1cm5Db3VudDogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChHYW1lLmluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gR2FtZS5pbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgdGhpcy50dXJuQ291bnQgPSAwO1xuICAgICAgICB3aW5kb3dbJ0dhbWUnXSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLmRpc3BsYXkgPSBuZXcgUk9ULkRpc3BsYXkoe1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2NyZWVuV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc2NyZWVuSGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kaXNwbGF5LmdldENvbnRhaW5lcigpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBST1QuU2NoZWR1bGVyLlNpbXBsZSgpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQoe1xuICAgICAgICAgICAgYWN0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuQ291bnQrKztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCd0dXJuJywgdGhpcy50dXJuQ291bnQpO1xuICAgICAgICAgICAgfX0sIHRydWUpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyBST1QuRW5naW5lKHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICB2YXIgZ2FtZVNjcmVlbiA9IG5ldyBHYW1lU2NyZWVuKHRoaXMuZGlzcGxheSwgdGhpcy5zY3JlZW5XaWR0aCwgdGhpcy5zY3JlZW5IZWlnaHQpO1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbiA9IGdhbWVTY3JlZW47XG5cbiAgICAgICAgdGhpcy5iaW5kSW5wdXRIYW5kbGluZygpO1xuXG4gICAgICAgIHRoaXMuZW5naW5lLnN0YXJ0KCk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRFdmVudChldmVudE5hbWU6IHN0cmluZywgY29udmVydGVyOiBhbnksIGNhbGxiYWNrOiBhbnkpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZElucHV0SGFuZGxpbmcoKSB7XG4gICAgICAgIHZhciBiaW5kRXZlbnRzVG9TY3JlZW4gPSAoZXZlbnROYW1lLCBjb252ZXJ0ZXIpID0+IHtcbiAgICAgICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlU2NyZWVuICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLmhhbmRsZUlucHV0KGNvbnZlcnRlcihldmVudE5hbWUsIGV2ZW50KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgfTtcblxuICAgICAgICBiaW5kRXZlbnRzVG9TY3JlZW4oJ2tleWRvd24nLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCk7XG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbignY2xpY2snLCB0aGlzLmNvbnZlcnRNb3VzZUV2ZW50KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRLZXlFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBLZXlib2FyZEV2ZW50ID0+IHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5QUkVTUztcbiAgICAgICAgaWYgKG5hbWUgPT09ICdrZXlkb3duJykge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEtleWJvYXJkRXZlbnQoXG4gICAgICAgICAgICBldmVudC5rZXlDb2RlLFxuICAgICAgICAgICAgZXZlbnRUeXBlLFxuICAgICAgICAgICAgZXZlbnQuYWx0S2V5LFxuICAgICAgICAgICAgZXZlbnQuY3RybEtleSxcbiAgICAgICAgICAgIGV2ZW50LnNoaWZ0S2V5LFxuICAgICAgICAgICAgZXZlbnQubWV0YUtleVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydE1vdXNlRXZlbnQgPSAobmFtZTogc3RyaW5nLCBldmVudDogYW55KTogTW91c2VDbGlja0V2ZW50ID0+IHtcbiAgICAgICAgbGV0IHBvc2l0aW9uID0gdGhpcy5kaXNwbGF5LmV2ZW50VG9Qb3NpdGlvbihldmVudCk7XG5cbiAgICAgICAgdmFyIGJ1dHRvblR5cGU6IE1vdXNlQnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5MRUZUO1xuICAgICAgICBpZiAoZXZlbnQud2hpY2ggPT09IDIpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuTUlERExFO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LndpY2ggPT09IDMpIHtcbiAgICAgICAgICAgIGJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuUklHSFRcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IE1vdXNlQ2xpY2tFdmVudChcbiAgICAgICAgICAgIHBvc2l0aW9uWzBdLFxuICAgICAgICAgICAgcG9zaXRpb25bMV0sXG4gICAgICAgICAgICBidXR0b25UeXBlXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHVibGljIGxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdW5sb2NrRW5naW5lKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS51bmxvY2soKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdBY3RvckNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5yZW1vdmUoZW50aXR5KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLmFkZChlbnRpdHksIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5cHJlc3MnLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgICAgICB0aGlzLmJpbmRFdmVudCgna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBzZW5kRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcmVuZGVyKCkge1xuICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbi5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0TWFwKCk6IE1hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLmFjdGl2ZVNjcmVlbi5nZXRNYXAoKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgZ2V0Q3VycmVudFR1cm4oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnR1cm5Db3VudDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuaW1wb3J0ICogYXMgVGlsZXMgZnJvbSAnLi9UaWxlcyc7XG5cbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge1NpZ2h0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlGaXJlYm9sdENvbXBvbmVudCc7XG5pbXBvcnQge0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2NyZWVuIHtcbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgbWFwOiBNYXA7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBwbGF5ZXI6IEVudGl0eTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIG51bGxUaWxlOiBUaWxlO1xuXG4gICAgY29uc3RydWN0b3IoZGlzcGxheTogYW55LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlcikge1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1hcCA9IG5ldyBNYXAodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQgLSAxKTtcbiAgICAgICAgdGhpcy5tYXAuZ2VuZXJhdGUoKTtcblxuICAgICAgICB0aGlzLm51bGxUaWxlID0gVGlsZXMuY3JlYXRlLm51bGxUaWxlKCk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgRW50aXR5KCdwbGF5ZXInKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBY3RvckNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IElucHV0Q29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IFNpZ2h0Q29tcG9uZW50KHtcbiAgICAgICAgICAgIGRpc3RhbmNlOiA1MFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCh7XG4gICAgICAgICAgICBoZXJvOiAxLFxuICAgICAgICAgICAgaWNlOiAtMSxcbiAgICAgICAgICAgIGZpcmU6IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBYmlsaXR5RmlyZWJvbHRDb21wb25lbnQoKSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50KCkpO1xuXG4gICAgICAgIHRoaXMubWFwLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24odGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5hZGRFbnRpdHkodGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5hZGRMaXN0ZW5lcignY2FuTW92ZVRvJywgdGhpcy5jYW5Nb3ZlVG8uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgcmVuZGVyKCkge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IGIueDsgeCA8IGIueCArIGIudzsgeCsrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gYi55OyB5IDwgYi55ICsgYi5oOyB5KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgZ2x5cGg6IEdseXBoID0gdGhpcy5tYXAuZ2V0VGlsZSh4LCB5KS5nZXRHbHlwaCgpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyTWFwR2x5cGgoZ2x5cGgsIHgsIHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYXAubWFwRW50aXRpZXModGhpcy5yZW5kZXJFbnRpdHkpO1xuICAgIH1cblxuICAgIGhhbmRsZUlucHV0KGV2ZW50RGF0YTogYW55KSB7XG4gICAgICAgIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdNb3VzZUNsaWNrRXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZU1vdXNlQ2xpY2tFdmVudCg8TW91c2VDbGlja0V2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnREYXRhLmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5Ym9hcmRFdmVudCg8S2V5Ym9hcmRFdmVudD5ldmVudERhdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlTW91c2VDbGlja0V2ZW50KGV2ZW50OiBNb3VzZUNsaWNrRXZlbnQpIHtcbiAgICAgICAgaWYgKGV2ZW50LmdldFgoKSA9PT0gLTEgfHwgZXZlbnQuZ2V0WSgpID09PSAtMSkge1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xpY2tlZCBvdXRzaWRlIG9mIGNhbnZhcycpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLm1hcC5nZXRUaWxlKGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2NsaWNrZWQnLCBldmVudC5nZXRYKCksIGV2ZW50LmdldFkoKSwgdGlsZSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVLZXlib2FyZEV2ZW50KGV2ZW50OiBLZXlib2FyZEV2ZW50KSB7XG4gICAgfVxuXG4gICAgZ2V0TWFwKCk6IE1hcCB7XG4gICAgICAgIHJldHVybiB0aGlzLm1hcDtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFJlbmRlcmFibGVCb3VuZGFyeSgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgICB5OiAwLFxuICAgICAgICAgICAgdzogdGhpcy5tYXAuZ2V0V2lkdGgoKSxcbiAgICAgICAgICAgIGg6IHRoaXMubWFwLmdldEhlaWdodCgpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1JlbmRlcmFibGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIHJldHVybiB4ID49IGIueCAmJiB4IDwgYi54ICsgYi53ICYmIHkgPj0gYi55ICYmIHkgPCBiLnkgKyBiLmg7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJNYXBHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcbiAgICAgICAgY29uc3Qgc2lnaHRDb21wb25lbnQ6IFNpZ2h0Q29tcG9uZW50ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGxheWVyLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcblxuICAgICAgICBpZiAoc2lnaHRDb21wb25lbnQuY2FuU2VlKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgZ2x5cGguYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIGlmIChzaWdodENvbXBvbmVudC5oYXNTZWVuKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgJyMxMTEnXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgZzogR2x5cGggPSB0aGlzLm51bGxUaWxlLmdldEdseXBoKCk7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZy5jaGFyLFxuICAgICAgICAgICAgICAgIGcuZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuICAgICAgICBjb25zdCBzaWdodENvbXBvbmVudDogU2lnaHRDb21wb25lbnQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuXG4gICAgICAgIGlmIChzaWdodENvbXBvbmVudC5jYW5TZWUoeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnbHlwaC5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJFbnRpdHkgPSAoZW50aXR5OiBFbnRpdHkpID0+IHtcbiAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICB2YXIgZ2x5cGhDb21wb25lbnQ6IEdseXBoQ29tcG9uZW50ID0gPEdseXBoQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0dseXBoQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdmFyIHBvc2l0aW9uID0gcG9zaXRpb25Db21wb25lbnQuZ2V0UG9zaXRpb24oKTtcbiAgICAgICAgdmFyIGdseXBoID0gZ2x5cGhDb21wb25lbnQuZ2V0R2x5cGgoKTtcblxuICAgICAgICBpZiAoIXRoaXMuaXNSZW5kZXJhYmxlKHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLnJlbmRlckdseXBoKGdseXBoLCBwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNhbk1vdmVUbyhwb3NpdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSwgYWNjOiBib29sZWFuID0gdHJ1ZSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmICh0aWxlLmlzV2Fsa2FibGUoKSAmJiB0aWxlLmdldEVudGl0eUd1aWQoKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIEdseXBoIHtcbiAgICBwdWJsaWMgY2hhcjogc3RyaW5nO1xuICAgIHB1YmxpYyBmb3JlZ3JvdW5kOiBzdHJpbmc7XG4gICAgcHVibGljIGJhY2tncm91bmQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGNoYXI6IHN0cmluZywgZm9yZWdyb3VuZDogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jaGFyID0gY2hhcjtcbiAgICAgICAgdGhpcy5mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBHdWlkIHtcbiAgICBzdGF0aWMgZ2VuZXJhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZEV2ZW50IHtcbiAgICBrZXlDb2RlOiBudW1iZXI7XG4gICAgYWx0S2V5OiBib29sZWFuO1xuICAgIGN0cmxLZXk6IGJvb2xlYW47XG4gICAgc2hpZnRLZXk6IGJvb2xlYW47XG4gICAgbWV0YUtleTogYm9vbGVhbjtcbiAgICBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlO1xuXG4gICAgZ2V0Q2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gS2V5Ym9hcmRFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrZXlDb2RlOiBudW1iZXIsIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUsIGFsdEtleTogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIG1ldGFLZXk6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5rZXlDb2RlID0ga2V5Q29kZTtcbiAgICAgICAgdGhpcy5ldmVudFR5cGUgPSBldmVudFR5cGU7XG4gICAgICAgIHRoaXMuYWx0S2V5ID0gYWx0S2V5O1xuICAgICAgICB0aGlzLmN0cmxLZXkgPSBjdHJsS2V5O1xuICAgICAgICB0aGlzLnNoaWZ0S2V5ID0gc2hpZnRLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IG1ldGFLZXk7XG4gICAgfVxuXG4gICAgZ2V0RXZlbnRUeXBlKCk6IEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRUeXBlO1xuICAgIH1cblxuICAgIGdldEtleUNvZGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5Q29kZTtcbiAgICB9XG5cbiAgICBoYXNBbHRLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsdEtleTtcbiAgICB9XG5cbiAgICBoYXNTaGlmdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hpZnRLZXk7XG4gICAgfVxuXG4gICAgaGFzQ3RybEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3RybEtleTtcbiAgICB9XG5cbiAgICBoYXNNZXRhS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhS2V5O1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICBET1dOLFxuICAgIFVQLFxuICAgIFBSRVNTXG59O1xuIiwiZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCAqIGFzIFRpbGVzIGZyb20gJy4vVGlsZXMnO1xuXG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UmFuZG9tV2Fsa0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1JhbmRvbVdhbGtDb21wb25lbnQnO1xuaW1wb3J0IHtBSUZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BSUZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0ZpcmVBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZpcmVBZmZpbml0eUNvbXBvbmVudCc7XG5pbXBvcnQge0ljZUFmZmluaXR5Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgTWFwIHtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIGhlaWdodDogbnVtYmVyO1xuICAgIHRpbGVzOiBUaWxlW11bXTtcblxuICAgIGVudGl0aWVzOiB7W2d1aWQ6IHN0cmluZ106IEVudGl0eX07XG4gICAgbWF4RW5lbWllczogbnVtYmVyO1xuXG4gICAgZm92OiBhbnk7XG5cbiAgICBjb25zdHJ1Y3Rvcih3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbWF4RW5lbWllczogbnVtYmVyID0gMTApIHtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXhFbmVtaWVzID0gbWF4RW5lbWllcztcbiAgICAgICAgdGhpcy50aWxlcyA9IFtdO1xuICAgICAgICB0aGlzLmVudGl0aWVzID0ge307XG5cbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdlbnRpdHlNb3ZlZCcsIHRoaXMuZW50aXR5TW92ZWRMaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICAgICAgZy5hZGRMaXN0ZW5lcignZW50aXR5S2lsbGVkJywgdGhpcy5lbnRpdHlLaWxsZWRMaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXR1cEZvdigpIHtcbiAgICAgICAgdGhpcy5mb3YgPSBuZXcgUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcoXG4gICAgICAgICAgICAoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aWxlLmJsb2Nrc0xpZ2h0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge3RvcG9sb2d5OiA0fVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscyhlbnRpdHk6IEVudGl0eSwgZGlzdGFuY2U6IG51bWJlcik6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIGxldCB2aXNpYmxlQ2VsbHM6IGFueSA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdGhpcy5mb3YuY29tcHV0ZShcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAgICAgKHgsIHksIHJhZGl1cywgdmlzaWJpbGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHZpc2libGVDZWxsc1t4ICsgXCIsXCIgKyB5XSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZpc2libGVDZWxscztcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIGdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcbiAgICB9XG5cbiAgICBnZXRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmdlbmVyYXRlTGV2ZWwoKTtcbiAgICAgICAgdGhpcy5zZXR1cEZvdigpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXhFbmVtaWVzOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRmlyZUltcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZGRJY2VJbXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEZpcmVJbXAoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2YnLCAncmVkJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFJRmFjdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGaXJlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMSxcbiAgICAgICAgICAgIGljZTogMCxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW5lbXkpO1xuXG4gICAgICAgIGcuYWRkRW50aXR5KGVuZW15KTtcbiAgICB9XG5cbiAgICBhZGRJY2VJbXAoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2knLCAnY3lhbicsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBSYW5kb21XYWxrQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEljZUFmZmluaXR5Q29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFNpZ2h0Q29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEZhY3Rpb25Db21wb25lbnQoIHtcbiAgICAgICAgICAgIGZpcmU6IDAsXG4gICAgICAgICAgICBpY2U6IDEsXG4gICAgICAgICAgICBoZXJvOiAtMVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVuZW15KTtcblxuICAgICAgICBnLmFkZEVudGl0eShlbmVteSk7XG4gICAgfVxuXG4gICAgYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbnRpdHk6IEVudGl0eSk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICAgICAgdmFyIG1heFRyaWVzID0gdGhpcy53aWR0aCAqIHRoaXMuaGVpZ2h0ICogMTA7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKCFmb3VuZCAmJiBpIDwgbWF4VHJpZXMpIHtcbiAgICAgICAgICAgIHZhciB4ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy53aWR0aCk7XG4gICAgICAgICAgICB2YXIgeSA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIGlmICh0aGlzLmdldFRpbGUoeCwgeSkuaXNXYWxrYWJsZSgpICYmICF0aGlzLnBvc2l0aW9uSGFzRW50aXR5KHgsIHkpKSB7XG4gICAgICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghZm91bmQpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ05vIGZyZWUgc3BvdCBmb3VuZCBmb3InLCBlbnRpdHkpO1xuICAgICAgICAgICAgdGhyb3cgJ05vIGZyZWUgc3BvdCBmb3VuZCBmb3IgYSBuZXcgZW50aXR5JztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBjb21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5zZXRQb3NpdGlvbih4LCB5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IGVudGl0eTtcbiAgICAgICAgdGhpcy5nZXRUaWxlKHgsIHkpLnNldEVudGl0eUd1aWQoZW50aXR5LmdldEd1aWQoKSk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGFkZEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGdhbWUuYWRkRW50aXR5KGVudGl0eSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBlbnRpdHk7XG4gICAgfVxuXG4gICAgcmVtb3ZlRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBnYW1lLnJlbW92ZUVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gbnVsbFxuICAgICAgICB0aGlzLmdldFRpbGUocG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLCBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkpLnNldEVudGl0eUd1aWQoJycpO1xuICAgIH1cblxuICAgIHBvc2l0aW9uSGFzRW50aXR5KHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gZW50aXR5R3VpZCAhPT0gJyc7XG4gICAgfVxuXG4gICAgZ2V0TmVhcmJ5RW50aXRpZXMob3JpZ2luQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCwgcmFkaXVzOiBudW1iZXIsIGZpbHRlcjogKGVudGl0eTogRW50aXR5KSA9PiBib29sZWFuID0gKGUpID0+IHtyZXR1cm4gdHJ1ZTt9KTogRW50aXR5W10ge1xuICAgICAgICBsZXQgZW50aXRpZXMgPSBbXTtcbiAgICAgICAgdGhpcy5tYXBFbnRpdGllcygoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICBpZiAoIWZpbHRlcihlbnRpdHkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgIGlmIChwb3NpdGlvbkNvbXBvbmVudCA9PT0gb3JpZ2luQ29tcG9uZW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGlzdGFuY2UgPSBwb3NpdGlvbkNvbXBvbmVudC5kaXN0YW5jZVRvKG9yaWdpbkNvbXBvbmVudC5nZXRYKCksIG9yaWdpbkNvbXBvbmVudC5nZXRZKCkpO1xuICAgICAgICAgICAgaWYgKGRpc3RhbmNlIDw9IHJhZGl1cykge1xuICAgICAgICAgICAgICAgIGVudGl0aWVzLnB1c2goe2Rpc3RhbmNlOiBkaXN0YW5jZSwgZW50aXR5OiBlbnRpdHl9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGVudGl0aWVzLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZTtcbiAgICAgICAgfSk7XG4gICAgICAgIGVudGl0aWVzID0gZW50aXRpZXMubWFwKChhKSA9PiB7IHJldHVybiBhLmVudGl0eTsgfSk7XG4gICAgICAgIHJldHVybiBlbnRpdGllcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdlbmVyYXRlTGV2ZWwoKTogVGlsZVtdW10ge1xuICAgICAgICB2YXIgdGlsZXMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gMDsgeCA8IHRoaXMud2lkdGg7IHgrKykge1xuICAgICAgICAgICAgdGlsZXMucHVzaChbXSk7XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gMDsgeSA8IHRoaXMuaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XS5wdXNoKFRpbGVzLmNyZWF0ZS5udWxsVGlsZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBnZW5lcmF0b3IgPSBuZXcgUk9ULk1hcC5DZWxsdWxhcih0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG4gICAgICAgIGdlbmVyYXRvci5yYW5kb21pemUoMC41KTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA0OyBpKyspIHtcbiAgICAgICAgICAgIGdlbmVyYXRvci5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGdlbmVyYXRvci5jcmVhdGUoKHgsIHksIHYpID0+IHtcbiAgICAgICAgICAgIGlmICh2ID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF1beV0gPSBUaWxlcy5jcmVhdGUuZmxvb3JUaWxlKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuY3JlYXRlLndhbGxUaWxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aWxlcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGVudGl0eU1vdmVkTGlzdGVuZXIoZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0gZGF0YS5vbGRQb3NpdGlvbjtcbiAgICAgICAgICAgIHZhciBlbnRpdHkgPSBkYXRhLmVudGl0eTtcbiAgICAgICAgICAgIGlmICghZW50aXR5Lmhhc0NvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdChkYXRhKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGlsZShvbGRQb3NpdGlvbi54LCBvbGRQb3NpdGlvbi55KS5zZXRFbnRpdHlHdWlkKCcnKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0VGlsZShwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCksIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSkuc2V0RW50aXR5R3VpZChlbnRpdHkuZ2V0R3VpZCgpKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW50aXR5S2lsbGVkTGlzdGVuZXIoZGF0YTogRW50aXR5KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVFbnRpdHkoZGF0YSk7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBNb3VzZUJ1dHRvblR5cGUge1xuICAgIExFRlQsXG4gICAgTUlERExFLFxuICAgIFJJR0hUXG59O1xuXG4iLCJpbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuXG5leHBvcnQgY2xhc3MgTW91c2VDbGlja0V2ZW50IHtcbiAgICB4OiBudW1iZXI7XG4gICAgeTogbnVtYmVyO1xuICAgIGJ1dHRvbjogTW91c2VCdXR0b25UeXBlO1xuXG4gICAgZ2V0Q2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gTW91c2VDbGlja0V2ZW50LnByb3RvdHlwZS5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIGNvbnN0cnVjdG9yKHg6IG51bWJlciwgeTogbnVtYmVyLCBidXR0b246IE1vdXNlQnV0dG9uVHlwZSkge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLmJ1dHRvbiA9IGJ1dHRvbjtcbiAgICB9XG5cbiAgICBnZXRYKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLng7XG4gICAgfVxuXG4gICAgZ2V0WSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy55O1xuICAgIH1cblxuICAgIGdldEJ1dHRvblR5cGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmJ1dHRvbjtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcblxuZXhwb3J0IGNsYXNzIFRpbGUge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuICAgIHByaXZhdGUgZW50aXR5R3VpZDogc3RyaW5nO1xuICAgIHByaXZhdGUgd2Fsa2FibGU6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBibG9ja2luZ0xpZ2h0OiBib29sZWFuO1xuXG4gICAgY29uc3RydWN0b3IoZ2x5cGg6IEdseXBoLCB3YWxrYWJsZTogYm9vbGVhbiA9IHRydWUsIGJsb2NraW5nTGlnaHQ6IGJvb2xlYW4gPSBmYWxzZSkge1xuICAgICAgICB0aGlzLmdseXBoID0gZ2x5cGg7XG4gICAgICAgIHRoaXMud2Fsa2FibGUgPSB3YWxrYWJsZTtcbiAgICAgICAgdGhpcy5ibG9ja2luZ0xpZ2h0ID0gYmxvY2tpbmdMaWdodDtcblxuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSAnJztcbiAgICB9XG5cbiAgICBpc1dhbGthYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy53YWxrYWJsZTtcbiAgICB9XG5cbiAgICBibG9ja3NMaWdodCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYmxvY2tpbmdMaWdodDtcbiAgICB9XG5cblxuICAgIGdldEdseXBoKCk6IEdseXBoIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0RW50aXR5R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdHlHdWlkO1xuICAgIH1cblxuICAgIHNldEVudGl0eUd1aWQoZW50aXR5R3VpZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuZW50aXR5R3VpZCA9IGVudGl0eUd1aWQ7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5cbmV4cG9ydCBtb2R1bGUgY3JlYXRlIHtcbiAgICBleHBvcnQgZnVuY3Rpb24gbnVsbFRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJyAnLCAnYmxhY2snLCAnIzAwMCcpLCBmYWxzZSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gZmxvb3JUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcuJywgJyMyMjInLCAnIzQ0NCcpLCB0cnVlLCBmYWxzZSk7XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiB3YWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnIycsICcjY2NjJywgJyM0NDQnKSwgZmFsc2UsIHRydWUpO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1NpZ2h0Q29tcG9uZW50fSBmcm9tICcuL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQUlGYWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICB0YXJnZXRQb3M6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgIH1cblxuICAgIGFjdCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzaWdodCA9IDxTaWdodENvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1NpZ2h0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zdCBmYWN0aW9uID0gPEZhY3Rpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbiA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudGl0aWVzID0gc2lnaHQuZ2V0VmlzaWJsZUVudGl0aWVzKCk7XG5cbiAgICAgICAgICAgIGxldCBmZWFyaW5nOiBFbnRpdHkgPSBudWxsO1xuICAgICAgICAgICAgbGV0IGVuZW15OiBFbnRpdHkgPSBudWxsO1xuXG4gICAgICAgICAgICBlbnRpdGllcy5mb3JFYWNoKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBlZiA9IDxGYWN0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ0ZhY3Rpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICBpZiAoZmFjdGlvbi5pc0VuZW15KGVmLmdldFNlbGZGYWN0aW9uKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZW15ID0gZW50aXR5O1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZmVhcmluZyA9PT0gbnVsbCAmJiBmYWN0aW9uLmlzRmVhcmluZyhlZi5nZXRTZWxmRmFjdGlvbigpKSkge1xuICAgICAgICAgICAgICAgICAgICBmZWFyaW5nID0gZW50aXR5O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpZiAoZW5lbXkgIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVuZW15LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogdC5nZXRYKCksXG4gICAgICAgICAgICAgICAgICAgIHk6IHQuZ2V0WSgpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHRoaXMudGFyZ2V0UG9zICE9PSBudWxsICYmICh0aGlzLnRhcmdldFBvcy54ICE9PSBwb3NpdGlvbi5nZXRYKCkgfHwgdGhpcy50YXJnZXRQb3MueSAhPT0gcG9zaXRpb24uZ2V0WSgpKSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZ29Ub3dhcmRzVGFyZ2V0KHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmFuZG9tV2FsaygpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ29Ub3dhcmRzVGFyZ2V0KHBvc2l0aW9uOiBQb3NpdGlvbkNvbXBvbmVudCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpO1xuICAgICAgICAgICAgdmFyIGR5ID0gTWF0aC5hYnModGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSk7XG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uOiBhbnk7XG5cbiAgICAgICAgICAgIGlmIChkeCA+IGR5KSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKSAvIGR5XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByYW5kb21XYWxrKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zOiBhbnkgPSBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDF9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAtMX0sXG4gICAgICAgICAgICAgICAge3g6IDEsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAtMSwgeTogMH0sXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBkaXJlY3Rpb25zID0gZGlyZWN0aW9ucy5yYW5kb21pemUoKTtcblxuICAgICAgICAgICAgdmFyIHRlc3REaXJlY3Rpb24gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRlc3REaXJlY3Rpb24oZGlyZWN0aW9ucy5wb3AoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByYW5nZTogbnVtYmVyO1xuICAgIGNvb2xkb3duOiBudW1iZXI7XG4gICAgbGFzdFVzZWQ6IG51bWJlcjtcbiAgICBkYW1hZ2VUeXBlOiBzdHJpbmc7XG5cbiAgICBnYW1lOiBHYW1lO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLnJhbmdlID0gNTtcbiAgICAgICAgdGhpcy5jb29sZG93biA9IDEwMDtcbiAgICAgICAgdGhpcy5sYXN0VXNlZCA9IC10aGlzLmNvb2xkb3duO1xuICAgICAgICB0aGlzLmRhbWFnZVR5cGUgPSAnZmlyZSc7XG4gICAgfVxuXG4gICAgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBjb25zdCBjb29sZG93biA9ICh0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93bikgLSBjdXJyZW50VHVybjtcbiAgICAgICAgcmV0dXJuICdGaXJlYm9sdCwgY29vbGRvd246ICcgKyBNYXRoLm1heCgwLCBjb29sZG93bik7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdEFiaWxpdHlGaXJlYm9sdCcsIHRoaXMudXNlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignY29uc3VtZUZpcmUnLCB0aGlzLmNvbnN1bWVGaXJlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUZpcmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCAtPSB0aGlzLmNvb2xkb3duO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1c2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQXZhaWxhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudGl0aWVzID0gbWFwLmdldE5lYXJieUVudGl0aWVzKHBvc2l0aW9uQ29tcG9uZW50LCB0aGlzLnJhbmdlKTtcblxuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRpdGllcy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc0NvbXBvbmVudCgnSWNlQWZmaW5pdHlDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2NvbnN1bWVJY2UnKTtcbiAgICAgICAgICAgIHRhcmdldC5raWxsKCk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBYmlsaXR5SWNlTGFuY2VDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJhbmdlOiBudW1iZXI7XG4gICAgY29vbGRvd246IG51bWJlcjtcbiAgICBsYXN0VXNlZDogbnVtYmVyO1xuICAgIGRhbWFnZVR5cGU6IHN0cmluZztcblxuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMucmFuZ2UgPSA1O1xuICAgICAgICB0aGlzLmNvb2xkb3duID0gMTAwO1xuICAgICAgICB0aGlzLmxhc3RVc2VkID0gLXRoaXMuY29vbGRvd247XG4gICAgICAgIHRoaXMuZGFtYWdlVHlwZSA9ICdpY2UnO1xuICAgIH1cblxuICAgIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgY29uc3QgY29vbGRvd24gPSAodGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24pIC0gY3VycmVudFR1cm47XG4gICAgICAgIHJldHVybiAnSWNlIExhbmNlLCBjb29sZG93bjogJyArIE1hdGgubWF4KDAsIGNvb2xkb3duKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0QWJpbGl0eUljZUxhbmNlJywgdGhpcy51c2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdjb25zdW1lSWNlJywgdGhpcy5jb25zdW1lSWNlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUljZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkIC09IHRoaXMuY29vbGRvd247XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVzZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMocG9zaXRpb25Db21wb25lbnQsIHRoaXMucmFuZ2UpO1xuXG4gICAgICAgICAgICBpZiAoZW50aXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGVudGl0aWVzLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQuaGFzQ29tcG9uZW50KCdGaXJlQWZmaW5pdHlDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnY29uc3VtZUZpcmUnKTtcbiAgICAgICAgICAgIHRhcmdldC5raWxsKCk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodGFyZ2V0KTtcblxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBBY3RvckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnYWN0Jyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xuICAgIHByb3RlY3RlZCBwYXJlbnQ6IEVudGl0eTtcblxuICAgIHB1YmxpYyBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBhcmVudEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGVudGl0eTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TGlzdGVuZXJzKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXNjcmliZVN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEZhY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGZpcmU6IG51bWJlcjtcbiAgICBpY2U6IG51bWJlcjtcbiAgICBoZXJvOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7ZmlyZTogbnVtYmVyLCBpY2U6IG51bWJlciwgaGVybzogbnVtYmVyfSA9IHtmaXJlOiAwLCBpY2U6IDAsIGhlcm86IDB9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmlyZSA9IG9wdGlvbnMuZmlyZTtcbiAgICAgICAgdGhpcy5pY2UgPSBvcHRpb25zLmljZTtcbiAgICAgICAgdGhpcy5oZXJvID0gb3B0aW9ucy5oZXJvO1xuICAgIH1cblxuICAgIGlzRnJpZW5kbHkoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0ZlYXJpbmcoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0VuZW15KGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFNlbGZGYWN0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmljZSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdpY2UnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmlyZSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdmaXJlJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhlcm8gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnaGVybyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBGaXJlQWZmaW5pdHlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGFmZmluaXR5OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWZmaW5pdHkgPSAnZmlyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2dseXBoOiBHbHlwaH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbHlwaCA9IG9wdGlvbnMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgSWNlQWZmaW5pdHlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGFmZmluaXR5OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWZmaW5pdHkgPSAnaWNlJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHdhaXRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIHJlc29sdmU6IGFueTtcbiAgICBwcml2YXRlIHJlamVjdDogYW55O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB3YWl0Rm9ySW5wdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLndhaXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0RXZlbnRUeXBlKCkgPT09IEtleWJvYXJkRXZlbnRUeXBlLkRPV04pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBrZXlib2FyZCBpbnB1dCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldElucHV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldEtleUNvZGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX1BFUklPRDpcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAwLCB5OiAxfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0s6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCB7eDogMCwgeTogLTF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIHt4OiAtMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19MOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywge3g6IDEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfMTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0QWJpbGl0eUZpcmVib2x0Jywge30pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLXzI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdEFiaWxpdHlJY2VMYW5jZScsIHt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdrZXlDb2RlIG5vdCBtYXRjaGVkJywgZXZlbnQuZ2V0S2V5Q29kZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUG9zaXRpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgeDogbnVtYmVyO1xuICAgIHByaXZhdGUgeTogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnggPSBvcHRpb25zLng7XG4gICAgICAgIHRoaXMueSA9IG9wdGlvbnMueTtcbiAgICB9XG5cbiAgICBnZXRQb3NpdGlvbigpOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgcmV0dXJuIHt4OiB0aGlzLngsIHk6IHRoaXMueX07XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBzZXRQb3NpdGlvbih4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNb3ZlJywgdGhpcy5hdHRlbXB0TW92ZUxpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlTGlzdGVuZXIoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdmFyIHBvc2l0aW9uID0ge1xuICAgICAgICAgICAgICAgIHg6IHRoaXMueCArIGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgICAgIHk6IHRoaXMueSArIGRpcmVjdGlvbi55XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgZy5zZW5kRXZlbnQoJ2Nhbk1vdmVUbycsIHBvc2l0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKChwb3NpdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZGlzdGFuY2VUbyh4OiBudW1iZXIsIHk6IG51bWJlcik6IG51bWJlciB7XG4gICAgICAgIGNvbnN0IGR4ID0gTWF0aC5hYnMoeCAtIHRoaXMueCk7XG4gICAgICAgIGNvbnN0IGR5ID0gTWF0aC5hYnMoeSAtIHRoaXMueSk7XG5cbiAgICAgICAgcmV0dXJuIGR4ICsgZHk7XG4gICAgfVxuXG4gICAgbW92ZShkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pIHtcbiAgICAgICAgdmFyIG9sZFBvc2l0aW9uID0ge1xuICAgICAgICAgICAgeDogdGhpcy54LFxuICAgICAgICAgICAgeTogdGhpcy55XG4gICAgICAgIH07XG4gICAgICAgIHRoaXMueCArPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ICs9IGRpcmVjdGlvbi55O1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlNb3ZlZCcsIHtlbnRpdHk6IHRoaXMucGFyZW50LCBvbGRQb3NpdGlvbjogb2xkUG9zaXRpb259KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgUmFuZG9tV2Fsa0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge3g6IG51bWJlciwgeTogbnVtYmVyfSA9IHt4OiAwLCB5OiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIHJhbmRvbVdhbGsoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnM6IGFueSA9IFtcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMX0sXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IC0xfSxcbiAgICAgICAgICAgICAgICB7eDogMSwgeTogMH0sXG4gICAgICAgICAgICAgICAge3g6IC0xLCB5OiAwfSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXG4gICAgICAgICAgICB2YXIgdGVzdERpcmVjdGlvbiA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0RGlyZWN0aW9uKGRpcmVjdGlvbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBTaWdodENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgZGlzdGFuY2U6IG51bWJlcjtcbiAgICB2aXNpYmxlQ2VsbHM6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIGhhc1NlZW5DZWxsczoge1twb3M6IHN0cmluZ106IGJvb2xlYW59O1xuXG4gICAgY2hlY2tlZEF0VHVybjogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2Rpc3RhbmNlOiBudW1iZXJ9ID0ge2Rpc3RhbmNlOiA1fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLmRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5oYXNTZWVuQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gLTE7XG4gICAgfVxuXG4gICAgZ2V0RGlzdGFuY2UoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUNlbGxzKCk6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpYmxlQ2VsbHM7XG4gICAgfVxuXG4gICAgY2FuU2VlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGlmIChwb3NpdGlvbkNvbXBvbmVudC5kaXN0YW5jZVRvKHgsIHkpID4gdGhpcy5kaXN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZSh4LCB5KTtcbiAgICB9XG5cbiAgICBoYXNTZWVuKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTZWVuQ2VsbHNbeCArICcsJyArIHldID09IHRydWU7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUVudGl0aWVzKCk6IEVudGl0eVtdIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29uc3QgbWFwOiBNYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgIHJldHVybiBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMoXG4gICAgICAgICAgICBwb3NpdGlvbkNvbXBvbmVudCxcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UsXG4gICAgICAgICAgICAoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXBvczogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoZXBvcy5nZXRYKCksIGVwb3MuZ2V0WSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmlzaWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzW3ggKyAnLCcgKyB5XSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbXB1dGVWaXNpYmxlQ2VsbHMoKTogdm9pZCB7XG4gICAgICAgIHZhciBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBpZiAoY3VycmVudFR1cm4gPT09IHRoaXMuY2hlY2tlZEF0VHVybikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcDogTWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICB0aGlzLnZpc2libGVDZWxscyA9IG1hcC5nZXRWaXNpYmxlQ2VsbHModGhpcy5wYXJlbnQsIHRoaXMuZGlzdGFuY2UpO1xuICAgICAgICB0aGlzLmhhc1NlZW5DZWxscyA9IE9iamVjdC5hc3NpZ24odGhpcy5oYXNTZWVuQ2VsbHMsIHRoaXMudmlzaWJsZUNlbGxzKTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gY3VycmVudFR1cm47XG4gICAgfVxuXG59XG4iLCJpbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgZ2FtZS5pbml0KDkwLCA1MCk7XG59XG5cbiJdfQ==
