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

var _Glyph = require('./Glyph');

var _Entity = require('./Entity');

var _Tiles = require('./Tiles');

var Tiles = _interopRequireWildcard(_Tiles);

var _ActorComponent = require('./components/ActorComponent');

var _PlayerComponent = require('./components/PlayerComponent');

var _SightComponent = require('./components/SightComponent');

var _GlyphComponent = require('./components/GlyphComponent');

var _PositionComponent = require('./components/PositionComponent');

var _InputComponent = require('./components/InputComponent');

var _FactionComponent = require('./components/FactionComponent');

var _AbilityFireboltComponent = require('./components/AbilityFireboltComponent');

var _AbilityIceLanceComponent = require('./components/AbilityIceLanceComponent');

var _MeleeAttackComponent = require('./components/MeleeAttackComponent');

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
        //new Map(this.width, this.height - 1);
        //this.map.generate();
        this.nullTile = Tiles.create.nullTile();
        this.player = new _Entity.Entity();
        this.player.addComponent(new _PlayerComponent.PlayerComponent());
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
        this.player.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
        this.map.addEntityAtRandomPosition(this.player);
        this.game.addEntity(this.player);
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
    }]);

    return GameScreen;
})();

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/AbilityFireboltComponent":14,"./components/AbilityIceLanceComponent":15,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/GlyphComponent":20,"./components/InputComponent":22,"./components/MeleeAttackComponent":23,"./components/PlayerComponent":24,"./components/PositionComponent":25,"./components/SightComponent":26}],4:[function(require,module,exports){
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

var _AIFactionComponent = require('./components/AIFactionComponent');

var _FactionComponent = require('./components/FactionComponent');

var _FireAffinityComponent = require('./components/FireAffinityComponent');

var _IceAffinityComponent = require('./components/IceAffinityComponent');

var _MeleeAttackComponent = require('./components/MeleeAttackComponent');

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
            enemy.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
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
            enemy.addComponent(new _AIFactionComponent.AIFactionComponent());
            enemy.addComponent(new _MeleeAttackComponent.MeleeAttackComponent());
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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/AIFactionComponent":13,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/FireAffinityComponent":19,"./components/GlyphComponent":20,"./components/IceAffinityComponent":21,"./components/MeleeAttackComponent":23,"./components/PositionComponent":25,"./components/SightComponent":26}],9:[function(require,module,exports){
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

},{"../Game":2,"../KeyboardEventType":7,"./Component":17}],23:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],24:[function(require,module,exports){
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

},{"./Component":17}],25:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],26:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],27:[function(require,module,exports){
'use strict';

var _Game = require('./Game');

window.onload = function () {
    var game = new _Game.Game();
    game.init(90, 50);
};

},{"./Game":2}]},{},[27])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNnQkk7OztBQUNJLFlBQUksQ0FBQyxJQUFJLEdBQUcsQUFBSSxNQWpCaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQUNwQixDQWdCa0IsUUFBUSxFQUFFLENBQUM7QUFDNUIsWUFBSSxDQUFDLE1BQU0sR0FBRyxLQUFLLENBQUM7QUFDcEIsWUFBSSxDQUFDLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFDckIsWUFBSSxDQUFDLFNBQVMsR0FBRyxFQUFFLENBQUMsQUFDeEI7S0FBQyxBQUVELEFBQU87Ozs7O0FBQ0gsQUFBTSxtQkFBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEFBQ3JCO1NBQUMsQUFFRCxBQUFHOzs7O0FBQ0MsZ0JBQUksQ0FBQyxHQUFHLEFBQUksQUFBSSxVQTNCaEIsSUFBSSxBQUFDLEFBQU0sQUFBUSxBQVEzQixFQW1CMEIsQ0FBQztBQUNuQixBQUFFLEFBQUMsZ0JBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN2QyxBQUFHLEFBQUMscUJBQUMsQUFBRyxJQUFDLGFBQWEsSUFBSSxJQUFJLENBQUMsVUFBVSxBQUFDLEVBQUMsQUFBQztBQUN4Qyx3QkFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNqRCx3QkFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3hDLEFBQUUsQUFBQyx3QkFBQyxLQUFLLEFBQUMsRUFBQyxBQUFDO0FBQ1IsK0JBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDdkI7cUJBQUMsQUFDTDtpQkFBQztBQUNELGlCQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsQUFDZjthQUFDO0FBRUQsZ0JBQUks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TSxHQUFHO0FBQ1osUUFBSSxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBSGYsSUFBSSxBQUFDLEFBQU0sQUFBUSxFQUdGLENBQUM7QUFDdEIsUUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUUsRUFBRSxDQUFDLENBQUMsQUFDdEI7Q0FBQyxDQUFBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsImltcG9ydCB7R3VpZH0gZnJvbSAnLi9HdWlkJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0NvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UmFuZG9tV2Fsa0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1JhbmRvbVdhbGtDb21wb25lbnQnO1xuaW1wb3J0IHtBSUZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BSUZhY3Rpb25Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRW50aXR5IHtcbiAgICBndWlkOiBzdHJpbmc7XG4gICAgY29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBDb21wb25lbnR9O1xuICAgIGFjdGluZzogYm9vbGVhbjtcblxuICAgIGxpc3RlbmVyczoge1tuYW1lOiBzdHJpbmddOiBhbnlbXX07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgdGhpcy5ndWlkID0gR3VpZC5nZW5lcmF0ZSgpO1xuICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHMgPSB7fTtcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICB9XG5cbiAgICBnZXRHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmd1aWQ7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnUGxheWVyQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbXBvbmVudE5hbWUgaW4gdGhpcy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gY29tcG9uZW50LmRlc2NyaWJlU3RhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcucmVuZGVyKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmFjdGluZyA9IHRydWU7XG4gICAgICAgIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVJbnB1dENvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdBSUZhY3Rpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVBSUZhY3Rpb25Db21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBraWxsKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICAgICAgdGhpcy5zZW5kRXZlbnQoJ2tpbGxlZCcpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5S2lsbGVkJywgdGhpcylcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVzb2x2ZSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlQUlGYWN0aW9uQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPEFJRmFjdGlvbkNvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnQUlGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5hY3QoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlUmFuZG9tV2Fsa0NvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxSYW5kb21XYWxrQ29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdSYW5kb21XYWxrQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC5yYW5kb21XYWxrKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUlucHV0Q29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPElucHV0Q29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQud2FpdEZvcklucHV0KClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhZGRDb21wb25lbnQoY29tcG9uZW50OiBDb21wb25lbnQpIHtcbiAgICAgICAgY29tcG9uZW50LnNldFBhcmVudEVudGl0eSh0aGlzKTtcbiAgICAgICAgY29tcG9uZW50LnNldExpc3RlbmVycygpO1xuICAgICAgICB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50LmdldE5hbWUoKV0gPSBjb21wb25lbnQ7XG4gICAgfVxuXG4gICAgaGFzQ29tcG9uZW50KG5hbWU6IHN0cmluZykge1xuICAgICAgICByZXR1cm4gdHlwZW9mIHRoaXMuY29tcG9uZW50c1tuYW1lXSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuXG4gICAgZ2V0Q29tcG9uZW50KG5hbWU6IHN0cmluZyk6IENvbXBvbmVudCB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbXBvbmVudHNbbmFtZV07XG4gICAgfVxuXG4gICAgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55ID0gbnVsbCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICBpZiAoIWxpc3RlbmVycyB8fCBsaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZExpc3RlbmVyPFQ+KG5hbWU6IHN0cmluZywgY2FsbGJhY2s6IChkYXRhOiBhbnkpID0+IFByb21pc2U8VD4pIHtcbiAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0gPSBbXTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXS5wdXNoKGNhbGxiYWNrKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZVNjcmVlbn0gZnJvbSAnLi9HYW1lU2NyZWVuJztcbmltcG9ydCB7QWN0b3JDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BY3RvckNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuXG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi9FbnRpdHknO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgR2FtZSB7XG4gICAgc2NyZWVuV2lkdGg6IG51bWJlcjtcbiAgICBzY3JlZW5IZWlnaHQ6IG51bWJlcjtcblxuICAgIGNhbnZhczogYW55O1xuXG4gICAgYWN0aXZlU2NyZWVuOiBHYW1lU2NyZWVuO1xuICAgIG1hcDogTWFwO1xuXG4gICAgZGlzcGxheTogYW55O1xuICAgIHNjaGVkdWxlcjogYW55O1xuICAgIGVuZ2luZTogYW55O1xuXG4gICAgdHVybkNvdW50OiBudW1iZXI7XG4gICAgdHVyblRpbWU6IG51bWJlcjtcbiAgICBtaW5UdXJuVGltZTogbnVtYmVyO1xuXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW5zdGFuY2U6IEdhbWU7XG5cbiAgICBsaXN0ZW5lcnM6IHtbbmFtZTogc3RyaW5nXTogYW55W119O1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIGlmIChHYW1lLmluc3RhbmNlKSB7XG4gICAgICAgICAgICByZXR1cm4gR2FtZS5pbnN0YW5jZTtcbiAgICAgICAgfVxuICAgICAgICBHYW1lLmluc3RhbmNlID0gdGhpcztcbiAgICAgICAgdGhpcy5saXN0ZW5lcnMgPSB7fTtcbiAgICAgICAgdGhpcy50dXJuQ291bnQgPSAwO1xuICAgICAgICB0aGlzLnR1cm5UaW1lID0gKG5ldyBEYXRlKCkpLmdldFRpbWUoKTtcbiAgICAgICAgdGhpcy5taW5UdXJuVGltZSA9IDEwMDtcbiAgICAgICAgd2luZG93WydHYW1lJ10gPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gbmV3IFJPVC5EaXNwbGF5KHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNjcmVlbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNjcmVlbkhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IHRoaXMuZGlzcGxheS5nZXRDb250YWluZXIoKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgUk9ULlNjaGVkdWxlci5TaW1wbGUoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKHtcbiAgICAgICAgICAgIGFjdDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybkNvdW50Kys7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygndHVybicsIHRoaXMudHVybkNvdW50KTtcbiAgICAgICAgICAgIH19LCB0cnVlKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgUk9ULkVuZ2luZSh0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG5cbiAgICAgICAgdmFyIGdhbWVTY3JlZW4gPSBuZXcgR2FtZVNjcmVlbih0aGlzLmRpc3BsYXksIHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0LCB0aGlzLm1hcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gZ2FtZVNjcmVlbjtcblxuICAgICAgICB0aGlzLmJpbmRJbnB1dEhhbmRsaW5nKCk7XG5cbiAgICAgICAgdGhpcy5lbmdpbmUuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLmFkZExpc3RlbmVyKCdlbnRpdHlLaWxsZWQnLCB0aGlzLmVudGl0eURlYXRoTGlzdGVuZXIuYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVudGl0eURlYXRoTGlzdGVuZXIoZW50aXR5OiBFbnRpdHkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnUGxheWVyQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhlIHBsYXllciBpcyBkZWFkIScpO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZEV2ZW50KGV2ZW50TmFtZTogc3RyaW5nLCBjb252ZXJ0ZXI6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kSW5wdXRIYW5kbGluZygpIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudHNUb1NjcmVlbiA9IChldmVudE5hbWUsIGNvbnZlcnRlcikgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTY3JlZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4uaGFuZGxlSW5wdXQoY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdjbGljaycsIHRoaXMuY29udmVydE1vdXNlRXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEtleUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IEtleWJvYXJkRXZlbnQgPT4ge1xuICAgICAgICB2YXIgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLlBSRVNTO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudChcbiAgICAgICAgICAgIGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICBldmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBldmVudC5tZXRhS2V5XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0TW91c2VFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBNb3VzZUNsaWNrRXZlbnQgPT4ge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmRpc3BsYXkuZXZlbnRUb1Bvc2l0aW9uKGV2ZW50KTtcblxuICAgICAgICB2YXIgYnV0dG9uVHlwZTogTW91c2VCdXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLkxFRlQ7XG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMikge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5NSURETEU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQud2ljaCA9PT0gMykge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5SSUdIVFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VDbGlja0V2ZW50KFxuICAgICAgICAgICAgcG9zaXRpb25bMF0sXG4gICAgICAgICAgICBwb3NpdGlvblsxXSxcbiAgICAgICAgICAgIGJ1dHRvblR5cGVcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnQWN0b3JDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKGVudGl0eSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSA8SW5wdXRDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCdrZXlkb3duJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQsIGNvbXBvbmVudC5oYW5kbGVFdmVudC5iaW5kKGNvbXBvbmVudCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gVCkge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRNYXAoKTogTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50VHVybigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybkNvdW50O1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5pbXBvcnQgKiBhcyBUaWxlcyBmcm9tICcuL1RpbGVzJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7UGxheWVyQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge0ZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUZpcmVib2x0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUljZUxhbmNlQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2NyZWVuIHtcbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgbWFwOiBNYXA7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBwbGF5ZXI6IEVudGl0eTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIG51bGxUaWxlOiBUaWxlO1xuXG4gICAgY29uc3RydWN0b3IoZGlzcGxheTogYW55LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbWFwOiBNYXApIHtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIC8vbmV3IE1hcCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDEpO1xuICAgICAgICAvL3RoaXMubWFwLmdlbmVyYXRlKCk7XG5cbiAgICAgICAgdGhpcy5udWxsVGlsZSA9IFRpbGVzLmNyZWF0ZS5udWxsVGlsZSgpO1xuXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IEVudGl0eSgpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IFBsYXllckNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBY3RvckNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBHbHlwaENvbXBvbmVudCh7XG4gICAgICAgICAgICBnbHlwaDogbmV3IEdseXBoKCdAJywgJ3doaXRlJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IElucHV0Q29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IFNpZ2h0Q29tcG9uZW50KHtcbiAgICAgICAgICAgIGRpc3RhbmNlOiA1MFxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCh7XG4gICAgICAgICAgICBoZXJvOiAxLFxuICAgICAgICAgICAgaWNlOiAtMSxcbiAgICAgICAgICAgIGZpcmU6IC0xXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBBYmlsaXR5RmlyZWJvbHRDb21wb25lbnQoKSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IE1lbGVlQXR0YWNrQ29tcG9uZW50KCkpO1xuXG4gICAgICAgIHRoaXMubWFwLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24odGhpcy5wbGF5ZXIpO1xuXG4gICAgICAgIHRoaXMuZ2FtZS5hZGRFbnRpdHkodGhpcy5wbGF5ZXIpO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuXG4gICAgICAgIGZvciAodmFyIHggPSBiLng7IHggPCBiLnggKyBiLnc7IHgrKykge1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IGIueTsgeSA8IGIueSArIGIuaDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGdseXBoOiBHbHlwaCA9IHRoaXMubWFwLmdldFRpbGUoeCwgeSkuZ2V0R2x5cGgoKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlck1hcEdseXBoKGdseXBoLCB4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubWFwLm1hcEVudGl0aWVzKHRoaXMucmVuZGVyRW50aXR5KTtcbiAgICB9XG5cbiAgICBoYW5kbGVJbnB1dChldmVudERhdGE6IGFueSkge1xuICAgICAgICBpZiAoZXZlbnREYXRhLmdldENsYXNzTmFtZSgpID09PSAnTW91c2VDbGlja0V2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVNb3VzZUNsaWNrRXZlbnQoPE1vdXNlQ2xpY2tFdmVudD5ldmVudERhdGEpO1xuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUtleWJvYXJkRXZlbnQoPEtleWJvYXJkRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZU1vdXNlQ2xpY2tFdmVudChldmVudDogTW91c2VDbGlja0V2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5nZXRYKCkgPT09IC0xIHx8IGV2ZW50LmdldFkoKSA9PT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2NsaWNrZWQgb3V0c2lkZSBvZiBjYW52YXMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciB0aWxlID0gdGhpcy5tYXAuZ2V0VGlsZShldmVudC5nZXRYKCksIGV2ZW50LmdldFkoKSk7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkJywgZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCksIHRpbGUpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5Ym9hcmRFdmVudChldmVudDogS2V5Ym9hcmRFdmVudCkge1xuICAgIH1cblxuICAgIGdldE1hcCgpOiBNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXA7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRSZW5kZXJhYmxlQm91bmRhcnkoKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgeTogMCxcbiAgICAgICAgICAgIHc6IHRoaXMubWFwLmdldFdpZHRoKCksXG4gICAgICAgICAgICBoOiB0aGlzLm1hcC5nZXRIZWlnaHQoKVxuICAgICAgICB9O1xuICAgIH1cblxuICAgIHByaXZhdGUgaXNSZW5kZXJhYmxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICByZXR1cm4geCA+PSBiLnggJiYgeCA8IGIueCArIGIudyAmJiB5ID49IGIueSAmJiB5IDwgYi55ICsgYi5oO1xuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyTWFwR2x5cGgoZ2x5cGg6IEdseXBoLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG4gICAgICAgIGNvbnN0IHNpZ2h0Q29tcG9uZW50OiBTaWdodENvbXBvbmVudCA9IDxTaWdodENvbXBvbmVudD50aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1NpZ2h0Q29tcG9uZW50Jyk7XG5cbiAgICAgICAgaWYgKHNpZ2h0Q29tcG9uZW50LmNhblNlZSh4LHkpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZ2x5cGguY2hhcixcbiAgICAgICAgICAgICAgICBnbHlwaC5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgIGdseXBoLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSBpZiAoc2lnaHRDb21wb25lbnQuaGFzU2Vlbih4LHkpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZ2x5cGguY2hhcixcbiAgICAgICAgICAgICAgICBnbHlwaC5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgICcjMTExJ1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGc6IEdseXBoID0gdGhpcy5udWxsVGlsZS5nZXRHbHlwaCgpO1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGcuY2hhcixcbiAgICAgICAgICAgICAgICBnLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgZy5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHJpdmF0ZSByZW5kZXJHbHlwaChnbHlwaDogR2x5cGgsIHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcbiAgICAgICAgY29uc3Qgc2lnaHRDb21wb25lbnQ6IFNpZ2h0Q29tcG9uZW50ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGxheWVyLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcblxuICAgICAgICBpZiAoc2lnaHRDb21wb25lbnQuY2FuU2VlKHgseSkpIHtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnbHlwaC5jaGFyLFxuICAgICAgICAgICAgICAgIGdseXBoLmZvcmVncm91bmQsXG4gICAgICAgICAgICAgICAgZ2x5cGguYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyRW50aXR5ID0gKGVudGl0eTogRW50aXR5KSA9PiB7XG4gICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgdmFyIGdseXBoQ29tcG9uZW50OiBHbHlwaENvbXBvbmVudCA9IDxHbHlwaENvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdHbHlwaENvbXBvbmVudCcpO1xuXG4gICAgICAgIHZhciBwb3NpdGlvbiA9IHBvc2l0aW9uQ29tcG9uZW50LmdldFBvc2l0aW9uKCk7XG4gICAgICAgIHZhciBnbHlwaCA9IGdseXBoQ29tcG9uZW50LmdldEdseXBoKCk7XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzUmVuZGVyYWJsZShwb3NpdGlvbi54LCBwb3NpdGlvbi55KSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXJHbHlwaChnbHlwaCwgcG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxufVxuIiwiZXhwb3J0IGNsYXNzIEdseXBoIHtcbiAgICBwdWJsaWMgY2hhcjogc3RyaW5nO1xuICAgIHB1YmxpYyBmb3JlZ3JvdW5kOiBzdHJpbmc7XG4gICAgcHVibGljIGJhY2tncm91bmQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKGNoYXI6IHN0cmluZywgZm9yZWdyb3VuZDogc3RyaW5nLCBiYWNrZ3JvdW5kOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jaGFyID0gY2hhcjtcbiAgICAgICAgdGhpcy5mb3JlZ3JvdW5kID0gZm9yZWdyb3VuZDtcbiAgICAgICAgdGhpcy5iYWNrZ3JvdW5kID0gYmFja2dyb3VuZDtcbiAgICB9XG5cbn1cbiIsImV4cG9ydCBjbGFzcyBHdWlkIHtcbiAgICBzdGF0aWMgZ2VuZXJhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICd4eHh4eHh4eC14eHh4LTR4eHgteXh4eC14eHh4eHh4eHh4eHgnLnJlcGxhY2UoL1t4eV0vZywgZnVuY3Rpb24oYykge1xuICAgICAgICAgICAgdmFyIHIgPSBNYXRoLnJhbmRvbSgpKjE2fDAsIHYgPSBjID09ICd4JyA/IHIgOiAociYweDN8MHg4KTtcbiAgICAgICAgICAgIHJldHVybiB2LnRvU3RyaW5nKDE2KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBLZXlib2FyZEV2ZW50IHtcbiAgICBrZXlDb2RlOiBudW1iZXI7XG4gICAgYWx0S2V5OiBib29sZWFuO1xuICAgIGN0cmxLZXk6IGJvb2xlYW47XG4gICAgc2hpZnRLZXk6IGJvb2xlYW47XG4gICAgbWV0YUtleTogYm9vbGVhbjtcbiAgICBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlO1xuXG4gICAgZ2V0Q2xhc3NOYW1lKCkge1xuICAgICAgICByZXR1cm4gS2V5Ym9hcmRFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvcihrZXlDb2RlOiBudW1iZXIsIGV2ZW50VHlwZTogS2V5Ym9hcmRFdmVudFR5cGUsIGFsdEtleTogYm9vbGVhbiwgY3RybEtleTogYm9vbGVhbiwgc2hpZnRLZXk6IGJvb2xlYW4sIG1ldGFLZXk6IGJvb2xlYW4pIHtcbiAgICAgICAgdGhpcy5rZXlDb2RlID0ga2V5Q29kZTtcbiAgICAgICAgdGhpcy5ldmVudFR5cGUgPSBldmVudFR5cGU7XG4gICAgICAgIHRoaXMuYWx0S2V5ID0gYWx0S2V5O1xuICAgICAgICB0aGlzLmN0cmxLZXkgPSBjdHJsS2V5O1xuICAgICAgICB0aGlzLnNoaWZ0S2V5ID0gc2hpZnRLZXk7XG4gICAgICAgIHRoaXMubWV0YUtleSA9IG1ldGFLZXk7XG4gICAgfVxuXG4gICAgZ2V0RXZlbnRUeXBlKCk6IEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXZlbnRUeXBlO1xuICAgIH1cblxuICAgIGdldEtleUNvZGUoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMua2V5Q29kZTtcbiAgICB9XG5cbiAgICBoYXNBbHRLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmFsdEtleTtcbiAgICB9XG5cbiAgICBoYXNTaGlmdEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2hpZnRLZXk7XG4gICAgfVxuXG4gICAgaGFzQ3RybEtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY3RybEtleTtcbiAgICB9XG5cbiAgICBoYXNNZXRhS2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5tZXRhS2V5O1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIEtleWJvYXJkRXZlbnRUeXBlIHtcbiAgICBET1dOLFxuICAgIFVQLFxuICAgIFBSRVNTXG59O1xuIiwiZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCAqIGFzIFRpbGVzIGZyb20gJy4vVGlsZXMnO1xuXG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtHbHlwaENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0dseXBoQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0lucHV0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSW5wdXRDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7UmFuZG9tV2Fsa0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1JhbmRvbVdhbGtDb21wb25lbnQnO1xuaW1wb3J0IHtBSUZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BSUZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0ZpcmVBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZpcmVBZmZpbml0eUNvbXBvbmVudCc7XG5pbXBvcnQge0ljZUFmZmluaXR5Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtNZWxlZUF0dGFja0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL01lbGVlQXR0YWNrQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1hcCB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB0aWxlczogVGlsZVtdW107XG5cbiAgICBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdHl9O1xuICAgIG1heEVuZW1pZXM6IG51bWJlcjtcblxuICAgIGZvdjogYW55O1xuXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG1heEVuZW1pZXM6IG51bWJlciA9IDEwKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubWF4RW5lbWllcyA9IG1heEVuZW1pZXM7XG4gICAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuXG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5hZGRMaXN0ZW5lcignZW50aXR5TW92ZWQnLCB0aGlzLmVudGl0eU1vdmVkTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2VudGl0eUtpbGxlZCcsIHRoaXMuZW50aXR5S2lsbGVkTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2Nhbk1vdmVUbycsIHRoaXMuY2FuTW92ZVRvLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHNldHVwRm92KCkge1xuICAgICAgICB0aGlzLmZvdiA9IG5ldyBST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZyhcbiAgICAgICAgICAgICh4LCB5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGlsZSA9IHRoaXMuZ2V0VGlsZSh4LCB5KTtcbiAgICAgICAgICAgICAgICBpZiAoIXRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIXRpbGUuYmxvY2tzTGlnaHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7dG9wb2xvZ3k6IDR9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUNlbGxzKGVudGl0eTogRW50aXR5LCBkaXN0YW5jZTogbnVtYmVyKToge1twb3M6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgICAgICAgbGV0IHZpc2libGVDZWxsczogYW55ID0ge307XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICB0aGlzLmZvdi5jb21wdXRlKFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpLFxuICAgICAgICAgICAgZGlzdGFuY2UsXG4gICAgICAgICAgICAoeCwgeSwgcmFkaXVzLCB2aXNpYmlsaXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgdmlzaWJsZUNlbGxzW3ggKyBcIixcIiArIHldID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmlzaWJsZUNlbGxzO1xuICAgIH1cblxuICAgIG1hcEVudGl0aWVzKGNhbGxiYWNrOiAoaXRlbTogRW50aXR5KSA9PiBhbnkpIHtcbiAgICAgICAgZm9yICh2YXIgZW50aXR5R3VpZCBpbiB0aGlzLmVudGl0aWVzKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tlbnRpdHlHdWlkXTtcbiAgICAgICAgICAgIGlmIChlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0V2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGdldFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5ID49IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1t4XVt5XTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRoaXMuZ2VuZXJhdGVMZXZlbCgpO1xuICAgICAgICB0aGlzLnNldHVwRm92KCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZGRGaXJlSW1wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF4RW5lbWllczsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEljZUltcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRmlyZUltcCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnZicsICdyZWQnLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgUG9zaXRpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQUlGYWN0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEZpcmVBZmZpbml0eUNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBNZWxlZUF0dGFja0NvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGYWN0aW9uQ29tcG9uZW50KCB7XG4gICAgICAgICAgICBmaXJlOiAxLFxuICAgICAgICAgICAgaWNlOiAwLFxuICAgICAgICAgICAgaGVybzogLTFcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSk7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgIH1cblxuICAgIGFkZEljZUltcCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnaScsICdjeWFuJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFJRmFjdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBNZWxlZUF0dGFja0NvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBJY2VBZmZpbml0eUNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGYWN0aW9uQ29tcG9uZW50KCB7XG4gICAgICAgICAgICBmaXJlOiAwLFxuICAgICAgICAgICAgaWNlOiAxLFxuICAgICAgICAgICAgaGVybzogLTFcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSk7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgIH1cblxuICAgIGFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHZhciBtYXhUcmllcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIDEwO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlICghZm91bmQgJiYgaSA8IG1heFRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRUaWxlKHgsIHkpLmlzV2Fsa2FibGUoKSAmJiAhdGhpcy5wb3NpdGlvbkhhc0VudGl0eSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBmcmVlIHNwb3QgZm91bmQgZm9yJywgZW50aXR5KTtcbiAgICAgICAgICAgIHRocm93ICdObyBmcmVlIHNwb3QgZm91bmQgZm9yIGEgbmV3IGVudGl0eSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBlbnRpdHk7XG4gICAgICAgIHRoaXMuZ2V0VGlsZSh4LCB5KS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnYW1lLmFkZEVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgIH1cblxuICAgIHJlbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICBjb25zdCBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgZ2FtZS5yZW1vdmVFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IG51bGxcbiAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKCcnKTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkhhc0VudGl0eSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZ2V0VGlsZSh4LCB5KTtcbiAgICAgICAgdmFyIGVudGl0eUd1aWQgPSB0aWxlLmdldEVudGl0eUd1aWQoKTtcbiAgICAgICAgcmV0dXJuIGVudGl0eUd1aWQgIT09ICcnO1xuICAgIH1cblxuICAgIGdldEVudGl0eUF0KHg6IG51bWJlciwgeTogbnVtYmVyKTogRW50aXR5IHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIHZhciBlbnRpdHlHdWlkID0gdGlsZS5nZXRFbnRpdHlHdWlkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0aWVzW2VudGl0eUd1aWRdO1xuICAgIH1cblxuICAgIGdldE5lYXJieUVudGl0aWVzKG9yaWdpbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQsIHJhZGl1czogbnVtYmVyLCBmaWx0ZXI6IChlbnRpdHk6IEVudGl0eSkgPT4gYm9vbGVhbiA9IChlKSA9PiB7cmV0dXJuIHRydWU7fSk6IEVudGl0eVtdIHtcbiAgICAgICAgbGV0IGVudGl0aWVzID0gW107XG4gICAgICAgIHRoaXMubWFwRW50aXRpZXMoKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaWx0ZXIoZW50aXR5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBpZiAocG9zaXRpb25Db21wb25lbnQgPT09IG9yaWdpbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gcG9zaXRpb25Db21wb25lbnQuZGlzdGFuY2VUbyhvcmlnaW5Db21wb25lbnQuZ2V0WCgpLCBvcmlnaW5Db21wb25lbnQuZ2V0WSgpKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSByYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5wdXNoKHtkaXN0YW5jZTogZGlzdGFuY2UsIGVudGl0eTogZW50aXR5fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBlbnRpdGllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2U7XG4gICAgICAgIH0pO1xuICAgICAgICBlbnRpdGllcyA9IGVudGl0aWVzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5lbnRpdHk7IH0pO1xuICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxldmVsKCk6IFRpbGVbXVtdIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF0ucHVzaChUaWxlcy5jcmVhdGUubnVsbFRpbGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbmV3IFJPVC5NYXAuQ2VsbHVsYXIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBnZW5lcmF0b3IucmFuZG9taXplKDAuNSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCh4LCB5LCB2KSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuY3JlYXRlLmZsb29yVGlsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS53YWxsVGlsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlNb3ZlZExpc3RlbmVyKGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IGRhdGEub2xkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gZGF0YS5lbnRpdHk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUob2xkUG9zaXRpb24ueCwgb2xkUG9zaXRpb24ueSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUocG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLCBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkpLnNldEVudGl0eUd1aWQoZW50aXR5LmdldEd1aWQoKSk7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVudGl0eUtpbGxlZExpc3RlbmVyKGRhdGE6IEVudGl0eSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRW50aXR5KGRhdGEpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYW5Nb3ZlVG8ocG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIGFjYzogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZ2V0VGlsZShwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmICh0aWxlLmlzV2Fsa2FibGUoKSAmJiB0aWxlLmdldEVudGl0eUd1aWQoKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gTW91c2VCdXR0b25UeXBlIHtcbiAgICBMRUZULFxuICAgIE1JRERMRSxcbiAgICBSSUdIVFxufTtcblxuIiwiaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcblxuZXhwb3J0IGNsYXNzIE1vdXNlQ2xpY2tFdmVudCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBidXR0b246IE1vdXNlQnV0dG9uVHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIE1vdXNlQ2xpY2tFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGUpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBidXR0b247XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBnZXRCdXR0b25UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5idXR0b247XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcbiAgICBwcml2YXRlIGVudGl0eUd1aWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHdhbGthYmxlOiBib29sZWFuO1xuICAgIHByaXZhdGUgYmxvY2tpbmdMaWdodDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4gPSB0cnVlLCBibG9ja2luZ0xpZ2h0OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG4gICAgICAgIHRoaXMuYmxvY2tpbmdMaWdodCA9IGJsb2NraW5nTGlnaHQ7XG5cbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gJyc7XG4gICAgfVxuXG4gICAgaXNXYWxrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2FibGU7XG4gICAgfVxuXG4gICAgYmxvY2tzTGlnaHQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NraW5nTGlnaHQ7XG4gICAgfVxuXG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cblxuICAgIGdldEVudGl0eUd1aWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5R3VpZDtcbiAgICB9XG5cbiAgICBzZXRFbnRpdHlHdWlkKGVudGl0eUd1aWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuXG5leHBvcnQgbW9kdWxlIGNyZWF0ZSB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIG51bGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcgJywgJ2JsYWNrJywgJyMwMDAnKSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZsb29yVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnLicsICcjMjIyJywgJyM0NDQnKSwgdHJ1ZSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FsbFRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJyMnLCAnI2NjYycsICcjNDQ0JyksIGZhbHNlLCB0cnVlKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFJRmFjdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdGFyZ2V0UG9zOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0UG9zID0gbnVsbDtcbiAgICB9XG5cbiAgICBhY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2lnaHQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgZmFjdGlvbiA9IDxGYWN0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IHNpZ2h0LmdldFZpc2libGVFbnRpdGllcygpO1xuXG4gICAgICAgICAgICBsZXQgZmVhcmluZzogRW50aXR5ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBlbmVteTogRW50aXR5ID0gbnVsbDtcblxuICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWYgPSA8RmFjdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGZhY3Rpb24uaXNFbmVteShlZi5nZXRTZWxmRmFjdGlvbigpKSkge1xuICAgICAgICAgICAgICAgICAgICBlbmVteSA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZlYXJpbmcgPT09IG51bGwgJiYgZmFjdGlvbi5pc0ZlYXJpbmcoZWYuZ2V0U2VsZkZhY3Rpb24oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhcmluZyA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGVuZW15ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbmVteS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHQuZ2V0WCgpLFxuICAgICAgICAgICAgICAgICAgICB5OiB0LmdldFkoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldFBvcyAhPT0gbnVsbCAmJiAodGhpcy50YXJnZXRQb3MueCAhPT0gcG9zaXRpb24uZ2V0WCgpIHx8IHRoaXMudGFyZ2V0UG9zLnkgIT09IHBvc2l0aW9uLmdldFkoKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG93YXJkc1RhcmdldChwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmRvbVdhbGsoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdvVG93YXJkc1RhcmdldChwb3NpdGlvbjogUG9zaXRpb25Db21wb25lbnQpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh0aGlzLnRhcmdldFBvcy54IC0gcG9zaXRpb24uZ2V0WCgpKTtcbiAgICAgICAgICAgIHZhciBkeSA9IE1hdGguYWJzKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpO1xuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbjogYW55O1xuXG4gICAgICAgICAgICBpZiAoZHggKyBkeSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogZHggPT0gMCA/IDAgOiBNYXRoLmZsb29yKCh0aGlzLnRhcmdldFBvcy54IC0gcG9zaXRpb24uZ2V0WCgpKSAvIGR4KSxcbiAgICAgICAgICAgICAgICAgICAgeTogZHkgPT0gMCA/IDAgOiBNYXRoLmZsb29yKCh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKSAvIGR5KVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3RyeWluZyB0byBhdHRhY2shJywgZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB0aGlzLmF0dGVtcHRBdHRhY2soZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihyZXNvbHZlKVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2gocmVqZWN0KVxuICAgICAgICAgICAgfSBlbHNlIGlmIChkeCA+IGR5KSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6ICh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKSAvIGR5XG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiAwLFxuICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiAodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0TW92ZShkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdEF0dGFjayhkaXJlY3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhdHRlbXB0TW92ZShkaXJlY3Rpb24pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJhbmRvbVdhbGsoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGRpcmVjdGlvbnM6IGFueSA9IFtcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogMX0sXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IC0xfSxcbiAgICAgICAgICAgICAgICB7eDogMSwgeTogMH0sXG4gICAgICAgICAgICAgICAge3g6IC0xLCB5OiAwfSxcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIGRpcmVjdGlvbnMgPSBkaXJlY3Rpb25zLnJhbmRvbWl6ZSgpO1xuXG4gICAgICAgICAgICB2YXIgdGVzdERpcmVjdGlvbiA9IChkaXJlY3Rpb24pID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoYSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkaXJlY3Rpb25zLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXN0RGlyZWN0aW9uKGRpcmVjdGlvbnMucG9wKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBYmlsaXR5RmlyZWJvbHRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJhbmdlOiBudW1iZXI7XG4gICAgY29vbGRvd246IG51bWJlcjtcbiAgICBsYXN0VXNlZDogbnVtYmVyO1xuICAgIGRhbWFnZVR5cGU6IHN0cmluZztcblxuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMucmFuZ2UgPSA1O1xuICAgICAgICB0aGlzLmNvb2xkb3duID0gMTAwO1xuICAgICAgICB0aGlzLmxhc3RVc2VkID0gLXRoaXMuY29vbGRvd247XG4gICAgICAgIHRoaXMuZGFtYWdlVHlwZSA9ICdmaXJlJztcbiAgICB9XG5cbiAgICBkZXNjcmliZVN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUdXJuID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgIGNvbnN0IGNvb2xkb3duID0gKHRoaXMubGFzdFVzZWQgKyB0aGlzLmNvb2xkb3duKSAtIGN1cnJlbnRUdXJuO1xuICAgICAgICByZXR1cm4gJ0ZpcmVib2x0LCBjb29sZG93bjogJyArIE1hdGgubWF4KDAsIGNvb2xkb3duKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0QWJpbGl0eUZpcmVib2x0JywgdGhpcy51c2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdjb25zdW1lRmlyZScsIHRoaXMuY29uc3VtZUZpcmUuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaXNBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93biA8PSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICB9XG5cbiAgICBjb25zdW1lRmlyZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkIC09IHRoaXMuY29vbGRvd247XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVzZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMocG9zaXRpb25Db21wb25lbnQsIHRoaXMucmFuZ2UpO1xuXG4gICAgICAgICAgICBpZiAoZW50aXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGVudGl0aWVzLnBvcCgpO1xuICAgICAgICAgICAgaWYgKCF0YXJnZXQuaGFzQ29tcG9uZW50KCdJY2VBZmZpbml0eUNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnY29uc3VtZUljZScpO1xuICAgICAgICAgICAgdGFyZ2V0LmtpbGwoKTtcblxuICAgICAgICAgICAgcmVzb2x2ZSh0YXJnZXQpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcmFuZ2U6IG51bWJlcjtcbiAgICBjb29sZG93bjogbnVtYmVyO1xuICAgIGxhc3RVc2VkOiBudW1iZXI7XG4gICAgZGFtYWdlVHlwZTogc3RyaW5nO1xuXG4gICAgZ2FtZTogR2FtZTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5yYW5nZSA9IDU7XG4gICAgICAgIHRoaXMuY29vbGRvd24gPSAxMDA7XG4gICAgICAgIHRoaXMubGFzdFVzZWQgPSAtdGhpcy5jb29sZG93bjtcbiAgICAgICAgdGhpcy5kYW1hZ2VUeXBlID0gJ2ljZSc7XG4gICAgfVxuXG4gICAgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBjb25zdCBjb29sZG93biA9ICh0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93bikgLSBjdXJyZW50VHVybjtcbiAgICAgICAgcmV0dXJuICdJY2UgTGFuY2UsIGNvb2xkb3duOiAnICsgTWF0aC5tYXgoMCwgY29vbGRvd24pO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRBYmlsaXR5SWNlTGFuY2UnLCB0aGlzLnVzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2NvbnN1bWVJY2UnLCB0aGlzLmNvbnN1bWVJY2UuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgaXNBdmFpbGFibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93biA8PSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICB9XG5cbiAgICBjb25zdW1lSWNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgLT0gdGhpcy5jb29sZG93bjtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0F2YWlsYWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IG1hcC5nZXROZWFyYnlFbnRpdGllcyhcbiAgICAgICAgICAgICAgICBwb3NpdGlvbkNvbXBvbmVudCxcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmdlLFxuICAgICAgICAgICAgICAgIChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVudGl0eS5oYXNDb21wb25lbnQoJ0ZpcmVBZmZpbml0eUNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGlmIChlbnRpdGllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnbm8gZW50aXRpZXMgbmVhcmJ5Jyk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IGVudGl0aWVzLnBvcCgpO1xuXG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2NvbnN1bWVGaXJlJyk7XG4gICAgICAgICAgICB0YXJnZXQua2lsbCgpO1xuXG4gICAgICAgICAgICByZXNvbHZlKHRhcmdldCk7XG5cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQWN0b3JDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBzdXBlcigpO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ2FjdCcpO1xuICAgIH1cbn1cbiIsImltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgQ29tcG9uZW50IHtcbiAgICBwcm90ZWN0ZWQgcGFyZW50OiBFbnRpdHk7XG5cbiAgICBwdWJsaWMgZ2V0TmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3Rvci50b1N0cmluZygpLm1hdGNoKC9cXHcrL2cpWzFdO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRQYXJlbnRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQgPSBlbnRpdHk7XG4gICAgfVxuXG4gICAgcHVibGljIHNldExpc3RlbmVycygpIHtcbiAgICB9XG5cbiAgICBwdWJsaWMgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBGYWN0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBmaXJlOiBudW1iZXI7XG4gICAgaWNlOiBudW1iZXI7XG4gICAgaGVybzogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2ZpcmU6IG51bWJlciwgaWNlOiBudW1iZXIsIGhlcm86IG51bWJlcn0gPSB7ZmlyZTogMCwgaWNlOiAwLCBoZXJvOiAwfSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmZpcmUgPSBvcHRpb25zLmZpcmU7XG4gICAgICAgIHRoaXMuaWNlID0gb3B0aW9ucy5pY2U7XG4gICAgICAgIHRoaXMuaGVybyA9IG9wdGlvbnMuaGVybztcbiAgICB9XG5cbiAgICBpc0ZyaWVuZGx5KGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNGZWFyaW5nKGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaXNFbmVteShmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gLTEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBnZXRTZWxmRmFjdGlvbigpOiBzdHJpbmcge1xuICAgICAgICBpZiAodGhpcy5pY2UgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnaWNlJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmZpcmUgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnZmlyZSc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oZXJvID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2hlcm8nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgRmlyZUFmZmluaXR5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBhZmZpbml0eTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFmZmluaXR5ID0gJ2ZpcmUnO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4uL0dseXBoJztcblxuZXhwb3J0IGNsYXNzIEdseXBoQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtnbHlwaDogR2x5cGh9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2x5cGggPSBvcHRpb25zLmdseXBoO1xuICAgIH1cblxuICAgIGdldEdseXBoKCk6IEdseXBoIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2x5cGg7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEljZUFmZmluaXR5Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBhZmZpbml0eTogc3RyaW5nO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmFmZmluaXR5ID0gJ2ljZSc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuZGVjbGFyZSB2YXIgUk9UOiBhbnk7XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuXG5pbXBvcnQge01vdXNlQnV0dG9uVHlwZX0gZnJvbSAnLi4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50fSBmcm9tICcuLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIElucHV0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHdhaXRpbmc6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIHJlc29sdmU6IGFueTtcbiAgICBwcml2YXRlIHJlamVjdDogYW55O1xuXG4gICAgZ2FtZTogR2FtZTtcbiAgICBtYXA6IE1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMubWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHdhaXRGb3JJbnB1dCgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICB0aGlzLndhaXRpbmcgPSB0cnVlO1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlc29sdmUgPSByZXNvbHZlO1xuICAgICAgICAgICAgdGhpcy5yZWplY3QgPSByZWplY3Q7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGhhbmRsZUV2ZW50KGV2ZW50OiBhbnkpIHtcbiAgICAgICAgaWYgKHRoaXMud2FpdGluZykge1xuICAgICAgICAgICAgaWYgKGV2ZW50LmdldENsYXNzTmFtZSgpID09PSAnS2V5Ym9hcmRFdmVudCcpIHtcbiAgICAgICAgICAgICAgICBldmVudCA9IDxLZXlib2FyZEV2ZW50PmV2ZW50O1xuICAgICAgICAgICAgICAgIGlmIChldmVudC5nZXRFdmVudFR5cGUoKSA9PT0gS2V5Ym9hcmRFdmVudFR5cGUuRE9XTikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUtleURvd24oZXZlbnQpXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdJbnZhbGlkIGtleWJvYXJkIGlucHV0JywgZXZlbnQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SW5wdXQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZUtleURvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiBQcm9taXNlPGJvb2xlYW4+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQuZ2V0S2V5Q29kZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfUEVSSU9EOlxuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19KOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IDAsIHk6IDF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19LOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IDAsIHk6IC0xfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAtMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0w6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMSwgeTogMH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLXzE6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdEFiaWxpdHlGaXJlYm9sdCcsIHt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS18yOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRBYmlsaXR5SWNlTGFuY2UnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1Zygna2V5Q29kZSBub3QgbWF0Y2hlZCcsIGV2ZW50LmdldEtleUNvZGUoKSk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBkaXJlY3Rpb25QcmVzc2VkKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9uID0gdGhpcy5nZXRQb3NpdGlvbkFmdGVyRGlyZWN0aW9uKGRpcmVjdGlvbik7XG4gICAgICAgICAgICBjb25zdCBlbnRpdHkgPSB0aGlzLm1hcC5nZXRFbnRpdHlBdChuZXdQb3NpdGlvbi54LCBuZXdQb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmIChlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb25BZnRlckRpcmVjdGlvbihkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcG9zaXRpb25Db21wb25lbnQuZ2V0WCgpICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgICB5OiBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkgKyBkaXJlY3Rpb24ueVxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1lbGVlQXR0YWNrQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBtYXA6IE1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBnYW1lLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIHRoaXMuYXR0ZW1wdE1lbGVlQXR0YWNrLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNZWxlZUF0dGFjayhkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm1hcC5nZXRFbnRpdHlBdChwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCkgKyBkaXJlY3Rpb24ueCwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpICsgZGlyZWN0aW9uLnkpO1xuXG4gICAgICAgICAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0YXJnZXQua2lsbCgpXG4gICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSk7XG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdraWxsZWQnLCB0YXJnZXQpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBQbGF5ZXJDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIFBvc2l0aW9uQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBwcml2YXRlIHg6IG51bWJlcjtcbiAgICBwcml2YXRlIHk6IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0gPSB7eDogMCwgeTogMH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy54ID0gb3B0aW9ucy54O1xuICAgICAgICB0aGlzLnkgPSBvcHRpb25zLnk7XG4gICAgfVxuXG4gICAgZ2V0UG9zaXRpb24oKToge3g6IG51bWJlciwgeTogbnVtYmVyfSB7XG4gICAgICAgIHJldHVybiB7eDogdGhpcy54LCB5OiB0aGlzLnl9O1xuICAgIH1cblxuICAgIGdldFgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICB9XG5cbiAgICBnZXRZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24oeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0TW92ZScsIHRoaXMuYXR0ZW1wdE1vdmVMaXN0ZW5lci5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhdHRlbXB0TW92ZUxpc3RlbmVyKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgICAgIHZhciBwb3NpdGlvbiA9IHtcbiAgICAgICAgICAgICAgICB4OiB0aGlzLnggKyBkaXJlY3Rpb24ueCxcbiAgICAgICAgICAgICAgICB5OiB0aGlzLnkgKyBkaXJlY3Rpb24ueVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGcuc2VuZEV2ZW50KCdjYW5Nb3ZlVG8nLCBwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tb3ZlKGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgocG9zaXRpb24pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGRpc3RhbmNlVG8oeDogbnVtYmVyLCB5OiBudW1iZXIpOiBudW1iZXIge1xuICAgICAgICBjb25zdCBkeCA9IE1hdGguYWJzKHggLSB0aGlzLngpO1xuICAgICAgICBjb25zdCBkeSA9IE1hdGguYWJzKHkgLSB0aGlzLnkpO1xuXG4gICAgICAgIHJldHVybiBkeCArIGR5O1xuICAgIH1cblxuICAgIG1vdmUoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KSB7XG4gICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IHtcbiAgICAgICAgICAgIHg6IHRoaXMueCxcbiAgICAgICAgICAgIHk6IHRoaXMueVxuICAgICAgICB9O1xuICAgICAgICB0aGlzLnggKz0gZGlyZWN0aW9uLng7XG4gICAgICAgIHRoaXMueSArPSBkaXJlY3Rpb24ueTtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLnNlbmRFdmVudCgnZW50aXR5TW92ZWQnLCB7ZW50aXR5OiB0aGlzLnBhcmVudCwgb2xkUG9zaXRpb246IG9sZFBvc2l0aW9ufSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBTaWdodENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgZGlzdGFuY2U6IG51bWJlcjtcbiAgICB2aXNpYmxlQ2VsbHM6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIGhhc1NlZW5DZWxsczoge1twb3M6IHN0cmluZ106IGJvb2xlYW59O1xuXG4gICAgY2hlY2tlZEF0VHVybjogbnVtYmVyO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2Rpc3RhbmNlOiBudW1iZXJ9ID0ge2Rpc3RhbmNlOiA1fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLmRpc3RhbmNlID0gb3B0aW9ucy5kaXN0YW5jZTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5oYXNTZWVuQ2VsbHMgPSB7fTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gLTE7XG4gICAgfVxuXG4gICAgZ2V0RGlzdGFuY2UoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGlzdGFuY2U7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUNlbGxzKCk6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy52aXNpYmxlQ2VsbHM7XG4gICAgfVxuXG4gICAgY2FuU2VlKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGlmIChwb3NpdGlvbkNvbXBvbmVudC5kaXN0YW5jZVRvKHgsIHkpID4gdGhpcy5kaXN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmlzVmlzaWJsZSh4LCB5KTtcbiAgICB9XG5cbiAgICBoYXNTZWVuKHg6IG51bWJlciwgeTogbnVtYmVyKTogYm9vbGVhbiB7XG4gICAgICAgIHRoaXMuY29tcHV0ZVZpc2libGVDZWxscygpO1xuICAgICAgICByZXR1cm4gdGhpcy5oYXNTZWVuQ2VsbHNbeCArICcsJyArIHldID09IHRydWU7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUVudGl0aWVzKCk6IEVudGl0eVtdIHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29uc3QgbWFwOiBNYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgIHJldHVybiBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMoXG4gICAgICAgICAgICBwb3NpdGlvbkNvbXBvbmVudCxcbiAgICAgICAgICAgIHRoaXMuZGlzdGFuY2UsXG4gICAgICAgICAgICAoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZXBvczogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoZXBvcy5nZXRYKCksIGVwb3MuZ2V0WSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzVmlzaWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzW3ggKyAnLCcgKyB5XSA9PT0gdHJ1ZTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbXB1dGVWaXNpYmxlQ2VsbHMoKTogdm9pZCB7XG4gICAgICAgIHZhciBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBpZiAoY3VycmVudFR1cm4gPT09IHRoaXMuY2hlY2tlZEF0VHVybikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcDogTWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICB0aGlzLnZpc2libGVDZWxscyA9IG1hcC5nZXRWaXNpYmxlQ2VsbHModGhpcy5wYXJlbnQsIHRoaXMuZGlzdGFuY2UpO1xuICAgICAgICB0aGlzLmhhc1NlZW5DZWxscyA9IE9iamVjdC5hc3NpZ24odGhpcy5oYXNTZWVuQ2VsbHMsIHRoaXMudmlzaWJsZUNlbGxzKTtcbiAgICAgICAgdGhpcy5jaGVja2VkQXRUdXJuID0gY3VycmVudFR1cm47XG4gICAgfVxuXG59XG4iLCJpbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5cbndpbmRvdy5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgZ2FtZS5pbml0KDkwLCA1MCk7XG59XG5cbiJdfQ==
