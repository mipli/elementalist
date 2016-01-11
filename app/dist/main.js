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
        this.player = new _Entity.Entity('player');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUGxheWVyQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9Qb3NpdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQudHMiLCJzcmMvbWFpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNpQkk7WUFBWSxJQUFJLHlEQUFXLEVBQUU7Ozs7QUFDekIsWUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7QUFDakIsWUFBSSxDQUFDLElBQUksR0FBRyxBQUFJLE1BbkJoQixJQUFJLEFBQUMsQUFBTSxBQUFRLEFBQ3BCLENBa0JrQixRQUFRLEVBQUUsQ0FBQztBQUM1QixZQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQztBQUNwQixZQUFJLENBQUMsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQUNyQixZQUFJLENBQUMsU0FBUyxHQUFHLEVBQUUsQ0FBQyxBQUN4QjtLQUFDLEFBRUQsQUFBTzs7Ozs7QUFDSCxBQUFNLG1CQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQUFDckI7U0FBQyxBQUVELEFBQUc7Ozs7QUFDQyxnQkFBSSxDQUFDLEdBQUcsQUFBSSxBQUFJLFVBN0JoQixJQUFJLEFBQUMsQUFBTSxBQUFRLEFBUTNCLEVBcUIwQixDQUFDO0FBQ25CLEFBQUUsQUFBQyxnQkFBQyxJQUFJLENBQUMsSUFBSSxLQUFLLFFBQVEsQUFBQyxFQUFDLEFBQUM7QUFDekIsQUFBRyxBQUFDLHFCQUFDLEFBQUcsSUFBQyxhQUFhLElBQUksSUFBSSxDQUFDLFVBQVUsQUFBQyxFQUFDLEFBQUM7QUFDeEMsd0JBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakQsd0JBQU0sS0FBSyxHQUFHLFNBQVMsQ0FBQyxhQUFhLEVBQUUsQ0FBQztBQUN4QyxBQUFFLEFBQUMsd0JBQUMsS0FBSyxBQUFDLEVBQUMsQUFBQztBQUNSLCtCQUFPLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQ3ZCO3FCQUFDLEFBQ0w7aUJBQUM7QUFDRCxpQkFBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBRVgsb0JBQU0sQ0FBQyxHQUFtQixJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUMsQUFDbEU7YUFBQztBQUVELGdCQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQztBQUNuQixBQUFFLEFBQUMsZ0JBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN0QyxvQkFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsQUFDaEM7YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFFLEFBQUMsSUFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ2xELG9CQUFJLENBQUMseUJBQXlCLEVBQUUsQ0FBQyxBQUNyQzthQUFDLEFBQUMsQUFBSSxNQUFDLEFBQUUsQUFBQyxJQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsb0JBQW9CLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDakQsb0JBQUksQ0FBQyx3QkFBd0IsRUFBRSxDQUFDLEFBQ3BDO2FBQUMsQUFBQyxBQUFJLE1BQUMsQUFBQztBQUNKLG9CQUFJLENBQUMsTUFBTSxHQUFHLEtBQUssQ0FBQyxBQUN4QjthQUFDLEFBQ0w7U0FBQyxBQUVELEFBQUk7Ozs7OztBQUNBLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxvQkFBTSxDQUFDLEdBQUcsQUFBSSxBQUFJLGdCQUFFLENBQUM7QUFDckIsQUFBSSxzQkFBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQ25CLElBQUksQ0FBQztBQUNGLHFCQUFDLENBQUMsU0FBUyxDQUFDLGNBQWMsQUFBRSxBQUFJLFFBQUMsQ0FDNUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUNiLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxBQUN4QjtpQkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gscUJBQUMsQ0FBQyxTQUFTLENBQUMsY0FBYyxBQUFFLEFBQUksUUFBQyxDQUM1QixJQUFJLENBQUMsT0FBTyxDQUFDLENBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEFBQ3hCO2lCQUFDLENBQUMsQ0FBQyxBQUNYO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVPLEFBQXdCOzs7Ozs7QUFDNUIsZ0JBQUksQ0FBQyxHQUFHLEFBQUksQUFBSSxnQkFBRSxDQUFDO0FBQ25CLGFBQUMsQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNmLGdCQUFJLFNBQVMsR0FBdUIsSUFBSSxDQUFDLFlBQVksQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO0FBQzVFLHFCQUFTLENBQUMsR0FBRyxFQUFFLENBQ1YsSUFBSSxDQUFDO0FBQ0YsQUFBSSx1QkFBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLGlCQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQUFDckI7YUFBQyxDQUFDLENBQUMsQUFDWDtTQUFDLEFBRU8sQUFBeUI7Ozs7OztBQUM3QixnQkFBSSxDQUFDLEdBQUcsQUFBSSxBQUFJLGdCQUFFLENBQUM7QUFDbkIsYUFBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2YsZ0JBQUksU0FBUyxHQUF3QixJQUFJLENBQUMsWUFBWSxDQUFDLHFCQUFxQixDQUFDLENBQUM7QUFDOUUscUJBQVMsQ0FBQyxVQUFVLEVBQUUsQ0FDakIsSUFBSSxDQUFDO0FBQ0YsQUFBSSx1QkFBQyxNQUFNLEdBQUcsS0FBSyxDQUFDO0FBQ3BCLGlCQUFDLENBQUMsWUFBWSxFQUFFLENBQUMsQUFDckI7YUFBQyxDQUFDLENBQUMsQUFDWDtTQUFDLEFBRU8sQUFBb0I7Ozs7OztBQUN4QixnQkFBSSxDQUFDLEdBQUcsQUFBSSxBQUFJLGdCQUFFLENBQUM7QUFDbkIsYUFBQyxDQUFDLFVBQVUsRUFBRSxDQUFDO0FBQ2YsZ0JBQUksU0FBUyxHQUFtQixJQUFJLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDcEUscUJBQVMsQ0FBQyxZQUFZLEVBQUUsQ0FDbkIsSUFBSSxDQUFDO0FBQ0YsaUJBQUMsQ0FBQyxZQUFZLEVBQUUsQ0FBQztBQUNqQixBQUFJLHVCQUFDLE1BQU0sR0FBRyxLQUFLLENBQUMsQUFDeEI7YUFBQyxDQUFDLENBQUMsQUFDWDtTQUFDLEFBRUQsQUFBWTs7O3FDQUFDLFNBQW9CO0FBQzdCLHFCQUFTLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2hDLHFCQUFTLENBQUMsWUFBWSxFQUFFLENBQUM7QUFDekIsZ0JBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEFBQ3JEO1NBQUMsQUFFRCxBQUFZOzs7cUNBQUMsSUFBWTtBQUNyQixBQUFNLG1CQUFDLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsS0FBSyxXQUFXLENBQUMsQUFDeEQ7U0FBQyxBQUVELEFBQVk7OztxQ0FBQyxJQUFZO0FBQ3JCLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNqQztTQUFDLEFBRUQsQUFBUzs7O2tDQUFDLElBQVk7OztnQkFBRSxJQUFJLHlEQUFRLElBQUk7O0FBQ3BDLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFFLEFBQUMsb0JBQUMsQ0FBQyxBQUFJLE9BQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN4QiwwQkFBTSxFQUFFLENBQUMsQUFDYjtpQkFBQztBQUNELG9CQUFJLFVBQVUsQ0FBQztBQUVmLG9CQUFJLFNBQVMsR0FBRyxBQUFJLE9BQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3JDLEFBQUUsQUFBQyxvQkFBQyxDQUFDLFNBQVMsSUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDdkMsMEJBQU0sRUFBRSxDQUFDLEFBQ2I7aUJBQUM7QUFDRCxvQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBRVYsb0JBQUksUUFBUSxHQUFHLGtCQUFDLElBQUk7QUFDaEIsd0JBQUksUUFBUSxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1QixxQkFBQyxFQUFFLENBQUM7QUFFSix3QkFBSSxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3ZCLHFCQUFDLENBQUMsSUFBSSxDQUFDLFVBQUMsTUFBTTtBQUNWLEFBQUUsQUFBQyw0QkFBQyxDQUFDLEtBQUssU0FBUyxDQUFDLE1BQU0sQUFBQyxFQUFDLEFBQUM7QUFDekIsbUNBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNwQjt5QkFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osb0NBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNyQjt5QkFBQyxBQUNMO3FCQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsVUFBQyxNQUFNO0FBQ1osOEJBQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNuQjtxQkFBQyxDQUFDLENBQUMsQUFDUDtpQkFBQyxDQUFDO0FBRUYsd0JBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNuQjthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFFRCxBQUFXOzs7b0NBQUksSUFBWSxFQUFFLFFBQW1DO0FBQzVELEFBQUUsQUFBQyxnQkFBQyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3hCLG9CQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQyxBQUM5QjthQUFDO0FBQ0QsZ0JBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDLEFBQ3hDO1NBQUMsQUFDTCxBQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDMUhHOzs7OztBQWlFUSw0QkFBZSxHQUFHLFVBQUMsSUFBWSxFQUFFLEtBQVU7QUFDL0MsZ0JBQUksU0FBUyxHQUFzQixBQUFpQixtQkExRnBELGlCQUFpQixBQUFDLEFBQU0sQUFBcUIsQUFDOUMsQ0F5RnNELEtBQUssQ0FBQztBQUMzRCxBQUFFLEFBQUMsZ0JBQUMsSUFBSSxLQUFLLFNBQVMsQUFBQyxFQUFDLEFBQUM7QUFDckIseUJBQVMsR0FBRyxBQUFpQixxQ0FBQyxJQUFJLENBQUMsQUFDdkM7YUFBQztBQUNELEFBQU0sbUJBQUMsQUFBSSxBQUFhLG1CQTdGeEIsYUFBYSxBQUFDLEFBQU0sQUFBaUIsQUFFN0MsQ0E0RlksS0FBSyxDQUFDLE9BQU8sRUFDYixTQUFTLEVBQ1QsS0FBSyxDQUFDLE1BQU0sRUFDWixLQUFLLENBQUMsT0FBTyxFQUNiLEtBQUssQ0FBQyxRQUFRLEVBQ2QsS0FBSyxDQUFDLE9BQU8sQ0FDaEIsQ0FBQyxBQUNOO1NBQUMsQ0FBQTtBQUVPLDhCQUFpQixHQUFHLFVBQUMsSUFBWSxFQUFFLEtBQVU7QUFDakQsZ0JBQUksUUFBUSxHQUFHLEFBQUksTUFBQyxPQUFPLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBRW5ELGdCQUFJLFVBQVUsR0FBb0IsQUFBZSxpQkE3R2pELGVBQWUsQUFBQyxBQUFNLEFBQW1CLEFBQzFDLENBNEdtRCxJQUFJLENBQUM7QUFDdkQsQUFBRSxBQUFDLGdCQUFDLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUNwQiwwQkFBVSxHQUFHLEFBQWUsaUNBQUMsTUFBTSxDQUFDLEFBQ3hDO2FBQUMsQUFBQyxBQUFJLE1BQUMsQUFBRSxBQUFDLElBQUMsS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQzFCLDBCQUFVLEdBQUcsQUFBZSxpQ0FBQyxLQUFLLENBQUEsQUFDdEM7YUFBQztBQUNELEFBQU0sbUJBQUMsQUFBSSxBQUFlLHFCQWxIMUIsZUFBZSxBQUFDLEFBQU0sQUFBbUIsQUFDMUMsQ0FrSEssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUNYLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFDWCxVQUFVLENBQ2IsQ0FBQyxBQUNOO1NBQUMsQ0FBQTtBQTdGRyxBQUFFLEFBQUMsWUFBQyxJQUFJLENBQUMsUUFBUSxBQUFDLEVBQUMsQUFBQztBQUNoQixBQUFNLG1CQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQUFDekI7U0FBQztBQUNELFlBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3JCLFlBQUksQ0FBQyxTQUFTLEdBQUcsRUFBRSxDQUFDO0FBQ3BCLFlBQUksQ0FBQyxTQUFTLEdBQUcsQ0FBQyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxRQUFRLEdBQUcsQUFBQyxJQUFJLElBQUksRUFBRSxBQUFDLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDdkMsWUFBSSxDQUFDLFdBQVcsR0FBRyxHQUFHLENBQUM7QUFDdkIsY0FBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxBQUMxQjtLQUFDLEFBRU0sQUFBSTs7Ozs2QkFBQyxLQUFhLEVBQUUsTUFBYzs7O0FBQ3JDLGdCQUFJLENBQUMsV0FBVyxHQUFHLEtBQUssQ0FBQztBQUN6QixnQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUM7QUFFM0IsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxHQUFHLENBQUMsT0FBTyxDQUFDO0FBQzNCLHFCQUFLLEVBQUUsSUFBSSxDQUFDLFdBQVc7QUFDdkIsc0JBQU0sRUFBRSxJQUFJLENBQUMsWUFBWTthQUM1QixDQUFDLENBQUM7QUFFSCxnQkFBSSxDQUFDLE1BQU0sR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFlBQVksRUFBRSxDQUFDO0FBQzFDLG9CQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFdkMsZ0JBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQzVDLGdCQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQztBQUNmLG1CQUFHLEVBQUU7QUFDRCxBQUFJLDJCQUFDLFNBQVMsRUFBRSxDQUFDO0FBQ2pCLDJCQUFPLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFBRSxBQUFJLE9BQUMsU0FBUyxDQUFDLENBQUMsQUFDMUM7aUJBQUMsRUFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQ2QsZ0JBQUksQ0FBQyxNQUFNLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUU3QyxnQkFBSSxDQUFDLEdBQUcsR0FBRyxBQUFJLEFBQUcsU0FqRWxCLEdBQUcsQUFBQyxBQUFNLEFBQU8sQUFDbEIsQ0FnRW9CLElBQUksQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFlBQVksR0FBRyxDQUFDLENBQUMsQ0FBQztBQUM1RCxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUVwQixnQkFBSSxVQUFVLEdBQUcsQUFBSSxBQUFVLGdCQW5FL0IsVUFBVSxBQUFDLEFBQU0sQUFBYyxBQU1oQyxDQTZEaUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdGLGdCQUFJLENBQUMsWUFBWSxHQUFHLFVBQVUsQ0FBQztBQUUvQixnQkFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7QUFFekIsZ0JBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFFcEIsZ0JBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxBQUNsQjtTQUFDLEFBRU8sQUFBUzs7O2tDQUFDLFNBQWlCLEVBQUUsU0FBYyxFQUFFLFFBQWE7QUFDOUQsa0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO0FBQ3JDLHdCQUFRLENBQUMsU0FBUyxDQUFDLFNBQVMsRUFBRSxLQUFLLENBQUMsQ0FBQyxDQUFDLEFBQzFDO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVPLEFBQWlCOzs7Ozs7QUFDckIsZ0JBQUksa0JBQWtCLEdBQUcsNEJBQUMsU0FBUyxFQUFFLFNBQVM7QUFDMUMsc0JBQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsVUFBQyxLQUFLO0FBQ3JDLEFBQUUsQUFBQyx3QkFBQyxBQUFJLE9BQUMsWUFBWSxLQUFLLElBQUksQUFBQyxFQUFDLEFBQUM7QUFDN0IsQUFBSSwrQkFBQyxZQUFZLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQyxBQUMvRDtxQkFBQyxBQUNMO2lCQUFDLENBQUMsQ0FBQSxBQUNOO2FBQUMsQ0FBQztBQUVGLDhCQUFrQixDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDcEQsOEJBQWtCLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNyRCw4QkFBa0IsQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQUFDeEQ7U0FBQyxBQWlDTSxBQUFVOzs7O0FBQ2IsZ0JBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUMsQUFDdkI7U0FBQyxBQUVNLEFBQVk7Ozs7QUFDZixnQkFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEVBQUUsQ0FBQyxBQUN6QjtTQUFDLEFBRU0sQUFBWTs7O3FDQUFDLE1BQWM7QUFDOUIsQUFBRSxBQUFDLGdCQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDeEMsb0JBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQ2xDO2FBQUMsQUFDTDtTQUFDLEFBRU0sQUFBUzs7O2tDQUFDLE1BQWM7QUFDM0IsQUFBRSxBQUFDLGdCQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDeEMsb0JBQUksQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQyxBQUNyQzthQUFDO0FBQ0QsQUFBRSxBQUFDLGdCQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsZ0JBQWdCLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDeEMsb0JBQUksU0FBUyxHQUFtQixNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDdEUsb0JBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxlQUFlLEVBQUUsU0FBUyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN4RixvQkFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxTQUFTLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLEFBQzNGO2FBQUMsQUFDTDtTQUFDLEFBRU0sQUFBUzs7O2tDQUFDLElBQVksRUFBRSxJQUFTOzs7QUFDcEMsQUFBTSxtQkFBQyxJQUFJLE9BQU8sQ0FBTSxVQUFDLE9BQU8sRUFBRSxNQUFNO0FBQ3BDLEFBQUUsQUFBQyxvQkFBQyxDQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3hCLEFBQU0sMkJBQUMsS0FBSyxDQUFDLEFBQ2pCO2lCQUFDO0FBQ0Qsb0JBQUksVUFBVSxDQUFDO0FBRWYsb0JBQUksU0FBUyxHQUFHLEFBQUksT0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDckMsb0JBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUVWLG9CQUFJLFFBQVEsR0FBRyxrQkFBQyxJQUFJO0FBQ2hCLHdCQUFJLFFBQVEsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDNUIscUJBQUMsRUFBRSxDQUFDO0FBRUosd0JBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN2QixxQkFBQyxDQUFDLElBQUksQ0FBQyxVQUFDLE1BQU07QUFDVixBQUFFLEFBQUMsNEJBQUMsQ0FBQyxLQUFLLFNBQVMsQ0FBQyxNQUFNLEFBQUMsRUFBQyxBQUFDO0FBQ3pCLG1DQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQUFDcEI7eUJBQUMsQUFBQyxBQUFJLE1BQUMsQUFBQztBQUNKLG9DQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQUFDckI7eUJBQUMsQUFDTDtxQkFBQyxDQUFDLENBQUMsS0FBSyxDQUFDLFVBQUMsTUFBTTtBQUNaLDhCQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQUFDbkI7cUJBQUMsQ0FBQyxDQUFDLEFBQ1A7aUJBQUMsQ0FBQztBQUVGLHdCQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQUFDbkI7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRU0sQUFBVzs7O29DQUFJLElBQVksRUFBRSxRQUEwQjtBQUMxRCxBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUN4QixvQkFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUMsQUFDOUI7YUFBQztBQUNELGdCQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxBQUN4QztTQUFDLEFBRU0sQUFBTTs7OztBQUNULGdCQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxDQUFDLEFBQy9CO1NBQUMsQUFFTSxBQUFNOzs7O0FBQ1QsQUFBTSxtQkFBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQ3BCO1NBQUMsQUFFTSxBQUFjOzs7O0FBQ2pCLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxBQUMxQjtTQUFDLEFBQ0wsQUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDdk1XLEtBQUssQUFBTSxBQUFTLEFBRXpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5Qkgsd0JBQVksT0FBWSxFQUFFLEtBQWEsRUFBRSxNQUFjLEVBQUUsR0FBUTs7Ozs7QUF1SXpELHlCQUFZLEdBQUcsVUFBQyxNQUFjO0FBQ2xDLGdCQUFJLGlCQUFpQixHQUF5QyxNQUFNLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDdkcsZ0JBQUksY0FBYyxHQUFtQyxNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFM0YsZ0JBQUksUUFBUSxHQUFHLGlCQUFpQixDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQy9DLGdCQUFJLEtBQUssR0FBRyxjQUFjLENBQUMsUUFBUSxFQUFFLENBQUM7QUFFdEMsQUFBRSxBQUFDLGdCQUFDLENBQUMsQUFBSSxNQUFDLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDN0MsQUFBTSx1QkFBQyxLQUFLLENBQUMsQUFDakI7YUFBQztBQUVELEFBQUksa0JBQUMsV0FBVyxDQUFDLEtBQUssRUFBRSxRQUFRLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUVoRCxBQUFNLG1CQUFDLElBQUksQ0FBQyxBQUNoQjtTQUFDLENBQUE7QUFwSkcsWUFBSSxDQUFDLElBQUksR0FBRyxBQUFJLEFBQUksVUFoQ3BCLElBQUksQUFBQyxBQUFNLEFBQVEsQUFDcEIsRUErQnVCLENBQUM7QUFDdkIsWUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHOzs7QUFBQyxBQUNmLEFBQXVDLEFBQ3ZDLEFBQXNCLEFBRXRCLFlBQUksQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUV4QyxZQUFJLENBQUMsTUFBTSxHQUFHLEFBQUksQUFBTSxZQXhDeEIsTUFBTSxBQUFDLEFBQU0sQUFBVSxBQUV4QixDQXNDMEIsUUFBUSxDQUFDLENBQUM7QUFDbkMsWUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFlLHFCQXBDNUMsZUFBZSxBQUFDLEFBQU0sQUFBOEIsQUFDckQsRUFtQytDLENBQUMsQ0FBQztBQUNoRCxZQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWMsb0JBdEMzQyxjQUFjLEFBQUMsQUFBTSxBQUE2QixBQUNuRCxFQXFDOEMsQ0FBQyxDQUFDO0FBQy9DLFlBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBYyxvQkFwQzNDLGNBQWMsQUFBQyxBQUFNLEFBQTZCLEFBQ25ELENBbUM2QztBQUN4QyxpQkFBSyxFQUFFLEFBQUksQUFBSyxXQTdDcEIsS0FBSyxBQUFDLEFBQU0sQUFBUyxBQUN0QixDQTRDc0IsR0FBRyxFQUFFLE9BQU8sRUFBRSxPQUFPLENBQUM7U0FDMUMsQ0FBQyxDQUFDLENBQUM7QUFDSixZQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWlCLHVCQXRDOUMsaUJBQWlCLEFBQUMsQUFBTSxBQUFnQyxBQUN6RCxFQXFDaUQsQ0FBQyxDQUFDO0FBQ2xELFlBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBYyxvQkF0QzNDLGNBQWMsQUFBQyxBQUFNLEFBQTZCLEFBQ25ELEVBcUM4QyxDQUFDLENBQUM7QUFDL0MsWUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFjLG9CQTFDM0MsY0FBYyxBQUFDLEFBQU0sQUFBNkIsQUFDbkQsQ0F5QzZDO0FBQ3hDLG9CQUFRLEVBQUUsRUFBRTtTQUNmLENBQUMsQ0FBQyxDQUFDO0FBQ0osWUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFnQixzQkF6QzdDLGdCQUFnQixBQUFDLEFBQU0sQUFBK0IsQUFDdkQsQ0F3QytDO0FBQzFDLGdCQUFJLEVBQUUsQ0FBQztBQUNQLGVBQUcsRUFBRSxDQUFDLENBQUM7QUFDUCxnQkFBSSxFQUFFLENBQUMsQ0FBQztTQUNYLENBQUMsQ0FBQyxDQUFDO0FBQ0osWUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUF3Qiw4QkE3Q3JELHdCQUF3QixBQUFDLEFBQU0sQUFBdUMsQUFDdkUsRUE0Q3dELENBQUMsQ0FBQztBQUN6RCxZQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQXdCLDhCQTdDckQsd0JBQXdCLEFBQUMsQUFBTSxBQUF1QyxBQUN2RSxFQTRDd0QsQ0FBQyxDQUFDO0FBQ3pELFlBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBb0IsMEJBN0NqRCxvQkFBb0IsQUFBQyxBQUFNLEFBQW1DLEFBT3RFLEVBc0MyRCxDQUFDLENBQUM7QUFFckQsWUFBSSxDQUFDLEdBQUcsQ0FBQyx5QkFBeUIsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFFaEQsWUFBSSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQ3JDO0tBQUMsQUFFRCxBQUFNOzs7OztBQUNGLGdCQUFJLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUVyQyxBQUFHLEFBQUMsaUJBQUMsQUFBRyxJQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUNuQyxBQUFHLEFBQUMscUJBQUMsQUFBRyxJQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUNuQyx3QkFBSSxLQUFLLEdBQVUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDO0FBQ3JELHdCQUFJLENBQUMsY0FBYyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQUFDckM7aUJBQUMsQUFDTDthQUFDO0FBRUQsZ0JBQUksQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxBQUM1QztTQUFDLEFBRUQsQUFBVzs7O29DQUFDLFNBQWM7QUFDdEIsQUFBRSxBQUFDLGdCQUFDLFNBQVMsQ0FBQyxZQUFZLEVBQUUsS0FBSyxpQkFBaUIsQUFBQyxFQUFDLEFBQUM7QUFDakQsb0JBQUksQ0FBQyxxQkFBcUIsQ0FBa0IsU0FBUyxDQUFDLENBQUMsQUFDM0Q7YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFFLEFBQUMsSUFBQyxTQUFTLENBQUMsWUFBWSxFQUFFLEtBQUssZUFBZSxBQUFDLEVBQUMsQUFBQztBQUN0RCxvQkFBSSxDQUFDLG1CQUFtQixDQUFnQixTQUFTLENBQUMsQ0FBQyxBQUN2RDthQUFDLEFBQ0w7U0FBQyxBQUVELEFBQXFCOzs7OENBQUMsS0FBc0I7QUFDeEMsQUFBRSxBQUFDLGdCQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQzdDLHVCQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQUFDL0M7YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osb0JBQUksSUFBSSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUN4RCx1QkFBTyxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksRUFBRSxFQUFFLEtBQUssQ0FBQyxJQUFJLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxBQUMvRDthQUFDLEFBQ0w7U0FBQyxBQUVELEFBQW1COzs7NENBQUMsS0FBb0IsRUFDeEMsRUFBQyxBQUVELEFBQU07Ozs7QUFDRixBQUFNLG1CQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQUFDcEI7U0FBQyxBQUVPLEFBQXFCOzs7O0FBQ3pCLEFBQU0sbUJBQUM7QUFDSCxpQkFBQyxFQUFFLENBQUM7QUFDSixpQkFBQyxFQUFFLENBQUM7QUFDSixpQkFBQyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFO0FBQ3RCLGlCQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUU7YUFDMUIsQ0FBQyxBQUNOO1NBQUMsQUFFTyxBQUFZOzs7cUNBQUMsQ0FBUyxFQUFFLENBQVM7QUFDckMsZ0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBRXJDLEFBQU0sbUJBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQ2xFO1NBQUMsQUFFTyxBQUFjOzs7dUNBQUMsS0FBWSxFQUFFLENBQVMsRUFBRSxDQUFTO0FBQ3JELGdCQUFJLENBQUMsR0FBRyxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUNyQyxnQkFBTSxjQUFjLEdBQW1DLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFFbEcsQUFBRSxBQUFDLGdCQUFDLGNBQWMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUM3QixvQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1AsS0FBSyxDQUFDLElBQUksRUFDVixLQUFLLENBQUMsVUFBVSxFQUNoQixLQUFLLENBQUMsVUFBVSxDQUNuQixDQUFDLEFBQ047YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFFLEFBQUMsSUFBQyxjQUFjLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDckMsb0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNiLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNQLEtBQUssQ0FBQyxJQUFJLEVBQ1YsS0FBSyxDQUFDLFVBQVUsRUFDaEIsTUFBTSxDQUNULENBQUMsQUFDTjthQUFDLEFBQUMsQUFBSSxNQUFDLEFBQUM7QUFDSixvQkFBTSxDQUFDLEdBQVUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUMxQyxvQkFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2IsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1AsQ0FBQyxDQUFDLElBQUksRUFDTixDQUFDLENBQUMsVUFBVSxFQUNaLENBQUMsQ0FBQyxVQUFVLENBQ2YsQ0FBQyxBQUNOO2FBQUMsQUFDTDtTQUFDLEFBRU8sQUFBVzs7O29DQUFDLEtBQVksRUFBRSxDQUFTLEVBQUUsQ0FBUztBQUNsRCxnQkFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDckMsZ0JBQU0sY0FBYyxHQUFtQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBRWxHLEFBQUUsQUFBQyxnQkFBQyxjQUFjLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDN0Isb0JBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNiLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNQLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNQLEtBQUssQ0FBQyxJQUFJLEVBQ1YsS0FBSyxDQUFDLFVBQVUsRUFDaEIsS0FBSyxDQUFDLFVBQVUsQ0FDbkIsQ0FBQyxBQUNOO2FBQUMsQUFDTDtTQUFDLEFBaUJMLEFBQUM7Ozs7Ozs7Ozs7Ozs7Ozs0QkNuTEcsZUFBWSxJQUFZLEVBQUUsVUFBa0IsRUFBRSxVQUFrQjs7O0FBQzVELFFBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO0FBQ2pCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDO0FBQzdCLFFBQUksQ0FBQyxVQUFVLEdBQUcsVUFBVSxDQUFDLEFBQ2pDO0NBQUMsQUFFTCxBQUFDOzs7Ozs7Ozs7Ozs7O1FDVkcsQUFBTyxBQUFROzs7Ozs7OztBQUNYLEFBQU0sbUJBQUMsc0NBQXNDLENBQUMsT0FBTyxDQUFDLE9BQU8sRUFBRSxVQUFTLENBQUM7QUFDckUsb0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBQyxFQUFFLEdBQUMsQ0FBQztvQkFBRSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLEFBQUcsR0FBQyxDQUFDLEdBQUMsR0FBRyxHQUFDLEdBQUcsQUFBQyxDQUFDO0FBQzNELEFBQU0sdUJBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxBQUMxQjthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFDTCxBQUFDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNPRywyQkFBWSxPQUFlLEVBQUUsU0FBNEIsRUFBRSxNQUFlLEVBQUUsT0FBZ0IsRUFBRSxRQUFpQixFQUFFLE9BQWdCOzs7QUFDN0gsWUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsWUFBSSxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7QUFDM0IsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsWUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7QUFDekIsWUFBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsQUFDM0I7S0FYQSxBQUFZLEFBV1g7Ozs7O0FBVkcsQUFBTSxtQkFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFDM0U7U0FBQyxBQVdELEFBQVk7Ozs7QUFDUixBQUFNLG1CQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQUFDMUI7U0FBQyxBQUVELEFBQVU7Ozs7QUFDTixBQUFNLG1CQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQUFDeEI7U0FBQyxBQUVELEFBQVM7Ozs7QUFDTCxBQUFNLG1CQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQUFDdkI7U0FBQyxBQUVELEFBQVc7Ozs7QUFDUCxBQUFNLG1CQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQUFDekI7U0FBQyxBQUVELEFBQVU7Ozs7QUFDTixBQUFNLG1CQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQUFDeEI7U0FBQyxBQUVELEFBQVU7Ozs7QUFDTixBQUFNLG1CQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQUFDeEI7U0FBQyxBQUNMLEFBQUM7Ozs7Ozs7Ozs7OztJQzlDVyxpQkFJWDtBQUpELFdBQVksaUJBQWlCO0FBQ3pCLDZEQUFJLENBQUE7QUFDSix5REFBRSxDQUFBO0FBQ0YsK0RBQUssQ0FBQSxBQUNUO0NBQUMsRUFKVyxpQkFBaUIsaUNBQWpCLGlCQUFpQixRQUk1QjtBQUFBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDRVUsS0FBSyxBQUFNLEFBQVMsQUFFekI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQkgsaUJBQVksS0FBYSxFQUFFLE1BQWM7WUFBRSxVQUFVLHlEQUFXLEVBQUU7Ozs7QUFDOUQsWUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUM7QUFDbkIsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDckIsWUFBSSxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUM7QUFDN0IsWUFBSSxDQUFDLEtBQUssR0FBRyxFQUFFLENBQUM7QUFDaEIsWUFBSSxDQUFDLFFBQVEsR0FBRyxFQUFFLENBQUM7QUFFbkIsWUFBSSxDQUFDLEdBQUcsQUFBSSxBQUFJLFVBbkNoQixJQUFJLEFBQUMsQUFBTSxBQUFRLEFBRXBCLEVBaUNtQixDQUFDO0FBQ25CLFNBQUMsQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUNsRSxTQUFDLENBQUMsV0FBVyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7QUFDcEUsU0FBQyxDQUFDLFdBQVcsQ0FBQyxXQUFXLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUMxRDtLQUFDLEFBRUQsQUFBUTs7Ozs7OztBQUNKLGdCQUFJLENBQUMsR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxxQkFBcUIsQ0FDeEMsVUFBQyxDQUFDLEVBQUUsQ0FBQztBQUNELG9CQUFNLElBQUksR0FBRyxBQUFJLE1BQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUNoQyxBQUFFLEFBQUMsb0JBQUMsQ0FBQyxJQUFJLEFBQUMsRUFBQyxBQUFDO0FBQ1IsQUFBTSwyQkFBQyxLQUFLLENBQUMsQUFDakI7aUJBQUM7QUFDRCxBQUFNLHVCQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDLEFBQy9CO2FBQUMsRUFDRCxFQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUMsQ0FDaEIsQ0FBQyxBQUNOO1NBQUMsQUFFRCxBQUFlOzs7d0NBQUMsTUFBYyxFQUFFLFFBQWdCO0FBQzVDLGdCQUFJLFlBQVksR0FBUSxFQUFFLENBQUM7QUFFM0IsZ0JBQU0saUJBQWlCLEdBQXNCLE1BQU0sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUV0RixnQkFBSSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQ1osaUJBQWlCLENBQUMsSUFBSSxFQUFFLEVBQ3hCLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUN4QixRQUFRLEVBQ1IsVUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxVQUFVO0FBQ3JCLDRCQUFZLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsQUFDckM7YUFBQyxDQUFDLENBQUM7QUFDUCxBQUFNLG1CQUFDLFlBQVksQ0FBQyxBQUN4QjtTQUFDLEFBRUQsQUFBVzs7O29DQUFDLFFBQStCO0FBQ3ZDLEFBQUcsQUFBQyxpQkFBQyxBQUFHLElBQUMsVUFBVSxJQUFJLElBQUksQ0FBQyxRQUFRLEFBQUMsRUFBQyxBQUFDO0FBQ25DLG9CQUFJLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxDQUFDO0FBQ3ZDLEFBQUUsQUFBQyxvQkFBQyxNQUFNLEFBQUMsRUFBQyxBQUFDO0FBQ1QsNEJBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUNyQjtpQkFBQyxBQUNMO2FBQUMsQUFDTDtTQUFDLEFBRUQsQUFBUzs7OztBQUNMLEFBQU0sbUJBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxBQUN2QjtTQUFDLEFBRUQsQUFBUTs7OztBQUNKLEFBQU0sbUJBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUN0QjtTQUFDLEFBRUQsQUFBTzs7O2dDQUFDLENBQVMsRUFBRSxDQUFTO0FBQ3hCLEFBQUUsQUFBQyxnQkFBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxJQUFJLElBQUksQ0FBQyxNQUFNLEFBQUMsRUFBQyxBQUFDO0FBQ3hELEFBQU0sdUJBQUMsSUFBSSxDQUFDLEFBQ2hCO2FBQUM7QUFDRCxBQUFNLG1CQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFDNUI7U0FBQyxBQUVELEFBQVE7Ozs7QUFDSixnQkFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDbEMsZ0JBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztBQUVoQixBQUFHLEFBQUMsaUJBQUMsQUFBRyxJQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUN2QyxvQkFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDLEFBQ3RCO2FBQUM7QUFFRCxBQUFHLEFBQUMsaUJBQUMsQUFBRyxJQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUN2QyxvQkFBSSxDQUFDLFNBQVMsRUFBRSxDQUFDLEFBQ3JCO2FBQUMsQUFDTDtTQUFDLEFBRUQsQUFBVTs7OztBQUNOLGdCQUFJLENBQUMsR0FBRyxBQUFJLEFBQUksZ0JBQUUsQ0FBQztBQUNuQixnQkFBSSxLQUFLLEdBQUcsQUFBSSxBQUFNLFlBekd0QixNQUFNLEFBQUMsQUFBTSxBQUFVLEFBQ3hCLEVBd0d5QixDQUFDO0FBQ3pCLGlCQUFLLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBYyxvQkF2R3JDLGNBQWMsQUFBQyxBQUFNLEFBQTZCLEFBQ25ELEVBc0d3QyxDQUFDLENBQUM7QUFDekMsaUJBQUssQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFjLG9CQXZHckMsY0FBYyxBQUFDLEFBQU0sQUFBNkIsQUFDbkQsQ0FzR3VDO0FBQ2xDLHFCQUFLLEVBQUUsQUFBSSxBQUFLLFdBN0dwQixLQUFLLEFBQUMsQUFBTSxBQUFTLEFBQ3RCLENBNEdzQixHQUFHLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQzthQUN4QyxDQUFDLENBQUMsQ0FBQztBQUNKLGlCQUFLLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBaUIsdUJBekd4QyxpQkFBaUIsQUFBQyxBQUFNLEFBQWdDLEFBRXpELEVBdUcyQyxDQUFDLENBQUM7QUFDNUMsaUJBQUssQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFrQix3QkF0R3pDLGtCQUFrQixBQUFDLEFBQU0sQUFBaUMsQUFDM0QsRUFxRzRDLENBQUMsQ0FBQztBQUM3QyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQXFCLDJCQXJHNUMscUJBQXFCLEFBQUMsQUFBTSxBQUFvQyxBQUNqRSxFQW9HK0MsQ0FBQyxDQUFDO0FBQ2hELGlCQUFLLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBYyxvQkExR3JDLGNBQWMsQUFBQyxBQUFNLEFBQTZCLEFBRW5ELEVBd0d3QyxDQUFDLENBQUM7QUFDekMsaUJBQUssQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFvQiwwQkFyRzNDLG9CQUFvQixBQUFDLEFBQU0sQUFBbUMsQUFFdEUsRUFtR3FELENBQUMsQ0FBQztBQUMvQyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWdCLHNCQXpHdkMsZ0JBQWdCLEFBQUMsQUFBTSxBQUErQixBQUN2RCxDQXdHMEM7QUFDckMsb0JBQUksRUFBRSxDQUFDO0FBQ1AsbUJBQUcsRUFBRSxDQUFDO0FBQ04sb0JBQUksRUFBRSxDQUFDLENBQUM7YUFDWCxDQUFDLENBQUMsQ0FBQztBQUVKLGdCQUFJLENBQUMseUJBQXlCLENBQUMsS0FBSyxDQUFDLENBQUM7QUFFdEMsYUFBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUN2QjtTQUFDLEFBRUQsQUFBUzs7OztBQUNMLGdCQUFJLENBQUMsR0FBRyxBQUFJLEFBQUksZ0JBQUUsQ0FBQztBQUNuQixnQkFBSSxLQUFLLEdBQUcsQUFBSSxBQUFNLG9CQUFFLENBQUM7QUFDekIsaUJBQUssQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFjLG9DQUFFLENBQUMsQ0FBQztBQUN6QyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWMsbUNBQUM7QUFDbEMscUJBQUssRUFBRSxBQUFJLEFBQUssaUJBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxPQUFPLENBQUM7YUFDekMsQ0FBQyxDQUFDLENBQUM7QUFDSixpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWlCLDBDQUFFLENBQUMsQ0FBQztBQUM1QyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQWtCLDRDQUFFLENBQUMsQ0FBQztBQUM3QyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQW9CLGdEQUFFLENBQUMsQ0FBQztBQUMvQyxpQkFBSyxDQUFDLFlBQVksQ0FBQyxBQUFJLEFBQW9CLDBCQTVIM0Msb0JBQW9CLEFBQUMsQUFBTSxBQUFtQyxBQUMvRCxFQTJIOEMsQ0FBQyxDQUFDO0FBQy9DLGlCQUFLLENBQUMsWUFBWSxDQUFDLEFBQUksQUFBYyxvQ0FBRSxDQUFDLENBQUM7QUFDekMsaUJBQUssQ0FBQyxZQUFZLENBQUMsQUFBSSxBQUFnQix1Q0FBRTtBQUNyQyxvQkFBSSxFQUFFLENBQUM7QUFDUCxtQkFBRyxFQUFFLENBQUM7QUFDTixvQkFBSSxFQUFFLENBQUMsQ0FBQzthQUNYLENBQUMsQ0FBQyxDQUFDO0FBRUosZ0JBQUksQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUV0QyxhQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQ3ZCO1NBQUMsQUFFRCxBQUF5Qjs7O2tEQUFDLE1BQWM7QUFDcEMsQUFBRSxBQUFDLGdCQUFDLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUM1QyxBQUFNLHVCQUFDLEtBQUssQ0FBQyxBQUNqQjthQUFDO0FBQ0QsZ0JBQUksS0FBSyxHQUFHLEtBQUssQ0FBQztBQUNsQixnQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztBQUM3QyxnQkFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1YsbUJBQU8sQ0FBQyxLQUFLLElBQUksQ0FBQyxHQUFHLFFBQVEsRUFBRSxBQUFDO0FBQzVCLG9CQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDL0Msb0JBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNoRCxpQkFBQyxFQUFFLENBQUM7QUFDSixBQUFFLEFBQUMsb0JBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUNuRSx5QkFBSyxHQUFHLElBQUksQ0FBQyxBQUNqQjtpQkFBQyxBQUNMO2FBQUM7QUFDRCxBQUFFLEFBQUMsZ0JBQUMsQ0FBQyxLQUFLLEFBQUMsRUFBQyxBQUFDO0FBQ1QsdUJBQU8sQ0FBQyxLQUFLLENBQUMsd0JBQXdCLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDaEQsc0JBQU0scUNBQXFDLENBQUMsQUFDaEQ7YUFBQztBQUVELGdCQUFJLFNBQVMsR0FBeUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQy9GLHFCQUFTLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM1QixnQkFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUM7QUFDekMsZ0JBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNuRCxBQUFNLG1CQUFDLElBQUksQ0FBQyxBQUNoQjtTQUFDLEFBRUQsQUFBUzs7O2tDQUFDLE1BQWM7QUFDcEIsZ0JBQUksSUFBSSxHQUFHLEFBQUksQUFBSSxnQkFBRSxDQUFDO0FBQ3RCLGdCQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ3ZCLGdCQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxBQUM3QztTQUFDLEFBRUQsQUFBWTs7O3FDQUFDLE1BQWM7QUFDdkIsZ0JBQU0sSUFBSSxHQUFHLEFBQUksQUFBSSxnQkFBRSxDQUFDO0FBQ3hCLGdCQUFNLGlCQUFpQixHQUFzQixNQUFNLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDdEYsZ0JBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDMUIsZ0JBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxDQUFDLEdBQUcsSUFBSSxDQUFBO0FBQ3RDLGdCQUFJLENBQUMsT0FBTyxDQUFDLGlCQUFpQixDQUFDLElBQUksRUFBRSxFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEFBQ3ZGO1NBQUMsQUFFRCxBQUFpQjs7OzBDQUFDLENBQVMsRUFBRSxDQUFTO0FBQ2xDLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixnQkFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RDLEFBQU0sbUJBQUMsVUFBVSxLQUFLLEVBQUUsQ0FBQyxBQUM3QjtTQUFDLEFBRUQsQUFBVzs7O29DQUFDLENBQVMsRUFBRSxDQUFTO0FBQzVCLGdCQUFJLElBQUksR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM5QixnQkFBSSxVQUFVLEdBQUcsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3RDLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBQyxBQUNyQztTQUFDLEFBRUQsQUFBaUI7OzswQ0FBQyxlQUFrQyxFQUFFLE1BQWM7Z0JBQUUsTUFBTSx5REFBZ0MsVUFBQyxDQUFDO0FBQU0sQUFBTSx1QkFBQyxJQUFJLENBQUM7YUFBQzs7QUFDN0gsZ0JBQUksUUFBUSxHQUFHLEVBQUUsQ0FBQztBQUNsQixnQkFBSSxDQUFDLFdBQVcsQ0FBQyxVQUFDLE1BQU07QUFDcEIsQUFBRSxBQUFDLG9CQUFDLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUNsQixBQUFNLDJCQUFDLEFBQ1g7aUJBQUM7QUFDRCxvQkFBTSxpQkFBaUIsR0FBc0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3RGLEFBQUUsQUFBQyxvQkFBQyxpQkFBaUIsS0FBSyxlQUFlLEFBQUMsRUFBQyxBQUFDO0FBQ3hDLEFBQU0sMkJBQUMsQUFDWDtpQkFBQztBQUNELG9CQUFNLFFBQVEsR0FBRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxFQUFFLGVBQWUsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQzlGLEFBQUUsQUFBQyxvQkFBQyxRQUFRLElBQUksTUFBTSxBQUFDLEVBQUMsQUFBQztBQUNyQiw0QkFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBQyxDQUFDLENBQUMsQUFDeEQ7aUJBQUMsQUFDTDthQUFDLENBQUMsQ0FBQztBQUNILG9CQUFRLENBQUMsSUFBSSxDQUFDLFVBQUMsQ0FBQyxFQUFFLENBQUM7QUFDZixBQUFNLHVCQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxBQUNuQzthQUFDLENBQUMsQ0FBQztBQUNILG9CQUFRLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQyxVQUFDLENBQUM7QUFBTyxBQUFNLHVCQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQUFBQzthQUFDLENBQUMsQ0FBQztBQUNyRCxBQUFNLG1CQUFDLFFBQVEsQ0FBQyxBQUNwQjtTQUFDLEFBRU8sQUFBYTs7OztBQUNqQixnQkFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBRWYsQUFBRyxBQUFDLGlCQUFDLEFBQUcsSUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxFQUFFLEFBQUM7QUFDbEMscUJBQUssQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDZixBQUFHLEFBQUMscUJBQUMsQUFBRyxJQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUNuQyx5QkFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUMsQUFDM0M7aUJBQUMsQUFDTDthQUFDO0FBRUQsZ0JBQUksU0FBUyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDOUQscUJBQVMsQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDekIsQUFBRyxBQUFDLGlCQUFDLEFBQUcsSUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQUFBQztBQUN6Qix5QkFBUyxDQUFDLE1BQU0sRUFBRSxDQUFDLEFBQ3ZCO2FBQUM7QUFFRCxxQkFBUyxDQUFDLE1BQU0sQ0FBQyxVQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztBQUNyQixBQUFFLEFBQUMsb0JBQUMsQ0FBQyxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDVix5QkFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsQUFDM0M7aUJBQUMsQUFBQyxBQUFJLE1BQUMsQUFBQztBQUNKLHlCQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sQ0FBQyxRQUFRLEVBQUUsQ0FBQyxBQUMxQztpQkFBQyxBQUNMO2FBQUMsQ0FBQyxDQUFDO0FBRUgsQUFBTSxtQkFBQyxLQUFLLENBQUMsQUFDakI7U0FBQyxBQUVPLEFBQW1COzs7NENBQUMsSUFBUzs7O0FBQ2pDLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxvQkFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLFdBQVcsQ0FBQztBQUNuQyxvQkFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQztBQUN6QixBQUFFLEFBQUMsb0JBQUMsQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQzVDLDBCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDYixBQUFNLDJCQUFDLEFBQ1g7aUJBQUM7QUFDRCxvQkFBSSxpQkFBaUIsR0FBc0IsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQ3BGLEFBQUksdUJBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxDQUFDLEVBQUUsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUM3RCxBQUFJLHVCQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUNqRyx1QkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVPLEFBQW9COzs7NkNBQUMsSUFBWTs7O0FBQ3JDLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFJLHVCQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUN4Qix1QkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVPLEFBQVM7OztrQ0FBQyxRQUFnQzs7O2dCQUFFLEdBQUcseURBQVksSUFBSTs7QUFDbkUsQUFBTSxtQkFBQyxJQUFJLE9BQU8sQ0FBTSxVQUFDLE9BQU8sRUFBRSxNQUFNO0FBQ3BDLG9CQUFJLElBQUksR0FBRyxBQUFJLE9BQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2hELEFBQUUsQUFBQyxvQkFBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksSUFBSSxDQUFDLGFBQWEsRUFBRSxLQUFLLEVBQUUsQUFBQyxFQUFDLEFBQUM7QUFDbkQsMkJBQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQyxBQUN0QjtpQkFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osMEJBQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQyxBQUNyQjtpQkFBQyxBQUNMO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUNMLEFBQUM7Ozs7Ozs7Ozs7OztJQ2hTVyxlQUlYO0FBSkQsV0FBWSxlQUFlO0FBQ3ZCLHlEQUFJLENBQUE7QUFDSiw2REFBTSxDQUFBO0FBQ04sMkRBQUssQ0FBQSxBQUNUO0NBQUMsRUFKVyxlQUFlLCtCQUFmLGVBQWUsUUFJMUI7QUFBQSxDQUFDOzs7Ozs7Ozs7Ozs7OztBQ09FLDZCQUFZLENBQVMsRUFBRSxDQUFTLEVBQUUsTUFBdUI7OztBQUNyRCxZQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLFlBQUksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ1gsWUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQUFDekI7S0FSQSxBQUFZLEFBUVg7Ozs7O0FBUEcsQUFBTSxtQkFBQyxlQUFlLENBQUMsU0FBUyxDQUFDLFdBQVcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQUFDN0U7U0FBQyxBQVFELEFBQUk7Ozs7QUFDQSxBQUFNLG1CQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQUFDbEI7U0FBQyxBQUVELEFBQUk7Ozs7QUFDQSxBQUFNLG1CQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQUFDbEI7U0FBQyxBQUVELEFBQWE7Ozs7QUFDVCxBQUFNLG1CQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQUFDdkI7U0FBQyxBQUNMLEFBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQ3BCRyxrQkFBWSxLQUFZO1lBQUUsUUFBUSx5REFBWSxJQUFJO1lBQUUsYUFBYSx5REFBWSxLQUFLOzs7O0FBQzlFLFlBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDO0FBQ25CLFlBQUksQ0FBQyxRQUFRLEdBQUcsUUFBUSxDQUFDO0FBQ3pCLFlBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0FBRW5DLFlBQUksQ0FBQyxVQUFVLEdBQUcsRUFBRSxDQUFDLEFBQ3pCO0tBQUMsQUFFRCxBQUFVOzs7OztBQUNOLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxBQUN6QjtTQUFDLEFBRUQsQUFBVzs7OztBQUNQLEFBQU0sbUJBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxBQUM5QjtTQUFDLEFBR0QsQUFBUTs7OztBQUNKLEFBQU0sbUJBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUN0QjtTQUFDLEFBRUQsQUFBYTs7OztBQUNULEFBQU0sbUJBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxBQUMzQjtTQUFDLEFBRUQsQUFBYTs7O3NDQUFDLFVBQWtCO0FBQzVCLGdCQUFJLENBQUMsVUFBVSxHQUFHLFVBQVUsQ0FBQyxBQUNqQztTQUFDLEFBQ0wsQUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0lDakNhLE1BQU0sOEJBVW5CO0FBVkQsV0FBYyxNQUFNLEVBQUMsQUFBQztBQUNsQjtBQUNJLEFBQU0sZUFBQyxBQUFJLEFBQUksVUFKZixJQUFJLEFBQUMsQUFBTSxBQUFRLEFBRTNCLENBRXdCLEFBQUksQUFBSyxXQUx6QixLQUFLLEFBQUMsQUFBTSxBQUFTLEFBQ3RCLENBSTJCLEdBQUcsRUFBRSxPQUFPLEVBQUUsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQyxDQUFDLEFBQ25FO0tBQUM7QUFGZSxtQkFBUSxXQUV2QixDQUFBO0FBQ0Q7QUFDSSxBQUFNLGVBQUMsQUFBSSxBQUFJLGVBQUMsQUFBSSxBQUFLLGlCQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDLEFBQ2pFO0tBQUM7QUFGZSxvQkFBUyxZQUV4QixDQUFBO0FBQ0Q7QUFDSSxBQUFNLGVBQUMsQUFBSSxBQUFJLGVBQUMsQUFBSSxBQUFLLGlCQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDLEFBQ2pFO0tBQUM7QUFGZSxtQkFBUSxXQUV2QixDQUFBLEFBQ0w7Q0FBQyxFQVZhLE1BQU0sc0JBQU4sTUFBTSxRQVVuQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7c0JDSnVDLEFBQVM7OztBQUc3QyxrQ0FDSSxBQUFPLEFBQUM7WUFEQSxPQUFPLHlEQUFPLEVBQUU7Ozs7OztBQUV4QixBQUFJLGNBQUMsU0FBUyxHQUFHLElBQUksQ0FBQyxBQUMxQjs7S0FBQyxBQUVELEFBQUc7Ozs7Ozs7QUFDQyxBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsb0JBQU0sS0FBSyxHQUFtQixBQUFJLE9BQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ3pFLG9CQUFNLE9BQU8sR0FBcUIsQUFBSSxPQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsa0JBQWtCLENBQUMsQ0FBQztBQUMvRSxvQkFBTSxRQUFRLEdBQXNCLEFBQUksT0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFFbEYsb0JBQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0FBRTVDLG9CQUFJLE9BQU8sR0FBVyxJQUFJLENBQUM7QUFDM0Isb0JBQUksS0FBSyxHQUFXLElBQUksQ0FBQztBQUV6Qix3QkFBUSxDQUFDLE9BQU8sQ0FBQyxVQUFDLE1BQU07QUFDcEIsd0JBQU0sRUFBRSxHQUFxQixNQUFNLENBQUMsWUFBWSxDQUFDLGtCQUFrQixDQUFDLENBQUM7QUFDckUsQUFBRSxBQUFDLHdCQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3ZDLDZCQUFLLEdBQUcsTUFBTSxDQUFDLEFBQ25CO3FCQUFDLEFBQUMsQUFBSSxNQUFDLEFBQUUsQUFBQyxJQUFDLE9BQU8sS0FBSyxJQUFJLElBQUksT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsY0FBYyxFQUFFLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDcEUsK0JBQU8sR0FBRyxNQUFNLENBQUMsQUFDckI7cUJBQUMsQUFDTDtpQkFBQyxDQUFDLENBQUM7QUFFSCxBQUFFLEFBQUMsb0JBQUMsS0FBSyxLQUFLLElBQUksQUFBQyxFQUFDLEFBQUM7QUFDakIsd0JBQU0sQ0FBQyxHQUFzQixLQUFLLENBQUMsWUFBWSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckUsQUFBSSwyQkFBQyxTQUFTLEdBQUc7QUFDYix5QkFBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7QUFDWCx5QkFBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUU7cUJBQ2QsQ0FBQyxBQUNOO2lCQUFDO0FBRUQsQUFBRSxBQUFDLG9CQUFDLEFBQUksT0FBQyxTQUFTLEtBQUssSUFBSSxBQUFJLEtBQUMsQUFBSSxPQUFDLFNBQVMsQ0FBQyxDQUFDLEtBQUssUUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLEFBQUksT0FBQyxTQUFTLENBQUMsQ0FBQyxLQUFLLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxBQUFDLEVBQUMsQUFBQztBQUM1RyxBQUFJLDJCQUFDLGVBQWUsQ0FBQyxRQUFRLENBQUMsQ0FDekIsSUFBSSxDQUFDO0FBQ0YsK0JBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNsQjtxQkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gsK0JBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUNuQjtxQkFBQyxDQUFDLENBQUEsQUFDVjtpQkFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osQUFBSSwyQkFBQyxVQUFVLEVBQUUsQ0FDWixJQUFJLENBQUM7QUFDRiwrQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO3FCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCwrQkFBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQ25CO3FCQUFDLENBQUMsQ0FBQSxBQUNWO2lCQUFDLEFBQ0w7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRUQsQUFBZTs7O3dDQUFDLFFBQTJCOzs7QUFDdkMsQUFBTSxtQkFBQyxJQUFJLE9BQU8sQ0FBTSxVQUFDLE9BQU8sRUFBRSxNQUFNO0FBQ3BDLG9CQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELG9CQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO0FBQ3RELG9CQUFJLFNBQWMsYUFBQztBQUVuQixBQUFFLEFBQUMsb0JBQUMsRUFBRSxHQUFHLEVBQUUsS0FBSyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ2hCLDZCQUFTLEdBQUc7QUFDUix5QkFBQyxFQUFFLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUFJLE9BQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEFBQUMsSUFBRyxFQUFFLENBQUM7QUFDdEUseUJBQUMsRUFBRSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQUFBSSxPQUFDLFNBQVMsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLElBQUksRUFBRSxBQUFDLElBQUcsRUFBRSxDQUFDO3FCQUN6RSxDQUFDO0FBQ0YsMkJBQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsU0FBUyxDQUFDLENBQUM7QUFDNUMsQUFBSSwyQkFBQyxhQUFhLENBQUMsU0FBUyxDQUFDLENBQ3hCLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FDYixLQUFLLENBQUMsTUFBTSxDQUFDLENBQUEsQUFDdEI7aUJBQUMsQUFBQyxBQUFJLE1BQUMsQUFBRSxBQUFDLElBQUMsRUFBRSxHQUFHLEVBQUUsQUFBQyxFQUFDLEFBQUM7QUFDakIsNkJBQVMsR0FBRztBQUNSLHlCQUFDLEVBQUUsQ0FBQyxBQUFJLE9BQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEFBQUMsSUFBRyxFQUFFO0FBQzVDLHlCQUFDLEVBQUUsQ0FBQztxQkFDUCxDQUFDO0FBQ0YsQUFBSSwyQkFBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQ3RCLElBQUksQ0FBQztBQUNGLCtCQUFPLEVBQUUsQ0FBQyxBQUNkO3FCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCxpQ0FBUyxHQUFHO0FBQ1IsNkJBQUMsRUFBRSxDQUFDO0FBQ0osNkJBQUMsRUFBRSxDQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQUFBQyxJQUFHLEVBQUU7eUJBQy9DLENBQUM7QUFDRixBQUFJLCtCQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FDdEIsSUFBSSxDQUFDO0FBQ0YsbUNBQU8sRUFBRSxDQUFDLEFBQ2Q7eUJBQUMsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILEFBQUksbUNBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixrQ0FBTSxFQUFFLENBQUMsQUFDYjt5QkFBQyxDQUFDLENBQUMsQUFDWDtxQkFBQyxDQUFDLENBQUMsQUFDWDtpQkFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osNkJBQVMsR0FBRztBQUNSLHlCQUFDLEVBQUUsQ0FBQztBQUNKLHlCQUFDLEVBQUUsQ0FBQyxBQUFJLE9BQUMsU0FBUyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLEFBQUMsSUFBRyxFQUFFO3FCQUMvQyxDQUFDO0FBQ0YsQUFBSSwyQkFBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQ3RCLElBQUksQ0FBQztBQUNGLCtCQUFPLEVBQUUsQ0FBQyxBQUNkO3FCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCxpQ0FBUyxHQUFHO0FBQ1IsNkJBQUMsRUFBRSxDQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQUFBQyxJQUFHLEVBQUU7QUFDNUMsNkJBQUMsRUFBRSxDQUFDO3lCQUNQLENBQUM7QUFDRixBQUFJLCtCQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FDdEIsSUFBSSxDQUFDO0FBQ0YsbUNBQU8sRUFBRSxDQUFDLEFBQ2Q7eUJBQUMsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILEFBQUksbUNBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUN0QixrQ0FBTSxFQUFFLENBQUMsQUFDYjt5QkFBQyxDQUFDLENBQUMsQUFDWDtxQkFBQyxDQUFDLENBQUMsQUFDWDtpQkFBQyxBQUNMO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVELEFBQWE7OztzQ0FBQyxTQUFTOzs7QUFDbkIsQUFBTSxtQkFBQyxJQUFJLE9BQU8sQ0FBTSxVQUFDLE9BQU8sRUFBRSxNQUFNO0FBQ3BDLEFBQUksdUJBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxvQkFBb0IsRUFBRSxTQUFTLENBQUMsQ0FDakQsSUFBSSxDQUFDO0FBQ0YsMkJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNsQjtpQkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gsMEJBQU0sRUFBRSxDQUFDLEFBQ2I7aUJBQUMsQ0FBQyxDQUNMLEFBQ0w7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRUQsQUFBVzs7O29DQUFDLFNBQVM7OztBQUNqQixBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsQUFBSSx1QkFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDMUMsSUFBSSxDQUFDO0FBQ0YsMkJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNsQjtpQkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gsMEJBQU0sRUFBRSxDQUFDLEFBQ2I7aUJBQUMsQ0FBQyxDQUNMLEFBQ0w7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRUQsQUFBVTs7Ozs7O0FBQ04sQUFBTSxtQkFBQyxJQUFJLE9BQU8sQ0FBTSxVQUFDLE9BQU8sRUFBRSxNQUFNO0FBQ3BDLG9CQUFJLFVBQVUsR0FBUSxDQUNsQixFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUNaLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUMsRUFDYixFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxFQUNaLEVBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FDaEIsQ0FBQztBQUVGLDBCQUFVLEdBQUcsVUFBVSxDQUFDLFNBQVMsRUFBRSxDQUFDO0FBRXBDLG9CQUFJLGFBQWEsR0FBRyx1QkFBQyxTQUFTO0FBQzFCLEFBQUksMkJBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLEVBQUUsU0FBUyxDQUFDLENBQzFDLElBQUksQ0FBQyxVQUFDLENBQUM7QUFDSiwrQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO3FCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCxBQUFFLEFBQUMsNEJBQUMsVUFBVSxDQUFDLE1BQU0sR0FBRyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3hCLHlDQUFhLENBQUMsVUFBVSxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQUFDcEM7eUJBQUMsQUFBQyxBQUFJLE1BQUMsQUFBQztBQUNKLG1DQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDbkI7eUJBQUMsQUFDTDtxQkFBQyxDQUFDLENBQUMsQUFDWDtpQkFBQyxDQUFDO0FBQ0YsNkJBQWEsQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxBQUNwQzthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFDTCxBQUFDOzs7O2VBckxPLFNBQVMsQUFBQyxBQUFNLEFBQWEsQUFPckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7NEJDRDhDLEFBQVM7OztBQVFuRCx3Q0FDSSxBQUFPLEFBQUM7WUFEQSxPQUFPLHlEQUFPLEVBQUU7Ozs7OztBQUV4QixBQUFJLGNBQUMsSUFBSSxHQUFHLEFBQUksQUFBSSxVQVpwQixJQUFJLEFBQUMsQUFBTSxBQUFTLEFBRTVCLEVBVThCLENBQUM7QUFDdkIsQUFBSSxjQUFDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDZixBQUFJLGNBQUMsUUFBUSxHQUFHLEdBQUcsQ0FBQztBQUNwQixBQUFJLGNBQUMsUUFBUSxHQUFHLENBQUMsQUFBSSxNQUFDLFFBQVEsQ0FBQztBQUMvQixBQUFJLGNBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxBQUM3Qjs7S0FBQyxBQUVELEFBQWE7Ozs7O0FBQ1QsZ0JBQU0sV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDL0MsZ0JBQU0sUUFBUSxHQUFHLEFBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxBQUFDLEdBQUcsV0FBVyxDQUFDO0FBQy9ELEFBQU0sbUJBQUMsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQUFDMUQ7U0FBQyxBQUVELEFBQVk7Ozs7QUFDUixnQkFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsd0JBQXdCLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztBQUN2RSxnQkFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQUFDeEU7U0FBQyxBQUVELEFBQVc7Ozs7QUFDUCxBQUFNLG1CQUFDLElBQUksQ0FBQyxRQUFRLEdBQUcsSUFBSSxDQUFDLFFBQVEsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDLEFBQ3ZFO1NBQUMsQUFFRCxBQUFXOzs7Ozs7QUFDUCxBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsQUFBSSx1QkFBQyxRQUFRLElBQUksQUFBSSxPQUFDLFFBQVEsQ0FBQztBQUMvQix1QkFBTyxFQUFFLENBQUMsQUFDZDthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFFRCxBQUFHOzs7Ozs7QUFDQyxBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsQUFBRSxBQUFDLG9CQUFDLENBQUMsQUFBSSxPQUFDLFdBQVcsRUFBRSxBQUFDLEVBQUMsQUFBQztBQUN0QiwwQkFBTSxFQUFFLENBQUM7QUFDVCxBQUFNLDJCQUFDLEFBQ1g7aUJBQUM7QUFDRCxvQkFBTSxHQUFHLEdBQUcsQUFBSSxPQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUMvQixvQkFBTSxpQkFBaUIsR0FBc0IsQUFBSSxPQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUUzRixvQkFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLGlCQUFpQixDQUFDLGlCQUFpQixFQUFFLEFBQUksT0FBQyxLQUFLLENBQUMsQ0FBQztBQUV0RSxBQUFFLEFBQUMsb0JBQUMsUUFBUSxDQUFDLE1BQU0sS0FBSyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3hCLDJCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxBQUFNLDJCQUFDLEFBQ1g7aUJBQUM7QUFFRCxvQkFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBQzlCLEFBQUUsQUFBQyxvQkFBQyxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsc0JBQXNCLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDL0MsMkJBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNkLEFBQU0sMkJBQUMsQUFDWDtpQkFBQztBQUVELEFBQUksdUJBQUMsUUFBUSxHQUFHLEFBQUksT0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDM0MsQUFBSSx1QkFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3BDLHNCQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7QUFFZCx1QkFBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEFBQ3BCO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUNMLEFBQUM7Ozs7ZUF6RU8sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUc5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs0QkNFdUMsQUFBUzs7O0FBUW5ELHdDQUNJLEFBQU8sQUFBQztZQURBLE9BQU8seURBQU8sRUFBRTs7Ozs7O0FBRXhCLEFBQUksY0FBQyxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBWnBCLElBQUksQUFBQyxBQUFNLEFBQVMsQUFFNUIsRUFVOEIsQ0FBQztBQUN2QixBQUFJLGNBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQztBQUNmLEFBQUksY0FBQyxRQUFRLEdBQUcsR0FBRyxDQUFDO0FBQ3BCLEFBQUksY0FBQyxRQUFRLEdBQUcsQ0FBQyxBQUFJLE1BQUMsUUFBUSxDQUFDO0FBQy9CLEFBQUksY0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLEFBQzVCOztLQUFDLEFBRUQsQUFBYTs7Ozs7QUFDVCxnQkFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUMvQyxnQkFBTSxRQUFRLEdBQUcsQUFBQyxJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQyxRQUFRLEFBQUMsR0FBRyxXQUFXLENBQUM7QUFDL0QsQUFBTSxtQkFBQyx1QkFBdUIsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxBQUMzRDtTQUFDLEFBRUQsQUFBWTs7OztBQUNSLGdCQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0FBQ3ZFLGdCQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUN0RTtTQUFDLEFBRUQsQUFBVzs7OztBQUNQLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUMsQUFDdkU7U0FBQyxBQUVELEFBQVU7Ozs7OztBQUNOLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFJLHVCQUFDLFFBQVEsSUFBSSxBQUFJLE9BQUMsUUFBUSxDQUFDO0FBQy9CLHVCQUFPLEVBQUUsQ0FBQyxBQUNkO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVELEFBQUc7Ozs7OztBQUNDLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFFLEFBQUMsb0JBQUMsQ0FBQyxBQUFJLE9BQUMsV0FBVyxFQUFFLEFBQUMsRUFBQyxBQUFDO0FBQ3RCLDBCQUFNLEVBQUUsQ0FBQztBQUNULEFBQU0sMkJBQUMsQUFDWDtpQkFBQztBQUNELG9CQUFNLEdBQUcsR0FBRyxBQUFJLE9BQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQy9CLG9CQUFNLGlCQUFpQixHQUFzQixBQUFJLE9BQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBRTNGLG9CQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsaUJBQWlCLENBQ2xDLGlCQUFpQixFQUNqQixBQUFJLE9BQUMsS0FBSyxFQUNWLFVBQUMsTUFBTTtBQUNILEFBQU0sMkJBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLEFBQ3hEO2lCQUFDLENBQ0osQ0FBQztBQUVGLEFBQUUsQUFBQyxvQkFBQyxRQUFRLENBQUMsTUFBTSxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDeEIsMkJBQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUMsQ0FBQztBQUNsQywyQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ2QsQUFBTSwyQkFBQyxBQUNYO2lCQUFDO0FBRUQsb0JBQU0sTUFBTSxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUU5QixBQUFJLHVCQUFDLFFBQVEsR0FBRyxBQUFJLE9BQUMsSUFBSSxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQzNDLEFBQUksdUJBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUNyQyxzQkFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBRWQsdUJBQU8sQ0FBQyxNQUFNLENBQUMsQ0FBQyxBQUVwQjthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFDTCxBQUFDOzs7O2VBN0VPLFNBQVMsQUFBQyxBQUFNLEFBQWEsQUFHOUI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQ0g2QixBQUFTOzs7QUFDekMsOEJBQ0ksQUFBTyxBQUFDLEFBQ1o7Ozs7S0FBQyxBQUVELEFBQUc7Ozs7O0FBQ0MsbUJBQU8sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDdkI7U0FBQyxBQUNMLEFBQUM7Ozs7ZUFYTyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBR3JDOzs7Ozs7Ozs7Ozs7O2FDRVcsQUFBTzs7Ozs7Ozs7QUFDVixBQUFNLG1CQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEFBQ3hEO1NBQUMsQUFFTSxBQUFlOzs7d0NBQUMsTUFBYztBQUNqQyxnQkFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQUFDekI7U0FBQyxBQUVNLEFBQVk7Ozt1Q0FDbkIsRUFBQyxBQUVNLEFBQWE7Ozs7QUFDaEIsQUFBTSxtQkFBQyxFQUFFLENBQUMsQUFDZDtTQUFDLEFBQ0wsQUFBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQ1hxQyxBQUFTOzs7QUFLM0MsZ0NBQ0ksQUFBTyxBQUFDO1lBREEsT0FBTyx5REFBOEMsRUFBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBQzs7Ozs7O0FBRXZGLEFBQUksY0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQztBQUN6QixBQUFJLGNBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUM7QUFDdkIsQUFBSSxjQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLEFBQzdCOztLQUFDLEFBRUQsQUFBVTs7OzttQ0FBQyxPQUFlO0FBQ3RCLEFBQUUsQUFBQyxnQkFBQyxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxXQUFXLEFBQUMsRUFBQyxBQUFDO0FBQ3ZDLHNCQUFNLHNDQUFzQyxDQUFDLEFBQ2pEO2FBQUM7QUFFRCxBQUFFLEFBQUMsZ0JBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDdEIsQUFBTSx1QkFBQyxJQUFJLENBQUMsQUFDaEI7YUFBQztBQUNELEFBQU0sbUJBQUMsS0FBSyxDQUFDLEFBQ2pCO1NBQUMsQUFFRCxBQUFTOzs7a0NBQUMsT0FBZTtBQUNyQixBQUFFLEFBQUMsZ0JBQUMsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssV0FBVyxBQUFDLEVBQUMsQUFBQztBQUN2QyxzQkFBTSxzQ0FBc0MsQ0FBQyxBQUNqRDthQUFDO0FBRUQsQUFBRSxBQUFDLGdCQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3RCLEFBQU0sdUJBQUMsSUFBSSxDQUFDLEFBQ2hCO2FBQUM7QUFDRCxBQUFNLG1CQUFDLEtBQUssQ0FBQyxBQUNqQjtTQUFDLEFBRUQsQUFBTzs7O2dDQUFDLE9BQWU7QUFDbkIsQUFBRSxBQUFDLGdCQUFDLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLFdBQVcsQUFBQyxFQUFDLEFBQUM7QUFDdkMsc0JBQU0sc0NBQXNDLENBQUMsQUFDakQ7YUFBQztBQUVELEFBQUUsQUFBQyxnQkFBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQUMsRUFBQyxBQUFDO0FBQ3ZCLEFBQU0sdUJBQUMsSUFBSSxDQUFDLEFBQ2hCO2FBQUM7QUFDRCxBQUFNLG1CQUFDLEtBQUssQ0FBQyxBQUNqQjtTQUFDLEFBRUQsQUFBYzs7OztBQUNWLEFBQUUsQUFBQyxnQkFBQyxJQUFJLENBQUMsR0FBRyxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDakIsQUFBTSx1QkFBQyxLQUFLLENBQUMsQUFDakI7YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFFLEFBQUMsSUFBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDekIsQUFBTSx1QkFBQyxNQUFNLENBQUMsQUFDbEI7YUFBQyxBQUFDLEFBQUksTUFBQyxBQUFFLEFBQUMsSUFBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsQUFBQyxFQUFDLEFBQUM7QUFDekIsQUFBTSx1QkFBQyxNQUFNLENBQUMsQUFDbEI7YUFBQztBQUNELEFBQU0sbUJBQUMsRUFBRSxDQUFDLEFBQ2Q7U0FBQyxBQUNMLEFBQUM7Ozs7ZUE3RE8sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQU1yQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQ0oyQyxBQUFTOzs7QUFHaEQscUNBQ0ksQUFBTyxBQUFDO1lBREEsT0FBTyx5REFBTyxFQUFFOzs7Ozs7QUFFeEIsQUFBSSxjQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsQUFDM0I7O0tBQUMsQUFDTCxBQUFDOzs7ZUFUTyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkNBb0MsQUFBUzs7O0FBR3pDLDRCQUFZLE9BQXVCLEVBQy9CLEFBQU8sQUFBQzs7Ozs7QUFDUixBQUFJLGNBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLENBQUMsQUFDL0I7O0tBQUMsQUFFRCxBQUFROzs7OztBQUNKLEFBQU0sbUJBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxBQUN0QjtTQUFDLEFBQ0wsQUFBQzs7OztlQWZPLFNBQVMsQUFBQyxBQUFNLEFBQWEsQUFJckM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozt3QkNBMEMsQUFBUzs7O0FBRy9DLG9DQUNJLEFBQU8sQUFBQztZQURBLE9BQU8seURBQU8sRUFBRTs7Ozs7O0FBRXhCLEFBQUksY0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLEFBQzFCOztLQUFDLEFBQ0wsQUFBQzs7O2VBVE8sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O2tCQ1dvQyxBQUFTOzs7QUFTekMsOEJBQ0ksQUFBTyxBQUFDO1lBREEsT0FBTyx5REFBTyxFQUFFOzs7Ozs7QUFFeEIsQUFBSSxjQUFDLE9BQU8sR0FBRyxLQUFLLENBQUM7QUFDckIsQUFBSSxjQUFDLElBQUksR0FBRyxBQUFJLEFBQUksVUFwQnBCLElBQUksQUFBQyxBQUFNLEFBQVMsQUFLckIsRUFldUIsQ0FBQztBQUN2QixBQUFJLGNBQUMsR0FBRyxHQUFHLEFBQUksTUFBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUMsQUFDbEM7O0tBQUMsQUFFRCxBQUFZOzs7Ozs7O0FBQ1IsZ0JBQUksQ0FBQyxPQUFPLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxBQUFJLHVCQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7QUFDdkIsQUFBSSx1QkFBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLEFBQ3pCO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVELEFBQVc7OztvQ0FBQyxLQUFVOzs7QUFDbEIsQUFBRSxBQUFDLGdCQUFDLElBQUksQ0FBQyxPQUFPLEFBQUMsRUFBQyxBQUFDO0FBQ2YsQUFBRSxBQUFDLG9CQUFDLEtBQUssQ0FBQyxZQUFZLEVBQUUsS0FBSyxlQUFlLEFBQUMsRUFBQyxBQUFDO0FBQzNDLHlCQUFLLEdBQWtCLEtBQUssQ0FBQztBQUM3QixBQUFFLEFBQUMsd0JBQUMsS0FBSyxDQUFDLFlBQVksRUFBRSxLQUFLLEFBQWlCLG1CQS9CdEQsaUJBQWlCLEFBQUMsQUFBTSxBQUFzQixBQUd0RCxDQTRCK0QsSUFBSSxBQUFDLEVBQUMsQUFBQztBQUNsRCw0QkFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsQ0FDcEIsSUFBSSxDQUFDLFVBQUMsTUFBTTtBQUNULG1DQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QixBQUFFLEFBQUMsZ0NBQUMsTUFBTSxBQUFDLEVBQUMsQUFBQztBQUNULEFBQUksdUNBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQztBQUNyQixBQUFJLHVDQUFDLE9BQU8sRUFBRSxDQUFDLEFBQ25COzZCQUFDLEFBQ0w7eUJBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxVQUFDLE1BQU07QUFDWixtQ0FBTyxDQUFDLEdBQUcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUMsQ0FBQyxBQUNqRDt5QkFBQyxDQUFDLENBQUMsQUFDWDtxQkFBQyxBQUNMO2lCQUFDLEFBQ0w7YUFBQyxBQUNMO1NBQUMsQUFFRCxBQUFROzs7O0FBQ0osQUFBTSxtQkFBQyxJQUFJLENBQUMsQUFDaEI7U0FBQyxBQUVELEFBQWE7OztzQ0FBQyxLQUFvQjs7O0FBQzlCLEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQVUsVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUN4QyxBQUFNLEFBQUMsd0JBQUMsS0FBSyxDQUFDLFVBQVUsRUFBRSxBQUFDLEFBQUMsQUFBQztBQUN6Qix5QkFBSyxHQUFHLENBQUMsU0FBUztBQUNkLCtCQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDZCxBQUFLO0FBQUMsQUFDVix5QkFBSyxHQUFHLENBQUMsSUFBSTtBQUNULEFBQUksK0JBQUMsZ0JBQWdCLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUMsQ0FBQyxDQUM5QixJQUFJLENBQUM7QUFDRixtQ0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO3lCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCxtQ0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQ25CO3lCQUFDLENBQUMsQ0FBQztBQUNQLEFBQUs7QUFBQyxBQUNWLHlCQUFLLEdBQUcsQ0FBQyxJQUFJO0FBQ1QsQUFBSSwrQkFBQyxnQkFBZ0IsQ0FBQyxFQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FDL0IsSUFBSSxDQUFDO0FBQ0YsbUNBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNsQjt5QkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gsbUNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUNuQjt5QkFBQyxDQUFDLENBQUM7QUFDUCxBQUFLO0FBQUMsQUFDVix5QkFBSyxHQUFHLENBQUMsSUFBSTtBQUNULEFBQUksK0JBQUMsZ0JBQWdCLENBQUMsRUFBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBQyxDQUFDLENBQy9CLElBQUksQ0FBQztBQUNGLG1DQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQUFDbEI7eUJBQUMsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILG1DQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDbkI7eUJBQUMsQ0FBQyxDQUFDO0FBQ1AsQUFBSztBQUFDLEFBQ1YseUJBQUssR0FBRyxDQUFDLElBQUk7QUFDVCxBQUFJLCtCQUFDLGdCQUFnQixDQUFDLEVBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFDLENBQUMsQ0FDOUIsSUFBSSxDQUFDO0FBQ0YsbUNBQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxBQUNsQjt5QkFBQyxDQUFDLENBQ0QsS0FBSyxDQUFDO0FBQ0gsbUNBQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxBQUNuQjt5QkFBQyxDQUFDLENBQUM7QUFDUCxBQUFLO0FBQUMsQUFDVix5QkFBSyxHQUFHLENBQUMsSUFBSTtBQUNULEFBQUksK0JBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FDOUMsSUFBSSxDQUFDLFVBQUMsTUFBTTtBQUNULG1DQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsQ0FBQztBQUM5QixtQ0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLEFBQ2xCO3lCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCxtQ0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEFBQ25CO3lCQUFDLENBQUMsQ0FBQztBQUNQLEFBQUs7QUFBQyxBQUNWLHlCQUFLLEdBQUcsQ0FBQyxJQUFJO0FBQ1QsQUFBSSwrQkFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHdCQUF3QixFQUFFLEVBQUUsQ0FBQyxDQUM5QyxJQUFJLENBQUMsVUFBQyxNQUFNO0FBQ1QsbUNBQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQzlCLG1DQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQUFDbEI7eUJBQUMsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILG1DQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQUFDbkI7eUJBQUMsQ0FBQyxDQUFDO0FBQ1AsQUFBSztBQUFDLEFBQ1Y7QUFDSSwrQkFBTyxDQUFDLEtBQUssQ0FBQyxxQkFBcUIsRUFBRSxLQUFLLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQztBQUN6RCw4QkFBTSxFQUFFLENBQUM7QUFDVCxBQUFLO0FBQUMsQUFDZCxpQkFBQyxBQUNMO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUVPLEFBQWdCOzs7eUNBQUMsU0FBaUM7OztBQUN0RCxBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsb0JBQU0sV0FBVyxHQUFHLEFBQUksT0FBQyx5QkFBeUIsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUM5RCxvQkFBTSxNQUFNLEdBQUcsQUFBSSxPQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbEUsQUFBRSxBQUFDLG9CQUFDLE1BQU0sQUFBQyxFQUFDLEFBQUM7QUFDVCxBQUFJLDJCQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsb0JBQW9CLEVBQUUsU0FBUyxDQUFDLENBQ2pELElBQUksQ0FBQztBQUNGLCtCQUFPLEVBQUUsQ0FBQyxBQUNkO3FCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUM7QUFDSCw4QkFBTSxFQUFFLENBQUMsQUFDYjtxQkFBQyxDQUFDLENBQUMsQUFDWDtpQkFBQyxBQUFDLEFBQUksTUFBQyxBQUFDO0FBQ0osQUFBSSwyQkFBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGFBQWEsRUFBRSxTQUFTLENBQUMsQ0FDMUMsSUFBSSxDQUFDO0FBQ0YsK0JBQU8sRUFBRSxDQUFDLEFBQ2Q7cUJBQUMsQ0FBQyxDQUNELEtBQUssQ0FBQztBQUNILDhCQUFNLEVBQUUsQ0FBQyxBQUNiO3FCQUFDLENBQUMsQ0FBQyxBQUNYO2lCQUFDLEFBQ0w7YUFBQyxDQUFDLENBQUMsQUFDUDtTQUFDLEFBRU8sQUFBeUI7OztrREFBQyxTQUFpQztBQUMvRCxnQkFBTSxpQkFBaUIsR0FBc0IsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMzRixBQUFNLG1CQUFDO0FBQ0gsaUJBQUMsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQztBQUN6QyxpQkFBQyxFQUFFLGlCQUFpQixDQUFDLElBQUksRUFBRSxHQUFHLFNBQVMsQ0FBQyxDQUFDO2FBQzVDLENBQUMsQUFDTjtTQUFDLEFBQ0wsQUFBQzs7OztlQWhLTyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRzlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3dCQ0FtQyxBQUFTOzs7QUFHL0Msb0NBQ0ksQUFBTyxBQUFDO1lBREEsT0FBTyx5REFBTyxFQUFFOzs7Ozs7QUFFeEIsWUFBTSxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBVHJCLElBQUksQUFBQyxBQUFNLEFBQVMsQUFDckIsRUFRd0IsQ0FBQztBQUV4QixBQUFJLGNBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQyxBQUM3Qjs7S0FBQyxBQUVELEFBQVk7Ozs7O0FBQ1IsZ0JBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUN0RjtTQUFDLEFBRUQsQUFBa0I7OzsyQ0FBQyxTQUFpQzs7O0FBQ2hELEFBQU0sbUJBQUMsSUFBSSxPQUFPLENBQU0sVUFBQyxPQUFPLEVBQUUsTUFBTTtBQUNwQyxvQkFBTSxpQkFBaUIsR0FBc0IsQUFBSSxPQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUMzRixvQkFBTSxNQUFNLEdBQUcsQUFBSSxPQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLENBQUMsSUFBSSxFQUFFLEdBQUcsU0FBUyxDQUFDLENBQUMsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsR0FBRyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFFcEgsQUFBRSxBQUFDLG9CQUFDLENBQUMsTUFBTSxBQUFDLEVBQUMsQUFBQztBQUNWLDBCQUFNLEVBQUUsQ0FBQyxBQUNiO2lCQUFDO0FBRUQsc0JBQU0sQ0FBQyxJQUFJLEVBQUUsQ0FDUixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7QUFFbkIsdUJBQU8sQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDLEFBRWxDO2FBQUMsQ0FBQyxDQUFDLEFBQ1A7U0FBQyxBQUNMLEFBQUM7Ozs7ZUFqQ08sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUdyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7O21CQ0hxQyxBQUFTLEFBQzlDLEFBQUM7Ozs7Ozs7Ozs7ZUFITyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRXJDOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3FCQ0V1QyxBQUFTOzs7QUFJNUMsaUNBQ0ksQUFBTyxBQUFDO1lBREEsT0FBTyx5REFBMkIsRUFBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUM7Ozs7OztBQUV0RCxBQUFJLGNBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDbkIsQUFBSSxjQUFDLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEFBQ3ZCOztLQUFDLEFBRUQsQUFBVzs7Ozs7QUFDUCxBQUFNLG1CQUFDLEVBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFDLEVBQUMsQ0FBQyxBQUNsQztTQUFDLEFBRUQsQUFBSTs7OztBQUNBLEFBQU0sbUJBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUNsQjtTQUFDLEFBRUQsQUFBSTs7OztBQUNBLEFBQU0sbUJBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxBQUNsQjtTQUFDLEFBRUQsQUFBVzs7O29DQUFDLENBQVMsRUFBRSxDQUFTO0FBQzVCLGdCQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNYLGdCQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxBQUNmO1NBQUMsQUFFRCxBQUFZOzs7O0FBQ1IsZ0JBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQUFDaEY7U0FBQyxBQUVELEFBQW1COzs7NENBQUMsU0FBaUM7OztBQUNqRCxBQUFNLG1CQUFDLElBQUksT0FBTyxDQUFNLFVBQUMsT0FBTyxFQUFFLE1BQU07QUFDcEMsb0JBQUksQ0FBQyxHQUFHLEFBQUksQUFBSSxnQkFBRSxDQUFDO0FBQ25CLG9CQUFJLFFBQVEsR0FBRztBQUNYLHFCQUFDLEVBQUUsQUFBSSxPQUFDLENBQUMsR0FBRyxTQUFTLENBQUMsQ0FBQztBQUN2QixxQkFBQyxFQUFFLEFBQUksT0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDLENBQUM7aUJBQzFCLENBQUM7QUFDRixpQkFBQyxDQUFDLFNBQVMsQ0FBQyxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQzdCLElBQUksQ0FBQyxVQUFDLFFBQVE7QUFDWCxBQUFJLDJCQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUNyQiwyQkFBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEFBQ3ZCO2lCQUFDLENBQUMsQ0FDRCxLQUFLLENBQUMsVUFBQyxRQUFRO0FBQ1osMEJBQU0sQ0FBQyxTQUFTLENBQUMsQ0FBQyxBQUN0QjtpQkFBQyxDQUFDLENBQUMsQUFDWDthQUFDLENBQUMsQ0FBQyxBQUNQO1NBQUMsQUFFRCxBQUFVOzs7bUNBQUMsQ0FBUyxFQUFFLENBQVM7QUFDM0IsZ0JBQU0sRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNoQyxnQkFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBRWhDLEFBQU0sbUJBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxBQUNuQjtTQUFDLEFBRUQsQUFBSTs7OzZCQUFDLFNBQWlDO0FBQ2xDLGdCQUFJLFdBQVcsR0FBRztBQUNkLGlCQUFDLEVBQUUsSUFBSSxDQUFDLENBQUM7QUFDVCxpQkFBQyxFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ1osQ0FBQztBQUNGLGdCQUFJLENBQUMsQ0FBQyxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUM7QUFDdEIsZ0JBQUksQ0FBQyxDQUFDLElBQUksU0FBUyxDQUFDLENBQUMsQ0FBQztBQUN0QixnQkFBSSxDQUFDLEdBQUcsQUFBSSxBQUFJLFVBakVoQixJQUFJLEFBQUMsQUFBTSxBQUFTLEFBRTVCLEVBK0QwQixDQUFDO0FBQ25CLGFBQUMsQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxNQUFNLEVBQUUsV0FBVyxFQUFFLFdBQVcsRUFBQyxDQUFDLENBQUMsQUFDaEY7U0FBQyxBQUNMLEFBQUM7Ozs7ZUF0RU8sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUU5Qjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztrQkNJNkIsQUFBUzs7O0FBUXpDLDhCQUNJLEFBQU8sQUFBQztZQURBLE9BQU8seURBQXVCLEVBQUMsUUFBUSxFQUFFLENBQUMsRUFBQzs7Ozs7O0FBRW5ELEFBQUksY0FBQyxJQUFJLEdBQUcsQUFBSSxBQUFJLFVBZHBCLElBQUksQUFBQyxBQUFNLEFBQVMsQUFJNUIsRUFVOEIsQ0FBQztBQUN2QixBQUFJLGNBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUM7QUFDakMsQUFBSSxjQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsQUFBSSxjQUFDLFlBQVksR0FBRyxFQUFFLENBQUM7QUFDdkIsQUFBSSxjQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQyxBQUM1Qjs7S0FBQyxBQUVELEFBQVc7Ozs7O0FBQ1AsQUFBTSxtQkFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEFBQ3pCO1NBQUMsQUFFRCxBQUFlOzs7O0FBQ1gsZ0JBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxBQUM3QjtTQUFDLEFBRUQsQUFBTTs7OytCQUFDLENBQVMsRUFBRSxDQUFTO0FBQ3ZCLGdCQUFNLGlCQUFpQixHQUF5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlHLEFBQUUsQUFBQyxnQkFBQyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxRQUFRLEFBQUMsRUFBQyxBQUFDO0FBQ3JELEFBQU0sdUJBQUMsS0FBSyxDQUFDLEFBQ2pCO2FBQUM7QUFDRCxBQUFNLG1CQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEFBQ2hDO1NBQUMsQUFFRCxBQUFPOzs7Z0NBQUMsQ0FBUyxFQUFFLENBQVM7QUFDeEIsZ0JBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzNCLEFBQU0sbUJBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxBQUNsRDtTQUFDLEFBRUQsQUFBa0I7Ozs7OztBQUNkLGdCQUFNLGlCQUFpQixHQUF5QyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlHLGdCQUFNLEdBQUcsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BDLEFBQU0sbUJBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUN4QixpQkFBaUIsRUFDakIsSUFBSSxDQUFDLFFBQVEsRUFDYixVQUFDLE1BQU07QUFDSCxvQkFBTSxJQUFJLEdBQXlDLE1BQU0sQ0FBQyxZQUFZLENBQUMsbUJBQW1CLENBQUMsQ0FBQztBQUM1RixBQUFNLHVCQUFDLEFBQUksT0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxFQUFFLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEFBQ3BEO2FBQUMsQ0FDSixDQUFDLEFBQ047U0FBQyxBQUVPLEFBQVM7OztrQ0FBQyxDQUFTLEVBQUUsQ0FBUztBQUNsQyxnQkFBSSxDQUFDLG1CQUFtQixFQUFFLENBQUM7QUFDM0IsQUFBTSxtQkFBQyxJQUFJLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLEtBQUssSUFBSSxDQUFDLEFBQ25EO1NBQUMsQUFFTyxBQUFtQjs7OztBQUN2QixnQkFBSSxXQUFXLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsQ0FBQztBQUM3QyxBQUFFLEFBQUMsZ0JBQUMsV0FBVyxLQUFLLElBQUksQ0FBQyxhQUFhLEFBQUMsRUFBQyxBQUFDO0FBQ3JDLEFBQU0sdUJBQUMsQUFDWDthQUFDO0FBQ0QsZ0JBQU0sR0FBRyxHQUFRLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7QUFDcEMsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUNwRSxnQkFBSSxDQUFDLFlBQVksR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0FBQ3hFLGdCQUFJLENBQUMsYUFBYSxHQUFHLFdBQVcsQ0FBQyxBQUNyQztTQUFDLEFBRUwsQUFBQzs7OztlQTFFTyxTQUFTLEFBQUMsQUFBTSxBQUFhLEFBRTlCOzs7Ozs7O0FDRlAsTUFBTSxDQUFDLE1BQU0sR0FBRztBQUNaLFFBQUksSUFBSSxHQUFHLEFBQUksQUFBSSxVQUhmLElBQUksQUFBQyxBQUFNLEFBQVEsRUFHRixDQUFDO0FBQ3RCLFFBQUksQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEFBQ3RCO0NBQUMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQge0d1aWR9IGZyb20gJy4vR3VpZCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEVudGl0eSB7XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIGd1aWQ6IHN0cmluZztcbiAgICBjb21wb25lbnRzOiB7W25hbWU6IHN0cmluZ106IENvbXBvbmVudH07XG4gICAgYWN0aW5nOiBib29sZWFuO1xuXG4gICAgbGlzdGVuZXJzOiB7W25hbWU6IHN0cmluZ106IGFueVtdfTtcblxuICAgIGNvbnN0cnVjdG9yKG5hbWU6IHN0cmluZyA9ICcnKSB7XG4gICAgICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgICAgIHRoaXMuZ3VpZCA9IEd1aWQuZ2VuZXJhdGUoKTtcbiAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzID0ge307XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgfVxuXG4gICAgZ2V0R3VpZCgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5ndWlkO1xuICAgIH1cblxuICAgIGFjdCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBpZiAodGhpcy5uYW1lID09PSAncGxheWVyJykge1xuICAgICAgICAgICAgZm9yICh2YXIgY29tcG9uZW50TmFtZSBpbiB0aGlzLmNvbXBvbmVudHMpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBjb21wb25lbnQgPSB0aGlzLmNvbXBvbmVudHNbY29tcG9uZW50TmFtZV07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3RhdGUgPSBjb21wb25lbnQuZGVzY3JpYmVTdGF0ZSgpO1xuICAgICAgICAgICAgICAgIGlmIChzdGF0ZSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhzdGF0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZy5yZW5kZXIoKTtcblxuICAgICAgICAgICAgY29uc3QgYyA9IDxTaWdodENvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuYWN0aW5nID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuaGFzQ29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUlucHV0Q29tcG9uZW50KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNDb21wb25lbnQoJ1JhbmRvbVdhbGtDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVSYW5kb21XYWxrQ29tcG9uZW50KCk7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5oYXNDb21wb25lbnQoJ0FJRmFjdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZUFJRmFjdGlvbkNvbXBvbmVudCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGtpbGwoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgICAgICB0aGlzLnNlbmRFdmVudCgna2lsbGVkJylcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlLaWxsZWQnLCB0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChyZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlLaWxsZWQnLCB0aGlzKVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaChyZXNvbHZlKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVBSUZhY3Rpb25Db21wb25lbnQoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5sb2NrRW5naW5lKCk7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSA8QUlGYWN0aW9uQ29tcG9uZW50PnRoaXMuZ2V0Q29tcG9uZW50KCdBSUZhY3Rpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LmFjdCgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVSYW5kb21XYWxrQ29tcG9uZW50KCkge1xuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcubG9ja0VuZ2luZSgpO1xuICAgICAgICB2YXIgY29tcG9uZW50ID0gPFJhbmRvbVdhbGtDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ1JhbmRvbVdhbGtDb21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnJhbmRvbVdhbGsoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgaGFuZGxlSW5wdXRDb21wb25lbnQoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5sb2NrRW5naW5lKCk7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSA8SW5wdXRDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50Jyk7XG4gICAgICAgIGNvbXBvbmVudC53YWl0Rm9ySW5wdXQoKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFkZENvbXBvbmVudChjb21wb25lbnQ6IENvbXBvbmVudCkge1xuICAgICAgICBjb21wb25lbnQuc2V0UGFyZW50RW50aXR5KHRoaXMpO1xuICAgICAgICBjb21wb25lbnQuc2V0TGlzdGVuZXJzKCk7XG4gICAgICAgIHRoaXMuY29tcG9uZW50c1tjb21wb25lbnQuZ2V0TmFtZSgpXSA9IGNvbXBvbmVudDtcbiAgICB9XG5cbiAgICBoYXNDb21wb25lbnQobmFtZTogc3RyaW5nKSB7XG4gICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy5jb21wb25lbnRzW25hbWVdICE9PSAndW5kZWZpbmVkJztcbiAgICB9XG5cbiAgICBnZXRDb21wb25lbnQobmFtZTogc3RyaW5nKTogQ29tcG9uZW50IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29tcG9uZW50c1tuYW1lXTtcbiAgICB9XG5cbiAgICBzZW5kRXZlbnQobmFtZTogc3RyaW5nLCBkYXRhOiBhbnkgPSBudWxsKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIGlmICghbGlzdGVuZXJzIHx8IGxpc3RlbmVycy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gUHJvbWlzZTxUPikge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtHYW1lU2NyZWVufSBmcm9tICcuL0dhbWVTY3JlZW4nO1xuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5cbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBzY3JlZW5XaWR0aDogbnVtYmVyO1xuICAgIHNjcmVlbkhlaWdodDogbnVtYmVyO1xuXG4gICAgY2FudmFzOiBhbnk7XG5cbiAgICBhY3RpdmVTY3JlZW46IEdhbWVTY3JlZW47XG4gICAgbWFwOiBNYXA7XG5cbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgc2NoZWR1bGVyOiBhbnk7XG4gICAgZW5naW5lOiBhbnk7XG5cbiAgICB0dXJuQ291bnQ6IG51bWJlcjtcbiAgICB0dXJuVGltZTogbnVtYmVyO1xuICAgIG1pblR1cm5UaW1lOiBudW1iZXI7XG5cbiAgICBwcml2YXRlIHN0YXRpYyBpbnN0YW5jZTogR2FtZTtcblxuICAgIGxpc3RlbmVyczoge1tuYW1lOiBzdHJpbmddOiBhbnlbXX07XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgaWYgKEdhbWUuaW5zdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBHYW1lLmluc3RhbmNlO1xuICAgICAgICB9XG4gICAgICAgIEdhbWUuaW5zdGFuY2UgPSB0aGlzO1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICAgICAgICB0aGlzLnR1cm5Db3VudCA9IDA7XG4gICAgICAgIHRoaXMudHVyblRpbWUgPSAobmV3IERhdGUoKSkuZ2V0VGltZSgpO1xuICAgICAgICB0aGlzLm1pblR1cm5UaW1lID0gMTAwO1xuICAgICAgICB3aW5kb3dbJ0dhbWUnXSA9IHRoaXM7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIpIHtcbiAgICAgICAgdGhpcy5zY3JlZW5XaWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLnNjcmVlbkhlaWdodCA9IGhlaWdodDtcblxuICAgICAgICB0aGlzLmRpc3BsYXkgPSBuZXcgUk9ULkRpc3BsYXkoe1xuICAgICAgICAgICAgd2lkdGg6IHRoaXMuc2NyZWVuV2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuc2NyZWVuSGVpZ2h0XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuY2FudmFzID0gdGhpcy5kaXNwbGF5LmdldENvbnRhaW5lcigpO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHRoaXMuY2FudmFzKTtcblxuICAgICAgICB0aGlzLnNjaGVkdWxlciA9IG5ldyBST1QuU2NoZWR1bGVyLlNpbXBsZSgpO1xuICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQoe1xuICAgICAgICAgICAgYWN0OiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy50dXJuQ291bnQrKztcbiAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCd0dXJuJywgdGhpcy50dXJuQ291bnQpO1xuICAgICAgICAgICAgfX0sIHRydWUpO1xuICAgICAgICB0aGlzLmVuZ2luZSA9IG5ldyBST1QuRW5naW5lKHRoaXMuc2NoZWR1bGVyKTtcblxuICAgICAgICB0aGlzLm1hcCA9IG5ldyBNYXAodGhpcy5zY3JlZW5XaWR0aCwgdGhpcy5zY3JlZW5IZWlnaHQgLSAxKTtcbiAgICAgICAgdGhpcy5tYXAuZ2VuZXJhdGUoKTtcblxuICAgICAgICB2YXIgZ2FtZVNjcmVlbiA9IG5ldyBHYW1lU2NyZWVuKHRoaXMuZGlzcGxheSwgdGhpcy5zY3JlZW5XaWR0aCwgdGhpcy5zY3JlZW5IZWlnaHQsIHRoaXMubWFwKTtcbiAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4gPSBnYW1lU2NyZWVuO1xuXG4gICAgICAgIHRoaXMuYmluZElucHV0SGFuZGxpbmcoKTtcblxuICAgICAgICB0aGlzLmVuZ2luZS5zdGFydCgpO1xuXG4gICAgICAgIHRoaXMucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kRXZlbnQoZXZlbnROYW1lOiBzdHJpbmcsIGNvbnZlcnRlcjogYW55LCBjYWxsYmFjazogYW55KSB7XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKGV2ZW50TmFtZSwgKGV2ZW50KSA9PiB7XG4gICAgICAgICAgICBjYWxsYmFjayhjb252ZXJ0ZXIoZXZlbnROYW1lLCBldmVudCkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGJpbmRJbnB1dEhhbmRsaW5nKCkge1xuICAgICAgICB2YXIgYmluZEV2ZW50c1RvU2NyZWVuID0gKGV2ZW50TmFtZSwgY29udmVydGVyKSA9PiB7XG4gICAgICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmFjdGl2ZVNjcmVlbiAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZVNjcmVlbi5oYW5kbGVJbnB1dChjb252ZXJ0ZXIoZXZlbnROYW1lLCBldmVudCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG5cbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlkb3duJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQpO1xuICAgICAgICBiaW5kRXZlbnRzVG9TY3JlZW4oJ2tleXByZXNzJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQpO1xuICAgICAgICBiaW5kRXZlbnRzVG9TY3JlZW4oJ2NsaWNrJywgdGhpcy5jb252ZXJ0TW91c2VFdmVudCk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0S2V5RXZlbnQgPSAobmFtZTogc3RyaW5nLCBldmVudDogYW55KTogS2V5Ym9hcmRFdmVudCA9PiB7XG4gICAgICAgIHZhciBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlID0gS2V5Ym9hcmRFdmVudFR5cGUuUFJFU1M7XG4gICAgICAgIGlmIChuYW1lID09PSAna2V5ZG93bicpIHtcbiAgICAgICAgICAgIGV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLkRPV047XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBLZXlib2FyZEV2ZW50KFxuICAgICAgICAgICAgZXZlbnQua2V5Q29kZSxcbiAgICAgICAgICAgIGV2ZW50VHlwZSxcbiAgICAgICAgICAgIGV2ZW50LmFsdEtleSxcbiAgICAgICAgICAgIGV2ZW50LmN0cmxLZXksXG4gICAgICAgICAgICBldmVudC5zaGlmdEtleSxcbiAgICAgICAgICAgIGV2ZW50Lm1ldGFLZXlcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGNvbnZlcnRNb3VzZUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IE1vdXNlQ2xpY2tFdmVudCA9PiB7XG4gICAgICAgIGxldCBwb3NpdGlvbiA9IHRoaXMuZGlzcGxheS5ldmVudFRvUG9zaXRpb24oZXZlbnQpO1xuXG4gICAgICAgIHZhciBidXR0b25UeXBlOiBNb3VzZUJ1dHRvblR5cGUgPSBNb3VzZUJ1dHRvblR5cGUuTEVGVDtcbiAgICAgICAgaWYgKGV2ZW50LndoaWNoID09PSAyKSB7XG4gICAgICAgICAgICBidXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLk1JRERMRTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudC53aWNoID09PSAzKSB7XG4gICAgICAgICAgICBidXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLlJJR0hUXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBNb3VzZUNsaWNrRXZlbnQoXG4gICAgICAgICAgICBwb3NpdGlvblswXSxcbiAgICAgICAgICAgIHBvc2l0aW9uWzFdLFxuICAgICAgICAgICAgYnV0dG9uVHlwZVxuICAgICAgICApO1xuICAgIH1cblxuICAgIHB1YmxpYyBsb2NrRW5naW5lKCkge1xuICAgICAgICB0aGlzLmVuZ2luZS5sb2NrKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHVubG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUudW5sb2NrKCk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnQWN0b3JDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIucmVtb3ZlKGVudGl0eSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIGlmIChlbnRpdHkuaGFzQ29tcG9uZW50KCdBY3RvckNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLnNjaGVkdWxlci5hZGQoZW50aXR5LCB0cnVlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxJbnB1dENvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdJbnB1dENvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoJ2tleXByZXNzJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQsIGNvbXBvbmVudC5oYW5kbGVFdmVudC5iaW5kKGNvbXBvbmVudCkpO1xuICAgICAgICAgICAgdGhpcy5iaW5kRXZlbnQoJ2tleWRvd24nLCB0aGlzLmNvbnZlcnRLZXlFdmVudCwgY29tcG9uZW50LmhhbmRsZUV2ZW50LmJpbmQoY29tcG9uZW50KSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwdWJsaWMgc2VuZEV2ZW50KG5hbWU6IHN0cmluZywgZGF0YTogYW55KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmxpc3RlbmVyc1tuYW1lXSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciByZXR1cm5EYXRhO1xuXG4gICAgICAgICAgICB2YXIgbGlzdGVuZXJzID0gdGhpcy5saXN0ZW5lcnNbbmFtZV07XG4gICAgICAgICAgICB2YXIgaSA9IDA7XG5cbiAgICAgICAgICAgIHZhciBjYWxsTmV4dCA9IChkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGxpc3RlbmVyID0gbGlzdGVuZXJzW2ldO1xuICAgICAgICAgICAgICAgIGkrKztcblxuICAgICAgICAgICAgICAgIHZhciBwID0gbGlzdGVuZXIoZGF0YSk7XG4gICAgICAgICAgICAgICAgcC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT09IGxpc3RlbmVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxOZXh0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChyZXN1bHQpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY2FsbE5leHQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHB1YmxpYyBhZGRMaXN0ZW5lcjxUPihuYW1lOiBzdHJpbmcsIGNhbGxiYWNrOiAoZGF0YTogYW55KSA9PiBUKSB7XG4gICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdID0gW107XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5saXN0ZW5lcnNbbmFtZV0ucHVzaChjYWxsYmFjayk7XG4gICAgfVxuXG4gICAgcHVibGljIHJlbmRlcigpIHtcbiAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4ucmVuZGVyKCk7XG4gICAgfVxuXG4gICAgcHVibGljIGdldE1hcCgpOiBNYXAge1xuICAgICAgICByZXR1cm4gdGhpcy5tYXA7XG4gICAgfVxuXG4gICAgcHVibGljIGdldEN1cnJlbnRUdXJuKCkge1xuICAgICAgICByZXR1cm4gdGhpcy50dXJuQ291bnQ7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi9HYW1lJztcbmltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4vRW50aXR5JztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcbmltcG9ydCAqIGFzIFRpbGVzIGZyb20gJy4vVGlsZXMnO1xuXG5pbXBvcnQge0FjdG9yQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQnO1xuaW1wb3J0IHtQbGF5ZXJDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9QbGF5ZXJDb21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1NpZ2h0Q29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtBYmlsaXR5RmlyZWJvbHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQnO1xuaW1wb3J0IHtBYmlsaXR5SWNlTGFuY2VDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9BYmlsaXR5SWNlTGFuY2VDb21wb25lbnQnO1xuaW1wb3J0IHtNZWxlZUF0dGFja0NvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL01lbGVlQXR0YWNrQ29tcG9uZW50JztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcbmltcG9ydCB7TW91c2VDbGlja0V2ZW50fSBmcm9tICcuL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi9LZXlib2FyZEV2ZW50JztcblxuZXhwb3J0IGNsYXNzIEdhbWVTY3JlZW4ge1xuICAgIGRpc3BsYXk6IGFueTtcbiAgICBtYXA6IE1hcDtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICAgIHBsYXllcjogRW50aXR5O1xuICAgIGdhbWU6IEdhbWU7XG4gICAgbnVsbFRpbGU6IFRpbGU7XG5cbiAgICBjb25zdHJ1Y3RvcihkaXNwbGF5OiBhbnksIHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYXA6IE1hcCkge1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLmRpc3BsYXkgPSBkaXNwbGF5O1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgLy9uZXcgTWFwKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0IC0gMSk7XG4gICAgICAgIC8vdGhpcy5tYXAuZ2VuZXJhdGUoKTtcblxuICAgICAgICB0aGlzLm51bGxUaWxlID0gVGlsZXMuY3JlYXRlLm51bGxUaWxlKCk7XG5cbiAgICAgICAgdGhpcy5wbGF5ZXIgPSBuZXcgRW50aXR5KCdwbGF5ZXInKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQbGF5ZXJDb21wb25lbnQoKSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnQCcsICd3aGl0ZScsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBJbnB1dENvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCh7XG4gICAgICAgICAgICBkaXN0YW5jZTogNTBcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IEZhY3Rpb25Db21wb25lbnQoe1xuICAgICAgICAgICAgaGVybzogMSxcbiAgICAgICAgICAgIGljZTogLTEsXG4gICAgICAgICAgICBmaXJlOiAtMVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IEFiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBNZWxlZUF0dGFja0NvbXBvbmVudCgpKTtcblxuICAgICAgICB0aGlzLm1hcC5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKHRoaXMucGxheWVyKTtcblxuICAgICAgICB0aGlzLmdhbWUuYWRkRW50aXR5KHRoaXMucGxheWVyKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gYi54OyB4IDwgYi54ICsgYi53OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBiLnk7IHkgPCBiLnkgKyBiLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciBnbHlwaDogR2x5cGggPSB0aGlzLm1hcC5nZXRUaWxlKHgsIHkpLmdldEdseXBoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJNYXBHbHlwaChnbHlwaCwgeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcC5tYXBFbnRpdGllcyh0aGlzLnJlbmRlckVudGl0eSk7XG4gICAgfVxuXG4gICAgaGFuZGxlSW5wdXQoZXZlbnREYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ01vdXNlQ2xpY2tFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VDbGlja0V2ZW50KDxNb3VzZUNsaWNrRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlib2FyZEV2ZW50KDxLZXlib2FyZEV2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZUNsaWNrRXZlbnQoZXZlbnQ6IE1vdXNlQ2xpY2tFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuZ2V0WCgpID09PSAtMSB8fCBldmVudC5nZXRZKCkgPT09IC0xKSB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkIG91dHNpZGUgb2YgY2FudmFzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCkpO1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xpY2tlZCcsIGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpLCB0aWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICB9XG5cbiAgICBnZXRNYXAoKTogTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3OiB0aGlzLm1hcC5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaDogdGhpcy5tYXAuZ2V0SGVpZ2h0KClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUmVuZGVyYWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgcmV0dXJuIHggPj0gYi54ICYmIHggPCBiLnggKyBiLncgJiYgeSA+PSBiLnkgJiYgeSA8IGIueSArIGIuaDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlck1hcEdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuICAgICAgICBjb25zdCBzaWdodENvbXBvbmVudDogU2lnaHRDb21wb25lbnQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuXG4gICAgICAgIGlmIChzaWdodENvbXBvbmVudC5jYW5TZWUoeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnbHlwaC5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHNpZ2h0Q29tcG9uZW50Lmhhc1NlZW4oeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICAnIzExMSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnOiBHbHlwaCA9IHRoaXMubnVsbFRpbGUuZ2V0R2x5cGgoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnLmNoYXIsXG4gICAgICAgICAgICAgICAgZy5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgIGcuYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyR2x5cGgoZ2x5cGg6IEdseXBoLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG4gICAgICAgIGNvbnN0IHNpZ2h0Q29tcG9uZW50OiBTaWdodENvbXBvbmVudCA9IDxTaWdodENvbXBvbmVudD50aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1NpZ2h0Q29tcG9uZW50Jyk7XG5cbiAgICAgICAgaWYgKHNpZ2h0Q29tcG9uZW50LmNhblNlZSh4LHkpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZ2x5cGguY2hhcixcbiAgICAgICAgICAgICAgICBnbHlwaC5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgIGdseXBoLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckVudGl0eSA9IChlbnRpdHk6IEVudGl0eSkgPT4ge1xuICAgICAgICB2YXIgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIHZhciBnbHlwaENvbXBvbmVudDogR2x5cGhDb21wb25lbnQgPSA8R2x5cGhDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnR2x5cGhDb21wb25lbnQnKTtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZ2x5cGggPSBnbHlwaENvbXBvbmVudC5nZXRHbHlwaCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1JlbmRlcmFibGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHbHlwaCB7XG4gICAgcHVibGljIGNoYXI6IHN0cmluZztcbiAgICBwdWJsaWMgZm9yZWdyb3VuZDogc3RyaW5nO1xuICAgIHB1YmxpYyBiYWNrZ3JvdW5kOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjaGFyOiBzdHJpbmcsIGZvcmVncm91bmQ6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY2hhciA9IGNoYXI7XG4gICAgICAgIHRoaXMuZm9yZWdyb3VuZCA9IGZvcmVncm91bmQ7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgR3VpZCB7XG4gICAgc3RhdGljIGdlbmVyYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmRFdmVudCB7XG4gICAga2V5Q29kZTogbnVtYmVyO1xuICAgIGFsdEtleTogYm9vbGVhbjtcbiAgICBjdHJsS2V5OiBib29sZWFuO1xuICAgIHNoaWZ0S2V5OiBib29sZWFuO1xuICAgIG1ldGFLZXk6IGJvb2xlYW47XG4gICAgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIEtleWJvYXJkRXZlbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3Ioa2V5Q29kZTogbnVtYmVyLCBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlLCBhbHRLZXk6IGJvb2xlYW4sIGN0cmxLZXk6IGJvb2xlYW4sIHNoaWZ0S2V5OiBib29sZWFuLCBtZXRhS2V5OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMua2V5Q29kZSA9IGtleUNvZGU7XG4gICAgICAgIHRoaXMuZXZlbnRUeXBlID0gZXZlbnRUeXBlO1xuICAgICAgICB0aGlzLmFsdEtleSA9IGFsdEtleTtcbiAgICAgICAgdGhpcy5jdHJsS2V5ID0gY3RybEtleTtcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IHNoaWZ0S2V5O1xuICAgICAgICB0aGlzLm1ldGFLZXkgPSBtZXRhS2V5O1xuICAgIH1cblxuICAgIGdldEV2ZW50VHlwZSgpOiBLZXlib2FyZEV2ZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50VHlwZTtcbiAgICB9XG5cbiAgICBnZXRLZXlDb2RlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmtleUNvZGU7XG4gICAgfVxuXG4gICAgaGFzQWx0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbHRLZXk7XG4gICAgfVxuXG4gICAgaGFzU2hpZnRLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoaWZ0S2V5O1xuICAgIH1cblxuICAgIGhhc0N0cmxLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN0cmxLZXk7XG4gICAgfVxuXG4gICAgaGFzTWV0YUtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YUtleTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBLZXlib2FyZEV2ZW50VHlwZSB7XG4gICAgRE9XTixcbiAgICBVUCxcbiAgICBQUkVTU1xufTtcbiIsImRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQgKiBhcyBUaWxlcyBmcm9tICcuL1RpbGVzJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGaXJlQWZmaW5pdHlDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GaXJlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtJY2VBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ljZUFmZmluaXR5Q29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBNYXAge1xuICAgIHdpZHRoOiBudW1iZXI7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgdGlsZXM6IFRpbGVbXVtdO1xuXG4gICAgZW50aXRpZXM6IHtbZ3VpZDogc3RyaW5nXTogRW50aXR5fTtcbiAgICBtYXhFbmVtaWVzOiBudW1iZXI7XG5cbiAgICBmb3Y6IGFueTtcblxuICAgIGNvbnN0cnVjdG9yKHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyLCBtYXhFbmVtaWVzOiBudW1iZXIgPSAxMCkge1xuICAgICAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICB0aGlzLm1heEVuZW1pZXMgPSBtYXhFbmVtaWVzO1xuICAgICAgICB0aGlzLnRpbGVzID0gW107XG4gICAgICAgIHRoaXMuZW50aXRpZXMgPSB7fTtcblxuICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2VudGl0eU1vdmVkJywgdGhpcy5lbnRpdHlNb3ZlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdlbnRpdHlLaWxsZWQnLCB0aGlzLmVudGl0eUtpbGxlZExpc3RlbmVyLmJpbmQodGhpcykpO1xuICAgICAgICBnLmFkZExpc3RlbmVyKCdjYW5Nb3ZlVG8nLCB0aGlzLmNhbk1vdmVUby5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBzZXR1cEZvdigpIHtcbiAgICAgICAgdGhpcy5mb3YgPSBuZXcgUk9ULkZPVi5EaXNjcmV0ZVNoYWRvd2Nhc3RpbmcoXG4gICAgICAgICAgICAoeCwgeSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgICAgICAgICAgaWYgKCF0aWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuICF0aWxlLmJsb2Nrc0xpZ2h0KCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAge3RvcG9sb2d5OiA0fVxuICAgICAgICApO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscyhlbnRpdHk6IEVudGl0eSwgZGlzdGFuY2U6IG51bWJlcik6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufSB7XG4gICAgICAgIGxldCB2aXNpYmxlQ2VsbHM6IGFueSA9IHt9O1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgdGhpcy5mb3YuY29tcHV0ZShcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSxcbiAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSxcbiAgICAgICAgICAgIGRpc3RhbmNlLFxuICAgICAgICAgICAgKHgsIHksIHJhZGl1cywgdmlzaWJpbGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIHZpc2libGVDZWxsc1t4ICsgXCIsXCIgKyB5XSA9IHRydWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHZpc2libGVDZWxscztcbiAgICB9XG5cbiAgICBtYXBFbnRpdGllcyhjYWxsYmFjazogKGl0ZW06IEVudGl0eSkgPT4gYW55KSB7XG4gICAgICAgIGZvciAodmFyIGVudGl0eUd1aWQgaW4gdGhpcy5lbnRpdGllcykge1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IHRoaXMuZW50aXRpZXNbZW50aXR5R3VpZF07XG4gICAgICAgICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZW50aXR5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldEhlaWdodCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIGdldFdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy53aWR0aDtcbiAgICB9XG5cbiAgICBnZXRUaWxlKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIGlmICh4IDwgMCB8fCB5IDwgMCB8fCB4ID49IHRoaXMud2lkdGggfHwgeSA+PSB0aGlzLmhlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudGlsZXNbeF1beV07XG4gICAgfVxuXG4gICAgZ2VuZXJhdGUoKSB7XG4gICAgICAgIHRoaXMudGlsZXMgPSB0aGlzLmdlbmVyYXRlTGV2ZWwoKTtcbiAgICAgICAgdGhpcy5zZXR1cEZvdigpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXhFbmVtaWVzOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWRkRmlyZUltcCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZGRJY2VJbXAoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGFkZEZpcmVJbXAoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2YnLCAncmVkJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFJRmFjdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGaXJlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgTWVsZWVBdHRhY2tDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMSxcbiAgICAgICAgICAgIGljZTogMCxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW5lbXkpO1xuXG4gICAgICAgIGcuYWRkRW50aXR5KGVuZW15KTtcbiAgICB9XG5cbiAgICBhZGRJY2VJbXAoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdmFyIGVuZW15ID0gbmV3IEVudGl0eSgpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFjdG9yQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEdseXBoQ29tcG9uZW50KHtcbiAgICAgICAgICAgIGdseXBoOiBuZXcgR2x5cGgoJ2knLCAnY3lhbicsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBBSUZhY3Rpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgTWVsZWVBdHRhY2tDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgSWNlQWZmaW5pdHlDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgU2lnaHRDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgRmFjdGlvbkNvbXBvbmVudCgge1xuICAgICAgICAgICAgZmlyZTogMCxcbiAgICAgICAgICAgIGljZTogMSxcbiAgICAgICAgICAgIGhlcm86IC0xXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLmFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW5lbXkpO1xuXG4gICAgICAgIGcuYWRkRW50aXR5KGVuZW15KTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKGVudGl0eTogRW50aXR5KTogYm9vbGVhbiB7XG4gICAgICAgIGlmICghZW50aXR5Lmhhc0NvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgICAgICB2YXIgbWF4VHJpZXMgPSB0aGlzLndpZHRoICogdGhpcy5oZWlnaHQgKiAxMDtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB3aGlsZSAoIWZvdW5kICYmIGkgPCBtYXhUcmllcykge1xuICAgICAgICAgICAgdmFyIHggPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLndpZHRoKTtcbiAgICAgICAgICAgIHZhciB5ID0gTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogdGhpcy5oZWlnaHQpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgaWYgKHRoaXMuZ2V0VGlsZSh4LCB5KS5pc1dhbGthYmxlKCkgJiYgIXRoaXMucG9zaXRpb25IYXNFbnRpdHkoeCwgeSkpIHtcbiAgICAgICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmb3VuZCkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcignTm8gZnJlZSBzcG90IGZvdW5kIGZvcicsIGVudGl0eSk7XG4gICAgICAgICAgICB0aHJvdyAnTm8gZnJlZSBzcG90IGZvdW5kIGZvciBhIG5ldyBlbnRpdHknO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LnNldFBvc2l0aW9uKHgsIHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgICAgICB0aGlzLmdldFRpbGUoeCwgeSkuc2V0RW50aXR5R3VpZChlbnRpdHkuZ2V0R3VpZCgpKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgYWRkRW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHZhciBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZ2FtZS5hZGRFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IGVudGl0eTtcbiAgICB9XG5cbiAgICByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGdhbWUucmVtb3ZlRW50aXR5KGVudGl0eSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBudWxsXG4gICAgICAgIHRoaXMuZ2V0VGlsZShwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCksIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgfVxuXG4gICAgcG9zaXRpb25IYXNFbnRpdHkoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIHZhciBlbnRpdHlHdWlkID0gdGlsZS5nZXRFbnRpdHlHdWlkKCk7XG4gICAgICAgIHJldHVybiBlbnRpdHlHdWlkICE9PSAnJztcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlBdCh4OiBudW1iZXIsIHk6IG51bWJlcik6IEVudGl0eSB7XG4gICAgICAgIHZhciB0aWxlID0gdGhpcy5nZXRUaWxlKHgsIHkpO1xuICAgICAgICB2YXIgZW50aXR5R3VpZCA9IHRpbGUuZ2V0RW50aXR5R3VpZCgpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbnRpdGllc1tlbnRpdHlHdWlkXTtcbiAgICB9XG5cbiAgICBnZXROZWFyYnlFbnRpdGllcyhvcmlnaW5Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50LCByYWRpdXM6IG51bWJlciwgZmlsdGVyOiAoZW50aXR5OiBFbnRpdHkpID0+IGJvb2xlYW4gPSAoZSkgPT4ge3JldHVybiB0cnVlO30pOiBFbnRpdHlbXSB7XG4gICAgICAgIGxldCBlbnRpdGllcyA9IFtdO1xuICAgICAgICB0aGlzLm1hcEVudGl0aWVzKChlbnRpdHkpID0+IHtcbiAgICAgICAgICAgIGlmICghZmlsdGVyKGVudGl0eSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgaWYgKHBvc2l0aW9uQ29tcG9uZW50ID09PSBvcmlnaW5Db21wb25lbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkaXN0YW5jZSA9IHBvc2l0aW9uQ29tcG9uZW50LmRpc3RhbmNlVG8ob3JpZ2luQ29tcG9uZW50LmdldFgoKSwgb3JpZ2luQ29tcG9uZW50LmdldFkoKSk7XG4gICAgICAgICAgICBpZiAoZGlzdGFuY2UgPD0gcmFkaXVzKSB7XG4gICAgICAgICAgICAgICAgZW50aXRpZXMucHVzaCh7ZGlzdGFuY2U6IGRpc3RhbmNlLCBlbnRpdHk6IGVudGl0eX0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGEuZGlzdGFuY2UgLSBiLmRpc3RhbmNlO1xuICAgICAgICB9KTtcbiAgICAgICAgZW50aXRpZXMgPSBlbnRpdGllcy5tYXAoKGEpID0+IHsgcmV0dXJuIGEuZW50aXR5OyB9KTtcbiAgICAgICAgcmV0dXJuIGVudGl0aWVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2VuZXJhdGVMZXZlbCgpOiBUaWxlW11bXSB7XG4gICAgICAgIHZhciB0aWxlcyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy53aWR0aDsgeCsrKSB7XG4gICAgICAgICAgICB0aWxlcy5wdXNoKFtdKTtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSAwOyB5IDwgdGhpcy5oZWlnaHQ7IHkrKykge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdLnB1c2goVGlsZXMuY3JlYXRlLm51bGxUaWxlKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGdlbmVyYXRvciA9IG5ldyBST1QuTWFwLkNlbGx1bGFyKHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbiAgICAgICAgZ2VuZXJhdG9yLnJhbmRvbWl6ZSgwLjUpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDQ7IGkrKykge1xuICAgICAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2VuZXJhdG9yLmNyZWF0ZSgoeCwgeSwgdikgPT4ge1xuICAgICAgICAgICAgaWYgKHYgPT09IDEpIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS5mbG9vclRpbGUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF1beV0gPSBUaWxlcy5jcmVhdGUud2FsbFRpbGUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHRpbGVzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZW50aXR5TW92ZWRMaXN0ZW5lcihkYXRhOiBhbnkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSBkYXRhLm9sZFBvc2l0aW9uO1xuICAgICAgICAgICAgdmFyIGVudGl0eSA9IGRhdGEuZW50aXR5O1xuICAgICAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KGRhdGEpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHZhciBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKG9sZFBvc2l0aW9uLngsIG9sZFBvc2l0aW9uLnkpLnNldEVudGl0eUd1aWQoJycpO1xuICAgICAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlLaWxsZWRMaXN0ZW5lcihkYXRhOiBFbnRpdHkpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUVudGl0eShkYXRhKTtcbiAgICAgICAgICAgIHJlc29sdmUoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgY2FuTW92ZVRvKHBvc2l0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9LCBhY2M6IGJvb2xlYW4gPSB0cnVlKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSk7XG4gICAgICAgICAgICBpZiAodGlsZS5pc1dhbGthYmxlKCkgJiYgdGlsZS5nZXRFbnRpdHlHdWlkKCkgPT09ICcnKSB7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShwb3NpdGlvbik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlamVjdChwb3NpdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImV4cG9ydCBlbnVtIE1vdXNlQnV0dG9uVHlwZSB7XG4gICAgTEVGVCxcbiAgICBNSURETEUsXG4gICAgUklHSFRcbn07XG5cbiIsImltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5cbmV4cG9ydCBjbGFzcyBNb3VzZUNsaWNrRXZlbnQge1xuICAgIHg6IG51bWJlcjtcbiAgICB5OiBudW1iZXI7XG4gICAgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGU7XG5cbiAgICBnZXRDbGFzc05hbWUoKSB7XG4gICAgICAgIHJldHVybiBNb3VzZUNsaWNrRXZlbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3IoeDogbnVtYmVyLCB5OiBudW1iZXIsIGJ1dHRvbjogTW91c2VCdXR0b25UeXBlKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgICAgIHRoaXMuYnV0dG9uID0gYnV0dG9uO1xuICAgIH1cblxuICAgIGdldFgoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDtcbiAgICB9XG5cbiAgICBnZXRZKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLnk7XG4gICAgfVxuXG4gICAgZ2V0QnV0dG9uVHlwZSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuYnV0dG9uO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgVGlsZSB7XG4gICAgcHJpdmF0ZSBnbHlwaDogR2x5cGg7XG4gICAgcHJpdmF0ZSBlbnRpdHlHdWlkOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSB3YWxrYWJsZTogYm9vbGVhbjtcbiAgICBwcml2YXRlIGJsb2NraW5nTGlnaHQ6IGJvb2xlYW47XG5cbiAgICBjb25zdHJ1Y3RvcihnbHlwaDogR2x5cGgsIHdhbGthYmxlOiBib29sZWFuID0gdHJ1ZSwgYmxvY2tpbmdMaWdodDogYm9vbGVhbiA9IGZhbHNlKSB7XG4gICAgICAgIHRoaXMuZ2x5cGggPSBnbHlwaDtcbiAgICAgICAgdGhpcy53YWxrYWJsZSA9IHdhbGthYmxlO1xuICAgICAgICB0aGlzLmJsb2NraW5nTGlnaHQgPSBibG9ja2luZ0xpZ2h0O1xuXG4gICAgICAgIHRoaXMuZW50aXR5R3VpZCA9ICcnO1xuICAgIH1cblxuICAgIGlzV2Fsa2FibGUoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLndhbGthYmxlO1xuICAgIH1cblxuICAgIGJsb2Nrc0xpZ2h0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5ibG9ja2luZ0xpZ2h0O1xuICAgIH1cblxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRFbnRpdHlHdWlkKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0eUd1aWQ7XG4gICAgfVxuXG4gICAgc2V0RW50aXR5R3VpZChlbnRpdHlHdWlkOiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gZW50aXR5R3VpZDtcbiAgICB9XG59XG4iLCJpbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7VGlsZX0gZnJvbSAnLi9UaWxlJztcblxuZXhwb3J0IG1vZHVsZSBjcmVhdGUge1xuICAgIGV4cG9ydCBmdW5jdGlvbiBudWxsVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnICcsICdibGFjaycsICcjMDAwJyksIGZhbHNlLCBmYWxzZSk7XG4gICAgfVxuICAgIGV4cG9ydCBmdW5jdGlvbiBmbG9vclRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJy4nLCAnIzIyMicsICcjNDQ0JyksIHRydWUsIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIHdhbGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcjJywgJyNjY2MnLCAnIzQ0NCcpLCBmYWxzZSwgdHJ1ZSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vU2lnaHRDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0ZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vRmFjdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBSUZhY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHRhcmdldFBvczogYW55O1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnRhcmdldFBvcyA9IG51bGw7XG4gICAgfVxuXG4gICAgYWN0KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHNpZ2h0ID0gPFNpZ2h0Q29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnU2lnaHRDb21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IGZhY3Rpb24gPSA8RmFjdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ0ZhY3Rpb25Db21wb25lbnQnKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBzaWdodC5nZXRWaXNpYmxlRW50aXRpZXMoKTtcblxuICAgICAgICAgICAgbGV0IGZlYXJpbmc6IEVudGl0eSA9IG51bGw7XG4gICAgICAgICAgICBsZXQgZW5lbXk6IEVudGl0eSA9IG51bGw7XG5cbiAgICAgICAgICAgIGVudGl0aWVzLmZvckVhY2goKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVmID0gPEZhY3Rpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIGlmIChmYWN0aW9uLmlzRW5lbXkoZWYuZ2V0U2VsZkZhY3Rpb24oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5lbXkgPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChmZWFyaW5nID09PSBudWxsICYmIGZhY3Rpb24uaXNGZWFyaW5nKGVmLmdldFNlbGZGYWN0aW9uKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIGZlYXJpbmcgPSBlbnRpdHk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChlbmVteSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW5lbXkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgICAgIHRoaXMudGFyZ2V0UG9zID0ge1xuICAgICAgICAgICAgICAgICAgICB4OiB0LmdldFgoKSxcbiAgICAgICAgICAgICAgICAgICAgeTogdC5nZXRZKClcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy50YXJnZXRQb3MgIT09IG51bGwgJiYgKHRoaXMudGFyZ2V0UG9zLnggIT09IHBvc2l0aW9uLmdldFgoKSB8fCB0aGlzLnRhcmdldFBvcy55ICE9PSBwb3NpdGlvbi5nZXRZKCkpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nb1Rvd2FyZHNUYXJnZXQocG9zaXRpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5kb21XYWxrKClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnb1Rvd2FyZHNUYXJnZXQocG9zaXRpb246IFBvc2l0aW9uQ29tcG9uZW50KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdmFyIGR4ID0gTWF0aC5hYnModGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSk7XG4gICAgICAgICAgICB2YXIgZHkgPSBNYXRoLmFicyh0aGlzLnRhcmdldFBvcy55IC0gcG9zaXRpb24uZ2V0WSgpKTtcbiAgICAgICAgICAgIGxldCBkaXJlY3Rpb246IGFueTtcblxuICAgICAgICAgICAgaWYgKGR4ICsgZHkgPT09IDEpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IGR4ID09IDAgPyAwIDogTWF0aC5mbG9vcigodGhpcy50YXJnZXRQb3MueCAtIHBvc2l0aW9uLmdldFgoKSkgLyBkeCksXG4gICAgICAgICAgICAgICAgICAgIHk6IGR5ID09IDAgPyAwIDogTWF0aC5mbG9vcigodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCd0cnlpbmcgdG8gYXR0YWNrIScsIGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgdGhpcy5hdHRlbXB0QXR0YWNrKGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocmVzb2x2ZSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKHJlamVjdClcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZHggPiBkeSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpIC8gZHlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dGVtcHRBdHRhY2soZGlyZWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TWVsZWVBdHRhY2snLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByYW5kb21XYWxrKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBkaXJlY3Rpb25zOiBhbnkgPSBbXG4gICAgICAgICAgICAgICAge3g6IDAsIHk6IDF9LFxuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAtMX0sXG4gICAgICAgICAgICAgICAge3g6IDEsIHk6IDB9LFxuICAgICAgICAgICAgICAgIHt4OiAtMSwgeTogMH0sXG4gICAgICAgICAgICBdO1xuXG4gICAgICAgICAgICBkaXJlY3Rpb25zID0gZGlyZWN0aW9ucy5yYW5kb21pemUoKTtcblxuICAgICAgICAgICAgdmFyIHRlc3REaXJlY3Rpb24gPSAoZGlyZWN0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKGEpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVzdERpcmVjdGlvbihkaXJlY3Rpb25zLnBvcCgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHRlc3REaXJlY3Rpb24oZGlyZWN0aW9ucy5wb3AoKSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByYW5nZTogbnVtYmVyO1xuICAgIGNvb2xkb3duOiBudW1iZXI7XG4gICAgbGFzdFVzZWQ6IG51bWJlcjtcbiAgICBkYW1hZ2VUeXBlOiBzdHJpbmc7XG5cbiAgICBnYW1lOiBHYW1lO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLnJhbmdlID0gNTtcbiAgICAgICAgdGhpcy5jb29sZG93biA9IDEwMDtcbiAgICAgICAgdGhpcy5sYXN0VXNlZCA9IC10aGlzLmNvb2xkb3duO1xuICAgICAgICB0aGlzLmRhbWFnZVR5cGUgPSAnZmlyZSc7XG4gICAgfVxuXG4gICAgZGVzY3JpYmVTdGF0ZSgpOiBzdHJpbmcge1xuICAgICAgICBjb25zdCBjdXJyZW50VHVybiA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICBjb25zdCBjb29sZG93biA9ICh0aGlzLmxhc3RVc2VkICsgdGhpcy5jb29sZG93bikgLSBjdXJyZW50VHVybjtcbiAgICAgICAgcmV0dXJuICdGaXJlYm9sdCwgY29vbGRvd246ICcgKyBNYXRoLm1heCgwLCBjb29sZG93bik7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdEFiaWxpdHlGaXJlYm9sdCcsIHRoaXMudXNlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignY29uc3VtZUZpcmUnLCB0aGlzLmNvbnN1bWVGaXJlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUZpcmUoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCAtPSB0aGlzLmNvb2xkb3duO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1c2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQXZhaWxhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudGl0aWVzID0gbWFwLmdldE5lYXJieUVudGl0aWVzKHBvc2l0aW9uQ29tcG9uZW50LCB0aGlzLnJhbmdlKTtcblxuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRpdGllcy5wb3AoKTtcbiAgICAgICAgICAgIGlmICghdGFyZ2V0Lmhhc0NvbXBvbmVudCgnSWNlQWZmaW5pdHlDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2NvbnN1bWVJY2UnKTtcbiAgICAgICAgICAgIHRhcmdldC5raWxsKCk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodGFyZ2V0KTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBBYmlsaXR5SWNlTGFuY2VDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHJhbmdlOiBudW1iZXI7XG4gICAgY29vbGRvd246IG51bWJlcjtcbiAgICBsYXN0VXNlZDogbnVtYmVyO1xuICAgIGRhbWFnZVR5cGU6IHN0cmluZztcblxuICAgIGdhbWU6IEdhbWU7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZ2FtZSA9IG5ldyBHYW1lKCk7XG4gICAgICAgIHRoaXMucmFuZ2UgPSA1O1xuICAgICAgICB0aGlzLmNvb2xkb3duID0gMTAwO1xuICAgICAgICB0aGlzLmxhc3RVc2VkID0gLXRoaXMuY29vbGRvd247XG4gICAgICAgIHRoaXMuZGFtYWdlVHlwZSA9ICdpY2UnO1xuICAgIH1cblxuICAgIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgY29uc3QgY29vbGRvd24gPSAodGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24pIC0gY3VycmVudFR1cm47XG4gICAgICAgIHJldHVybiAnSWNlIExhbmNlLCBjb29sZG93bjogJyArIE1hdGgubWF4KDAsIGNvb2xkb3duKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0QWJpbGl0eUljZUxhbmNlJywgdGhpcy51c2UuYmluZCh0aGlzKSk7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdjb25zdW1lSWNlJywgdGhpcy5jb25zdW1lSWNlLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGlzQXZhaWxhYmxlKCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24gPD0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgfVxuXG4gICAgY29uc3VtZUljZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB0aGlzLmxhc3RVc2VkIC09IHRoaXMuY29vbGRvd247XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHVzZSgpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMuaXNBdmFpbGFibGUoKSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICAgICAgY29uc3QgZW50aXRpZXMgPSBtYXAuZ2V0TmVhcmJ5RW50aXRpZXMoXG4gICAgICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQsXG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZSxcbiAgICAgICAgICAgICAgICAoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBlbnRpdHkuaGFzQ29tcG9uZW50KCdGaXJlQWZmaW5pdHlDb21wb25lbnQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpZiAoZW50aXRpZXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ25vIGVudGl0aWVzIG5lYXJieScpO1xuICAgICAgICAgICAgICAgIHJlc29sdmUobnVsbCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSBlbnRpdGllcy5wb3AoKTtcblxuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdjb25zdW1lRmlyZScpO1xuICAgICAgICAgICAgdGFyZ2V0LmtpbGwoKTtcblxuICAgICAgICAgICAgcmVzb2x2ZSh0YXJnZXQpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEFjdG9yQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBjb25zdHJ1Y3RvcigpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdhY3QnKTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIENvbXBvbmVudCB7XG4gICAgcHJvdGVjdGVkIHBhcmVudDogRW50aXR5O1xuXG4gICAgcHVibGljIGdldE5hbWUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0UGFyZW50RW50aXR5KGVudGl0eTogRW50aXR5KSB7XG4gICAgICAgIHRoaXMucGFyZW50ID0gZW50aXR5O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgfVxuXG4gICAgcHVibGljIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgRmFjdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgZmlyZTogbnVtYmVyO1xuICAgIGljZTogbnVtYmVyO1xuICAgIGhlcm86IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtmaXJlOiBudW1iZXIsIGljZTogbnVtYmVyLCBoZXJvOiBudW1iZXJ9ID0ge2ZpcmU6IDAsIGljZTogMCwgaGVybzogMH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5maXJlID0gb3B0aW9ucy5maXJlO1xuICAgICAgICB0aGlzLmljZSA9IG9wdGlvbnMuaWNlO1xuICAgICAgICB0aGlzLmhlcm8gPSBvcHRpb25zLmhlcm87XG4gICAgfVxuXG4gICAgaXNGcmllbmRseShmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlzRmVhcmluZyhmYWN0aW9uOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0aGlzW2ZhY3Rpb25dID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgJ0Fza2luZyBmb3IgaW5mbyBvbiB1bmRlZmluZWQgZmFjdGlvbic7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpc1tmYWN0aW9uXSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGlzRW5lbXkoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IC0xKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgZ2V0U2VsZkZhY3Rpb24oKTogc3RyaW5nIHtcbiAgICAgICAgaWYgKHRoaXMuaWNlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ljZSc7XG4gICAgICAgIH0gZWxzZSBpZiAodGhpcy5maXJlID09PSAxKSB7XG4gICAgICAgICAgICByZXR1cm4gJ2ZpcmUnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuaGVybyA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdoZXJvJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuIiwiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4uLy4uL3R5cGluZ3MvbGliLmVzNi5kLnRzXCIgLz5cblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIEZpcmVBZmZpbml0eUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgYWZmaW5pdHk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZmZpbml0eSA9ICdmaXJlJztcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBHbHlwaENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSBnbHlwaDogR2x5cGg7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7Z2x5cGg6IEdseXBofSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdseXBoID0gb3B0aW9ucy5nbHlwaDtcbiAgICB9XG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBJY2VBZmZpbml0eUNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgYWZmaW5pdHk6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5hZmZpbml0eSA9ICdpY2UnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcblxuaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4uL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi4vTW91c2VDbGlja0V2ZW50JztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4uL0tleWJvYXJkRXZlbnRUeXBlJztcbmltcG9ydCB7S2V5Ym9hcmRFdmVudH0gZnJvbSAnLi4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBJbnB1dENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSB3YWl0aW5nOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSByZXNvbHZlOiBhbnk7XG4gICAgcHJpdmF0ZSByZWplY3Q6IGFueTtcblxuICAgIGdhbWU6IEdhbWU7XG4gICAgbWFwOiBNYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLm1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICB9XG5cbiAgICB3YWl0Rm9ySW5wdXQoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgdGhpcy53YWl0aW5nID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBoYW5kbGVFdmVudChldmVudDogYW55KSB7XG4gICAgICAgIGlmICh0aGlzLndhaXRpbmcpIHtcbiAgICAgICAgICAgIGlmIChldmVudC5nZXRDbGFzc05hbWUoKSA9PT0gJ0tleWJvYXJkRXZlbnQnKSB7XG4gICAgICAgICAgICAgICAgZXZlbnQgPSA8S2V5Ym9hcmRFdmVudD5ldmVudDtcbiAgICAgICAgICAgICAgICBpZiAoZXZlbnQuZ2V0RXZlbnRUeXBlKCkgPT09IEtleWJvYXJkRXZlbnRUeXBlLkRPV04pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlEb3duKGV2ZW50KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy53YWl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnSW52YWxpZCBrZXlib2FyZCBpbnB1dCcsIGV2ZW50KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGdldElucHV0KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVLZXlEb3duKGV2ZW50OiBLZXlib2FyZEV2ZW50KTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxib29sZWFuPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmdldEtleUNvZGUoKSkge1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX1BFUklPRDpcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAwLCB5OiAxfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfSzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAwLCB5OiAtMX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0g6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogLTEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19MOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IDEsIHk6IDB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS18xOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRBYmlsaXR5RmlyZWJvbHQnLCB7fSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfMjpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0QWJpbGl0eUljZUxhbmNlJywge30pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUuZGVidWcoJ2tleUNvZGUgbm90IG1hdGNoZWQnLCBldmVudC5nZXRLZXlDb2RlKCkpO1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZGlyZWN0aW9uUHJlc3NlZChkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBuZXdQb3NpdGlvbiA9IHRoaXMuZ2V0UG9zaXRpb25BZnRlckRpcmVjdGlvbihkaXJlY3Rpb24pO1xuICAgICAgICAgICAgY29uc3QgZW50aXR5ID0gdGhpcy5tYXAuZ2V0RW50aXR5QXQobmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSk7XG4gICAgICAgICAgICBpZiAoZW50aXR5KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TWVsZWVBdHRhY2snLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0TW92ZScsIGRpcmVjdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFBvc2l0aW9uQWZ0ZXJEaXJlY3Rpb24oZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KToge3g6IG51bWJlciwgeTogbnVtYmVyfSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSArIGRpcmVjdGlvbi54LFxuICAgICAgICAgICAgeTogcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpICsgZGlyZWN0aW9uLnlcbiAgICAgICAgfTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBNZWxlZUF0dGFja0NvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgbWFwOiBNYXA7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIGNvbnN0IGdhbWUgPSBuZXcgR2FtZSgpO1xuXG4gICAgICAgIHRoaXMubWFwID0gZ2FtZS5nZXRNYXAoKTtcbiAgICB9XG5cbiAgICBzZXRMaXN0ZW5lcnMoKSB7XG4gICAgICAgIHRoaXMucGFyZW50LmFkZExpc3RlbmVyKCdhdHRlbXB0TWVsZWVBdHRhY2snLCB0aGlzLmF0dGVtcHRNZWxlZUF0dGFjay5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBhdHRlbXB0TWVsZWVBdHRhY2soZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gdGhpcy5tYXAuZ2V0RW50aXR5QXQocG9zaXRpb25Db21wb25lbnQuZ2V0WCgpICsgZGlyZWN0aW9uLngsIHBvc2l0aW9uQ29tcG9uZW50LmdldFkoKSArIGRpcmVjdGlvbi55KTtcblxuICAgICAgICAgICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGFyZ2V0LmtpbGwoKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlc29sdmUpO1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygna2lsbGVkJywgdGFyZ2V0KTtcblxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgUGxheWVyQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSB4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9ID0ge3g6IDAsIHk6IDB9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMueCA9IG9wdGlvbnMueDtcbiAgICAgICAgdGhpcy55ID0gb3B0aW9ucy55O1xuICAgIH1cblxuICAgIGdldFBvc2l0aW9uKCk6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0ge1xuICAgICAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcbiAgICB9XG5cbiAgICBnZXRYKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLng7XG4gICAgfVxuXG4gICAgZ2V0WSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy55O1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdE1vdmUnLCB0aGlzLmF0dGVtcHRNb3ZlTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1vdmVMaXN0ZW5lcihkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgICAgICAgeTogdGhpcy55ICsgZGlyZWN0aW9uLnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnLnNlbmRFdmVudCgnY2FuTW92ZVRvJywgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZVRvKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZHggPSBNYXRoLmFicyh4IC0gdGhpcy54KTtcbiAgICAgICAgY29uc3QgZHkgPSBNYXRoLmFicyh5IC0gdGhpcy55KTtcblxuICAgICAgICByZXR1cm4gZHggKyBkeTtcbiAgICB9XG5cbiAgICBtb3ZlKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSkge1xuICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgICAgICB5OiB0aGlzLnlcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy54ICs9IGRpcmVjdGlvbi54O1xuICAgICAgICB0aGlzLnkgKz0gZGlyZWN0aW9uLnk7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5zZW5kRXZlbnQoJ2VudGl0eU1vdmVkJywge2VudGl0eTogdGhpcy5wYXJlbnQsIG9sZFBvc2l0aW9uOiBvbGRQb3NpdGlvbn0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgU2lnaHRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGRpc3RhbmNlOiBudW1iZXI7XG4gICAgdmlzaWJsZUNlbGxzOiB7W3Bvczogc3RyaW5nXTogYm9vbGVhbn07XG4gICAgZ2FtZTogR2FtZTtcbiAgICBoYXNTZWVuQ2VsbHM6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufTtcblxuICAgIGNoZWNrZWRBdFR1cm46IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtkaXN0YW5jZTogbnVtYmVyfSA9IHtkaXN0YW5jZTogNX0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IG9wdGlvbnMuZGlzdGFuY2U7XG4gICAgICAgIHRoaXMudmlzaWJsZUNlbGxzID0ge307XG4gICAgICAgIHRoaXMuaGFzU2VlbkNlbGxzID0ge307XG4gICAgICAgIHRoaXMuY2hlY2tlZEF0VHVybiA9IC0xO1xuICAgIH1cblxuICAgIGdldERpc3RhbmNlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscygpOiB7W3Bvczogc3RyaW5nXTogYm9vbGVhbn0ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzO1xuICAgIH1cblxuICAgIGNhblNlZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBpZiAocG9zaXRpb25Db21wb25lbnQuZGlzdGFuY2VUbyh4LCB5KSA+IHRoaXMuZGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoeCwgeSk7XG4gICAgfVxuXG4gICAgaGFzU2Vlbih4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU2VlbkNlbGxzW3ggKyAnLCcgKyB5XSA9PSB0cnVlO1xuICAgIH1cblxuICAgIGdldFZpc2libGVFbnRpdGllcygpOiBFbnRpdHlbXSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbnN0IG1hcDogTWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICByZXR1cm4gbWFwLmdldE5lYXJieUVudGl0aWVzKFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQsXG4gICAgICAgICAgICB0aGlzLmRpc3RhbmNlLFxuICAgICAgICAgICAgKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVwb3M6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNWaXNpYmxlKGVwb3MuZ2V0WCgpLCBlcG9zLmdldFkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1Zpc2libGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5jb21wdXRlVmlzaWJsZUNlbGxzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2libGVDZWxsc1t4ICsgJywnICsgeV0gPT09IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21wdXRlVmlzaWJsZUNlbGxzKCk6IHZvaWQge1xuICAgICAgICB2YXIgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRUdXJuID09PSB0aGlzLmNoZWNrZWRBdFR1cm4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXA6IE1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbHMgPSBtYXAuZ2V0VmlzaWJsZUNlbGxzKHRoaXMucGFyZW50LCB0aGlzLmRpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5oYXNTZWVuQ2VsbHMgPSBPYmplY3QuYXNzaWduKHRoaXMuaGFzU2VlbkNlbGxzLCB0aGlzLnZpc2libGVDZWxscyk7XG4gICAgICAgIHRoaXMuY2hlY2tlZEF0VHVybiA9IGN1cnJlbnRUdXJuO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgIGdhbWUuaW5pdCg5MCwgNTApO1xufVxuXG4iXX0=
