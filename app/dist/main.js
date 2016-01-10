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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/AbilityFireboltComponent":14,"./components/AbilityIceLanceComponent":15,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/GlyphComponent":20,"./components/InputComponent":22,"./components/MeleeAttackComponent":23,"./components/PositionComponent":24,"./components/SightComponent":25}],4:[function(require,module,exports){
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

},{"./Entity":1,"./Game":2,"./Glyph":4,"./Tiles":12,"./components/AIFactionComponent":13,"./components/ActorComponent":16,"./components/FactionComponent":18,"./components/FireAffinityComponent":19,"./components/GlyphComponent":20,"./components/IceAffinityComponent":21,"./components/PositionComponent":24,"./components/SightComponent":25}],9:[function(require,module,exports){
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
                    reject();
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
                console.log(target);
                resolve();
            });
        }
    }]);

    return MeleeAttackComponent;
})(_Component2.Component);

},{"../Game":2,"./Component":17}],24:[function(require,module,exports){
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

},{"../Game":2,"./Component":17}],25:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvRW50aXR5LnRzIiwic3JjL0dhbWUudHMiLCJzcmMvR2FtZVNjcmVlbi50cyIsInNyYy9HbHlwaC50cyIsInNyYy9HdWlkLnRzIiwic3JjL0tleWJvYXJkRXZlbnQudHMiLCJzcmMvS2V5Ym9hcmRFdmVudFR5cGUudHMiLCJzcmMvTWFwLnRzIiwic3JjL01vdXNlQnV0dG9uVHlwZS50cyIsInNyYy9Nb3VzZUNsaWNrRXZlbnQudHMiLCJzcmMvVGlsZS50cyIsInNyYy9UaWxlcy50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9BYmlsaXR5RmlyZWJvbHRDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0FiaWxpdHlJY2VMYW5jZUNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvQWN0b3JDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmFjdGlvbkNvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvRmlyZUFmZmluaXR5Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9HbHlwaENvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvSWNlQWZmaW5pdHlDb21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50LnRzIiwiY29tcG9uZW50cy9zcmMvY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudC50cyIsImNvbXBvbmVudHMvc3JjL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQudHMiLCJjb21wb25lbnRzL3NyYy9j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QUFJLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDN0MsQUFBRSxBQUFDLGdCQUFDLFdBQVcsS0FBSyxJQUFJLENBQUMsYUFBYSxBQUFDLEVBQUMsQUFBQztBQUNyQyxBQUFNLHVCQUFDLEFBQ1g7YUFBQztBQUNELGdCQUFNLEdBQUcsR0FBUSxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0FBQ3BDLGdCQUFJLENBQUMsWUFBWSxHQUFHLEdBQUcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEUsZ0JBQUksQ0FBQyxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUN4RSxnQkFBSSxDQUFDLGFBQWEsR0FBRyxXQUFXLENBQUMsQUFDckM7U0FBQyxBQUVMLEFBQUM7Ozs7ZUExRU8sU0FBUyxBQUFDLEFBQU0sQUFBYSxBQUU5Qjs7Ozs7OztBQ0ZQLE1BQU0sQ0FBQyxNQUFNLEdBQUc7QUFDWixRQUFJLElBQUksR0FBRyxBQUFJLEFBQUksVUFIZixJQUFJLEFBQUMsQUFBTSxBQUFRLEVBR0YsQ0FBQztBQUN0QixRQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQyxBQUN0QjtDQUFDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHtHdWlkfSBmcm9tICcuL0d1aWQnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4vTWFwJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge1NpZ2h0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvU2lnaHRDb21wb25lbnQnO1xuaW1wb3J0IHtSYW5kb21XYWxrQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUmFuZG9tV2Fsa0NvbXBvbmVudCc7XG5pbXBvcnQge0FJRmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FJRmFjdGlvbkNvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBFbnRpdHkge1xuICAgIG5hbWU6IHN0cmluZztcbiAgICBndWlkOiBzdHJpbmc7XG4gICAgY29tcG9uZW50czoge1tuYW1lOiBzdHJpbmddOiBDb21wb25lbnR9O1xuICAgIGFjdGluZzogYm9vbGVhbjtcblxuICAgIGxpc3RlbmVyczoge1tuYW1lOiBzdHJpbmddOiBhbnlbXX07XG5cbiAgICBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcgPSAnJykge1xuICAgICAgICB0aGlzLm5hbWUgPSBuYW1lO1xuICAgICAgICB0aGlzLmd1aWQgPSBHdWlkLmdlbmVyYXRlKCk7XG4gICAgICAgIHRoaXMuYWN0aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuY29tcG9uZW50cyA9IHt9O1xuICAgICAgICB0aGlzLmxpc3RlbmVycyA9IHt9O1xuICAgIH1cblxuICAgIGdldEd1aWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ3VpZDtcbiAgICB9XG5cbiAgICBhY3QoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgaWYgKHRoaXMubmFtZSA9PT0gJ3BsYXllcicpIHtcbiAgICAgICAgICAgIGZvciAodmFyIGNvbXBvbmVudE5hbWUgaW4gdGhpcy5jb21wb25lbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY29tcG9uZW50ID0gdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudE5hbWVdO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0YXRlID0gY29tcG9uZW50LmRlc2NyaWJlU3RhdGUoKTtcbiAgICAgICAgICAgICAgICBpZiAoc3RhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coc3RhdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGcucmVuZGVyKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGMgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ1NpZ2h0Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygndmlzaWJsZSBlbnRpdGllcycsIGMuZ2V0VmlzaWJsZUVudGl0aWVzKCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5hY3RpbmcgPSB0cnVlO1xuICAgICAgICBpZiAodGhpcy5oYXNDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlSW5wdXRDb21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnUmFuZG9tV2Fsa0NvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLmhhbmRsZVJhbmRvbVdhbGtDb21wb25lbnQoKTtcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhhc0NvbXBvbmVudCgnQUlGYWN0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlQUlGYWN0aW9uQ29tcG9uZW50KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAga2lsbCgpIHtcbiAgICAgICAgY29uc3QgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgIGcuc2VuZEV2ZW50KCdlbnRpdHlLaWxsZWQnLCB0aGlzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZUFJRmFjdGlvbkNvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxBSUZhY3Rpb25Db21wb25lbnQ+dGhpcy5nZXRDb21wb25lbnQoJ0FJRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQuYWN0KClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGcudW5sb2NrRW5naW5lKCk7XG4gICAgICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGhhbmRsZVJhbmRvbVdhbGtDb21wb25lbnQoKSB7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5sb2NrRW5naW5lKCk7XG4gICAgICAgIHZhciBjb21wb25lbnQgPSA8UmFuZG9tV2Fsa0NvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnUmFuZG9tV2Fsa0NvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQucmFuZG9tV2FsaygpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5hY3RpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBnLnVubG9ja0VuZ2luZSgpO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBoYW5kbGVJbnB1dENvbXBvbmVudCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnLmxvY2tFbmdpbmUoKTtcbiAgICAgICAgdmFyIGNvbXBvbmVudCA9IDxJbnB1dENvbXBvbmVudD50aGlzLmdldENvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKTtcbiAgICAgICAgY29tcG9uZW50LndhaXRGb3JJbnB1dCgpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgZy51bmxvY2tFbmdpbmUoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmFjdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkQ29tcG9uZW50KGNvbXBvbmVudDogQ29tcG9uZW50KSB7XG4gICAgICAgIGNvbXBvbmVudC5zZXRQYXJlbnRFbnRpdHkodGhpcyk7XG4gICAgICAgIGNvbXBvbmVudC5zZXRMaXN0ZW5lcnMoKTtcbiAgICAgICAgdGhpcy5jb21wb25lbnRzW2NvbXBvbmVudC5nZXROYW1lKCldID0gY29tcG9uZW50O1xuICAgIH1cblxuICAgIGhhc0NvbXBvbmVudChuYW1lOiBzdHJpbmcpIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiB0aGlzLmNvbXBvbmVudHNbbmFtZV0gIT09ICd1bmRlZmluZWQnO1xuICAgIH1cblxuICAgIGdldENvbXBvbmVudChuYW1lOiBzdHJpbmcpOiBDb21wb25lbnQge1xuICAgICAgICByZXR1cm4gdGhpcy5jb21wb25lbnRzW25hbWVdO1xuICAgIH1cblxuICAgIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSA9IG51bGwpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHJldHVybkRhdGE7XG5cbiAgICAgICAgICAgIHZhciBsaXN0ZW5lcnMgPSB0aGlzLmxpc3RlbmVyc1tuYW1lXTtcbiAgICAgICAgICAgIHZhciBpID0gMDtcblxuICAgICAgICAgICAgdmFyIGNhbGxOZXh0ID0gKGRhdGEpID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBsaXN0ZW5lcnNbaV07XG4gICAgICAgICAgICAgICAgaSsrO1xuXG4gICAgICAgICAgICAgICAgdmFyIHAgPSBsaXN0ZW5lcihkYXRhKTtcbiAgICAgICAgICAgICAgICBwLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PT0gbGlzdGVuZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbE5leHQocmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pLmNhdGNoKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjYWxsTmV4dChkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gUHJvbWlzZTxUPikge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge01hcH0gZnJvbSAnLi9NYXAnO1xuaW1wb3J0IHtHYW1lU2NyZWVufSBmcm9tICcuL0dhbWVTY3JlZW4nO1xuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5cbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lIHtcbiAgICBzY3JlZW5XaWR0aDogbnVtYmVyO1xuICAgIHNjcmVlbkhlaWdodDogbnVtYmVyO1xuXG4gICAgY2FudmFzOiBhbnk7XG5cbiAgICBhY3RpdmVTY3JlZW46IEdhbWVTY3JlZW47XG4gICAgbWFwOiBNYXA7XG5cbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgc2NoZWR1bGVyOiBhbnk7XG4gICAgZW5naW5lOiBhbnk7XG5cbiAgICB0dXJuQ291bnQ6IG51bWJlcjtcblxuICAgIHByaXZhdGUgc3RhdGljIGluc3RhbmNlOiBHYW1lO1xuXG4gICAgbGlzdGVuZXJzOiB7W25hbWU6IHN0cmluZ106IGFueVtdfTtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICBpZiAoR2FtZS5pbnN0YW5jZSkge1xuICAgICAgICAgICAgcmV0dXJuIEdhbWUuaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgR2FtZS5pbnN0YW5jZSA9IHRoaXM7XG4gICAgICAgIHRoaXMubGlzdGVuZXJzID0ge307XG4gICAgICAgIHRoaXMudHVybkNvdW50ID0gMDtcbiAgICAgICAgd2luZG93WydHYW1lJ10gPSB0aGlzO1xuICAgIH1cblxuICAgIHB1YmxpYyBpbml0KHdpZHRoOiBudW1iZXIsIGhlaWdodDogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuV2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5zY3JlZW5IZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gbmV3IFJPVC5EaXNwbGF5KHtcbiAgICAgICAgICAgIHdpZHRoOiB0aGlzLnNjcmVlbldpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiB0aGlzLnNjcmVlbkhlaWdodFxuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmNhbnZhcyA9IHRoaXMuZGlzcGxheS5nZXRDb250YWluZXIoKTtcbiAgICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICAgICAgdGhpcy5zY2hlZHVsZXIgPSBuZXcgUk9ULlNjaGVkdWxlci5TaW1wbGUoKTtcbiAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKHtcbiAgICAgICAgICAgIGFjdDogKCkgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMudHVybkNvdW50Kys7XG4gICAgICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygndHVybicsIHRoaXMudHVybkNvdW50KTtcbiAgICAgICAgICAgIH19LCB0cnVlKTtcbiAgICAgICAgdGhpcy5lbmdpbmUgPSBuZXcgUk9ULkVuZ2luZSh0aGlzLnNjaGVkdWxlcik7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBuZXcgTWFwKHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0IC0gMSk7XG4gICAgICAgIHRoaXMubWFwLmdlbmVyYXRlKCk7XG5cbiAgICAgICAgdmFyIGdhbWVTY3JlZW4gPSBuZXcgR2FtZVNjcmVlbih0aGlzLmRpc3BsYXksIHRoaXMuc2NyZWVuV2lkdGgsIHRoaXMuc2NyZWVuSGVpZ2h0LCB0aGlzLm1hcCk7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuID0gZ2FtZVNjcmVlbjtcblxuICAgICAgICB0aGlzLmJpbmRJbnB1dEhhbmRsaW5nKCk7XG5cbiAgICAgICAgdGhpcy5lbmdpbmUuc3RhcnQoKTtcblxuICAgICAgICB0aGlzLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHByaXZhdGUgYmluZEV2ZW50KGV2ZW50TmFtZTogc3RyaW5nLCBjb252ZXJ0ZXI6IGFueSwgY2FsbGJhY2s6IGFueSkge1xuICAgICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihldmVudE5hbWUsIChldmVudCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2soY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBiaW5kSW5wdXRIYW5kbGluZygpIHtcbiAgICAgICAgdmFyIGJpbmRFdmVudHNUb1NjcmVlbiA9IChldmVudE5hbWUsIGNvbnZlcnRlcikgPT4ge1xuICAgICAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoZXZlbnROYW1lLCAoZXZlbnQpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5hY3RpdmVTY3JlZW4gIT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVTY3JlZW4uaGFuZGxlSW5wdXQoY29udmVydGVyKGV2ZW50TmFtZSwgZXZlbnQpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICB9O1xuXG4gICAgICAgIGJpbmRFdmVudHNUb1NjcmVlbigna2V5ZG93bicsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50KTtcbiAgICAgICAgYmluZEV2ZW50c1RvU2NyZWVuKCdjbGljaycsIHRoaXMuY29udmVydE1vdXNlRXZlbnQpO1xuICAgIH1cblxuICAgIHByaXZhdGUgY29udmVydEtleUV2ZW50ID0gKG5hbWU6IHN0cmluZywgZXZlbnQ6IGFueSk6IEtleWJvYXJkRXZlbnQgPT4ge1xuICAgICAgICB2YXIgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZSA9IEtleWJvYXJkRXZlbnRUeXBlLlBSRVNTO1xuICAgICAgICBpZiAobmFtZSA9PT0gJ2tleWRvd24nKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgS2V5Ym9hcmRFdmVudChcbiAgICAgICAgICAgIGV2ZW50LmtleUNvZGUsXG4gICAgICAgICAgICBldmVudFR5cGUsXG4gICAgICAgICAgICBldmVudC5hbHRLZXksXG4gICAgICAgICAgICBldmVudC5jdHJsS2V5LFxuICAgICAgICAgICAgZXZlbnQuc2hpZnRLZXksXG4gICAgICAgICAgICBldmVudC5tZXRhS2V5XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb252ZXJ0TW91c2VFdmVudCA9IChuYW1lOiBzdHJpbmcsIGV2ZW50OiBhbnkpOiBNb3VzZUNsaWNrRXZlbnQgPT4ge1xuICAgICAgICBsZXQgcG9zaXRpb24gPSB0aGlzLmRpc3BsYXkuZXZlbnRUb1Bvc2l0aW9uKGV2ZW50KTtcblxuICAgICAgICB2YXIgYnV0dG9uVHlwZTogTW91c2VCdXR0b25UeXBlID0gTW91c2VCdXR0b25UeXBlLkxFRlQ7XG4gICAgICAgIGlmIChldmVudC53aGljaCA9PT0gMikge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5NSURETEU7XG4gICAgICAgIH0gZWxzZSBpZiAoZXZlbnQud2ljaCA9PT0gMykge1xuICAgICAgICAgICAgYnV0dG9uVHlwZSA9IE1vdXNlQnV0dG9uVHlwZS5SSUdIVFxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgTW91c2VDbGlja0V2ZW50KFxuICAgICAgICAgICAgcG9zaXRpb25bMF0sXG4gICAgICAgICAgICBwb3NpdGlvblsxXSxcbiAgICAgICAgICAgIGJ1dHRvblR5cGVcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgbG9ja0VuZ2luZSgpIHtcbiAgICAgICAgdGhpcy5lbmdpbmUubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyB1bmxvY2tFbmdpbmUoKSB7XG4gICAgICAgIHRoaXMuZW5naW5lLnVubG9jaygpO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW1vdmVFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0FjdG9yQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMuc2NoZWR1bGVyLnJlbW92ZShlbnRpdHkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIGFkZEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICBpZiAoZW50aXR5Lmhhc0NvbXBvbmVudCgnQWN0b3JDb21wb25lbnQnKSkge1xuICAgICAgICAgICAgdGhpcy5zY2hlZHVsZXIuYWRkKGVudGl0eSwgdHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVudGl0eS5oYXNDb21wb25lbnQoJ0lucHV0Q29tcG9uZW50JykpIHtcbiAgICAgICAgICAgIHZhciBjb21wb25lbnQgPSA8SW5wdXRDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnSW5wdXRDb21wb25lbnQnKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCdrZXlwcmVzcycsIHRoaXMuY29udmVydEtleUV2ZW50LCBjb21wb25lbnQuaGFuZGxlRXZlbnQuYmluZChjb21wb25lbnQpKTtcbiAgICAgICAgICAgIHRoaXMuYmluZEV2ZW50KCdrZXlkb3duJywgdGhpcy5jb252ZXJ0S2V5RXZlbnQsIGNvbXBvbmVudC5oYW5kbGVFdmVudC5iaW5kKGNvbXBvbmVudCkpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcHVibGljIHNlbmRFdmVudChuYW1lOiBzdHJpbmcsIGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5saXN0ZW5lcnNbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgcmV0dXJuRGF0YTtcblxuICAgICAgICAgICAgdmFyIGxpc3RlbmVycyA9IHRoaXMubGlzdGVuZXJzW25hbWVdO1xuICAgICAgICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICAgICAgICB2YXIgY2FsbE5leHQgPSAoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXTtcbiAgICAgICAgICAgICAgICBpKys7XG5cbiAgICAgICAgICAgICAgICB2YXIgcCA9IGxpc3RlbmVyKGRhdGEpO1xuICAgICAgICAgICAgICAgIHAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09PSBsaXN0ZW5lcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsTmV4dChyZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkuY2F0Y2goKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGNhbGxOZXh0KGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWRkTGlzdGVuZXI8VD4obmFtZTogc3RyaW5nLCBjYWxsYmFjazogKGRhdGE6IGFueSkgPT4gVCkge1xuICAgICAgICBpZiAoIXRoaXMubGlzdGVuZXJzW25hbWVdKSB7XG4gICAgICAgICAgICB0aGlzLmxpc3RlbmVyc1tuYW1lXSA9IFtdO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubGlzdGVuZXJzW25hbWVdLnB1c2goY2FsbGJhY2spO1xuICAgIH1cblxuICAgIHB1YmxpYyByZW5kZXIoKSB7XG4gICAgICAgIHRoaXMuYWN0aXZlU2NyZWVuLnJlbmRlcigpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRNYXAoKTogTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRDdXJyZW50VHVybigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudHVybkNvdW50O1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuL01hcCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5pbXBvcnQgKiBhcyBUaWxlcyBmcm9tICcuL1RpbGVzJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge0dseXBoQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvR2x5cGhDb21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7SW5wdXRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9JbnB1dENvbXBvbmVudCc7XG5pbXBvcnQge0ZhY3Rpb25Db21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUZpcmVib2x0Q29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50JztcbmltcG9ydCB7QWJpbGl0eUljZUxhbmNlQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50JztcbmltcG9ydCB7TWVsZWVBdHRhY2tDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9NZWxlZUF0dGFja0NvbXBvbmVudCc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuL01vdXNlQnV0dG9uVHlwZSc7XG5pbXBvcnQge01vdXNlQ2xpY2tFdmVudH0gZnJvbSAnLi9Nb3VzZUNsaWNrRXZlbnQnO1xuaW1wb3J0IHtLZXlib2FyZEV2ZW50VHlwZX0gZnJvbSAnLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4vS2V5Ym9hcmRFdmVudCc7XG5cbmV4cG9ydCBjbGFzcyBHYW1lU2NyZWVuIHtcbiAgICBkaXNwbGF5OiBhbnk7XG4gICAgbWFwOiBNYXA7XG4gICAgaGVpZ2h0OiBudW1iZXI7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBwbGF5ZXI6IEVudGl0eTtcbiAgICBnYW1lOiBHYW1lO1xuICAgIG51bGxUaWxlOiBUaWxlO1xuXG4gICAgY29uc3RydWN0b3IoZGlzcGxheTogYW55LCB3aWR0aDogbnVtYmVyLCBoZWlnaHQ6IG51bWJlciwgbWFwOiBNYXApIHtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5kaXNwbGF5ID0gZGlzcGxheTtcbiAgICAgICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIC8vbmV3IE1hcCh0aGlzLndpZHRoLCB0aGlzLmhlaWdodCAtIDEpO1xuICAgICAgICAvL3RoaXMubWFwLmdlbmVyYXRlKCk7XG5cbiAgICAgICAgdGhpcy5udWxsVGlsZSA9IFRpbGVzLmNyZWF0ZS5udWxsVGlsZSgpO1xuXG4gICAgICAgIHRoaXMucGxheWVyID0gbmV3IEVudGl0eSgncGxheWVyJyk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnQCcsICd3aGl0ZScsICdibGFjaycpXG4gICAgICAgIH0pKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBQb3NpdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBJbnB1dENvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCh7XG4gICAgICAgICAgICBkaXN0YW5jZTogNTBcbiAgICAgICAgfSkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IEZhY3Rpb25Db21wb25lbnQoe1xuICAgICAgICAgICAgaGVybzogMSxcbiAgICAgICAgICAgIGljZTogLTEsXG4gICAgICAgICAgICBmaXJlOiAtMVxuICAgICAgICB9KSk7XG4gICAgICAgIHRoaXMucGxheWVyLmFkZENvbXBvbmVudChuZXcgQWJpbGl0eUZpcmVib2x0Q29tcG9uZW50KCkpO1xuICAgICAgICB0aGlzLnBsYXllci5hZGRDb21wb25lbnQobmV3IEFiaWxpdHlJY2VMYW5jZUNvbXBvbmVudCgpKTtcbiAgICAgICAgdGhpcy5wbGF5ZXIuYWRkQ29tcG9uZW50KG5ldyBNZWxlZUF0dGFja0NvbXBvbmVudCgpKTtcblxuICAgICAgICB0aGlzLm1hcC5hZGRFbnRpdHlBdFJhbmRvbVBvc2l0aW9uKHRoaXMucGxheWVyKTtcblxuICAgICAgICB0aGlzLmdhbWUuYWRkRW50aXR5KHRoaXMucGxheWVyKTtcbiAgICB9XG5cbiAgICByZW5kZXIoKSB7XG4gICAgICAgIHZhciBiID0gdGhpcy5nZXRSZW5kZXJhYmxlQm91bmRhcnkoKTtcblxuICAgICAgICBmb3IgKHZhciB4ID0gYi54OyB4IDwgYi54ICsgYi53OyB4KyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIHkgPSBiLnk7IHkgPCBiLnkgKyBiLmg7IHkrKykge1xuICAgICAgICAgICAgICAgIHZhciBnbHlwaDogR2x5cGggPSB0aGlzLm1hcC5nZXRUaWxlKHgsIHkpLmdldEdseXBoKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJNYXBHbHlwaChnbHlwaCwgeCwgeSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hcC5tYXBFbnRpdGllcyh0aGlzLnJlbmRlckVudGl0eSk7XG4gICAgfVxuXG4gICAgaGFuZGxlSW5wdXQoZXZlbnREYXRhOiBhbnkpIHtcbiAgICAgICAgaWYgKGV2ZW50RGF0YS5nZXRDbGFzc05hbWUoKSA9PT0gJ01vdXNlQ2xpY2tFdmVudCcpIHtcbiAgICAgICAgICAgIHRoaXMuaGFuZGxlTW91c2VDbGlja0V2ZW50KDxNb3VzZUNsaWNrRXZlbnQ+ZXZlbnREYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChldmVudERhdGEuZ2V0Q2xhc3NOYW1lKCkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICAgICAgdGhpcy5oYW5kbGVLZXlib2FyZEV2ZW50KDxLZXlib2FyZEV2ZW50PmV2ZW50RGF0YSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBoYW5kbGVNb3VzZUNsaWNrRXZlbnQoZXZlbnQ6IE1vdXNlQ2xpY2tFdmVudCkge1xuICAgICAgICBpZiAoZXZlbnQuZ2V0WCgpID09PSAtMSB8fCBldmVudC5nZXRZKCkgPT09IC0xKSB7XG4gICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdjbGlja2VkIG91dHNpZGUgb2YgY2FudmFzJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMubWFwLmdldFRpbGUoZXZlbnQuZ2V0WCgpLCBldmVudC5nZXRZKCkpO1xuICAgICAgICAgICAgY29uc29sZS5kZWJ1ZygnY2xpY2tlZCcsIGV2ZW50LmdldFgoKSwgZXZlbnQuZ2V0WSgpLCB0aWxlKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGhhbmRsZUtleWJvYXJkRXZlbnQoZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICB9XG5cbiAgICBnZXRNYXAoKTogTWFwIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWFwO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB3OiB0aGlzLm1hcC5nZXRXaWR0aCgpLFxuICAgICAgICAgICAgaDogdGhpcy5tYXAuZ2V0SGVpZ2h0KClcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGlzUmVuZGVyYWJsZSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG5cbiAgICAgICAgcmV0dXJuIHggPj0gYi54ICYmIHggPCBiLnggKyBiLncgJiYgeSA+PSBiLnkgJiYgeSA8IGIueSArIGIuaDtcbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlck1hcEdseXBoKGdseXBoOiBHbHlwaCwgeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgdmFyIGIgPSB0aGlzLmdldFJlbmRlcmFibGVCb3VuZGFyeSgpO1xuICAgICAgICBjb25zdCBzaWdodENvbXBvbmVudDogU2lnaHRDb21wb25lbnQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wbGF5ZXIuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuXG4gICAgICAgIGlmIChzaWdodENvbXBvbmVudC5jYW5TZWUoeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICBnbHlwaC5iYWNrZ3JvdW5kXG4gICAgICAgICAgICApO1xuICAgICAgICB9IGVsc2UgaWYgKHNpZ2h0Q29tcG9uZW50Lmhhc1NlZW4oeCx5KSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5LmRyYXcoXG4gICAgICAgICAgICAgICAgeCAtIGIueCxcbiAgICAgICAgICAgICAgICB5IC0gYi55LFxuICAgICAgICAgICAgICAgIGdseXBoLmNoYXIsXG4gICAgICAgICAgICAgICAgZ2x5cGguZm9yZWdyb3VuZCxcbiAgICAgICAgICAgICAgICAnIzExMSdcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBnOiBHbHlwaCA9IHRoaXMubnVsbFRpbGUuZ2V0R2x5cGgoKTtcbiAgICAgICAgICAgIHRoaXMuZGlzcGxheS5kcmF3KFxuICAgICAgICAgICAgICAgIHggLSBiLngsXG4gICAgICAgICAgICAgICAgeSAtIGIueSxcbiAgICAgICAgICAgICAgICBnLmNoYXIsXG4gICAgICAgICAgICAgICAgZy5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgIGcuYmFja2dyb3VuZFxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHByaXZhdGUgcmVuZGVyR2x5cGgoZ2x5cGg6IEdseXBoLCB4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgYiA9IHRoaXMuZ2V0UmVuZGVyYWJsZUJvdW5kYXJ5KCk7XG4gICAgICAgIGNvbnN0IHNpZ2h0Q29tcG9uZW50OiBTaWdodENvbXBvbmVudCA9IDxTaWdodENvbXBvbmVudD50aGlzLnBsYXllci5nZXRDb21wb25lbnQoJ1NpZ2h0Q29tcG9uZW50Jyk7XG5cbiAgICAgICAgaWYgKHNpZ2h0Q29tcG9uZW50LmNhblNlZSh4LHkpKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3BsYXkuZHJhdyhcbiAgICAgICAgICAgICAgICB4IC0gYi54LFxuICAgICAgICAgICAgICAgIHkgLSBiLnksXG4gICAgICAgICAgICAgICAgZ2x5cGguY2hhcixcbiAgICAgICAgICAgICAgICBnbHlwaC5mb3JlZ3JvdW5kLFxuICAgICAgICAgICAgICAgIGdseXBoLmJhY2tncm91bmRcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBwcml2YXRlIHJlbmRlckVudGl0eSA9IChlbnRpdHk6IEVudGl0eSkgPT4ge1xuICAgICAgICB2YXIgcG9zaXRpb25Db21wb25lbnQ6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIHZhciBnbHlwaENvbXBvbmVudDogR2x5cGhDb21wb25lbnQgPSA8R2x5cGhDb21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnR2x5cGhDb21wb25lbnQnKTtcblxuICAgICAgICB2YXIgcG9zaXRpb24gPSBwb3NpdGlvbkNvbXBvbmVudC5nZXRQb3NpdGlvbigpO1xuICAgICAgICB2YXIgZ2x5cGggPSBnbHlwaENvbXBvbmVudC5nZXRHbHlwaCgpO1xuXG4gICAgICAgIGlmICghdGhpcy5pc1JlbmRlcmFibGUocG9zaXRpb24ueCwgcG9zaXRpb24ueSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVuZGVyR2x5cGgoZ2x5cGgsIHBvc2l0aW9uLngsIHBvc2l0aW9uLnkpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbn1cbiIsImV4cG9ydCBjbGFzcyBHbHlwaCB7XG4gICAgcHVibGljIGNoYXI6IHN0cmluZztcbiAgICBwdWJsaWMgZm9yZWdyb3VuZDogc3RyaW5nO1xuICAgIHB1YmxpYyBiYWNrZ3JvdW5kOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjaGFyOiBzdHJpbmcsIGZvcmVncm91bmQ6IHN0cmluZywgYmFja2dyb3VuZDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMuY2hhciA9IGNoYXI7XG4gICAgICAgIHRoaXMuZm9yZWdyb3VuZCA9IGZvcmVncm91bmQ7XG4gICAgICAgIHRoaXMuYmFja2dyb3VuZCA9IGJhY2tncm91bmQ7XG4gICAgfVxuXG59XG4iLCJleHBvcnQgY2xhc3MgR3VpZCB7XG4gICAgc3RhdGljIGdlbmVyYXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAneHh4eHh4eHgteHh4eC00eHh4LXl4eHgteHh4eHh4eHh4eHh4Jy5yZXBsYWNlKC9beHldL2csIGZ1bmN0aW9uKGMpIHtcbiAgICAgICAgICAgIHZhciByID0gTWF0aC5yYW5kb20oKSoxNnwwLCB2ID0gYyA9PSAneCcgPyByIDogKHImMHgzfDB4OCk7XG4gICAgICAgICAgICByZXR1cm4gdi50b1N0cmluZygxNik7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsImltcG9ydCB7S2V5Ym9hcmRFdmVudFR5cGV9IGZyb20gJy4vS2V5Ym9hcmRFdmVudFR5cGUnO1xuXG5leHBvcnQgY2xhc3MgS2V5Ym9hcmRFdmVudCB7XG4gICAga2V5Q29kZTogbnVtYmVyO1xuICAgIGFsdEtleTogYm9vbGVhbjtcbiAgICBjdHJsS2V5OiBib29sZWFuO1xuICAgIHNoaWZ0S2V5OiBib29sZWFuO1xuICAgIG1ldGFLZXk6IGJvb2xlYW47XG4gICAgZXZlbnRUeXBlOiBLZXlib2FyZEV2ZW50VHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIEtleWJvYXJkRXZlbnQucHJvdG90eXBlLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgY29uc3RydWN0b3Ioa2V5Q29kZTogbnVtYmVyLCBldmVudFR5cGU6IEtleWJvYXJkRXZlbnRUeXBlLCBhbHRLZXk6IGJvb2xlYW4sIGN0cmxLZXk6IGJvb2xlYW4sIHNoaWZ0S2V5OiBib29sZWFuLCBtZXRhS2V5OiBib29sZWFuKSB7XG4gICAgICAgIHRoaXMua2V5Q29kZSA9IGtleUNvZGU7XG4gICAgICAgIHRoaXMuZXZlbnRUeXBlID0gZXZlbnRUeXBlO1xuICAgICAgICB0aGlzLmFsdEtleSA9IGFsdEtleTtcbiAgICAgICAgdGhpcy5jdHJsS2V5ID0gY3RybEtleTtcbiAgICAgICAgdGhpcy5zaGlmdEtleSA9IHNoaWZ0S2V5O1xuICAgICAgICB0aGlzLm1ldGFLZXkgPSBtZXRhS2V5O1xuICAgIH1cblxuICAgIGdldEV2ZW50VHlwZSgpOiBLZXlib2FyZEV2ZW50VHlwZSB7XG4gICAgICAgIHJldHVybiB0aGlzLmV2ZW50VHlwZTtcbiAgICB9XG5cbiAgICBnZXRLZXlDb2RlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmtleUNvZGU7XG4gICAgfVxuXG4gICAgaGFzQWx0S2V5KCk6IGJvb2xlYW4ge1xuICAgICAgICByZXR1cm4gdGhpcy5hbHRLZXk7XG4gICAgfVxuXG4gICAgaGFzU2hpZnRLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLnNoaWZ0S2V5O1xuICAgIH1cblxuICAgIGhhc0N0cmxLZXkoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmN0cmxLZXk7XG4gICAgfVxuXG4gICAgaGFzTWV0YUtleSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubWV0YUtleTtcbiAgICB9XG59XG4iLCJleHBvcnQgZW51bSBLZXlib2FyZEV2ZW50VHlwZSB7XG4gICAgRE9XTixcbiAgICBVUCxcbiAgICBQUkVTU1xufTtcbiIsImRlY2xhcmUgdmFyIFJPVDogYW55O1xuXG5pbXBvcnQge0dhbWV9IGZyb20gJy4vR2FtZSc7XG5pbXBvcnQge1RpbGV9IGZyb20gJy4vVGlsZSc7XG5pbXBvcnQge0dseXBofSBmcm9tICcuL0dseXBoJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuL0VudGl0eSc7XG5pbXBvcnQgKiBhcyBUaWxlcyBmcm9tICcuL1RpbGVzJztcblxuaW1wb3J0IHtBY3RvckNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0FjdG9yQ29tcG9uZW50JztcbmltcG9ydCB7R2x5cGhDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9HbHlwaENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtJbnB1dENvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0lucHV0Q29tcG9uZW50JztcbmltcG9ydCB7U2lnaHRDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1JhbmRvbVdhbGtDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9SYW5kb21XYWxrQ29tcG9uZW50JztcbmltcG9ydCB7QUlGYWN0aW9uQ29tcG9uZW50fSBmcm9tICcuL2NvbXBvbmVudHMvQUlGYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ZhY3Rpb25Db21wb25lbnQnO1xuaW1wb3J0IHtGaXJlQWZmaW5pdHlDb21wb25lbnR9IGZyb20gJy4vY29tcG9uZW50cy9GaXJlQWZmaW5pdHlDb21wb25lbnQnO1xuaW1wb3J0IHtJY2VBZmZpbml0eUNvbXBvbmVudH0gZnJvbSAnLi9jb21wb25lbnRzL0ljZUFmZmluaXR5Q29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1hcCB7XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgICBoZWlnaHQ6IG51bWJlcjtcbiAgICB0aWxlczogVGlsZVtdW107XG5cbiAgICBlbnRpdGllczoge1tndWlkOiBzdHJpbmddOiBFbnRpdHl9O1xuICAgIG1heEVuZW1pZXM6IG51bWJlcjtcblxuICAgIGZvdjogYW55O1xuXG4gICAgY29uc3RydWN0b3Iod2lkdGg6IG51bWJlciwgaGVpZ2h0OiBudW1iZXIsIG1heEVuZW1pZXM6IG51bWJlciA9IDEwKSB7XG4gICAgICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICAgICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIHRoaXMubWF4RW5lbWllcyA9IG1heEVuZW1pZXM7XG4gICAgICAgIHRoaXMudGlsZXMgPSBbXTtcbiAgICAgICAgdGhpcy5lbnRpdGllcyA9IHt9O1xuXG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5hZGRMaXN0ZW5lcignZW50aXR5TW92ZWQnLCB0aGlzLmVudGl0eU1vdmVkTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2VudGl0eUtpbGxlZCcsIHRoaXMuZW50aXR5S2lsbGVkTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgICAgIGcuYWRkTGlzdGVuZXIoJ2Nhbk1vdmVUbycsIHRoaXMuY2FuTW92ZVRvLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIHNldHVwRm92KCkge1xuICAgICAgICB0aGlzLmZvdiA9IG5ldyBST1QuRk9WLkRpc2NyZXRlU2hhZG93Y2FzdGluZyhcbiAgICAgICAgICAgICh4LCB5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgdGlsZSA9IHRoaXMuZ2V0VGlsZSh4LCB5KTtcbiAgICAgICAgICAgICAgICBpZiAoIXRpbGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gIXRpbGUuYmxvY2tzTGlnaHQoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7dG9wb2xvZ3k6IDR9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZ2V0VmlzaWJsZUNlbGxzKGVudGl0eTogRW50aXR5LCBkaXN0YW5jZTogbnVtYmVyKToge1twb3M6IHN0cmluZ106IGJvb2xlYW59IHtcbiAgICAgICAgbGV0IHZpc2libGVDZWxsczogYW55ID0ge307XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcblxuICAgICAgICB0aGlzLmZvdi5jb21wdXRlKFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpLFxuICAgICAgICAgICAgZGlzdGFuY2UsXG4gICAgICAgICAgICAoeCwgeSwgcmFkaXVzLCB2aXNpYmlsaXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgdmlzaWJsZUNlbGxzW3ggKyBcIixcIiArIHldID0gdHJ1ZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdmlzaWJsZUNlbGxzO1xuICAgIH1cblxuICAgIG1hcEVudGl0aWVzKGNhbGxiYWNrOiAoaXRlbTogRW50aXR5KSA9PiBhbnkpIHtcbiAgICAgICAgZm9yICh2YXIgZW50aXR5R3VpZCBpbiB0aGlzLmVudGl0aWVzKSB7XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gdGhpcy5lbnRpdGllc1tlbnRpdHlHdWlkXTtcbiAgICAgICAgICAgIGlmIChlbnRpdHkpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlbnRpdHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgZ2V0SGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5oZWlnaHQ7XG4gICAgfVxuXG4gICAgZ2V0V2lkdGgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgIH1cblxuICAgIGdldFRpbGUoeDogbnVtYmVyLCB5OiBudW1iZXIpIHtcbiAgICAgICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gdGhpcy53aWR0aCB8fCB5ID49IHRoaXMuaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy50aWxlc1t4XVt5XTtcbiAgICB9XG5cbiAgICBnZW5lcmF0ZSgpIHtcbiAgICAgICAgdGhpcy50aWxlcyA9IHRoaXMuZ2VuZXJhdGVMZXZlbCgpO1xuICAgICAgICB0aGlzLnNldHVwRm92KCk7XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm1heEVuZW1pZXM7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZGRGaXJlSW1wKCk7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWF4RW5lbWllczsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEljZUltcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWRkRmlyZUltcCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnZicsICdyZWQnLCAnYmxhY2snKVxuICAgICAgICB9KSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgUG9zaXRpb25Db21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQUlGYWN0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEZpcmVBZmZpbml0eUNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGYWN0aW9uQ29tcG9uZW50KCB7XG4gICAgICAgICAgICBmaXJlOiAxLFxuICAgICAgICAgICAgaWNlOiAwLFxuICAgICAgICAgICAgaGVybzogLTFcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSk7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgIH1cblxuICAgIGFkZEljZUltcCgpIHtcbiAgICAgICAgdmFyIGcgPSBuZXcgR2FtZSgpO1xuICAgICAgICB2YXIgZW5lbXkgPSBuZXcgRW50aXR5KCk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgQWN0b3JDb21wb25lbnQoKSk7XG4gICAgICAgIGVuZW15LmFkZENvbXBvbmVudChuZXcgR2x5cGhDb21wb25lbnQoe1xuICAgICAgICAgICAgZ2x5cGg6IG5ldyBHbHlwaCgnaScsICdjeWFuJywgJ2JsYWNrJylcbiAgICAgICAgfSkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IFBvc2l0aW9uQ29tcG9uZW50KCkpO1xuICAgICAgICBlbmVteS5hZGRDb21wb25lbnQobmV3IEFJRmFjdGlvbkNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBJY2VBZmZpbml0eUNvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBTaWdodENvbXBvbmVudCgpKTtcbiAgICAgICAgZW5lbXkuYWRkQ29tcG9uZW50KG5ldyBGYWN0aW9uQ29tcG9uZW50KCB7XG4gICAgICAgICAgICBmaXJlOiAwLFxuICAgICAgICAgICAgaWNlOiAxLFxuICAgICAgICAgICAgaGVybzogLTFcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMuYWRkRW50aXR5QXRSYW5kb21Qb3NpdGlvbihlbmVteSk7XG5cbiAgICAgICAgZy5hZGRFbnRpdHkoZW5lbXkpO1xuICAgIH1cblxuICAgIGFkZEVudGl0eUF0UmFuZG9tUG9zaXRpb24oZW50aXR5OiBFbnRpdHkpOiBib29sZWFuIHtcbiAgICAgICAgaWYgKCFlbnRpdHkuaGFzQ29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgICAgIHZhciBtYXhUcmllcyA9IHRoaXMud2lkdGggKiB0aGlzLmhlaWdodCAqIDEwO1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlICghZm91bmQgJiYgaSA8IG1heFRyaWVzKSB7XG4gICAgICAgICAgICB2YXIgeCA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHRoaXMud2lkdGgpO1xuICAgICAgICAgICAgdmFyIHkgPSBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB0aGlzLmhlaWdodCk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRUaWxlKHgsIHkpLmlzV2Fsa2FibGUoKSAmJiAhdGhpcy5wb3NpdGlvbkhhc0VudGl0eSh4LCB5KSkge1xuICAgICAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWZvdW5kKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdObyBmcmVlIHNwb3QgZm91bmQgZm9yJywgZW50aXR5KTtcbiAgICAgICAgICAgIHRocm93ICdObyBmcmVlIHNwb3QgZm91bmQgZm9yIGEgbmV3IGVudGl0eSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBjb21wb25lbnQuc2V0UG9zaXRpb24oeCwgeSk7XG4gICAgICAgIHRoaXMuZW50aXRpZXNbZW50aXR5LmdldEd1aWQoKV0gPSBlbnRpdHk7XG4gICAgICAgIHRoaXMuZ2V0VGlsZSh4LCB5KS5zZXRFbnRpdHlHdWlkKGVudGl0eS5nZXRHdWlkKCkpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGRFbnRpdHkoZW50aXR5OiBFbnRpdHkpIHtcbiAgICAgICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICBnYW1lLmFkZEVudGl0eShlbnRpdHkpO1xuICAgICAgICB0aGlzLmVudGl0aWVzW2VudGl0eS5nZXRHdWlkKCldID0gZW50aXR5O1xuICAgIH1cblxuICAgIHJlbW92ZUVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICBjb25zdCBnYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+ZW50aXR5LmdldENvbXBvbmVudCgnUG9zaXRpb25Db21wb25lbnQnKTtcbiAgICAgICAgZ2FtZS5yZW1vdmVFbnRpdHkoZW50aXR5KTtcbiAgICAgICAgdGhpcy5lbnRpdGllc1tlbnRpdHkuZ2V0R3VpZCgpXSA9IG51bGxcbiAgICAgICAgdGhpcy5nZXRUaWxlKHBvc2l0aW9uQ29tcG9uZW50LmdldFgoKSwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpKS5zZXRFbnRpdHlHdWlkKCcnKTtcbiAgICB9XG5cbiAgICBwb3NpdGlvbkhhc0VudGl0eSh4OiBudW1iZXIsIHk6IG51bWJlcikge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZ2V0VGlsZSh4LCB5KTtcbiAgICAgICAgdmFyIGVudGl0eUd1aWQgPSB0aWxlLmdldEVudGl0eUd1aWQoKTtcbiAgICAgICAgcmV0dXJuIGVudGl0eUd1aWQgIT09ICcnO1xuICAgIH1cblxuICAgIGdldEVudGl0eUF0KHg6IG51bWJlciwgeTogbnVtYmVyKTogRW50aXR5IHtcbiAgICAgICAgdmFyIHRpbGUgPSB0aGlzLmdldFRpbGUoeCwgeSk7XG4gICAgICAgIHZhciBlbnRpdHlHdWlkID0gdGlsZS5nZXRFbnRpdHlHdWlkKCk7XG4gICAgICAgIHJldHVybiB0aGlzLmVudGl0aWVzW2VudGl0eUd1aWRdO1xuICAgIH1cblxuICAgIGdldE5lYXJieUVudGl0aWVzKG9yaWdpbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQsIHJhZGl1czogbnVtYmVyLCBmaWx0ZXI6IChlbnRpdHk6IEVudGl0eSkgPT4gYm9vbGVhbiA9IChlKSA9PiB7cmV0dXJuIHRydWU7fSk6IEVudGl0eVtdIHtcbiAgICAgICAgbGV0IGVudGl0aWVzID0gW107XG4gICAgICAgIHRoaXMubWFwRW50aXRpZXMoKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFmaWx0ZXIoZW50aXR5KSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBpZiAocG9zaXRpb25Db21wb25lbnQgPT09IG9yaWdpbkNvbXBvbmVudCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGRpc3RhbmNlID0gcG9zaXRpb25Db21wb25lbnQuZGlzdGFuY2VUbyhvcmlnaW5Db21wb25lbnQuZ2V0WCgpLCBvcmlnaW5Db21wb25lbnQuZ2V0WSgpKTtcbiAgICAgICAgICAgIGlmIChkaXN0YW5jZSA8PSByYWRpdXMpIHtcbiAgICAgICAgICAgICAgICBlbnRpdGllcy5wdXNoKHtkaXN0YW5jZTogZGlzdGFuY2UsIGVudGl0eTogZW50aXR5fSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBlbnRpdGllcy5zb3J0KChhLCBiKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2U7XG4gICAgICAgIH0pO1xuICAgICAgICBlbnRpdGllcyA9IGVudGl0aWVzLm1hcCgoYSkgPT4geyByZXR1cm4gYS5lbnRpdHk7IH0pO1xuICAgICAgICByZXR1cm4gZW50aXRpZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZW5lcmF0ZUxldmVsKCk6IFRpbGVbXVtdIHtcbiAgICAgICAgdmFyIHRpbGVzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgeCA9IDA7IHggPCB0aGlzLndpZHRoOyB4KyspIHtcbiAgICAgICAgICAgIHRpbGVzLnB1c2goW10pO1xuICAgICAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmhlaWdodDsgeSsrKSB7XG4gICAgICAgICAgICAgICAgdGlsZXNbeF0ucHVzaChUaWxlcy5jcmVhdGUubnVsbFRpbGUoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgZ2VuZXJhdG9yID0gbmV3IFJPVC5NYXAuQ2VsbHVsYXIodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgICBnZW5lcmF0b3IucmFuZG9taXplKDAuNSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDsgaSsrKSB7XG4gICAgICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBnZW5lcmF0b3IuY3JlYXRlKCh4LCB5LCB2KSA9PiB7XG4gICAgICAgICAgICBpZiAodiA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHRpbGVzW3hdW3ldID0gVGlsZXMuY3JlYXRlLmZsb29yVGlsZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aWxlc1t4XVt5XSA9IFRpbGVzLmNyZWF0ZS53YWxsVGlsZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gdGlsZXM7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBlbnRpdHlNb3ZlZExpc3RlbmVyKGRhdGE6IGFueSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHZhciBvbGRQb3NpdGlvbiA9IGRhdGEub2xkUG9zaXRpb247XG4gICAgICAgICAgICB2YXIgZW50aXR5ID0gZGF0YS5lbnRpdHk7XG4gICAgICAgICAgICBpZiAoIWVudGl0eS5oYXNDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoZGF0YSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIHBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUob2xkUG9zaXRpb24ueCwgb2xkUG9zaXRpb24ueSkuc2V0RW50aXR5R3VpZCgnJyk7XG4gICAgICAgICAgICB0aGlzLmdldFRpbGUocG9zaXRpb25Db21wb25lbnQuZ2V0WCgpLCBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkpLnNldEVudGl0eUd1aWQoZW50aXR5LmdldEd1aWQoKSk7XG4gICAgICAgICAgICByZXNvbHZlKGRhdGEpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGVudGl0eUtpbGxlZExpc3RlbmVyKGRhdGE6IEVudGl0eSk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlRW50aXR5KGRhdGEpO1xuICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjYW5Nb3ZlVG8ocG9zaXRpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0sIGFjYzogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgdGlsZSA9IHRoaXMuZ2V0VGlsZShwb3NpdGlvbi54LCBwb3NpdGlvbi55KTtcbiAgICAgICAgICAgIGlmICh0aWxlLmlzV2Fsa2FibGUoKSAmJiB0aWxlLmdldEVudGl0eUd1aWQoKSA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KHBvc2l0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuIiwiZXhwb3J0IGVudW0gTW91c2VCdXR0b25UeXBlIHtcbiAgICBMRUZULFxuICAgIE1JRERMRSxcbiAgICBSSUdIVFxufTtcblxuIiwiaW1wb3J0IHtNb3VzZUJ1dHRvblR5cGV9IGZyb20gJy4vTW91c2VCdXR0b25UeXBlJztcblxuZXhwb3J0IGNsYXNzIE1vdXNlQ2xpY2tFdmVudCB7XG4gICAgeDogbnVtYmVyO1xuICAgIHk6IG51bWJlcjtcbiAgICBidXR0b246IE1vdXNlQnV0dG9uVHlwZTtcblxuICAgIGdldENsYXNzTmFtZSgpIHtcbiAgICAgICAgcmV0dXJuIE1vdXNlQ2xpY2tFdmVudC5wcm90b3R5cGUuY29uc3RydWN0b3IudG9TdHJpbmcoKS5tYXRjaCgvXFx3Ky9nKVsxXTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3Rvcih4OiBudW1iZXIsIHk6IG51bWJlciwgYnV0dG9uOiBNb3VzZUJ1dHRvblR5cGUpIHtcbiAgICAgICAgdGhpcy54ID0geDtcbiAgICAgICAgdGhpcy55ID0geTtcbiAgICAgICAgdGhpcy5idXR0b24gPSBidXR0b247XG4gICAgfVxuXG4gICAgZ2V0WCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy54O1xuICAgIH1cblxuICAgIGdldFkoKTogbnVtYmVyIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueTtcbiAgICB9XG5cbiAgICBnZXRCdXR0b25UeXBlKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5idXR0b247XG4gICAgfVxufVxuIiwiaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi9HbHlwaCc7XG5cbmV4cG9ydCBjbGFzcyBUaWxlIHtcbiAgICBwcml2YXRlIGdseXBoOiBHbHlwaDtcbiAgICBwcml2YXRlIGVudGl0eUd1aWQ6IHN0cmluZztcbiAgICBwcml2YXRlIHdhbGthYmxlOiBib29sZWFuO1xuICAgIHByaXZhdGUgYmxvY2tpbmdMaWdodDogYm9vbGVhbjtcblxuICAgIGNvbnN0cnVjdG9yKGdseXBoOiBHbHlwaCwgd2Fsa2FibGU6IGJvb2xlYW4gPSB0cnVlLCBibG9ja2luZ0xpZ2h0OiBib29sZWFuID0gZmFsc2UpIHtcbiAgICAgICAgdGhpcy5nbHlwaCA9IGdseXBoO1xuICAgICAgICB0aGlzLndhbGthYmxlID0gd2Fsa2FibGU7XG4gICAgICAgIHRoaXMuYmxvY2tpbmdMaWdodCA9IGJsb2NraW5nTGlnaHQ7XG5cbiAgICAgICAgdGhpcy5lbnRpdHlHdWlkID0gJyc7XG4gICAgfVxuXG4gICAgaXNXYWxrYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud2Fsa2FibGU7XG4gICAgfVxuXG4gICAgYmxvY2tzTGlnaHQoKTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLmJsb2NraW5nTGlnaHQ7XG4gICAgfVxuXG5cbiAgICBnZXRHbHlwaCgpOiBHbHlwaCB7XG4gICAgICAgIHJldHVybiB0aGlzLmdseXBoO1xuICAgIH1cblxuICAgIGdldEVudGl0eUd1aWQoKTogc3RyaW5nIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZW50aXR5R3VpZDtcbiAgICB9XG5cbiAgICBzZXRFbnRpdHlHdWlkKGVudGl0eUd1aWQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmVudGl0eUd1aWQgPSBlbnRpdHlHdWlkO1xuICAgIH1cbn1cbiIsImltcG9ydCB7R2x5cGh9IGZyb20gJy4vR2x5cGgnO1xuaW1wb3J0IHtUaWxlfSBmcm9tICcuL1RpbGUnO1xuXG5leHBvcnQgbW9kdWxlIGNyZWF0ZSB7XG4gICAgZXhwb3J0IGZ1bmN0aW9uIG51bGxUaWxlKCkge1xuICAgICAgICByZXR1cm4gbmV3IFRpbGUobmV3IEdseXBoKCcgJywgJ2JsYWNrJywgJyMwMDAnKSwgZmFsc2UsIGZhbHNlKTtcbiAgICB9XG4gICAgZXhwb3J0IGZ1bmN0aW9uIGZsb29yVGlsZSgpIHtcbiAgICAgICAgcmV0dXJuIG5ldyBUaWxlKG5ldyBHbHlwaCgnLicsICcjMjIyJywgJyM0NDQnKSwgdHJ1ZSwgZmFsc2UpO1xuICAgIH1cbiAgICBleHBvcnQgZnVuY3Rpb24gd2FsbFRpbGUoKSB7XG4gICAgICAgIHJldHVybiBuZXcgVGlsZShuZXcgR2x5cGgoJyMnLCAnI2NjYycsICcjNDQ0JyksIGZhbHNlLCB0cnVlKTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtTaWdodENvbXBvbmVudH0gZnJvbSAnLi9TaWdodENvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RmFjdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9GYWN0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFJRmFjdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgdGFyZ2V0UG9zOiBhbnk7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMudGFyZ2V0UG9zID0gbnVsbDtcbiAgICB9XG5cbiAgICBhY3QoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgc2lnaHQgPSA8U2lnaHRDb21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdTaWdodENvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgZmFjdGlvbiA9IDxGYWN0aW9uQ29tcG9uZW50PnRoaXMucGFyZW50LmdldENvbXBvbmVudCgnRmFjdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IHNpZ2h0LmdldFZpc2libGVFbnRpdGllcygpO1xuXG4gICAgICAgICAgICBsZXQgZmVhcmluZzogRW50aXR5ID0gbnVsbDtcbiAgICAgICAgICAgIGxldCBlbmVteTogRW50aXR5ID0gbnVsbDtcblxuICAgICAgICAgICAgZW50aXRpZXMuZm9yRWFjaCgoZW50aXR5KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgZWYgPSA8RmFjdGlvbkNvbXBvbmVudD5lbnRpdHkuZ2V0Q29tcG9uZW50KCdGYWN0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGZhY3Rpb24uaXNFbmVteShlZi5nZXRTZWxmRmFjdGlvbigpKSkge1xuICAgICAgICAgICAgICAgICAgICBlbmVteSA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGZlYXJpbmcgPT09IG51bGwgJiYgZmFjdGlvbi5pc0ZlYXJpbmcoZWYuZ2V0U2VsZkZhY3Rpb24oKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhcmluZyA9IGVudGl0eTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgaWYgKGVuZW15ICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdCA9IDxQb3NpdGlvbkNvbXBvbmVudD5lbmVteS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHQuZ2V0WCgpLFxuICAgICAgICAgICAgICAgICAgICB5OiB0LmdldFkoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICh0aGlzLnRhcmdldFBvcyAhPT0gbnVsbCAmJiAodGhpcy50YXJnZXRQb3MueCAhPT0gcG9zaXRpb24uZ2V0WCgpIHx8IHRoaXMudGFyZ2V0UG9zLnkgIT09IHBvc2l0aW9uLmdldFkoKSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdvVG93YXJkc1RhcmdldChwb3NpdGlvbilcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJhbmRvbVdhbGsoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdvVG93YXJkc1RhcmdldChwb3NpdGlvbjogUG9zaXRpb25Db21wb25lbnQpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh0aGlzLnRhcmdldFBvcy54IC0gcG9zaXRpb24uZ2V0WCgpKTtcbiAgICAgICAgICAgIHZhciBkeSA9IE1hdGguYWJzKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpO1xuICAgICAgICAgICAgbGV0IGRpcmVjdGlvbjogYW55O1xuXG4gICAgICAgICAgICBpZiAoZHggPiBkeSkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgIHk6IDBcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB5OiAodGhpcy50YXJnZXRQb3MueSAtIHBvc2l0aW9uLmdldFkoKSkgLyBkeVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9IHtcbiAgICAgICAgICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgICAgICAgICAgeTogKHRoaXMudGFyZ2V0UG9zLnkgLSBwb3NpdGlvbi5nZXRZKCkpIC8gZHlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeDogKHRoaXMudGFyZ2V0UG9zLnggLSBwb3NpdGlvbi5nZXRYKCkpIC8gZHgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogMFxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXR0ZW1wdE1vdmUoZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy50YXJnZXRQb3MgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGF0dGVtcHRNb3ZlKGRpcmVjdGlvbik6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmFuZG9tV2FsaygpOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZGlyZWN0aW9uczogYW55ID0gW1xuICAgICAgICAgICAgICAgIHt4OiAwLCB5OiAxfSxcbiAgICAgICAgICAgICAgICB7eDogMCwgeTogLTF9LFxuICAgICAgICAgICAgICAgIHt4OiAxLCB5OiAwfSxcbiAgICAgICAgICAgICAgICB7eDogLTEsIHk6IDB9LFxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgZGlyZWN0aW9ucyA9IGRpcmVjdGlvbnMucmFuZG9taXplKCk7XG5cbiAgICAgICAgICAgIHZhciB0ZXN0RGlyZWN0aW9uID0gKGRpcmVjdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdE1vdmUnLCBkaXJlY3Rpb24pXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKChhKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRpcmVjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlc3REaXJlY3Rpb24oZGlyZWN0aW9ucy5wb3AoKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB0ZXN0RGlyZWN0aW9uKGRpcmVjdGlvbnMucG9wKCkpO1xuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcblxuZXhwb3J0IGNsYXNzIEFiaWxpdHlGaXJlYm9sdENvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcmFuZ2U6IG51bWJlcjtcbiAgICBjb29sZG93bjogbnVtYmVyO1xuICAgIGxhc3RVc2VkOiBudW1iZXI7XG4gICAgZGFtYWdlVHlwZTogc3RyaW5nO1xuXG4gICAgZ2FtZTogR2FtZTtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5yYW5nZSA9IDU7XG4gICAgICAgIHRoaXMuY29vbGRvd24gPSAxMDA7XG4gICAgICAgIHRoaXMubGFzdFVzZWQgPSAtdGhpcy5jb29sZG93bjtcbiAgICAgICAgdGhpcy5kYW1hZ2VUeXBlID0gJ2ZpcmUnO1xuICAgIH1cblxuICAgIGRlc2NyaWJlU3RhdGUoKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgY29uc3QgY29vbGRvd24gPSAodGhpcy5sYXN0VXNlZCArIHRoaXMuY29vbGRvd24pIC0gY3VycmVudFR1cm47XG4gICAgICAgIHJldHVybiAnRmlyZWJvbHQsIGNvb2xkb3duOiAnICsgTWF0aC5tYXgoMCwgY29vbGRvd24pO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRBYmlsaXR5RmlyZWJvbHQnLCB0aGlzLnVzZS5iaW5kKHRoaXMpKTtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2NvbnN1bWVGaXJlJywgdGhpcy5jb25zdW1lRmlyZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBpc0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdFVzZWQgKyB0aGlzLmNvb2xkb3duIDw9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgIH1cblxuICAgIGNvbnN1bWVGaXJlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgLT0gdGhpcy5jb29sZG93bjtcbiAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdXNlKCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGlmICghdGhpcy5pc0F2YWlsYWJsZSgpKSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgbWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuXG4gICAgICAgICAgICBjb25zdCBlbnRpdGllcyA9IG1hcC5nZXROZWFyYnlFbnRpdGllcyhwb3NpdGlvbkNvbXBvbmVudCwgdGhpcy5yYW5nZSk7XG5cbiAgICAgICAgICAgIGlmIChlbnRpdGllcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZW50aXRpZXMucG9wKCk7XG4gICAgICAgICAgICBpZiAoIXRhcmdldC5oYXNDb21wb25lbnQoJ0ljZUFmZmluaXR5Q29tcG9uZW50JykpIHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCA9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdjb25zdW1lSWNlJyk7XG4gICAgICAgICAgICB0YXJnZXQua2lsbCgpO1xuXG4gICAgICAgICAgICByZXNvbHZlKHRhcmdldCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuXG5leHBvcnQgY2xhc3MgQWJpbGl0eUljZUxhbmNlQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICByYW5nZTogbnVtYmVyO1xuICAgIGNvb2xkb3duOiBudW1iZXI7XG4gICAgbGFzdFVzZWQ6IG51bWJlcjtcbiAgICBkYW1hZ2VUeXBlOiBzdHJpbmc7XG5cbiAgICBnYW1lOiBHYW1lO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLmdhbWUgPSBuZXcgR2FtZSgpO1xuICAgICAgICB0aGlzLnJhbmdlID0gNTtcbiAgICAgICAgdGhpcy5jb29sZG93biA9IDEwMDtcbiAgICAgICAgdGhpcy5sYXN0VXNlZCA9IC10aGlzLmNvb2xkb3duO1xuICAgICAgICB0aGlzLmRhbWFnZVR5cGUgPSAnaWNlJztcbiAgICB9XG5cbiAgICBkZXNjcmliZVN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRUdXJuID0gdGhpcy5nYW1lLmdldEN1cnJlbnRUdXJuKCk7XG4gICAgICAgIGNvbnN0IGNvb2xkb3duID0gKHRoaXMubGFzdFVzZWQgKyB0aGlzLmNvb2xkb3duKSAtIGN1cnJlbnRUdXJuO1xuICAgICAgICByZXR1cm4gJ0ljZSBMYW5jZSwgY29vbGRvd246ICcgKyBNYXRoLm1heCgwLCBjb29sZG93bik7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdEFiaWxpdHlJY2VMYW5jZScsIHRoaXMudXNlLmJpbmQodGhpcykpO1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignY29uc3VtZUljZScsIHRoaXMuY29uc3VtZUljZS5iaW5kKHRoaXMpKTtcbiAgICB9XG5cbiAgICBpc0F2YWlsYWJsZSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubGFzdFVzZWQgKyB0aGlzLmNvb2xkb3duIDw9IHRoaXMuZ2FtZS5nZXRDdXJyZW50VHVybigpO1xuICAgIH1cblxuICAgIGNvbnN1bWVJY2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5sYXN0VXNlZCAtPSB0aGlzLmNvb2xkb3duO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB1c2UoKTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgaWYgKCF0aGlzLmlzQXZhaWxhYmxlKCkpIHtcbiAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBtYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG5cbiAgICAgICAgICAgIGNvbnN0IGVudGl0aWVzID0gbWFwLmdldE5lYXJieUVudGl0aWVzKFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uQ29tcG9uZW50LFxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2UsXG4gICAgICAgICAgICAgICAgKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZW50aXR5Lmhhc0NvbXBvbmVudCgnRmlyZUFmZmluaXR5Q29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGVudGl0aWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdubyBlbnRpdGllcyBuZWFyYnknKTtcbiAgICAgICAgICAgICAgICByZXNvbHZlKG51bGwpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdGFyZ2V0ID0gZW50aXRpZXMucG9wKCk7XG5cbiAgICAgICAgICAgIHRoaXMubGFzdFVzZWQgPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnY29uc3VtZUZpcmUnKTtcbiAgICAgICAgICAgIHRhcmdldC5raWxsKCk7XG5cbiAgICAgICAgICAgIHJlc29sdmUodGFyZ2V0KTtcblxuICAgICAgICB9KTtcbiAgICB9XG59XG4iLCJpbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBBY3RvckNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgfVxuXG4gICAgYWN0KCkge1xuICAgICAgICBjb25zb2xlLmxvZygnYWN0Jyk7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5cbmV4cG9ydCBjbGFzcyBDb21wb25lbnQge1xuICAgIHByb3RlY3RlZCBwYXJlbnQ6IEVudGl0eTtcblxuICAgIHB1YmxpYyBnZXROYW1lKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdG9yLnRvU3RyaW5nKCkubWF0Y2goL1xcdysvZylbMV07XG4gICAgfVxuXG4gICAgcHVibGljIHNldFBhcmVudEVudGl0eShlbnRpdHk6IEVudGl0eSkge1xuICAgICAgICB0aGlzLnBhcmVudCA9IGVudGl0eTtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0TGlzdGVuZXJzKCkge1xuICAgIH1cblxuICAgIHB1YmxpYyBkZXNjcmliZVN0YXRlKCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuaW1wb3J0IHtQb3NpdGlvbkNvbXBvbmVudH0gZnJvbSAnLi9Qb3NpdGlvbkNvbXBvbmVudCc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcblxuZXhwb3J0IGNsYXNzIEZhY3Rpb25Db21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGZpcmU6IG51bWJlcjtcbiAgICBpY2U6IG51bWJlcjtcbiAgICBoZXJvOiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7ZmlyZTogbnVtYmVyLCBpY2U6IG51bWJlciwgaGVybzogbnVtYmVyfSA9IHtmaXJlOiAwLCBpY2U6IDAsIGhlcm86IDB9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuZmlyZSA9IG9wdGlvbnMuZmlyZTtcbiAgICAgICAgdGhpcy5pY2UgPSBvcHRpb25zLmljZTtcbiAgICAgICAgdGhpcy5oZXJvID0gb3B0aW9ucy5oZXJvO1xuICAgIH1cblxuICAgIGlzRnJpZW5kbHkoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0ZlYXJpbmcoZmFjdGlvbjogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpc1tmYWN0aW9uXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHRocm93ICdBc2tpbmcgZm9yIGluZm8gb24gdW5kZWZpbmVkIGZhY3Rpb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXNbZmFjdGlvbl0gPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpc0VuZW15KGZhY3Rpb246IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgICBpZiAodHlwZW9mIHRoaXNbZmFjdGlvbl0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyAnQXNraW5nIGZvciBpbmZvIG9uIHVuZGVmaW5lZCBmYWN0aW9uJztcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzW2ZhY3Rpb25dID09PSAtMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldFNlbGZGYWN0aW9uKCk6IHN0cmluZyB7XG4gICAgICAgIGlmICh0aGlzLmljZSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdpY2UnO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZmlyZSA9PT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuICdmaXJlJztcbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmhlcm8gPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiAnaGVybyc7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5cbmV4cG9ydCBjbGFzcyBGaXJlQWZmaW5pdHlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGFmZmluaXR5OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWZmaW5pdHkgPSAnZmlyZSc7XG4gICAgfVxufVxuIiwiaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuaW1wb3J0IHtHbHlwaH0gZnJvbSAnLi4vR2x5cGgnO1xuXG5leHBvcnQgY2xhc3MgR2x5cGhDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgZ2x5cGg6IEdseXBoO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge2dseXBoOiBHbHlwaH0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nbHlwaCA9IG9wdGlvbnMuZ2x5cGg7XG4gICAgfVxuXG4gICAgZ2V0R2x5cGgoKTogR2x5cGgge1xuICAgICAgICByZXR1cm4gdGhpcy5nbHlwaDtcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5pbXBvcnQge0NvbXBvbmVudH0gZnJvbSAnLi9Db21wb25lbnQnO1xuXG5leHBvcnQgY2xhc3MgSWNlQWZmaW5pdHlDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGFmZmluaXR5OiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7fSA9IHt9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuYWZmaW5pdHkgPSAnaWNlJztcbiAgICB9XG59XG4iLCIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi4vLi4vdHlwaW5ncy9saWIuZXM2LmQudHNcIiAvPlxuXG5kZWNsYXJlIHZhciBST1Q6IGFueTtcblxuaW1wb3J0IHtDb21wb25lbnR9IGZyb20gJy4vQ29tcG9uZW50JztcbmltcG9ydCB7UG9zaXRpb25Db21wb25lbnR9IGZyb20gJy4vUG9zaXRpb25Db21wb25lbnQnO1xuaW1wb3J0IHtFbnRpdHl9IGZyb20gJy4uL0VudGl0eSc7XG5pbXBvcnQge0dhbWV9IGZyb20gJy4uL0dhbWUnO1xuaW1wb3J0IHtNYXB9IGZyb20gJy4uL01hcCc7XG5cbmltcG9ydCB7TW91c2VCdXR0b25UeXBlfSBmcm9tICcuLi9Nb3VzZUJ1dHRvblR5cGUnO1xuaW1wb3J0IHtNb3VzZUNsaWNrRXZlbnR9IGZyb20gJy4uL01vdXNlQ2xpY2tFdmVudCc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnRUeXBlfSBmcm9tICcuLi9LZXlib2FyZEV2ZW50VHlwZSc7XG5pbXBvcnQge0tleWJvYXJkRXZlbnR9IGZyb20gJy4uL0tleWJvYXJkRXZlbnQnO1xuXG5leHBvcnQgY2xhc3MgSW5wdXRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIHByaXZhdGUgd2FpdGluZzogYm9vbGVhbjtcblxuICAgIHByaXZhdGUgcmVzb2x2ZTogYW55O1xuICAgIHByaXZhdGUgcmVqZWN0OiBhbnk7XG5cbiAgICBnYW1lOiBHYW1lO1xuICAgIG1hcDogTWFwO1xuXG4gICAgY29uc3RydWN0b3Iob3B0aW9uczoge30gPSB7fSkge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLndhaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5tYXAgPSB0aGlzLmdhbWUuZ2V0TWFwKCk7XG4gICAgfVxuXG4gICAgd2FpdEZvcklucHV0KCk6IFByb21pc2U8YW55PiB7XG4gICAgICAgIHRoaXMud2FpdGluZyA9IHRydWU7XG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxhbnk+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIHRoaXMucmVzb2x2ZSA9IHJlc29sdmU7XG4gICAgICAgICAgICB0aGlzLnJlamVjdCA9IHJlamVjdDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgaGFuZGxlRXZlbnQoZXZlbnQ6IGFueSkge1xuICAgICAgICBpZiAodGhpcy53YWl0aW5nKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnQuZ2V0Q2xhc3NOYW1lKCkgPT09ICdLZXlib2FyZEV2ZW50Jykge1xuICAgICAgICAgICAgICAgIGV2ZW50ID0gPEtleWJvYXJkRXZlbnQ+ZXZlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50LmdldEV2ZW50VHlwZSgpID09PSBLZXlib2FyZEV2ZW50VHlwZS5ET1dOKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlS2V5RG93bihldmVudClcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKChyZXN1bHQpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygncmVzdWx0JywgcmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMud2FpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KS5jYXRjaCgocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0ludmFsaWQga2V5Ym9hcmQgaW5wdXQnLCBldmVudCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRJbnB1dCgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgaGFuZGxlS2V5RG93bihldmVudDogS2V5Ym9hcmRFdmVudCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8Ym9vbGVhbj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgc3dpdGNoIChldmVudC5nZXRLZXlDb2RlKCkpIHtcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19QRVJJT0Q6XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0o6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMCwgeTogMX0pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLX0s6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGlyZWN0aW9uUHJlc3NlZCh7eDogMCwgeTogLTF9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFJPVC5WS19IOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLmRpcmVjdGlvblByZXNzZWQoe3g6IC0xLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfTDpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kaXJlY3Rpb25QcmVzc2VkKHt4OiAxLCB5OiAwfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBST1QuVktfMTpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXJlbnQuc2VuZEV2ZW50KCdhdHRlbXB0QWJpbGl0eUZpcmVib2x0Jywge30pXG4gICAgICAgICAgICAgICAgICAgICAgICAudGhlbigocmVzdWx0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ3Jlc3VsdCcsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAuY2F0Y2goKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUk9ULlZLXzI6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGFyZW50LnNlbmRFdmVudCgnYXR0ZW1wdEFiaWxpdHlJY2VMYW5jZScsIHt9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdyZXN1bHQnLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmRlYnVnKCdrZXlDb2RlIG5vdCBtYXRjaGVkJywgZXZlbnQuZ2V0S2V5Q29kZSgpKTtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpcmVjdGlvblByZXNzZWQoZGlyZWN0aW9uOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9KTogUHJvbWlzZTxhbnk+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlPGFueT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbmV3UG9zaXRpb24gPSB0aGlzLmdldFBvc2l0aW9uQWZ0ZXJEaXJlY3Rpb24oZGlyZWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGVudGl0eSA9IHRoaXMubWFwLmdldEVudGl0eUF0KG5ld1Bvc2l0aW9uLngsIG5ld1Bvc2l0aW9uLnkpO1xuICAgICAgICAgICAgaWYgKGVudGl0eSkge1xuICAgICAgICAgICAgICAgIHJlamVjdCgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnBhcmVudC5zZW5kRXZlbnQoJ2F0dGVtcHRNb3ZlJywgZGlyZWN0aW9uKVxuICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0UG9zaXRpb25BZnRlckRpcmVjdGlvbihkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeDogcG9zaXRpb25Db21wb25lbnQuZ2V0WCgpICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgICB5OiBwb3NpdGlvbkNvbXBvbmVudC5nZXRZKCkgKyBkaXJlY3Rpb24ueVxuICAgICAgICB9O1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7TWFwfSBmcm9tICcuLi9NYXAnO1xuaW1wb3J0IHtHYW1lfSBmcm9tICcuLi9HYW1lJztcbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcblxuZXhwb3J0IGNsYXNzIE1lbGVlQXR0YWNrQ29tcG9uZW50IGV4dGVuZHMgQ29tcG9uZW50IHtcbiAgICBtYXA6IE1hcDtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHt9ID0ge30pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgY29uc3QgZ2FtZSA9IG5ldyBHYW1lKCk7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBnYW1lLmdldE1hcCgpO1xuICAgIH1cblxuICAgIHNldExpc3RlbmVycygpIHtcbiAgICAgICAgdGhpcy5wYXJlbnQuYWRkTGlzdGVuZXIoJ2F0dGVtcHRNZWxlZUF0dGFjaycsIHRoaXMuYXR0ZW1wdE1lbGVlQXR0YWNrLmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIGF0dGVtcHRNZWxlZUF0dGFjayhkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICBjb25zdCB0YXJnZXQgPSB0aGlzLm1hcC5nZXRFbnRpdHlBdChwb3NpdGlvbkNvbXBvbmVudC5nZXRYKCkgKyBkaXJlY3Rpb24ueCwgcG9zaXRpb25Db21wb25lbnQuZ2V0WSgpICsgZGlyZWN0aW9uLnkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2codGFyZ2V0KTtcblxuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge0VudGl0eX0gZnJvbSAnLi4vRW50aXR5JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5cbmV4cG9ydCBjbGFzcyBQb3NpdGlvbkNvbXBvbmVudCBleHRlbmRzIENvbXBvbmVudCB7XG4gICAgcHJpdmF0ZSB4OiBudW1iZXI7XG4gICAgcHJpdmF0ZSB5OiBudW1iZXI7XG5cbiAgICBjb25zdHJ1Y3RvcihvcHRpb25zOiB7eDogbnVtYmVyLCB5OiBudW1iZXJ9ID0ge3g6IDAsIHk6IDB9KSB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMueCA9IG9wdGlvbnMueDtcbiAgICAgICAgdGhpcy55ID0gb3B0aW9ucy55O1xuICAgIH1cblxuICAgIGdldFBvc2l0aW9uKCk6IHt4OiBudW1iZXIsIHk6IG51bWJlcn0ge1xuICAgICAgICByZXR1cm4ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcbiAgICB9XG5cbiAgICBnZXRYKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLng7XG4gICAgfVxuXG4gICAgZ2V0WSgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy55O1xuICAgIH1cblxuICAgIHNldFBvc2l0aW9uKHg6IG51bWJlciwgeTogbnVtYmVyKSB7XG4gICAgICAgIHRoaXMueCA9IHg7XG4gICAgICAgIHRoaXMueSA9IHk7XG4gICAgfVxuXG4gICAgc2V0TGlzdGVuZXJzKCkge1xuICAgICAgICB0aGlzLnBhcmVudC5hZGRMaXN0ZW5lcignYXR0ZW1wdE1vdmUnLCB0aGlzLmF0dGVtcHRNb3ZlTGlzdGVuZXIuYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgYXR0ZW1wdE1vdmVMaXN0ZW5lcihkaXJlY3Rpb246IHt4OiBudW1iZXIsIHk6IG51bWJlcn0pOiBQcm9taXNlPGFueT4ge1xuICAgICAgICByZXR1cm4gbmV3IFByb21pc2U8YW55PigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICB2YXIgZyA9IG5ldyBHYW1lKCk7XG4gICAgICAgICAgICB2YXIgcG9zaXRpb24gPSB7XG4gICAgICAgICAgICAgICAgeDogdGhpcy54ICsgZGlyZWN0aW9uLngsXG4gICAgICAgICAgICAgICAgeTogdGhpcy55ICsgZGlyZWN0aW9uLnlcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBnLnNlbmRFdmVudCgnY2FuTW92ZVRvJywgcG9zaXRpb24pXG4gICAgICAgICAgICAgICAgLnRoZW4oKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubW92ZShkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKGRpcmVjdGlvbik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goKHBvc2l0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChkaXJlY3Rpb24pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBkaXN0YW5jZVRvKHg6IG51bWJlciwgeTogbnVtYmVyKTogbnVtYmVyIHtcbiAgICAgICAgY29uc3QgZHggPSBNYXRoLmFicyh4IC0gdGhpcy54KTtcbiAgICAgICAgY29uc3QgZHkgPSBNYXRoLmFicyh5IC0gdGhpcy55KTtcblxuICAgICAgICByZXR1cm4gZHggKyBkeTtcbiAgICB9XG5cbiAgICBtb3ZlKGRpcmVjdGlvbjoge3g6IG51bWJlciwgeTogbnVtYmVyfSkge1xuICAgICAgICB2YXIgb2xkUG9zaXRpb24gPSB7XG4gICAgICAgICAgICB4OiB0aGlzLngsXG4gICAgICAgICAgICB5OiB0aGlzLnlcbiAgICAgICAgfTtcbiAgICAgICAgdGhpcy54ICs9IGRpcmVjdGlvbi54O1xuICAgICAgICB0aGlzLnkgKz0gZGlyZWN0aW9uLnk7XG4gICAgICAgIHZhciBnID0gbmV3IEdhbWUoKTtcbiAgICAgICAgZy5zZW5kRXZlbnQoJ2VudGl0eU1vdmVkJywge2VudGl0eTogdGhpcy5wYXJlbnQsIG9sZFBvc2l0aW9uOiBvbGRQb3NpdGlvbn0pO1xuICAgIH1cbn1cbiIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi90eXBpbmdzL2xpYi5lczYuZC50c1wiIC8+XG5cbmltcG9ydCB7Q29tcG9uZW50fSBmcm9tICcuL0NvbXBvbmVudCc7XG5pbXBvcnQge1Bvc2l0aW9uQ29tcG9uZW50fSBmcm9tICcuL1Bvc2l0aW9uQ29tcG9uZW50JztcbmltcG9ydCB7R2FtZX0gZnJvbSAnLi4vR2FtZSc7XG5pbXBvcnQge01hcH0gZnJvbSAnLi4vTWFwJztcbmltcG9ydCB7RW50aXR5fSBmcm9tICcuLi9FbnRpdHknO1xuXG5leHBvcnQgY2xhc3MgU2lnaHRDb21wb25lbnQgZXh0ZW5kcyBDb21wb25lbnQge1xuICAgIGRpc3RhbmNlOiBudW1iZXI7XG4gICAgdmlzaWJsZUNlbGxzOiB7W3Bvczogc3RyaW5nXTogYm9vbGVhbn07XG4gICAgZ2FtZTogR2FtZTtcbiAgICBoYXNTZWVuQ2VsbHM6IHtbcG9zOiBzdHJpbmddOiBib29sZWFufTtcblxuICAgIGNoZWNrZWRBdFR1cm46IG51bWJlcjtcblxuICAgIGNvbnN0cnVjdG9yKG9wdGlvbnM6IHtkaXN0YW5jZTogbnVtYmVyfSA9IHtkaXN0YW5jZTogNX0pIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5nYW1lID0gbmV3IEdhbWUoKTtcbiAgICAgICAgdGhpcy5kaXN0YW5jZSA9IG9wdGlvbnMuZGlzdGFuY2U7XG4gICAgICAgIHRoaXMudmlzaWJsZUNlbGxzID0ge307XG4gICAgICAgIHRoaXMuaGFzU2VlbkNlbGxzID0ge307XG4gICAgICAgIHRoaXMuY2hlY2tlZEF0VHVybiA9IC0xO1xuICAgIH1cblxuICAgIGdldERpc3RhbmNlKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLmRpc3RhbmNlO1xuICAgIH1cblxuICAgIGdldFZpc2libGVDZWxscygpOiB7W3Bvczogc3RyaW5nXTogYm9vbGVhbn0ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMudmlzaWJsZUNlbGxzO1xuICAgIH1cblxuICAgIGNhblNlZSh4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbkNvbXBvbmVudDogUG9zaXRpb25Db21wb25lbnQgPSA8UG9zaXRpb25Db21wb25lbnQ+dGhpcy5wYXJlbnQuZ2V0Q29tcG9uZW50KCdQb3NpdGlvbkNvbXBvbmVudCcpO1xuICAgICAgICBpZiAocG9zaXRpb25Db21wb25lbnQuZGlzdGFuY2VUbyh4LCB5KSA+IHRoaXMuZGlzdGFuY2UpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5pc1Zpc2libGUoeCwgeSk7XG4gICAgfVxuXG4gICAgaGFzU2Vlbih4OiBudW1iZXIsIHk6IG51bWJlcik6IGJvb2xlYW4ge1xuICAgICAgICB0aGlzLmNvbXB1dGVWaXNpYmxlQ2VsbHMoKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaGFzU2VlbkNlbGxzW3ggKyAnLCcgKyB5XSA9PSB0cnVlO1xuICAgIH1cblxuICAgIGdldFZpc2libGVFbnRpdGllcygpOiBFbnRpdHlbXSB7XG4gICAgICAgIGNvbnN0IHBvc2l0aW9uQ29tcG9uZW50OiBQb3NpdGlvbkNvbXBvbmVudCA9IDxQb3NpdGlvbkNvbXBvbmVudD50aGlzLnBhcmVudC5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgIGNvbnN0IG1hcDogTWFwID0gdGhpcy5nYW1lLmdldE1hcCgpO1xuICAgICAgICByZXR1cm4gbWFwLmdldE5lYXJieUVudGl0aWVzKFxuICAgICAgICAgICAgcG9zaXRpb25Db21wb25lbnQsXG4gICAgICAgICAgICB0aGlzLmRpc3RhbmNlLFxuICAgICAgICAgICAgKGVudGl0eSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVwb3M6IFBvc2l0aW9uQ29tcG9uZW50ID0gPFBvc2l0aW9uQ29tcG9uZW50PmVudGl0eS5nZXRDb21wb25lbnQoJ1Bvc2l0aW9uQ29tcG9uZW50Jyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuaXNWaXNpYmxlKGVwb3MuZ2V0WCgpLCBlcG9zLmdldFkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBpc1Zpc2libGUoeDogbnVtYmVyLCB5OiBudW1iZXIpOiBib29sZWFuIHtcbiAgICAgICAgdGhpcy5jb21wdXRlVmlzaWJsZUNlbGxzKCk7XG4gICAgICAgIHJldHVybiB0aGlzLnZpc2libGVDZWxsc1t4ICsgJywnICsgeV0gPT09IHRydWU7XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBjb21wdXRlVmlzaWJsZUNlbGxzKCk6IHZvaWQge1xuICAgICAgICB2YXIgY3VycmVudFR1cm4gPSB0aGlzLmdhbWUuZ2V0Q3VycmVudFR1cm4oKTtcbiAgICAgICAgaWYgKGN1cnJlbnRUdXJuID09PSB0aGlzLmNoZWNrZWRBdFR1cm4pIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBtYXA6IE1hcCA9IHRoaXMuZ2FtZS5nZXRNYXAoKTtcbiAgICAgICAgdGhpcy52aXNpYmxlQ2VsbHMgPSBtYXAuZ2V0VmlzaWJsZUNlbGxzKHRoaXMucGFyZW50LCB0aGlzLmRpc3RhbmNlKTtcbiAgICAgICAgdGhpcy5oYXNTZWVuQ2VsbHMgPSBPYmplY3QuYXNzaWduKHRoaXMuaGFzU2VlbkNlbGxzLCB0aGlzLnZpc2libGVDZWxscyk7XG4gICAgICAgIHRoaXMuY2hlY2tlZEF0VHVybiA9IGN1cnJlbnRUdXJuO1xuICAgIH1cblxufVxuIiwiaW1wb3J0IHtHYW1lfSBmcm9tICcuL0dhbWUnO1xuXG53aW5kb3cub25sb2FkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGdhbWUgPSBuZXcgR2FtZSgpO1xuICAgIGdhbWUuaW5pdCg5MCwgNTApO1xufVxuXG4iXX0=
