/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var Agent = __webpack_require__(1);
	var TraceUpdatesBackendManager = __webpack_require__(11);
	var Bridge = __webpack_require__(20);
	var inject = __webpack_require__(45);
	var setupRNStyle = __webpack_require__(59);
	var setupHighlighter = __webpack_require__(61);
	var setupRelay = __webpack_require__(66);

	window.addEventListener('message', welcome);
	function welcome(evt) {
	  if (evt.source !== window || evt.data.source !== 'react-devtools-content-script') {
	    return;
	  }

	  window.removeEventListener('message', welcome);
	  setup(window.__REACT_DEVTOOLS_GLOBAL_HOOK__);
	}

	function setup(hook) {
	  var listeners = [];

	  var wall = {
	    listen: function listen(fn) {
	      var listener = function listener(evt) {
	        if (evt.source !== window || !evt.data || evt.data.source !== 'react-devtools-content-script' || !evt.data.payload) {
	          return;
	        }
	        fn(evt.data.payload);
	      };
	      listeners.push(listener);
	      window.addEventListener('message', listener);
	    },
	    send: function send(data) {
	      window.postMessage({
	        source: 'react-devtools-bridge',
	        payload: data
	      }, '*');
	    }
	  };

	  // Note: this is only useful for react-native-web (and equivalents).
	  // They would have to set this field directly on the hook.
	  var isRNStyleEnabled = !!hook.resolveRNStyle;

	  var bridge = new Bridge(wall);
	  var agent = new Agent(window, {
	    rnStyle: isRNStyleEnabled
	  });
	  agent.addBridge(bridge);

	  agent.once('connected', function () {
	    inject(hook, agent);
	  });

	  if (isRNStyleEnabled) {
	    setupRNStyle(bridge, agent, hook.resolveRNStyle);
	  }

	  setupRelay(bridge, agent, hook);

	  agent.on('shutdown', function () {
	    hook.emit('shutdown');
	    listeners.forEach(function (fn) {
	      window.removeEventListener('message', fn);
	    });
	    listeners = [];
	  });

	  setupHighlighter(agent);
	  TraceUpdatesBackendManager.init(agent);
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create, Map, WeakMap, Set) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = __webpack_provided_Object_dot_create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var _require = __webpack_require__(6),
	    EventEmitter = _require.EventEmitter;

	var assign = __webpack_require__(7);
	var nullthrows = __webpack_require__(8).default;
	var guid = __webpack_require__(9);
	var getIn = __webpack_require__(10);

	/**
	 * The agent lives on the page in the same context as React, observes events
	 * from the `backend`, and communicates (via a `Bridge`) with the frontend.
	 *
	 * It is responsible for generating string IDs (ElementID) for each react
	 * element, maintaining a mapping of those IDs to elements, handling messages
	 * from the frontend, and translating between react elements and native
	 * handles.
	 *
	 *
	 *   React
	 *     |
	 *     v
	 *  backend
	 *     |
	 *     v
	 *  -----------
	 * | **Agent** |
	 *  -----------
	 *     ^
	 *     |
	 *     v
	 *  (Bridge)
	 *     ^
	 *     |
	 * serialization
	 *     |
	 *     v
	 *  (Bridge)
	 *     ^
	 *     |
	 *     v
	 *  ----------------
	 * | Frontend Store |
	 *  ----------------
	 *
	 *
	 * Events from the `backend`:
	 * - root (got a root)
	 * - mount (a component mounted)
	 * - update (a component updated)
	 * - unmount (a component mounted)
	 *
	 * Events from the `frontend` Store:
	 * - see `addBridge` for subscriptions
	 *
	 * Events that Agent fires:
	 * - selected
	 * - hideHighlight
	 * - startInspecting
	 * - stopInspecting
	 * - shutdown
	 * - highlight /highlightMany
	 * - setSelection
	 * - root
	 * - mount
	 * - update
	 * - unmount
	 */
	var Agent = function (_EventEmitter) {
	  _inherits(Agent, _EventEmitter);

	  // the window or global -> used to "make a value available in the console"
	  function Agent(global, capabilities) {
	    _classCallCheck(this, Agent);

	    var _this = _possibleConstructorReturn(this, (Agent.__proto__ || Object.getPrototypeOf(Agent)).call(this));

	    _this.global = global;
	    _this.internalInstancesById = new Map();
	    _this.idsByInternalInstances = new WeakMap();
	    _this.renderers = new Map();
	    _this.elementData = new Map();
	    _this.roots = new Set();
	    _this.reactInternals = {};
	    var lastSelected;
	    _this.on('selected', function (id) {
	      var data = _this.elementData.get(id);
	      if (data && data.publicInstance && _this.global.$r === lastSelected) {
	        _this.global.$r = data.publicInstance;
	        lastSelected = data.publicInstance;
	      }
	    });
	    _this._prevSelected = null;
	    _this._scrollUpdate = false;
	    var isReactDOM = window.document && typeof window.document.createElement === 'function';
	    _this.capabilities = assign({
	      scroll: isReactDOM && typeof window.document.body.scrollIntoView === 'function',
	      dom: isReactDOM,
	      editTextContent: false
	    }, capabilities);

	    if (isReactDOM) {
	      _this._updateScroll = _this._updateScroll.bind(_this);
	      window.addEventListener('scroll', _this._onScroll.bind(_this), true);
	      window.addEventListener('click', _this._onClick.bind(_this), true);
	      window.addEventListener('mouseover', _this._onMouseOver.bind(_this), true);
	      window.addEventListener('resize', _this._onResize.bind(_this), true);
	    }
	    return _this;
	  }

	  // returns an "unsubscribe" function


	  _createClass(Agent, [{
	    key: 'sub',
	    value: function sub(ev, fn) {
	      var _this2 = this;

	      this.on(ev, fn);
	      return function () {
	        _this2.removeListener(ev, fn);
	      };
	    }
	  }, {
	    key: 'setReactInternals',
	    value: function setReactInternals(renderer, reactInternals) {
	      this.reactInternals[renderer] = reactInternals;
	    }
	  }, {
	    key: 'addBridge',
	    value: function addBridge(bridge) {
	      var _this3 = this;

	      /** Events received from the frontend **/
	      // the initial handshake
	      bridge.on('requestCapabilities', function () {
	        bridge.send('capabilities', _this3.capabilities);
	        _this3.emit('connected');
	      });
	      bridge.on('setState', this._setState.bind(this));
	      bridge.on('setProps', this._setProps.bind(this));
	      bridge.on('setContext', this._setContext.bind(this));
	      bridge.on('makeGlobal', this._makeGlobal.bind(this));
	      bridge.on('highlight', function (id) {
	        return _this3.highlight(id);
	      });
	      bridge.on('highlightMany', function (id) {
	        return _this3.highlightMany(id);
	      });
	      bridge.on('hideHighlight', function () {
	        return _this3.emit('hideHighlight');
	      });
	      bridge.on('startInspecting', function () {
	        return _this3.emit('startInspecting');
	      });
	      bridge.on('stopInspecting', function () {
	        return _this3.emit('stopInspecting');
	      });
	      bridge.on('selected', function (id) {
	        return _this3.emit('selected', id);
	      });
	      bridge.on('setInspectEnabled', function (enabled) {
	        _this3._inspectEnabled = enabled;
	        _this3.emit('stopInspecting');
	      });
	      bridge.on('shutdown', function () {
	        return _this3.emit('shutdown');
	      });
	      bridge.on('changeTextContent', function (_ref) {
	        var id = _ref.id,
	            text = _ref.text;

	        var node = _this3.getNodeForID(id);
	        if (!node) {
	          return;
	        }
	        node.textContent = text;
	      });
	      // used to "inspect node in Elements pane"
	      bridge.on('putSelectedNode', function (id) {
	        window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node = _this3.getNodeForID(id);
	      });
	      // used to "view source in Sources pane"
	      bridge.on('putSelectedInstance', function (id) {
	        var node = _this3.elementData.get(id);
	        if (node) {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$type = node.type;
	        } else {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$type = null;
	        }
	        if (node && node.publicInstance) {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = node.publicInstance;
	        } else {
	          window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$inst = null;
	        }
	      });
	      // used to select the inspected node ($0)
	      bridge.on('checkSelection', function () {
	        var newSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$0;
	        if (newSelected !== _this3._prevSelected) {
	          _this3._prevSelected = newSelected;
	          var sentSelected = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.$node;
	          if (newSelected !== sentSelected) {
	            _this3.selectFromDOMNode(newSelected, true);
	          }
	        }
	      });
	      bridge.on('scrollToNode', function (id) {
	        return _this3.scrollToNode(id);
	      });
	      bridge.on('traceupdatesstatechange', function (value) {
	        return _this3.emit('traceupdatesstatechange', value);
	      });
	      bridge.on('colorizerchange', function (value) {
	        return _this3.emit('colorizerchange', value);
	      });

	      /** Events sent to the frontend **/
	      this.on('root', function (id) {
	        return bridge.send('root', id);
	      });
	      this.on('mount', function (data) {
	        return bridge.send('mount', data);
	      });
	      this.on('update', function (data) {
	        return bridge.send('update', data);
	      });
	      this.on('unmount', function (id) {
	        bridge.send('unmount', id);
	        // once an element has been unmounted, the bridge doesn't need to be
	        // able to inspect it anymore.
	        bridge.forget(id);
	      });
	      this.on('setSelection', function (data) {
	        return bridge.send('select', data);
	      });
	      this.on('setInspectEnabled', function (data) {
	        return bridge.send('setInspectEnabled', data);
	      });
	    }
	  }, {
	    key: 'scrollToNode',
	    value: function scrollToNode(id) {
	      var node = this.getNodeForID(id);
	      if (!node) {
	        console.warn('unable to get the node for scrolling');
	        return;
	      }
	      var domElement = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
	      if (!domElement) {
	        console.warn('unable to get the domElement for scrolling');
	        return;
	      }

	      if (typeof domElement.scrollIntoViewIfNeeded === 'function') {
	        domElement.scrollIntoViewIfNeeded();
	      } else if (typeof domElement.scrollIntoView === 'function') {
	        domElement.scrollIntoView();
	      }
	      this.highlight(id);
	    }
	  }, {
	    key: 'highlight',
	    value: function highlight(id) {
	      var data = this.elementData.get(id);
	      var node = this.getNodeForID(id);
	      if (data && node) {
	        this.emit('highlight', { node: node, name: data.name, props: data.props });
	      }
	    }
	  }, {
	    key: 'highlightMany',
	    value: function highlightMany(ids) {
	      var _this4 = this;

	      var nodes = [];
	      ids.forEach(function (id) {
	        var node = _this4.getNodeForID(id);
	        if (node) {
	          nodes.push(node);
	        }
	      });
	      if (nodes.length) {
	        this.emit('highlightMany', nodes);
	      }
	    }
	  }, {
	    key: 'getNodeForID',
	    value: function getNodeForID(id) {
	      var component = this.internalInstancesById.get(id);
	      if (!component) {
	        return null;
	      }
	      var renderer = this.renderers.get(id);
	      if (renderer && this.reactInternals[renderer].getNativeFromReactElement) {
	        return this.reactInternals[renderer].getNativeFromReactElement(component);
	      }
	      return null;
	    }
	  }, {
	    key: 'selectFromDOMNode',
	    value: function selectFromDOMNode(node, quiet) {
	      var offsetFromLeaf = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

	      var id = this.getIDForNode(node);
	      if (!id) {
	        return;
	      }
	      this.emit('setSelection', { id: id, quiet: quiet, offsetFromLeaf: offsetFromLeaf });
	    }

	    // TODO: remove this method because it's breaking encapsulation.
	    // It was used by RN inspector but this required leaking Fibers to it.
	    // RN inspector will use selectFromDOMNode() instead now.
	    // Remove this method in a few months after this comment was added.

	  }, {
	    key: 'selectFromReactInstance',
	    value: function selectFromReactInstance(instance, quiet) {
	      var id = this.getId(instance);
	      if (!id) {
	        console.log('no instance id', instance);
	        return;
	      }
	      this.emit('setSelection', { id: id, quiet: quiet });
	    }
	  }, {
	    key: 'getIDForNode',
	    value: function getIDForNode(node) {
	      if (!this.reactInternals) {
	        return null;
	      }
	      var component;
	      for (var renderer in this.reactInternals) {
	        // If a renderer doesn't know about a reactId, it will throw an error.
	        try {
	          // $FlowFixMe possibly null - it's not null
	          component = this.reactInternals[renderer].getReactElementFromNative(node);
	        } catch (e) {}
	        if (component) {
	          return this.getId(component);
	        }
	      }
	      return null;
	    }
	  }, {
	    key: '_setProps',
	    value: function _setProps(_ref2) {
	      var id = _ref2.id,
	          path = _ref2.path,
	          value = _ref2.value;

	      var data = this.elementData.get(id);
	      if (data && data.updater && typeof data.updater.setInProps === 'function') {
	        data.updater.setInProps(path, value);
	      } else {
	        console.warn("trying to set props on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_setState',
	    value: function _setState(_ref3) {
	      var id = _ref3.id,
	          path = _ref3.path,
	          value = _ref3.value;

	      var data = this.elementData.get(id);
	      if (data && data.updater && typeof data.updater.setInState === 'function') {
	        data.updater.setInState(path, value);
	      } else {
	        console.warn("trying to set state on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_setContext',
	    value: function _setContext(_ref4) {
	      var id = _ref4.id,
	          path = _ref4.path,
	          value = _ref4.value;

	      var data = this.elementData.get(id);
	      if (data && data.updater && typeof data.updater.setInContext === 'function') {
	        // $FlowFixMe
	        data.updater.setInContext(path, value);
	      } else {
	        console.warn("trying to set context on a component that doesn't support it");
	      }
	    }
	  }, {
	    key: '_makeGlobal',
	    value: function _makeGlobal(_ref5) {
	      var id = _ref5.id,
	          path = _ref5.path;

	      var data = this.elementData.get(id);
	      if (!data) {
	        return;
	      }
	      var value;
	      if (path === 'instance') {
	        value = data.publicInstance;
	      } else {
	        value = getIn(data, path);
	      }
	      this.global.$tmp = value;
	      console.log('$tmp =', value);
	    }
	  }, {
	    key: 'getId',
	    value: function getId(internalInstance) {
	      if ((typeof internalInstance === 'undefined' ? 'undefined' : _typeof(internalInstance)) !== 'object' || !internalInstance) {
	        return internalInstance;
	      }
	      if (!this.idsByInternalInstances.has(internalInstance)) {
	        this.idsByInternalInstances.set(internalInstance, guid());
	        this.internalInstancesById.set(nullthrows(this.idsByInternalInstances.get(internalInstance)), internalInstance);
	      }
	      return nullthrows(this.idsByInternalInstances.get(internalInstance));
	    }
	  }, {
	    key: 'addRoot',
	    value: function addRoot(renderer, internalInstance) {
	      var id = this.getId(internalInstance);
	      this.roots.add(id);
	      this.emit('root', id);
	    }
	  }, {
	    key: 'onMounted',
	    value: function onMounted(renderer, component, data) {
	      var _this5 = this;

	      var id = this.getId(component);
	      this.renderers.set(id, renderer);
	      this.elementData.set(id, data);

	      var send = assign({}, data);
	      if (send.children && send.children.map) {
	        send.children = send.children.map(function (c) {
	          return _this5.getId(c);
	        });
	      }
	      send.id = id;
	      send.canUpdate = send.updater && !!send.updater.forceUpdate;
	      delete send.type;
	      delete send.updater;
	      this.emit('mount', send);
	    }
	  }, {
	    key: 'onUpdated',
	    value: function onUpdated(component, data) {
	      var _this6 = this;

	      var id = this.getId(component);
	      this.elementData.set(id, data);

	      var send = assign({}, data);
	      if (send.children && send.children.map) {
	        send.children = send.children.map(function (c) {
	          return _this6.getId(c);
	        });
	      }
	      send.id = id;
	      send.canUpdate = send.updater && !!send.updater.forceUpdate;
	      delete send.type;
	      delete send.updater;
	      this.emit('update', send);
	    }
	  }, {
	    key: 'onUnmounted',
	    value: function onUnmounted(component) {
	      var id = this.getId(component);
	      this.elementData.delete(id);
	      this.roots.delete(id);
	      this.renderers.delete(id);
	      this.emit('unmount', id);
	      this.idsByInternalInstances.delete(component);
	    }
	  }, {
	    key: '_onScroll',
	    value: function _onScroll() {
	      if (!this._scrollUpdate) {
	        this._scrollUpdate = true;
	        window.requestAnimationFrame(this._updateScroll);
	      }
	    }
	  }, {
	    key: '_updateScroll',
	    value: function _updateScroll() {
	      this.emit('refreshMultiOverlay');
	      this.emit('stopInspecting');
	      this._scrollUpdate = false;
	    }
	  }, {
	    key: '_onClick',
	    value: function _onClick(event) {
	      if (!this._inspectEnabled) {
	        return;
	      }

	      var id = this.getIDForNode(event.target);
	      if (!id) {
	        return;
	      }

	      event.stopPropagation();
	      event.preventDefault();

	      this.emit('setSelection', { id: id });
	      this.emit('setInspectEnabled', false);
	    }
	  }, {
	    key: '_onMouseOver',
	    value: function _onMouseOver(event) {
	      if (this._inspectEnabled) {
	        var id = this.getIDForNode(event.target);
	        if (!id) {
	          return;
	        }

	        this.highlight(id);
	      }
	    }
	  }, {
	    key: '_onResize',
	    value: function _onResize(event) {
	      this.emit('stopInspecting');
	    }
	  }]);

	  return Agent;
	}(EventEmitter);

	module.exports = Agent;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(3), __webpack_require__(4), __webpack_require__(5)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	module.exports = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeObjectCreate;

/***/ },
/* 3 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	'use strict';

	module.exports = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeMap;

/***/ },
/* 4 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	'use strict';

	module.exports = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeWeakMap;

/***/ },
/* 5 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */
	'use strict';

	module.exports = window.__REACT_DEVTOOLS_GLOBAL_HOOK__.nativeSet;

/***/ },
/* 6 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 7 */
/***/ function(module, exports) {

	/* eslint-disable no-unused-vars */
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty;
	var propIsEnumerable = Object.prototype.propertyIsEnumerable;

	function toObject(val) {
		if (val === null || val === undefined) {
			throw new TypeError('Object.assign cannot be called with null or undefined');
		}

		return Object(val);
	}

	module.exports = Object.assign || function (target, source) {
		var from;
		var to = toObject(target);
		var symbols;

		for (var s = 1; s < arguments.length; s++) {
			from = Object(arguments[s]);

			for (var key in from) {
				if (hasOwnProperty.call(from, key)) {
					to[key] = from[key];
				}
			}

			if (Object.getOwnPropertySymbols) {
				symbols = Object.getOwnPropertySymbols(from);
				for (var i = 0; i < symbols.length; i++) {
					if (propIsEnumerable.call(from, symbols[i])) {
						to[symbols[i]] = from[symbols[i]];
					}
				}
			}
		}

		return to;
	};


/***/ },
/* 8 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {value: true});

	exports.default = function nullthrows(x) {
	  if (x != null) {
	    return x;
	  }
	  throw new Error('Got unexpected null or undefined');
	};


/***/ },
/* 9 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	function guid() {
	  return 'g' + Math.random().toString(16).substr(2);
	}

	module.exports = guid;

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 */

	/**
	 * Retrieves the value from the path of nested objects
	 * @param  {Object} base Base or root object for path
	 * @param  {Array<String>} path nested path
	 * @return {any}      Value at end of path or `mull`
	 */
	function getIn(base, path) {
	  return path.reduce(function (obj, attr) {
	    if (obj) {
	      if (obj.hasOwnProperty(attr)) {
	        return obj[attr];
	      }
	      if (typeof obj[Symbol.iterator] === 'function') {
	        // Convert iterable to array and return array[index]
	        return [].concat(_toConsumableArray(obj))[attr];
	      }
	    }

	    return null;
	  }, base);
	}

	module.exports = getIn;

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var TraceUpdatesAbstractNodeMeasurer = __webpack_require__(12);
	var TraceUpdatesAbstractNodePresenter = __webpack_require__(17);
	var TraceUpdatesWebNodeMeasurer = __webpack_require__(18);
	var TraceUpdatesWebNodePresenter = __webpack_require__(19);

	var NODE_TYPE_COMPOSITE = 'Composite';
	var NODE_TYPE_SPECIAL = 'Special';

	var TraceUpdatesBackendManager = function () {
	  function TraceUpdatesBackendManager(agent) {
	    _classCallCheck(this, TraceUpdatesBackendManager);

	    this._onMeasureNode = this._onMeasureNode.bind(this);

	    var useDOM = agent.capabilities.dom;

	    this._measurer = useDOM ? new TraceUpdatesWebNodeMeasurer() : new TraceUpdatesAbstractNodeMeasurer();

	    this._presenter = useDOM ? new TraceUpdatesWebNodePresenter() : new TraceUpdatesAbstractNodePresenter();

	    this._isActive = false;
	    agent.on('traceupdatesstatechange', this._onTraceUpdatesStateChange.bind(this));
	    agent.on('update', this._onUpdate.bind(this, agent));
	    agent.on('shutdown', this._shutdown.bind(this));
	  }

	  _createClass(TraceUpdatesBackendManager, [{
	    key: '_onUpdate',
	    value: function _onUpdate(agent, obj) {
	      if (!this._isActive || !obj.id) {
	        return;
	      }

	      // Highlighting every host node would be too noisy.
	      // We highlight user components and context consumers
	      // (without consumers, a context update that renders
	      // only host nodes directly wouldn't highlight at all).
	      var shouldHighlight = obj.nodeType === NODE_TYPE_COMPOSITE || obj.nodeType === NODE_TYPE_SPECIAL && obj.name === 'Context.Consumer';
	      if (!shouldHighlight) {
	        return;
	      }

	      var node = agent.getNodeForID(obj.id);
	      if (!node) {
	        return;
	      }

	      this._measurer.request(node, this._onMeasureNode);
	    }
	  }, {
	    key: '_onMeasureNode',
	    value: function _onMeasureNode(measurement) {
	      this._presenter.present(measurement);
	    }
	  }, {
	    key: '_onTraceUpdatesStateChange',
	    value: function _onTraceUpdatesStateChange(state) {
	      this._isActive = state.enabled;
	      this._presenter.setEnabled(state.enabled);
	    }
	  }, {
	    key: '_shutdown',
	    value: function _shutdown() {
	      this._isActive = false;
	      this._presenter.setEnabled(false);
	    }
	  }]);

	  return TraceUpdatesBackendManager;
	}();

	function init(agent) {
	  return new TraceUpdatesBackendManager(agent);
	}

	module.exports = {
	  init: init
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var requestAnimationFrame = __webpack_require__(13);
	var immutable = __webpack_require__(16);

	// How long the measurement can be cached in ms.
	var DURATION = 800;

	var Record = immutable.Record,
	    Map = immutable.Map,
	    Set = immutable.Set;


	var MeasurementRecord = Record({
	  bottom: 0,
	  expiration: 0,
	  height: 0,
	  id: '',
	  left: 0,
	  right: 0,
	  scrollX: 0,
	  scrollY: 0,
	  top: 0,
	  width: 0
	});

	var _id = 100;

	var TraceUpdatesAbstractNodeMeasurer = function () {
	  function TraceUpdatesAbstractNodeMeasurer() {
	    _classCallCheck(this, TraceUpdatesAbstractNodeMeasurer);

	    // pending nodes to measure.
	    this._nodes = new Map();

	    // ids of pending nodes.
	    this._ids = new Map();

	    // cached measurements.
	    this._measurements = new Map();

	    // callbacks for pending nodes.
	    this._callbacks = new Map();

	    this._isRequesting = false;

	    // non-auto-binds.
	    this._measureNodes = this._measureNodes.bind(this);
	  }

	  _createClass(TraceUpdatesAbstractNodeMeasurer, [{
	    key: 'request',
	    value: function request(node, callback) {
	      var requestID = this._nodes.has(node) ? this._nodes.get(node) : String(_id++);

	      this._nodes = this._nodes.set(node, requestID);
	      this._ids = this._ids.set(requestID, node);

	      var callbacks = this._callbacks.has(node) ? this._callbacks.get(node) : new Set();

	      callbacks = callbacks.add(callback);
	      this._callbacks = this._callbacks.set(node, callbacks);

	      if (this._isRequesting) {
	        return requestID;
	      }

	      this._isRequesting = true;
	      requestAnimationFrame(this._measureNodes);
	      return requestID;
	    }
	  }, {
	    key: 'cancel',
	    value: function cancel(requestID) {
	      if (this._ids.has(requestID)) {
	        var node = this._ids.get(requestID);
	        this._ids = this._ids.delete(requestID);
	        this._nodes = this._nodes.delete(node);
	        this._callbacks = this._callbacks.delete(node);
	      }
	    }
	  }, {
	    key: 'measureImpl',
	    value: function measureImpl(node) {
	      // sub-class must overwrite this.
	      return new MeasurementRecord();
	    }
	  }, {
	    key: '_measureNodes',
	    value: function _measureNodes() {
	      var _this = this;

	      var now = Date.now();

	      this._measurements = this._measurements.withMutations(function (_measurements) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = _this._nodes.keys()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var node = _step.value;

	            var measurement = _this._measureNode(now, node);
	            // cache measurement.
	            _measurements.set(node, measurement);
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	      });

	      // execute callbacks.
	      var _iteratorNormalCompletion2 = true;
	      var _didIteratorError2 = false;
	      var _iteratorError2 = undefined;

	      try {
	        var _loop = function _loop() {
	          var node = _step2.value;

	          var measurement = _this._measurements.get(node);
	          _this._callbacks.get(node).forEach(function (callback) {
	            return callback(measurement);
	          });
	        };

	        for (var _iterator2 = this._nodes.keys()[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	          _loop();
	        }

	        // clear stale measurement.
	      } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion2 && _iterator2.return) {
	            _iterator2.return();
	          }
	        } finally {
	          if (_didIteratorError2) {
	            throw _iteratorError2;
	          }
	        }
	      }

	      this._measurements = this._measurements.withMutations(function (_measurements) {
	        var _iteratorNormalCompletion3 = true;
	        var _didIteratorError3 = false;
	        var _iteratorError3 = undefined;

	        try {
	          for (var _iterator3 = _measurements.entries()[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var _step3$value = _slicedToArray(_step3.value, 2),
	                node = _step3$value[0],
	                measurement = _step3$value[1];

	            if (measurement.expiration < now) {
	              _measurements.delete(node);
	            }
	          }
	        } catch (err) {
	          _didIteratorError3 = true;
	          _iteratorError3 = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	              _iterator3.return();
	            }
	          } finally {
	            if (_didIteratorError3) {
	              throw _iteratorError3;
	            }
	          }
	        }
	      });

	      this._ids = this._ids.clear();
	      this._nodes = this._nodes.clear();
	      this._callbacks = this._callbacks.clear();
	      this._isRequesting = false;
	    }
	  }, {
	    key: '_measureNode',
	    value: function _measureNode(timestamp, node) {
	      var measurement;
	      var data;

	      if (this._measurements.has(node)) {
	        measurement = this._measurements.get(node);
	        if (measurement.expiration < timestamp) {
	          // measurement expires. measure again.
	          data = this.measureImpl(node);
	          measurement = measurement.merge(_extends({}, data, {
	            expiration: timestamp + DURATION
	          }));
	        }
	      } else {
	        data = this.measureImpl(node);
	        measurement = new MeasurementRecord(_extends({}, data, {
	          expiration: timestamp + DURATION,
	          id: 'm_' + String(_id++)
	        }));
	      }
	      return measurement;
	    }
	  }]);

	  return TraceUpdatesAbstractNodeMeasurer;
	}();

	module.exports = TraceUpdatesAbstractNodeMeasurer;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule requestAnimationFrame
	 */

	'use strict';

	var emptyFunction = __webpack_require__(14);
	var nativeRequestAnimationFrame = __webpack_require__(15);

	var lastTime = 0;

	var requestAnimationFrame = nativeRequestAnimationFrame || function (callback) {
	  var currTime = Date.now();
	  var timeDelay = Math.max(0, 16 - (currTime - lastTime));
	  lastTime = currTime + timeDelay;
	  return global.setTimeout(function () {
	    callback(Date.now());
	  }, timeDelay);
	};

	// Works around a rare bug in Safari 6 where the first request is never invoked.
	requestAnimationFrame(emptyFunction);

	module.exports = requestAnimationFrame;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 14 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule emptyFunction
	 */

	"use strict";

	function makeEmptyFunction(arg) {
	  return function () {
	    return arg;
	  };
	}

	/**
	 * This function accepts and discards inputs; it has no side effects. This is
	 * primarily useful idiomatically for overridable function endpoints which
	 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
	 */
	function emptyFunction() {}

	emptyFunction.thatReturns = makeEmptyFunction;
	emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
	emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
	emptyFunction.thatReturnsNull = makeEmptyFunction(null);
	emptyFunction.thatReturnsThis = function () {
	  return this;
	};
	emptyFunction.thatReturnsArgument = function (arg) {
	  return arg;
	};

	module.exports = emptyFunction;

/***/ },
/* 15 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule nativeRequestAnimationFrame
	 */

	"use strict";

	var nativeRequestAnimationFrame = global.requestAnimationFrame || global.webkitRequestAnimationFrame || global.mozRequestAnimationFrame || global.oRequestAnimationFrame || global.msRequestAnimationFrame;

	module.exports = nativeRequestAnimationFrame;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create, WeakMap, Map, Set) {/**
	 *  Copyright (c) 2014-2015, Facebook, Inc.
	 *  All rights reserved.
	 *
	 *  This source code is licensed under the BSD-style license found in the
	 *  LICENSE file in the root directory of this source tree. An additional grant
	 *  of patent rights can be found in the PATENTS file in the same directory.
	 */

	(function (global, factory) {
	   true ? module.exports = factory() :
	  typeof define === 'function' && define.amd ? define(factory) :
	  global.Immutable = factory();
	}(this, function () { 'use strict';var SLICE$0 = Array.prototype.slice;

	  function createClass(ctor, superClass) {
	    if (superClass) {
	      ctor.prototype = __webpack_provided_Object_dot_create(superClass.prototype);
	    }
	    ctor.prototype.constructor = ctor;
	  }

	  function Iterable(value) {
	      return isIterable(value) ? value : Seq(value);
	    }


	  createClass(KeyedIterable, Iterable);
	    function KeyedIterable(value) {
	      return isKeyed(value) ? value : KeyedSeq(value);
	    }


	  createClass(IndexedIterable, Iterable);
	    function IndexedIterable(value) {
	      return isIndexed(value) ? value : IndexedSeq(value);
	    }


	  createClass(SetIterable, Iterable);
	    function SetIterable(value) {
	      return isIterable(value) && !isAssociative(value) ? value : SetSeq(value);
	    }



	  function isIterable(maybeIterable) {
	    return !!(maybeIterable && maybeIterable[IS_ITERABLE_SENTINEL]);
	  }

	  function isKeyed(maybeKeyed) {
	    return !!(maybeKeyed && maybeKeyed[IS_KEYED_SENTINEL]);
	  }

	  function isIndexed(maybeIndexed) {
	    return !!(maybeIndexed && maybeIndexed[IS_INDEXED_SENTINEL]);
	  }

	  function isAssociative(maybeAssociative) {
	    return isKeyed(maybeAssociative) || isIndexed(maybeAssociative);
	  }

	  function isOrdered(maybeOrdered) {
	    return !!(maybeOrdered && maybeOrdered[IS_ORDERED_SENTINEL]);
	  }

	  Iterable.isIterable = isIterable;
	  Iterable.isKeyed = isKeyed;
	  Iterable.isIndexed = isIndexed;
	  Iterable.isAssociative = isAssociative;
	  Iterable.isOrdered = isOrdered;

	  Iterable.Keyed = KeyedIterable;
	  Iterable.Indexed = IndexedIterable;
	  Iterable.Set = SetIterable;


	  var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
	  var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
	  var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
	  var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

	  // Used for setting prototype methods that IE8 chokes on.
	  var DELETE = 'delete';

	  // Constants describing the size of trie nodes.
	  var SHIFT = 5; // Resulted in best performance after ______?
	  var SIZE = 1 << SHIFT;
	  var MASK = SIZE - 1;

	  // A consistent shared value representing "not set" which equals nothing other
	  // than itself, and nothing that could be provided externally.
	  var NOT_SET = {};

	  // Boolean references, Rough equivalent of `bool &`.
	  var CHANGE_LENGTH = { value: false };
	  var DID_ALTER = { value: false };

	  function MakeRef(ref) {
	    ref.value = false;
	    return ref;
	  }

	  function SetRef(ref) {
	    ref && (ref.value = true);
	  }

	  // A function which returns a value representing an "owner" for transient writes
	  // to tries. The return value will only ever equal itself, and will not equal
	  // the return of any subsequent call of this function.
	  function OwnerID() {}

	  // http://jsperf.com/copy-array-inline
	  function arrCopy(arr, offset) {
	    offset = offset || 0;
	    var len = Math.max(0, arr.length - offset);
	    var newArr = new Array(len);
	    for (var ii = 0; ii < len; ii++) {
	      newArr[ii] = arr[ii + offset];
	    }
	    return newArr;
	  }

	  function ensureSize(iter) {
	    if (iter.size === undefined) {
	      iter.size = iter.__iterate(returnTrue);
	    }
	    return iter.size;
	  }

	  function wrapIndex(iter, index) {
	    // This implements "is array index" which the ECMAString spec defines as:
	    //
	    //     A String property name P is an array index if and only if
	    //     ToString(ToUint32(P)) is equal to P and ToUint32(P) is not equal
	    //     to 2^32−1.
	    //
	    // http://www.ecma-international.org/ecma-262/6.0/#sec-array-exotic-objects
	    if (typeof index !== 'number') {
	      var uint32Index = index >>> 0; // N >>> 0 is shorthand for ToUint32
	      if ('' + uint32Index !== index || uint32Index === 4294967295) {
	        return NaN;
	      }
	      index = uint32Index;
	    }
	    return index < 0 ? ensureSize(iter) + index : index;
	  }

	  function returnTrue() {
	    return true;
	  }

	  function wholeSlice(begin, end, size) {
	    return (begin === 0 || (size !== undefined && begin <= -size)) &&
	      (end === undefined || (size !== undefined && end >= size));
	  }

	  function resolveBegin(begin, size) {
	    return resolveIndex(begin, size, 0);
	  }

	  function resolveEnd(end, size) {
	    return resolveIndex(end, size, size);
	  }

	  function resolveIndex(index, size, defaultIndex) {
	    return index === undefined ?
	      defaultIndex :
	      index < 0 ?
	        Math.max(0, size + index) :
	        size === undefined ?
	          index :
	          Math.min(size, index);
	  }

	  /* global Symbol */

	  var ITERATE_KEYS = 0;
	  var ITERATE_VALUES = 1;
	  var ITERATE_ENTRIES = 2;

	  var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	  var FAUX_ITERATOR_SYMBOL = '@@iterator';

	  var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


	  function Iterator(next) {
	      this.next = next;
	    }

	    Iterator.prototype.toString = function() {
	      return '[Iterator]';
	    };


	  Iterator.KEYS = ITERATE_KEYS;
	  Iterator.VALUES = ITERATE_VALUES;
	  Iterator.ENTRIES = ITERATE_ENTRIES;

	  Iterator.prototype.inspect =
	  Iterator.prototype.toSource = function () { return this.toString(); }
	  Iterator.prototype[ITERATOR_SYMBOL] = function () {
	    return this;
	  };


	  function iteratorValue(type, k, v, iteratorResult) {
	    var value = type === 0 ? k : type === 1 ? v : [k, v];
	    iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
	      value: value, done: false
	    });
	    return iteratorResult;
	  }

	  function iteratorDone() {
	    return { value: undefined, done: true };
	  }

	  function hasIterator(maybeIterable) {
	    return !!getIteratorFn(maybeIterable);
	  }

	  function isIterator(maybeIterator) {
	    return maybeIterator && typeof maybeIterator.next === 'function';
	  }

	  function getIterator(iterable) {
	    var iteratorFn = getIteratorFn(iterable);
	    return iteratorFn && iteratorFn.call(iterable);
	  }

	  function getIteratorFn(iterable) {
	    var iteratorFn = iterable && (
	      (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
	      iterable[FAUX_ITERATOR_SYMBOL]
	    );
	    if (typeof iteratorFn === 'function') {
	      return iteratorFn;
	    }
	  }

	  function isArrayLike(value) {
	    return value && typeof value.length === 'number';
	  }

	  createClass(Seq, Iterable);
	    function Seq(value) {
	      return value === null || value === undefined ? emptySequence() :
	        isIterable(value) ? value.toSeq() : seqFromValue(value);
	    }

	    Seq.of = function(/*...values*/) {
	      return Seq(arguments);
	    };

	    Seq.prototype.toSeq = function() {
	      return this;
	    };

	    Seq.prototype.toString = function() {
	      return this.__toString('Seq {', '}');
	    };

	    Seq.prototype.cacheResult = function() {
	      if (!this._cache && this.__iterateUncached) {
	        this._cache = this.entrySeq().toArray();
	        this.size = this._cache.length;
	      }
	      return this;
	    };

	    // abstract __iterateUncached(fn, reverse)

	    Seq.prototype.__iterate = function(fn, reverse) {
	      return seqIterate(this, fn, reverse, true);
	    };

	    // abstract __iteratorUncached(type, reverse)

	    Seq.prototype.__iterator = function(type, reverse) {
	      return seqIterator(this, type, reverse, true);
	    };



	  createClass(KeyedSeq, Seq);
	    function KeyedSeq(value) {
	      return value === null || value === undefined ?
	        emptySequence().toKeyedSeq() :
	        isIterable(value) ?
	          (isKeyed(value) ? value.toSeq() : value.fromEntrySeq()) :
	          keyedSeqFromValue(value);
	    }

	    KeyedSeq.prototype.toKeyedSeq = function() {
	      return this;
	    };



	  createClass(IndexedSeq, Seq);
	    function IndexedSeq(value) {
	      return value === null || value === undefined ? emptySequence() :
	        !isIterable(value) ? indexedSeqFromValue(value) :
	        isKeyed(value) ? value.entrySeq() : value.toIndexedSeq();
	    }

	    IndexedSeq.of = function(/*...values*/) {
	      return IndexedSeq(arguments);
	    };

	    IndexedSeq.prototype.toIndexedSeq = function() {
	      return this;
	    };

	    IndexedSeq.prototype.toString = function() {
	      return this.__toString('Seq [', ']');
	    };

	    IndexedSeq.prototype.__iterate = function(fn, reverse) {
	      return seqIterate(this, fn, reverse, false);
	    };

	    IndexedSeq.prototype.__iterator = function(type, reverse) {
	      return seqIterator(this, type, reverse, false);
	    };



	  createClass(SetSeq, Seq);
	    function SetSeq(value) {
	      return (
	        value === null || value === undefined ? emptySequence() :
	        !isIterable(value) ? indexedSeqFromValue(value) :
	        isKeyed(value) ? value.entrySeq() : value
	      ).toSetSeq();
	    }

	    SetSeq.of = function(/*...values*/) {
	      return SetSeq(arguments);
	    };

	    SetSeq.prototype.toSetSeq = function() {
	      return this;
	    };



	  Seq.isSeq = isSeq;
	  Seq.Keyed = KeyedSeq;
	  Seq.Set = SetSeq;
	  Seq.Indexed = IndexedSeq;

	  var IS_SEQ_SENTINEL = '@@__IMMUTABLE_SEQ__@@';

	  Seq.prototype[IS_SEQ_SENTINEL] = true;



	  createClass(ArraySeq, IndexedSeq);
	    function ArraySeq(array) {
	      this._array = array;
	      this.size = array.length;
	    }

	    ArraySeq.prototype.get = function(index, notSetValue) {
	      return this.has(index) ? this._array[wrapIndex(this, index)] : notSetValue;
	    };

	    ArraySeq.prototype.__iterate = function(fn, reverse) {
	      var array = this._array;
	      var maxIndex = array.length - 1;
	      for (var ii = 0; ii <= maxIndex; ii++) {
	        if (fn(array[reverse ? maxIndex - ii : ii], ii, this) === false) {
	          return ii + 1;
	        }
	      }
	      return ii;
	    };

	    ArraySeq.prototype.__iterator = function(type, reverse) {
	      var array = this._array;
	      var maxIndex = array.length - 1;
	      var ii = 0;
	      return new Iterator(function() 
	        {return ii > maxIndex ?
	          iteratorDone() :
	          iteratorValue(type, ii, array[reverse ? maxIndex - ii++ : ii++])}
	      );
	    };



	  createClass(ObjectSeq, KeyedSeq);
	    function ObjectSeq(object) {
	      var keys = Object.keys(object);
	      this._object = object;
	      this._keys = keys;
	      this.size = keys.length;
	    }

	    ObjectSeq.prototype.get = function(key, notSetValue) {
	      if (notSetValue !== undefined && !this.has(key)) {
	        return notSetValue;
	      }
	      return this._object[key];
	    };

	    ObjectSeq.prototype.has = function(key) {
	      return this._object.hasOwnProperty(key);
	    };

	    ObjectSeq.prototype.__iterate = function(fn, reverse) {
	      var object = this._object;
	      var keys = this._keys;
	      var maxIndex = keys.length - 1;
	      for (var ii = 0; ii <= maxIndex; ii++) {
	        var key = keys[reverse ? maxIndex - ii : ii];
	        if (fn(object[key], key, this) === false) {
	          return ii + 1;
	        }
	      }
	      return ii;
	    };

	    ObjectSeq.prototype.__iterator = function(type, reverse) {
	      var object = this._object;
	      var keys = this._keys;
	      var maxIndex = keys.length - 1;
	      var ii = 0;
	      return new Iterator(function()  {
	        var key = keys[reverse ? maxIndex - ii : ii];
	        return ii++ > maxIndex ?
	          iteratorDone() :
	          iteratorValue(type, key, object[key]);
	      });
	    };

	  ObjectSeq.prototype[IS_ORDERED_SENTINEL] = true;


	  createClass(IterableSeq, IndexedSeq);
	    function IterableSeq(iterable) {
	      this._iterable = iterable;
	      this.size = iterable.length || iterable.size;
	    }

	    IterableSeq.prototype.__iterateUncached = function(fn, reverse) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse);
	      }
	      var iterable = this._iterable;
	      var iterator = getIterator(iterable);
	      var iterations = 0;
	      if (isIterator(iterator)) {
	        var step;
	        while (!(step = iterator.next()).done) {
	          if (fn(step.value, iterations++, this) === false) {
	            break;
	          }
	        }
	      }
	      return iterations;
	    };

	    IterableSeq.prototype.__iteratorUncached = function(type, reverse) {
	      if (reverse) {
	        return this.cacheResult().__iterator(type, reverse);
	      }
	      var iterable = this._iterable;
	      var iterator = getIterator(iterable);
	      if (!isIterator(iterator)) {
	        return new Iterator(iteratorDone);
	      }
	      var iterations = 0;
	      return new Iterator(function()  {
	        var step = iterator.next();
	        return step.done ? step : iteratorValue(type, iterations++, step.value);
	      });
	    };



	  createClass(IteratorSeq, IndexedSeq);
	    function IteratorSeq(iterator) {
	      this._iterator = iterator;
	      this._iteratorCache = [];
	    }

	    IteratorSeq.prototype.__iterateUncached = function(fn, reverse) {
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse);
	      }
	      var iterator = this._iterator;
	      var cache = this._iteratorCache;
	      var iterations = 0;
	      while (iterations < cache.length) {
	        if (fn(cache[iterations], iterations++, this) === false) {
	          return iterations;
	        }
	      }
	      var step;
	      while (!(step = iterator.next()).done) {
	        var val = step.value;
	        cache[iterations] = val;
	        if (fn(val, iterations++, this) === false) {
	          break;
	        }
	      }
	      return iterations;
	    };

	    IteratorSeq.prototype.__iteratorUncached = function(type, reverse) {
	      if (reverse) {
	        return this.cacheResult().__iterator(type, reverse);
	      }
	      var iterator = this._iterator;
	      var cache = this._iteratorCache;
	      var iterations = 0;
	      return new Iterator(function()  {
	        if (iterations >= cache.length) {
	          var step = iterator.next();
	          if (step.done) {
	            return step;
	          }
	          cache[iterations] = step.value;
	        }
	        return iteratorValue(type, iterations, cache[iterations++]);
	      });
	    };




	  // # pragma Helper functions

	  function isSeq(maybeSeq) {
	    return !!(maybeSeq && maybeSeq[IS_SEQ_SENTINEL]);
	  }

	  var EMPTY_SEQ;

	  function emptySequence() {
	    return EMPTY_SEQ || (EMPTY_SEQ = new ArraySeq([]));
	  }

	  function keyedSeqFromValue(value) {
	    var seq =
	      Array.isArray(value) ? new ArraySeq(value).fromEntrySeq() :
	      isIterator(value) ? new IteratorSeq(value).fromEntrySeq() :
	      hasIterator(value) ? new IterableSeq(value).fromEntrySeq() :
	      typeof value === 'object' ? new ObjectSeq(value) :
	      undefined;
	    if (!seq) {
	      throw new TypeError(
	        'Expected Array or iterable object of [k, v] entries, '+
	        'or keyed object: ' + value
	      );
	    }
	    return seq;
	  }

	  function indexedSeqFromValue(value) {
	    var seq = maybeIndexedSeqFromValue(value);
	    if (!seq) {
	      throw new TypeError(
	        'Expected Array or iterable object of values: ' + value
	      );
	    }
	    return seq;
	  }

	  function seqFromValue(value) {
	    var seq = maybeIndexedSeqFromValue(value) ||
	      (typeof value === 'object' && new ObjectSeq(value));
	    if (!seq) {
	      throw new TypeError(
	        'Expected Array or iterable object of values, or keyed object: ' + value
	      );
	    }
	    return seq;
	  }

	  function maybeIndexedSeqFromValue(value) {
	    return (
	      isArrayLike(value) ? new ArraySeq(value) :
	      isIterator(value) ? new IteratorSeq(value) :
	      hasIterator(value) ? new IterableSeq(value) :
	      undefined
	    );
	  }

	  function seqIterate(seq, fn, reverse, useKeys) {
	    var cache = seq._cache;
	    if (cache) {
	      var maxIndex = cache.length - 1;
	      for (var ii = 0; ii <= maxIndex; ii++) {
	        var entry = cache[reverse ? maxIndex - ii : ii];
	        if (fn(entry[1], useKeys ? entry[0] : ii, seq) === false) {
	          return ii + 1;
	        }
	      }
	      return ii;
	    }
	    return seq.__iterateUncached(fn, reverse);
	  }

	  function seqIterator(seq, type, reverse, useKeys) {
	    var cache = seq._cache;
	    if (cache) {
	      var maxIndex = cache.length - 1;
	      var ii = 0;
	      return new Iterator(function()  {
	        var entry = cache[reverse ? maxIndex - ii : ii];
	        return ii++ > maxIndex ?
	          iteratorDone() :
	          iteratorValue(type, useKeys ? entry[0] : ii - 1, entry[1]);
	      });
	    }
	    return seq.__iteratorUncached(type, reverse);
	  }

	  function fromJS(json, converter) {
	    return converter ?
	      fromJSWith(converter, json, '', {'': json}) :
	      fromJSDefault(json);
	  }

	  function fromJSWith(converter, json, key, parentJSON) {
	    if (Array.isArray(json)) {
	      return converter.call(parentJSON, key, IndexedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
	    }
	    if (isPlainObj(json)) {
	      return converter.call(parentJSON, key, KeyedSeq(json).map(function(v, k)  {return fromJSWith(converter, v, k, json)}));
	    }
	    return json;
	  }

	  function fromJSDefault(json) {
	    if (Array.isArray(json)) {
	      return IndexedSeq(json).map(fromJSDefault).toList();
	    }
	    if (isPlainObj(json)) {
	      return KeyedSeq(json).map(fromJSDefault).toMap();
	    }
	    return json;
	  }

	  function isPlainObj(value) {
	    return value && (value.constructor === Object || value.constructor === undefined);
	  }

	  /**
	   * An extension of the "same-value" algorithm as [described for use by ES6 Map
	   * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
	   *
	   * NaN is considered the same as NaN, however -0 and 0 are considered the same
	   * value, which is different from the algorithm described by
	   * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
	   *
	   * This is extended further to allow Objects to describe the values they
	   * represent, by way of `valueOf` or `equals` (and `hashCode`).
	   *
	   * Note: because of this extension, the key equality of Immutable.Map and the
	   * value equality of Immutable.Set will differ from ES6 Map and Set.
	   *
	   * ### Defining custom values
	   *
	   * The easiest way to describe the value an object represents is by implementing
	   * `valueOf`. For example, `Date` represents a value by returning a unix
	   * timestamp for `valueOf`:
	   *
	   *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
	   *     var date2 = new Date(1234567890000);
	   *     date1.valueOf(); // 1234567890000
	   *     assert( date1 !== date2 );
	   *     assert( Immutable.is( date1, date2 ) );
	   *
	   * Note: overriding `valueOf` may have other implications if you use this object
	   * where JavaScript expects a primitive, such as implicit string coercion.
	   *
	   * For more complex types, especially collections, implementing `valueOf` may
	   * not be performant. An alternative is to implement `equals` and `hashCode`.
	   *
	   * `equals` takes another object, presumably of similar type, and returns true
	   * if the it is equal. Equality is symmetrical, so the same result should be
	   * returned if this and the argument are flipped.
	   *
	   *     assert( a.equals(b) === b.equals(a) );
	   *
	   * `hashCode` returns a 32bit integer number representing the object which will
	   * be used to determine how to store the value object in a Map or Set. You must
	   * provide both or neither methods, one must not exist without the other.
	   *
	   * Also, an important relationship between these methods must be upheld: if two
	   * values are equal, they *must* return the same hashCode. If the values are not
	   * equal, they might have the same hashCode; this is called a hash collision,
	   * and while undesirable for performance reasons, it is acceptable.
	   *
	   *     if (a.equals(b)) {
	   *       assert( a.hashCode() === b.hashCode() );
	   *     }
	   *
	   * All Immutable collections implement `equals` and `hashCode`.
	   *
	   */
	  function is(valueA, valueB) {
	    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
	      return true;
	    }
	    if (!valueA || !valueB) {
	      return false;
	    }
	    if (typeof valueA.valueOf === 'function' &&
	        typeof valueB.valueOf === 'function') {
	      valueA = valueA.valueOf();
	      valueB = valueB.valueOf();
	      if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
	        return true;
	      }
	      if (!valueA || !valueB) {
	        return false;
	      }
	    }
	    if (typeof valueA.equals === 'function' &&
	        typeof valueB.equals === 'function' &&
	        valueA.equals(valueB)) {
	      return true;
	    }
	    return false;
	  }

	  function deepEqual(a, b) {
	    if (a === b) {
	      return true;
	    }

	    if (
	      !isIterable(b) ||
	      a.size !== undefined && b.size !== undefined && a.size !== b.size ||
	      a.__hash !== undefined && b.__hash !== undefined && a.__hash !== b.__hash ||
	      isKeyed(a) !== isKeyed(b) ||
	      isIndexed(a) !== isIndexed(b) ||
	      isOrdered(a) !== isOrdered(b)
	    ) {
	      return false;
	    }

	    if (a.size === 0 && b.size === 0) {
	      return true;
	    }

	    var notAssociative = !isAssociative(a);

	    if (isOrdered(a)) {
	      var entries = a.entries();
	      return b.every(function(v, k)  {
	        var entry = entries.next().value;
	        return entry && is(entry[1], v) && (notAssociative || is(entry[0], k));
	      }) && entries.next().done;
	    }

	    var flipped = false;

	    if (a.size === undefined) {
	      if (b.size === undefined) {
	        if (typeof a.cacheResult === 'function') {
	          a.cacheResult();
	        }
	      } else {
	        flipped = true;
	        var _ = a;
	        a = b;
	        b = _;
	      }
	    }

	    var allEqual = true;
	    var bSize = b.__iterate(function(v, k)  {
	      if (notAssociative ? !a.has(v) :
	          flipped ? !is(v, a.get(k, NOT_SET)) : !is(a.get(k, NOT_SET), v)) {
	        allEqual = false;
	        return false;
	      }
	    });

	    return allEqual && a.size === bSize;
	  }

	  createClass(Repeat, IndexedSeq);

	    function Repeat(value, times) {
	      if (!(this instanceof Repeat)) {
	        return new Repeat(value, times);
	      }
	      this._value = value;
	      this.size = times === undefined ? Infinity : Math.max(0, times);
	      if (this.size === 0) {
	        if (EMPTY_REPEAT) {
	          return EMPTY_REPEAT;
	        }
	        EMPTY_REPEAT = this;
	      }
	    }

	    Repeat.prototype.toString = function() {
	      if (this.size === 0) {
	        return 'Repeat []';
	      }
	      return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
	    };

	    Repeat.prototype.get = function(index, notSetValue) {
	      return this.has(index) ? this._value : notSetValue;
	    };

	    Repeat.prototype.includes = function(searchValue) {
	      return is(this._value, searchValue);
	    };

	    Repeat.prototype.slice = function(begin, end) {
	      var size = this.size;
	      return wholeSlice(begin, end, size) ? this :
	        new Repeat(this._value, resolveEnd(end, size) - resolveBegin(begin, size));
	    };

	    Repeat.prototype.reverse = function() {
	      return this;
	    };

	    Repeat.prototype.indexOf = function(searchValue) {
	      if (is(this._value, searchValue)) {
	        return 0;
	      }
	      return -1;
	    };

	    Repeat.prototype.lastIndexOf = function(searchValue) {
	      if (is(this._value, searchValue)) {
	        return this.size;
	      }
	      return -1;
	    };

	    Repeat.prototype.__iterate = function(fn, reverse) {
	      for (var ii = 0; ii < this.size; ii++) {
	        if (fn(this._value, ii, this) === false) {
	          return ii + 1;
	        }
	      }
	      return ii;
	    };

	    Repeat.prototype.__iterator = function(type, reverse) {var this$0 = this;
	      var ii = 0;
	      return new Iterator(function() 
	        {return ii < this$0.size ? iteratorValue(type, ii++, this$0._value) : iteratorDone()}
	      );
	    };

	    Repeat.prototype.equals = function(other) {
	      return other instanceof Repeat ?
	        is(this._value, other._value) :
	        deepEqual(other);
	    };


	  var EMPTY_REPEAT;

	  function invariant(condition, error) {
	    if (!condition) throw new Error(error);
	  }

	  createClass(Range, IndexedSeq);

	    function Range(start, end, step) {
	      if (!(this instanceof Range)) {
	        return new Range(start, end, step);
	      }
	      invariant(step !== 0, 'Cannot step a Range by 0');
	      start = start || 0;
	      if (end === undefined) {
	        end = Infinity;
	      }
	      step = step === undefined ? 1 : Math.abs(step);
	      if (end < start) {
	        step = -step;
	      }
	      this._start = start;
	      this._end = end;
	      this._step = step;
	      this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
	      if (this.size === 0) {
	        if (EMPTY_RANGE) {
	          return EMPTY_RANGE;
	        }
	        EMPTY_RANGE = this;
	      }
	    }

	    Range.prototype.toString = function() {
	      if (this.size === 0) {
	        return 'Range []';
	      }
	      return 'Range [ ' +
	        this._start + '...' + this._end +
	        (this._step > 1 ? ' by ' + this._step : '') +
	      ' ]';
	    };

	    Range.prototype.get = function(index, notSetValue) {
	      return this.has(index) ?
	        this._start + wrapIndex(this, index) * this._step :
	        notSetValue;
	    };

	    Range.prototype.includes = function(searchValue) {
	      var possibleIndex = (searchValue - this._start) / this._step;
	      return possibleIndex >= 0 &&
	        possibleIndex < this.size &&
	        possibleIndex === Math.floor(possibleIndex);
	    };

	    Range.prototype.slice = function(begin, end) {
	      if (wholeSlice(begin, end, this.size)) {
	        return this;
	      }
	      begin = resolveBegin(begin, this.size);
	      end = resolveEnd(end, this.size);
	      if (end <= begin) {
	        return new Range(0, 0);
	      }
	      return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
	    };

	    Range.prototype.indexOf = function(searchValue) {
	      var offsetValue = searchValue - this._start;
	      if (offsetValue % this._step === 0) {
	        var index = offsetValue / this._step;
	        if (index >= 0 && index < this.size) {
	          return index
	        }
	      }
	      return -1;
	    };

	    Range.prototype.lastIndexOf = function(searchValue) {
	      return this.indexOf(searchValue);
	    };

	    Range.prototype.__iterate = function(fn, reverse) {
	      var maxIndex = this.size - 1;
	      var step = this._step;
	      var value = reverse ? this._start + maxIndex * step : this._start;
	      for (var ii = 0; ii <= maxIndex; ii++) {
	        if (fn(value, ii, this) === false) {
	          return ii + 1;
	        }
	        value += reverse ? -step : step;
	      }
	      return ii;
	    };

	    Range.prototype.__iterator = function(type, reverse) {
	      var maxIndex = this.size - 1;
	      var step = this._step;
	      var value = reverse ? this._start + maxIndex * step : this._start;
	      var ii = 0;
	      return new Iterator(function()  {
	        var v = value;
	        value += reverse ? -step : step;
	        return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
	      });
	    };

	    Range.prototype.equals = function(other) {
	      return other instanceof Range ?
	        this._start === other._start &&
	        this._end === other._end &&
	        this._step === other._step :
	        deepEqual(this, other);
	    };


	  var EMPTY_RANGE;

	  createClass(Collection, Iterable);
	    function Collection() {
	      throw TypeError('Abstract');
	    }


	  createClass(KeyedCollection, Collection);function KeyedCollection() {}

	  createClass(IndexedCollection, Collection);function IndexedCollection() {}

	  createClass(SetCollection, Collection);function SetCollection() {}


	  Collection.Keyed = KeyedCollection;
	  Collection.Indexed = IndexedCollection;
	  Collection.Set = SetCollection;

	  var imul =
	    typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2 ?
	    Math.imul :
	    function imul(a, b) {
	      a = a | 0; // int
	      b = b | 0; // int
	      var c = a & 0xffff;
	      var d = b & 0xffff;
	      // Shift by 0 fixes the sign on the high part.
	      return (c * d) + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0) | 0; // int
	    };

	  // v8 has an optimization for storing 31-bit signed numbers.
	  // Values which have either 00 or 11 as the high order bits qualify.
	  // This function drops the highest order bit in a signed number, maintaining
	  // the sign bit.
	  function smi(i32) {
	    return ((i32 >>> 1) & 0x40000000) | (i32 & 0xBFFFFFFF);
	  }

	  function hash(o) {
	    if (o === false || o === null || o === undefined) {
	      return 0;
	    }
	    if (typeof o.valueOf === 'function') {
	      o = o.valueOf();
	      if (o === false || o === null || o === undefined) {
	        return 0;
	      }
	    }
	    if (o === true) {
	      return 1;
	    }
	    var type = typeof o;
	    if (type === 'number') {
	      var h = o | 0;
	      if (h !== o) {
	        h ^= o * 0xFFFFFFFF;
	      }
	      while (o > 0xFFFFFFFF) {
	        o /= 0xFFFFFFFF;
	        h ^= o;
	      }
	      return smi(h);
	    }
	    if (type === 'string') {
	      return o.length > STRING_HASH_CACHE_MIN_STRLEN ? cachedHashString(o) : hashString(o);
	    }
	    if (typeof o.hashCode === 'function') {
	      return o.hashCode();
	    }
	    if (type === 'object') {
	      return hashJSObj(o);
	    }
	    if (typeof o.toString === 'function') {
	      return hashString(o.toString());
	    }
	    throw new Error('Value type ' + type + ' cannot be hashed.');
	  }

	  function cachedHashString(string) {
	    var hash = stringHashCache[string];
	    if (hash === undefined) {
	      hash = hashString(string);
	      if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
	        STRING_HASH_CACHE_SIZE = 0;
	        stringHashCache = {};
	      }
	      STRING_HASH_CACHE_SIZE++;
	      stringHashCache[string] = hash;
	    }
	    return hash;
	  }

	  // http://jsperf.com/hashing-strings
	  function hashString(string) {
	    // This is the hash from JVM
	    // The hash code for a string is computed as
	    // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
	    // where s[i] is the ith character of the string and n is the length of
	    // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
	    // (exclusive) by dropping high bits.
	    var hash = 0;
	    for (var ii = 0; ii < string.length; ii++) {
	      hash = 31 * hash + string.charCodeAt(ii) | 0;
	    }
	    return smi(hash);
	  }

	  function hashJSObj(obj) {
	    var hash;
	    if (usingWeakMap) {
	      hash = weakMap.get(obj);
	      if (hash !== undefined) {
	        return hash;
	      }
	    }

	    hash = obj[UID_HASH_KEY];
	    if (hash !== undefined) {
	      return hash;
	    }

	    if (!canDefineProperty) {
	      hash = obj.propertyIsEnumerable && obj.propertyIsEnumerable[UID_HASH_KEY];
	      if (hash !== undefined) {
	        return hash;
	      }

	      hash = getIENodeHash(obj);
	      if (hash !== undefined) {
	        return hash;
	      }
	    }

	    hash = ++objHashUID;
	    if (objHashUID & 0x40000000) {
	      objHashUID = 0;
	    }

	    if (usingWeakMap) {
	      weakMap.set(obj, hash);
	    } else if (isExtensible !== undefined && isExtensible(obj) === false) {
	      throw new Error('Non-extensible objects are not allowed as keys.');
	    } else if (canDefineProperty) {
	      Object.defineProperty(obj, UID_HASH_KEY, {
	        'enumerable': false,
	        'configurable': false,
	        'writable': false,
	        'value': hash
	      });
	    } else if (obj.propertyIsEnumerable !== undefined &&
	               obj.propertyIsEnumerable === obj.constructor.prototype.propertyIsEnumerable) {
	      // Since we can't define a non-enumerable property on the object
	      // we'll hijack one of the less-used non-enumerable properties to
	      // save our hash on it. Since this is a function it will not show up in
	      // `JSON.stringify` which is what we want.
	      obj.propertyIsEnumerable = function() {
	        return this.constructor.prototype.propertyIsEnumerable.apply(this, arguments);
	      };
	      obj.propertyIsEnumerable[UID_HASH_KEY] = hash;
	    } else if (obj.nodeType !== undefined) {
	      // At this point we couldn't get the IE `uniqueID` to use as a hash
	      // and we couldn't use a non-enumerable property to exploit the
	      // dontEnum bug so we simply add the `UID_HASH_KEY` on the node
	      // itself.
	      obj[UID_HASH_KEY] = hash;
	    } else {
	      throw new Error('Unable to set a non-enumerable property on object.');
	    }

	    return hash;
	  }

	  // Get references to ES5 object methods.
	  var isExtensible = Object.isExtensible;

	  // True if Object.defineProperty works as expected. IE8 fails this test.
	  var canDefineProperty = (function() {
	    try {
	      Object.defineProperty({}, '@', {});
	      return true;
	    } catch (e) {
	      return false;
	    }
	  }());

	  // IE has a `uniqueID` property on DOM nodes. We can construct the hash from it
	  // and avoid memory leaks from the IE cloneNode bug.
	  function getIENodeHash(node) {
	    if (node && node.nodeType > 0) {
	      switch (node.nodeType) {
	        case 1: // Element
	          return node.uniqueID;
	        case 9: // Document
	          return node.documentElement && node.documentElement.uniqueID;
	      }
	    }
	  }

	  // If possible, use a WeakMap.
	  var usingWeakMap = typeof WeakMap === 'function';
	  var weakMap;
	  if (usingWeakMap) {
	    weakMap = new WeakMap();
	  }

	  var objHashUID = 0;

	  var UID_HASH_KEY = '__immutablehash__';
	  if (typeof Symbol === 'function') {
	    UID_HASH_KEY = Symbol(UID_HASH_KEY);
	  }

	  var STRING_HASH_CACHE_MIN_STRLEN = 16;
	  var STRING_HASH_CACHE_MAX_SIZE = 255;
	  var STRING_HASH_CACHE_SIZE = 0;
	  var stringHashCache = {};

	  function assertNotInfinite(size) {
	    invariant(
	      size !== Infinity,
	      'Cannot perform this action with an infinite size.'
	    );
	  }

	  createClass(Map, KeyedCollection);

	    // @pragma Construction

	    function Map(value) {
	      return value === null || value === undefined ? emptyMap() :
	        isMap(value) && !isOrdered(value) ? value :
	        emptyMap().withMutations(function(map ) {
	          var iter = KeyedIterable(value);
	          assertNotInfinite(iter.size);
	          iter.forEach(function(v, k)  {return map.set(k, v)});
	        });
	    }

	    Map.prototype.toString = function() {
	      return this.__toString('Map {', '}');
	    };

	    // @pragma Access

	    Map.prototype.get = function(k, notSetValue) {
	      return this._root ?
	        this._root.get(0, undefined, k, notSetValue) :
	        notSetValue;
	    };

	    // @pragma Modification

	    Map.prototype.set = function(k, v) {
	      return updateMap(this, k, v);
	    };

	    Map.prototype.setIn = function(keyPath, v) {
	      return this.updateIn(keyPath, NOT_SET, function()  {return v});
	    };

	    Map.prototype.remove = function(k) {
	      return updateMap(this, k, NOT_SET);
	    };

	    Map.prototype.deleteIn = function(keyPath) {
	      return this.updateIn(keyPath, function()  {return NOT_SET});
	    };

	    Map.prototype.update = function(k, notSetValue, updater) {
	      return arguments.length === 1 ?
	        k(this) :
	        this.updateIn([k], notSetValue, updater);
	    };

	    Map.prototype.updateIn = function(keyPath, notSetValue, updater) {
	      if (!updater) {
	        updater = notSetValue;
	        notSetValue = undefined;
	      }
	      var updatedValue = updateInDeepMap(
	        this,
	        forceIterator(keyPath),
	        notSetValue,
	        updater
	      );
	      return updatedValue === NOT_SET ? undefined : updatedValue;
	    };

	    Map.prototype.clear = function() {
	      if (this.size === 0) {
	        return this;
	      }
	      if (this.__ownerID) {
	        this.size = 0;
	        this._root = null;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return emptyMap();
	    };

	    // @pragma Composition

	    Map.prototype.merge = function(/*...iters*/) {
	      return mergeIntoMapWith(this, undefined, arguments);
	    };

	    Map.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
	      return mergeIntoMapWith(this, merger, iters);
	    };

	    Map.prototype.mergeIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
	      return this.updateIn(
	        keyPath,
	        emptyMap(),
	        function(m ) {return typeof m.merge === 'function' ?
	          m.merge.apply(m, iters) :
	          iters[iters.length - 1]}
	      );
	    };

	    Map.prototype.mergeDeep = function(/*...iters*/) {
	      return mergeIntoMapWith(this, deepMerger, arguments);
	    };

	    Map.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
	      return mergeIntoMapWith(this, deepMergerWith(merger), iters);
	    };

	    Map.prototype.mergeDeepIn = function(keyPath) {var iters = SLICE$0.call(arguments, 1);
	      return this.updateIn(
	        keyPath,
	        emptyMap(),
	        function(m ) {return typeof m.mergeDeep === 'function' ?
	          m.mergeDeep.apply(m, iters) :
	          iters[iters.length - 1]}
	      );
	    };

	    Map.prototype.sort = function(comparator) {
	      // Late binding
	      return OrderedMap(sortFactory(this, comparator));
	    };

	    Map.prototype.sortBy = function(mapper, comparator) {
	      // Late binding
	      return OrderedMap(sortFactory(this, comparator, mapper));
	    };

	    // @pragma Mutability

	    Map.prototype.withMutations = function(fn) {
	      var mutable = this.asMutable();
	      fn(mutable);
	      return mutable.wasAltered() ? mutable.__ensureOwner(this.__ownerID) : this;
	    };

	    Map.prototype.asMutable = function() {
	      return this.__ownerID ? this : this.__ensureOwner(new OwnerID());
	    };

	    Map.prototype.asImmutable = function() {
	      return this.__ensureOwner();
	    };

	    Map.prototype.wasAltered = function() {
	      return this.__altered;
	    };

	    Map.prototype.__iterator = function(type, reverse) {
	      return new MapIterator(this, type, reverse);
	    };

	    Map.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      var iterations = 0;
	      this._root && this._root.iterate(function(entry ) {
	        iterations++;
	        return fn(entry[1], entry[0], this$0);
	      }, reverse);
	      return iterations;
	    };

	    Map.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        this.__altered = false;
	        return this;
	      }
	      return makeMap(this.size, this._root, ownerID, this.__hash);
	    };


	  function isMap(maybeMap) {
	    return !!(maybeMap && maybeMap[IS_MAP_SENTINEL]);
	  }

	  Map.isMap = isMap;

	  var IS_MAP_SENTINEL = '@@__IMMUTABLE_MAP__@@';

	  var MapPrototype = Map.prototype;
	  MapPrototype[IS_MAP_SENTINEL] = true;
	  MapPrototype[DELETE] = MapPrototype.remove;
	  MapPrototype.removeIn = MapPrototype.deleteIn;


	  // #pragma Trie Nodes



	    function ArrayMapNode(ownerID, entries) {
	      this.ownerID = ownerID;
	      this.entries = entries;
	    }

	    ArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
	      var entries = this.entries;
	      for (var ii = 0, len = entries.length; ii < len; ii++) {
	        if (is(key, entries[ii][0])) {
	          return entries[ii][1];
	        }
	      }
	      return notSetValue;
	    };

	    ArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	      var removed = value === NOT_SET;

	      var entries = this.entries;
	      var idx = 0;
	      for (var len = entries.length; idx < len; idx++) {
	        if (is(key, entries[idx][0])) {
	          break;
	        }
	      }
	      var exists = idx < len;

	      if (exists ? entries[idx][1] === value : removed) {
	        return this;
	      }

	      SetRef(didAlter);
	      (removed || !exists) && SetRef(didChangeSize);

	      if (removed && entries.length === 1) {
	        return; // undefined
	      }

	      if (!exists && !removed && entries.length >= MAX_ARRAY_MAP_SIZE) {
	        return createNodes(ownerID, entries, key, value);
	      }

	      var isEditable = ownerID && ownerID === this.ownerID;
	      var newEntries = isEditable ? entries : arrCopy(entries);

	      if (exists) {
	        if (removed) {
	          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	        } else {
	          newEntries[idx] = [key, value];
	        }
	      } else {
	        newEntries.push([key, value]);
	      }

	      if (isEditable) {
	        this.entries = newEntries;
	        return this;
	      }

	      return new ArrayMapNode(ownerID, newEntries);
	    };




	    function BitmapIndexedNode(ownerID, bitmap, nodes) {
	      this.ownerID = ownerID;
	      this.bitmap = bitmap;
	      this.nodes = nodes;
	    }

	    BitmapIndexedNode.prototype.get = function(shift, keyHash, key, notSetValue) {
	      if (keyHash === undefined) {
	        keyHash = hash(key);
	      }
	      var bit = (1 << ((shift === 0 ? keyHash : keyHash >>> shift) & MASK));
	      var bitmap = this.bitmap;
	      return (bitmap & bit) === 0 ? notSetValue :
	        this.nodes[popCount(bitmap & (bit - 1))].get(shift + SHIFT, keyHash, key, notSetValue);
	    };

	    BitmapIndexedNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	      if (keyHash === undefined) {
	        keyHash = hash(key);
	      }
	      var keyHashFrag = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	      var bit = 1 << keyHashFrag;
	      var bitmap = this.bitmap;
	      var exists = (bitmap & bit) !== 0;

	      if (!exists && value === NOT_SET) {
	        return this;
	      }

	      var idx = popCount(bitmap & (bit - 1));
	      var nodes = this.nodes;
	      var node = exists ? nodes[idx] : undefined;
	      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);

	      if (newNode === node) {
	        return this;
	      }

	      if (!exists && newNode && nodes.length >= MAX_BITMAP_INDEXED_SIZE) {
	        return expandNodes(ownerID, nodes, bitmap, keyHashFrag, newNode);
	      }

	      if (exists && !newNode && nodes.length === 2 && isLeafNode(nodes[idx ^ 1])) {
	        return nodes[idx ^ 1];
	      }

	      if (exists && newNode && nodes.length === 1 && isLeafNode(newNode)) {
	        return newNode;
	      }

	      var isEditable = ownerID && ownerID === this.ownerID;
	      var newBitmap = exists ? newNode ? bitmap : bitmap ^ bit : bitmap | bit;
	      var newNodes = exists ? newNode ?
	        setIn(nodes, idx, newNode, isEditable) :
	        spliceOut(nodes, idx, isEditable) :
	        spliceIn(nodes, idx, newNode, isEditable);

	      if (isEditable) {
	        this.bitmap = newBitmap;
	        this.nodes = newNodes;
	        return this;
	      }

	      return new BitmapIndexedNode(ownerID, newBitmap, newNodes);
	    };




	    function HashArrayMapNode(ownerID, count, nodes) {
	      this.ownerID = ownerID;
	      this.count = count;
	      this.nodes = nodes;
	    }

	    HashArrayMapNode.prototype.get = function(shift, keyHash, key, notSetValue) {
	      if (keyHash === undefined) {
	        keyHash = hash(key);
	      }
	      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	      var node = this.nodes[idx];
	      return node ? node.get(shift + SHIFT, keyHash, key, notSetValue) : notSetValue;
	    };

	    HashArrayMapNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	      if (keyHash === undefined) {
	        keyHash = hash(key);
	      }
	      var idx = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;
	      var removed = value === NOT_SET;
	      var nodes = this.nodes;
	      var node = nodes[idx];

	      if (removed && !node) {
	        return this;
	      }

	      var newNode = updateNode(node, ownerID, shift + SHIFT, keyHash, key, value, didChangeSize, didAlter);
	      if (newNode === node) {
	        return this;
	      }

	      var newCount = this.count;
	      if (!node) {
	        newCount++;
	      } else if (!newNode) {
	        newCount--;
	        if (newCount < MIN_HASH_ARRAY_MAP_SIZE) {
	          return packNodes(ownerID, nodes, newCount, idx);
	        }
	      }

	      var isEditable = ownerID && ownerID === this.ownerID;
	      var newNodes = setIn(nodes, idx, newNode, isEditable);

	      if (isEditable) {
	        this.count = newCount;
	        this.nodes = newNodes;
	        return this;
	      }

	      return new HashArrayMapNode(ownerID, newCount, newNodes);
	    };




	    function HashCollisionNode(ownerID, keyHash, entries) {
	      this.ownerID = ownerID;
	      this.keyHash = keyHash;
	      this.entries = entries;
	    }

	    HashCollisionNode.prototype.get = function(shift, keyHash, key, notSetValue) {
	      var entries = this.entries;
	      for (var ii = 0, len = entries.length; ii < len; ii++) {
	        if (is(key, entries[ii][0])) {
	          return entries[ii][1];
	        }
	      }
	      return notSetValue;
	    };

	    HashCollisionNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	      if (keyHash === undefined) {
	        keyHash = hash(key);
	      }

	      var removed = value === NOT_SET;

	      if (keyHash !== this.keyHash) {
	        if (removed) {
	          return this;
	        }
	        SetRef(didAlter);
	        SetRef(didChangeSize);
	        return mergeIntoNode(this, ownerID, shift, keyHash, [key, value]);
	      }

	      var entries = this.entries;
	      var idx = 0;
	      for (var len = entries.length; idx < len; idx++) {
	        if (is(key, entries[idx][0])) {
	          break;
	        }
	      }
	      var exists = idx < len;

	      if (exists ? entries[idx][1] === value : removed) {
	        return this;
	      }

	      SetRef(didAlter);
	      (removed || !exists) && SetRef(didChangeSize);

	      if (removed && len === 2) {
	        return new ValueNode(ownerID, this.keyHash, entries[idx ^ 1]);
	      }

	      var isEditable = ownerID && ownerID === this.ownerID;
	      var newEntries = isEditable ? entries : arrCopy(entries);

	      if (exists) {
	        if (removed) {
	          idx === len - 1 ? newEntries.pop() : (newEntries[idx] = newEntries.pop());
	        } else {
	          newEntries[idx] = [key, value];
	        }
	      } else {
	        newEntries.push([key, value]);
	      }

	      if (isEditable) {
	        this.entries = newEntries;
	        return this;
	      }

	      return new HashCollisionNode(ownerID, this.keyHash, newEntries);
	    };




	    function ValueNode(ownerID, keyHash, entry) {
	      this.ownerID = ownerID;
	      this.keyHash = keyHash;
	      this.entry = entry;
	    }

	    ValueNode.prototype.get = function(shift, keyHash, key, notSetValue) {
	      return is(key, this.entry[0]) ? this.entry[1] : notSetValue;
	    };

	    ValueNode.prototype.update = function(ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	      var removed = value === NOT_SET;
	      var keyMatch = is(key, this.entry[0]);
	      if (keyMatch ? value === this.entry[1] : removed) {
	        return this;
	      }

	      SetRef(didAlter);

	      if (removed) {
	        SetRef(didChangeSize);
	        return; // undefined
	      }

	      if (keyMatch) {
	        if (ownerID && ownerID === this.ownerID) {
	          this.entry[1] = value;
	          return this;
	        }
	        return new ValueNode(ownerID, this.keyHash, [key, value]);
	      }

	      SetRef(didChangeSize);
	      return mergeIntoNode(this, ownerID, shift, hash(key), [key, value]);
	    };



	  // #pragma Iterators

	  ArrayMapNode.prototype.iterate =
	  HashCollisionNode.prototype.iterate = function (fn, reverse) {
	    var entries = this.entries;
	    for (var ii = 0, maxIndex = entries.length - 1; ii <= maxIndex; ii++) {
	      if (fn(entries[reverse ? maxIndex - ii : ii]) === false) {
	        return false;
	      }
	    }
	  }

	  BitmapIndexedNode.prototype.iterate =
	  HashArrayMapNode.prototype.iterate = function (fn, reverse) {
	    var nodes = this.nodes;
	    for (var ii = 0, maxIndex = nodes.length - 1; ii <= maxIndex; ii++) {
	      var node = nodes[reverse ? maxIndex - ii : ii];
	      if (node && node.iterate(fn, reverse) === false) {
	        return false;
	      }
	    }
	  }

	  ValueNode.prototype.iterate = function (fn, reverse) {
	    return fn(this.entry);
	  }

	  createClass(MapIterator, Iterator);

	    function MapIterator(map, type, reverse) {
	      this._type = type;
	      this._reverse = reverse;
	      this._stack = map._root && mapIteratorFrame(map._root);
	    }

	    MapIterator.prototype.next = function() {
	      var type = this._type;
	      var stack = this._stack;
	      while (stack) {
	        var node = stack.node;
	        var index = stack.index++;
	        var maxIndex;
	        if (node.entry) {
	          if (index === 0) {
	            return mapIteratorValue(type, node.entry);
	          }
	        } else if (node.entries) {
	          maxIndex = node.entries.length - 1;
	          if (index <= maxIndex) {
	            return mapIteratorValue(type, node.entries[this._reverse ? maxIndex - index : index]);
	          }
	        } else {
	          maxIndex = node.nodes.length - 1;
	          if (index <= maxIndex) {
	            var subNode = node.nodes[this._reverse ? maxIndex - index : index];
	            if (subNode) {
	              if (subNode.entry) {
	                return mapIteratorValue(type, subNode.entry);
	              }
	              stack = this._stack = mapIteratorFrame(subNode, stack);
	            }
	            continue;
	          }
	        }
	        stack = this._stack = this._stack.__prev;
	      }
	      return iteratorDone();
	    };


	  function mapIteratorValue(type, entry) {
	    return iteratorValue(type, entry[0], entry[1]);
	  }

	  function mapIteratorFrame(node, prev) {
	    return {
	      node: node,
	      index: 0,
	      __prev: prev
	    };
	  }

	  function makeMap(size, root, ownerID, hash) {
	    var map = __webpack_provided_Object_dot_create(MapPrototype);
	    map.size = size;
	    map._root = root;
	    map.__ownerID = ownerID;
	    map.__hash = hash;
	    map.__altered = false;
	    return map;
	  }

	  var EMPTY_MAP;
	  function emptyMap() {
	    return EMPTY_MAP || (EMPTY_MAP = makeMap(0));
	  }

	  function updateMap(map, k, v) {
	    var newRoot;
	    var newSize;
	    if (!map._root) {
	      if (v === NOT_SET) {
	        return map;
	      }
	      newSize = 1;
	      newRoot = new ArrayMapNode(map.__ownerID, [[k, v]]);
	    } else {
	      var didChangeSize = MakeRef(CHANGE_LENGTH);
	      var didAlter = MakeRef(DID_ALTER);
	      newRoot = updateNode(map._root, map.__ownerID, 0, undefined, k, v, didChangeSize, didAlter);
	      if (!didAlter.value) {
	        return map;
	      }
	      newSize = map.size + (didChangeSize.value ? v === NOT_SET ? -1 : 1 : 0);
	    }
	    if (map.__ownerID) {
	      map.size = newSize;
	      map._root = newRoot;
	      map.__hash = undefined;
	      map.__altered = true;
	      return map;
	    }
	    return newRoot ? makeMap(newSize, newRoot) : emptyMap();
	  }

	  function updateNode(node, ownerID, shift, keyHash, key, value, didChangeSize, didAlter) {
	    if (!node) {
	      if (value === NOT_SET) {
	        return node;
	      }
	      SetRef(didAlter);
	      SetRef(didChangeSize);
	      return new ValueNode(ownerID, keyHash, [key, value]);
	    }
	    return node.update(ownerID, shift, keyHash, key, value, didChangeSize, didAlter);
	  }

	  function isLeafNode(node) {
	    return node.constructor === ValueNode || node.constructor === HashCollisionNode;
	  }

	  function mergeIntoNode(node, ownerID, shift, keyHash, entry) {
	    if (node.keyHash === keyHash) {
	      return new HashCollisionNode(ownerID, keyHash, [node.entry, entry]);
	    }

	    var idx1 = (shift === 0 ? node.keyHash : node.keyHash >>> shift) & MASK;
	    var idx2 = (shift === 0 ? keyHash : keyHash >>> shift) & MASK;

	    var newNode;
	    var nodes = idx1 === idx2 ?
	      [mergeIntoNode(node, ownerID, shift + SHIFT, keyHash, entry)] :
	      ((newNode = new ValueNode(ownerID, keyHash, entry)), idx1 < idx2 ? [node, newNode] : [newNode, node]);

	    return new BitmapIndexedNode(ownerID, (1 << idx1) | (1 << idx2), nodes);
	  }

	  function createNodes(ownerID, entries, key, value) {
	    if (!ownerID) {
	      ownerID = new OwnerID();
	    }
	    var node = new ValueNode(ownerID, hash(key), [key, value]);
	    for (var ii = 0; ii < entries.length; ii++) {
	      var entry = entries[ii];
	      node = node.update(ownerID, 0, undefined, entry[0], entry[1]);
	    }
	    return node;
	  }

	  function packNodes(ownerID, nodes, count, excluding) {
	    var bitmap = 0;
	    var packedII = 0;
	    var packedNodes = new Array(count);
	    for (var ii = 0, bit = 1, len = nodes.length; ii < len; ii++, bit <<= 1) {
	      var node = nodes[ii];
	      if (node !== undefined && ii !== excluding) {
	        bitmap |= bit;
	        packedNodes[packedII++] = node;
	      }
	    }
	    return new BitmapIndexedNode(ownerID, bitmap, packedNodes);
	  }

	  function expandNodes(ownerID, nodes, bitmap, including, node) {
	    var count = 0;
	    var expandedNodes = new Array(SIZE);
	    for (var ii = 0; bitmap !== 0; ii++, bitmap >>>= 1) {
	      expandedNodes[ii] = bitmap & 1 ? nodes[count++] : undefined;
	    }
	    expandedNodes[including] = node;
	    return new HashArrayMapNode(ownerID, count + 1, expandedNodes);
	  }

	  function mergeIntoMapWith(map, merger, iterables) {
	    var iters = [];
	    for (var ii = 0; ii < iterables.length; ii++) {
	      var value = iterables[ii];
	      var iter = KeyedIterable(value);
	      if (!isIterable(value)) {
	        iter = iter.map(function(v ) {return fromJS(v)});
	      }
	      iters.push(iter);
	    }
	    return mergeIntoCollectionWith(map, merger, iters);
	  }

	  function deepMerger(existing, value, key) {
	    return existing && existing.mergeDeep && isIterable(value) ?
	      existing.mergeDeep(value) :
	      is(existing, value) ? existing : value;
	  }

	  function deepMergerWith(merger) {
	    return function(existing, value, key)  {
	      if (existing && existing.mergeDeepWith && isIterable(value)) {
	        return existing.mergeDeepWith(merger, value);
	      }
	      var nextValue = merger(existing, value, key);
	      return is(existing, nextValue) ? existing : nextValue;
	    };
	  }

	  function mergeIntoCollectionWith(collection, merger, iters) {
	    iters = iters.filter(function(x ) {return x.size !== 0});
	    if (iters.length === 0) {
	      return collection;
	    }
	    if (collection.size === 0 && !collection.__ownerID && iters.length === 1) {
	      return collection.constructor(iters[0]);
	    }
	    return collection.withMutations(function(collection ) {
	      var mergeIntoMap = merger ?
	        function(value, key)  {
	          collection.update(key, NOT_SET, function(existing )
	            {return existing === NOT_SET ? value : merger(existing, value, key)}
	          );
	        } :
	        function(value, key)  {
	          collection.set(key, value);
	        }
	      for (var ii = 0; ii < iters.length; ii++) {
	        iters[ii].forEach(mergeIntoMap);
	      }
	    });
	  }

	  function updateInDeepMap(existing, keyPathIter, notSetValue, updater) {
	    var isNotSet = existing === NOT_SET;
	    var step = keyPathIter.next();
	    if (step.done) {
	      var existingValue = isNotSet ? notSetValue : existing;
	      var newValue = updater(existingValue);
	      return newValue === existingValue ? existing : newValue;
	    }
	    invariant(
	      isNotSet || (existing && existing.set),
	      'invalid keyPath'
	    );
	    var key = step.value;
	    var nextExisting = isNotSet ? NOT_SET : existing.get(key, NOT_SET);
	    var nextUpdated = updateInDeepMap(
	      nextExisting,
	      keyPathIter,
	      notSetValue,
	      updater
	    );
	    return nextUpdated === nextExisting ? existing :
	      nextUpdated === NOT_SET ? existing.remove(key) :
	      (isNotSet ? emptyMap() : existing).set(key, nextUpdated);
	  }

	  function popCount(x) {
	    x = x - ((x >> 1) & 0x55555555);
	    x = (x & 0x33333333) + ((x >> 2) & 0x33333333);
	    x = (x + (x >> 4)) & 0x0f0f0f0f;
	    x = x + (x >> 8);
	    x = x + (x >> 16);
	    return x & 0x7f;
	  }

	  function setIn(array, idx, val, canEdit) {
	    var newArray = canEdit ? array : arrCopy(array);
	    newArray[idx] = val;
	    return newArray;
	  }

	  function spliceIn(array, idx, val, canEdit) {
	    var newLen = array.length + 1;
	    if (canEdit && idx + 1 === newLen) {
	      array[idx] = val;
	      return array;
	    }
	    var newArray = new Array(newLen);
	    var after = 0;
	    for (var ii = 0; ii < newLen; ii++) {
	      if (ii === idx) {
	        newArray[ii] = val;
	        after = -1;
	      } else {
	        newArray[ii] = array[ii + after];
	      }
	    }
	    return newArray;
	  }

	  function spliceOut(array, idx, canEdit) {
	    var newLen = array.length - 1;
	    if (canEdit && idx === newLen) {
	      array.pop();
	      return array;
	    }
	    var newArray = new Array(newLen);
	    var after = 0;
	    for (var ii = 0; ii < newLen; ii++) {
	      if (ii === idx) {
	        after = 1;
	      }
	      newArray[ii] = array[ii + after];
	    }
	    return newArray;
	  }

	  var MAX_ARRAY_MAP_SIZE = SIZE / 4;
	  var MAX_BITMAP_INDEXED_SIZE = SIZE / 2;
	  var MIN_HASH_ARRAY_MAP_SIZE = SIZE / 4;

	  createClass(List, IndexedCollection);

	    // @pragma Construction

	    function List(value) {
	      var empty = emptyList();
	      if (value === null || value === undefined) {
	        return empty;
	      }
	      if (isList(value)) {
	        return value;
	      }
	      var iter = IndexedIterable(value);
	      var size = iter.size;
	      if (size === 0) {
	        return empty;
	      }
	      assertNotInfinite(size);
	      if (size > 0 && size < SIZE) {
	        return makeList(0, size, SHIFT, null, new VNode(iter.toArray()));
	      }
	      return empty.withMutations(function(list ) {
	        list.setSize(size);
	        iter.forEach(function(v, i)  {return list.set(i, v)});
	      });
	    }

	    List.of = function(/*...values*/) {
	      return this(arguments);
	    };

	    List.prototype.toString = function() {
	      return this.__toString('List [', ']');
	    };

	    // @pragma Access

	    List.prototype.get = function(index, notSetValue) {
	      index = wrapIndex(this, index);
	      if (index >= 0 && index < this.size) {
	        index += this._origin;
	        var node = listNodeFor(this, index);
	        return node && node.array[index & MASK];
	      }
	      return notSetValue;
	    };

	    // @pragma Modification

	    List.prototype.set = function(index, value) {
	      return updateList(this, index, value);
	    };

	    List.prototype.remove = function(index) {
	      return !this.has(index) ? this :
	        index === 0 ? this.shift() :
	        index === this.size - 1 ? this.pop() :
	        this.splice(index, 1);
	    };

	    List.prototype.insert = function(index, value) {
	      return this.splice(index, 0, value);
	    };

	    List.prototype.clear = function() {
	      if (this.size === 0) {
	        return this;
	      }
	      if (this.__ownerID) {
	        this.size = this._origin = this._capacity = 0;
	        this._level = SHIFT;
	        this._root = this._tail = null;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return emptyList();
	    };

	    List.prototype.push = function(/*...values*/) {
	      var values = arguments;
	      var oldSize = this.size;
	      return this.withMutations(function(list ) {
	        setListBounds(list, 0, oldSize + values.length);
	        for (var ii = 0; ii < values.length; ii++) {
	          list.set(oldSize + ii, values[ii]);
	        }
	      });
	    };

	    List.prototype.pop = function() {
	      return setListBounds(this, 0, -1);
	    };

	    List.prototype.unshift = function(/*...values*/) {
	      var values = arguments;
	      return this.withMutations(function(list ) {
	        setListBounds(list, -values.length);
	        for (var ii = 0; ii < values.length; ii++) {
	          list.set(ii, values[ii]);
	        }
	      });
	    };

	    List.prototype.shift = function() {
	      return setListBounds(this, 1);
	    };

	    // @pragma Composition

	    List.prototype.merge = function(/*...iters*/) {
	      return mergeIntoListWith(this, undefined, arguments);
	    };

	    List.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
	      return mergeIntoListWith(this, merger, iters);
	    };

	    List.prototype.mergeDeep = function(/*...iters*/) {
	      return mergeIntoListWith(this, deepMerger, arguments);
	    };

	    List.prototype.mergeDeepWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
	      return mergeIntoListWith(this, deepMergerWith(merger), iters);
	    };

	    List.prototype.setSize = function(size) {
	      return setListBounds(this, 0, size);
	    };

	    // @pragma Iteration

	    List.prototype.slice = function(begin, end) {
	      var size = this.size;
	      if (wholeSlice(begin, end, size)) {
	        return this;
	      }
	      return setListBounds(
	        this,
	        resolveBegin(begin, size),
	        resolveEnd(end, size)
	      );
	    };

	    List.prototype.__iterator = function(type, reverse) {
	      var index = 0;
	      var values = iterateList(this, reverse);
	      return new Iterator(function()  {
	        var value = values();
	        return value === DONE ?
	          iteratorDone() :
	          iteratorValue(type, index++, value);
	      });
	    };

	    List.prototype.__iterate = function(fn, reverse) {
	      var index = 0;
	      var values = iterateList(this, reverse);
	      var value;
	      while ((value = values()) !== DONE) {
	        if (fn(value, index++, this) === false) {
	          break;
	        }
	      }
	      return index;
	    };

	    List.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        return this;
	      }
	      return makeList(this._origin, this._capacity, this._level, this._root, this._tail, ownerID, this.__hash);
	    };


	  function isList(maybeList) {
	    return !!(maybeList && maybeList[IS_LIST_SENTINEL]);
	  }

	  List.isList = isList;

	  var IS_LIST_SENTINEL = '@@__IMMUTABLE_LIST__@@';

	  var ListPrototype = List.prototype;
	  ListPrototype[IS_LIST_SENTINEL] = true;
	  ListPrototype[DELETE] = ListPrototype.remove;
	  ListPrototype.setIn = MapPrototype.setIn;
	  ListPrototype.deleteIn =
	  ListPrototype.removeIn = MapPrototype.removeIn;
	  ListPrototype.update = MapPrototype.update;
	  ListPrototype.updateIn = MapPrototype.updateIn;
	  ListPrototype.mergeIn = MapPrototype.mergeIn;
	  ListPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
	  ListPrototype.withMutations = MapPrototype.withMutations;
	  ListPrototype.asMutable = MapPrototype.asMutable;
	  ListPrototype.asImmutable = MapPrototype.asImmutable;
	  ListPrototype.wasAltered = MapPrototype.wasAltered;



	    function VNode(array, ownerID) {
	      this.array = array;
	      this.ownerID = ownerID;
	    }

	    // TODO: seems like these methods are very similar

	    VNode.prototype.removeBefore = function(ownerID, level, index) {
	      if (index === level ? 1 << level : 0 || this.array.length === 0) {
	        return this;
	      }
	      var originIndex = (index >>> level) & MASK;
	      if (originIndex >= this.array.length) {
	        return new VNode([], ownerID);
	      }
	      var removingFirst = originIndex === 0;
	      var newChild;
	      if (level > 0) {
	        var oldChild = this.array[originIndex];
	        newChild = oldChild && oldChild.removeBefore(ownerID, level - SHIFT, index);
	        if (newChild === oldChild && removingFirst) {
	          return this;
	        }
	      }
	      if (removingFirst && !newChild) {
	        return this;
	      }
	      var editable = editableVNode(this, ownerID);
	      if (!removingFirst) {
	        for (var ii = 0; ii < originIndex; ii++) {
	          editable.array[ii] = undefined;
	        }
	      }
	      if (newChild) {
	        editable.array[originIndex] = newChild;
	      }
	      return editable;
	    };

	    VNode.prototype.removeAfter = function(ownerID, level, index) {
	      if (index === (level ? 1 << level : 0) || this.array.length === 0) {
	        return this;
	      }
	      var sizeIndex = ((index - 1) >>> level) & MASK;
	      if (sizeIndex >= this.array.length) {
	        return this;
	      }

	      var newChild;
	      if (level > 0) {
	        var oldChild = this.array[sizeIndex];
	        newChild = oldChild && oldChild.removeAfter(ownerID, level - SHIFT, index);
	        if (newChild === oldChild && sizeIndex === this.array.length - 1) {
	          return this;
	        }
	      }

	      var editable = editableVNode(this, ownerID);
	      editable.array.splice(sizeIndex + 1);
	      if (newChild) {
	        editable.array[sizeIndex] = newChild;
	      }
	      return editable;
	    };



	  var DONE = {};

	  function iterateList(list, reverse) {
	    var left = list._origin;
	    var right = list._capacity;
	    var tailPos = getTailOffset(right);
	    var tail = list._tail;

	    return iterateNodeOrLeaf(list._root, list._level, 0);

	    function iterateNodeOrLeaf(node, level, offset) {
	      return level === 0 ?
	        iterateLeaf(node, offset) :
	        iterateNode(node, level, offset);
	    }

	    function iterateLeaf(node, offset) {
	      var array = offset === tailPos ? tail && tail.array : node && node.array;
	      var from = offset > left ? 0 : left - offset;
	      var to = right - offset;
	      if (to > SIZE) {
	        to = SIZE;
	      }
	      return function()  {
	        if (from === to) {
	          return DONE;
	        }
	        var idx = reverse ? --to : from++;
	        return array && array[idx];
	      };
	    }

	    function iterateNode(node, level, offset) {
	      var values;
	      var array = node && node.array;
	      var from = offset > left ? 0 : (left - offset) >> level;
	      var to = ((right - offset) >> level) + 1;
	      if (to > SIZE) {
	        to = SIZE;
	      }
	      return function()  {
	        do {
	          if (values) {
	            var value = values();
	            if (value !== DONE) {
	              return value;
	            }
	            values = null;
	          }
	          if (from === to) {
	            return DONE;
	          }
	          var idx = reverse ? --to : from++;
	          values = iterateNodeOrLeaf(
	            array && array[idx], level - SHIFT, offset + (idx << level)
	          );
	        } while (true);
	      };
	    }
	  }

	  function makeList(origin, capacity, level, root, tail, ownerID, hash) {
	    var list = __webpack_provided_Object_dot_create(ListPrototype);
	    list.size = capacity - origin;
	    list._origin = origin;
	    list._capacity = capacity;
	    list._level = level;
	    list._root = root;
	    list._tail = tail;
	    list.__ownerID = ownerID;
	    list.__hash = hash;
	    list.__altered = false;
	    return list;
	  }

	  var EMPTY_LIST;
	  function emptyList() {
	    return EMPTY_LIST || (EMPTY_LIST = makeList(0, 0, SHIFT));
	  }

	  function updateList(list, index, value) {
	    index = wrapIndex(list, index);

	    if (index !== index) {
	      return list;
	    }

	    if (index >= list.size || index < 0) {
	      return list.withMutations(function(list ) {
	        index < 0 ?
	          setListBounds(list, index).set(0, value) :
	          setListBounds(list, 0, index + 1).set(index, value)
	      });
	    }

	    index += list._origin;

	    var newTail = list._tail;
	    var newRoot = list._root;
	    var didAlter = MakeRef(DID_ALTER);
	    if (index >= getTailOffset(list._capacity)) {
	      newTail = updateVNode(newTail, list.__ownerID, 0, index, value, didAlter);
	    } else {
	      newRoot = updateVNode(newRoot, list.__ownerID, list._level, index, value, didAlter);
	    }

	    if (!didAlter.value) {
	      return list;
	    }

	    if (list.__ownerID) {
	      list._root = newRoot;
	      list._tail = newTail;
	      list.__hash = undefined;
	      list.__altered = true;
	      return list;
	    }
	    return makeList(list._origin, list._capacity, list._level, newRoot, newTail);
	  }

	  function updateVNode(node, ownerID, level, index, value, didAlter) {
	    var idx = (index >>> level) & MASK;
	    var nodeHas = node && idx < node.array.length;
	    if (!nodeHas && value === undefined) {
	      return node;
	    }

	    var newNode;

	    if (level > 0) {
	      var lowerNode = node && node.array[idx];
	      var newLowerNode = updateVNode(lowerNode, ownerID, level - SHIFT, index, value, didAlter);
	      if (newLowerNode === lowerNode) {
	        return node;
	      }
	      newNode = editableVNode(node, ownerID);
	      newNode.array[idx] = newLowerNode;
	      return newNode;
	    }

	    if (nodeHas && node.array[idx] === value) {
	      return node;
	    }

	    SetRef(didAlter);

	    newNode = editableVNode(node, ownerID);
	    if (value === undefined && idx === newNode.array.length - 1) {
	      newNode.array.pop();
	    } else {
	      newNode.array[idx] = value;
	    }
	    return newNode;
	  }

	  function editableVNode(node, ownerID) {
	    if (ownerID && node && ownerID === node.ownerID) {
	      return node;
	    }
	    return new VNode(node ? node.array.slice() : [], ownerID);
	  }

	  function listNodeFor(list, rawIndex) {
	    if (rawIndex >= getTailOffset(list._capacity)) {
	      return list._tail;
	    }
	    if (rawIndex < 1 << (list._level + SHIFT)) {
	      var node = list._root;
	      var level = list._level;
	      while (node && level > 0) {
	        node = node.array[(rawIndex >>> level) & MASK];
	        level -= SHIFT;
	      }
	      return node;
	    }
	  }

	  function setListBounds(list, begin, end) {
	    // Sanitize begin & end using this shorthand for ToInt32(argument)
	    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
	    if (begin !== undefined) {
	      begin = begin | 0;
	    }
	    if (end !== undefined) {
	      end = end | 0;
	    }
	    var owner = list.__ownerID || new OwnerID();
	    var oldOrigin = list._origin;
	    var oldCapacity = list._capacity;
	    var newOrigin = oldOrigin + begin;
	    var newCapacity = end === undefined ? oldCapacity : end < 0 ? oldCapacity + end : oldOrigin + end;
	    if (newOrigin === oldOrigin && newCapacity === oldCapacity) {
	      return list;
	    }

	    // If it's going to end after it starts, it's empty.
	    if (newOrigin >= newCapacity) {
	      return list.clear();
	    }

	    var newLevel = list._level;
	    var newRoot = list._root;

	    // New origin might need creating a higher root.
	    var offsetShift = 0;
	    while (newOrigin + offsetShift < 0) {
	      newRoot = new VNode(newRoot && newRoot.array.length ? [undefined, newRoot] : [], owner);
	      newLevel += SHIFT;
	      offsetShift += 1 << newLevel;
	    }
	    if (offsetShift) {
	      newOrigin += offsetShift;
	      oldOrigin += offsetShift;
	      newCapacity += offsetShift;
	      oldCapacity += offsetShift;
	    }

	    var oldTailOffset = getTailOffset(oldCapacity);
	    var newTailOffset = getTailOffset(newCapacity);

	    // New size might need creating a higher root.
	    while (newTailOffset >= 1 << (newLevel + SHIFT)) {
	      newRoot = new VNode(newRoot && newRoot.array.length ? [newRoot] : [], owner);
	      newLevel += SHIFT;
	    }

	    // Locate or create the new tail.
	    var oldTail = list._tail;
	    var newTail = newTailOffset < oldTailOffset ?
	      listNodeFor(list, newCapacity - 1) :
	      newTailOffset > oldTailOffset ? new VNode([], owner) : oldTail;

	    // Merge Tail into tree.
	    if (oldTail && newTailOffset > oldTailOffset && newOrigin < oldCapacity && oldTail.array.length) {
	      newRoot = editableVNode(newRoot, owner);
	      var node = newRoot;
	      for (var level = newLevel; level > SHIFT; level -= SHIFT) {
	        var idx = (oldTailOffset >>> level) & MASK;
	        node = node.array[idx] = editableVNode(node.array[idx], owner);
	      }
	      node.array[(oldTailOffset >>> SHIFT) & MASK] = oldTail;
	    }

	    // If the size has been reduced, there's a chance the tail needs to be trimmed.
	    if (newCapacity < oldCapacity) {
	      newTail = newTail && newTail.removeAfter(owner, 0, newCapacity);
	    }

	    // If the new origin is within the tail, then we do not need a root.
	    if (newOrigin >= newTailOffset) {
	      newOrigin -= newTailOffset;
	      newCapacity -= newTailOffset;
	      newLevel = SHIFT;
	      newRoot = null;
	      newTail = newTail && newTail.removeBefore(owner, 0, newOrigin);

	    // Otherwise, if the root has been trimmed, garbage collect.
	    } else if (newOrigin > oldOrigin || newTailOffset < oldTailOffset) {
	      offsetShift = 0;

	      // Identify the new top root node of the subtree of the old root.
	      while (newRoot) {
	        var beginIndex = (newOrigin >>> newLevel) & MASK;
	        if (beginIndex !== (newTailOffset >>> newLevel) & MASK) {
	          break;
	        }
	        if (beginIndex) {
	          offsetShift += (1 << newLevel) * beginIndex;
	        }
	        newLevel -= SHIFT;
	        newRoot = newRoot.array[beginIndex];
	      }

	      // Trim the new sides of the new root.
	      if (newRoot && newOrigin > oldOrigin) {
	        newRoot = newRoot.removeBefore(owner, newLevel, newOrigin - offsetShift);
	      }
	      if (newRoot && newTailOffset < oldTailOffset) {
	        newRoot = newRoot.removeAfter(owner, newLevel, newTailOffset - offsetShift);
	      }
	      if (offsetShift) {
	        newOrigin -= offsetShift;
	        newCapacity -= offsetShift;
	      }
	    }

	    if (list.__ownerID) {
	      list.size = newCapacity - newOrigin;
	      list._origin = newOrigin;
	      list._capacity = newCapacity;
	      list._level = newLevel;
	      list._root = newRoot;
	      list._tail = newTail;
	      list.__hash = undefined;
	      list.__altered = true;
	      return list;
	    }
	    return makeList(newOrigin, newCapacity, newLevel, newRoot, newTail);
	  }

	  function mergeIntoListWith(list, merger, iterables) {
	    var iters = [];
	    var maxSize = 0;
	    for (var ii = 0; ii < iterables.length; ii++) {
	      var value = iterables[ii];
	      var iter = IndexedIterable(value);
	      if (iter.size > maxSize) {
	        maxSize = iter.size;
	      }
	      if (!isIterable(value)) {
	        iter = iter.map(function(v ) {return fromJS(v)});
	      }
	      iters.push(iter);
	    }
	    if (maxSize > list.size) {
	      list = list.setSize(maxSize);
	    }
	    return mergeIntoCollectionWith(list, merger, iters);
	  }

	  function getTailOffset(size) {
	    return size < SIZE ? 0 : (((size - 1) >>> SHIFT) << SHIFT);
	  }

	  createClass(OrderedMap, Map);

	    // @pragma Construction

	    function OrderedMap(value) {
	      return value === null || value === undefined ? emptyOrderedMap() :
	        isOrderedMap(value) ? value :
	        emptyOrderedMap().withMutations(function(map ) {
	          var iter = KeyedIterable(value);
	          assertNotInfinite(iter.size);
	          iter.forEach(function(v, k)  {return map.set(k, v)});
	        });
	    }

	    OrderedMap.of = function(/*...values*/) {
	      return this(arguments);
	    };

	    OrderedMap.prototype.toString = function() {
	      return this.__toString('OrderedMap {', '}');
	    };

	    // @pragma Access

	    OrderedMap.prototype.get = function(k, notSetValue) {
	      var index = this._map.get(k);
	      return index !== undefined ? this._list.get(index)[1] : notSetValue;
	    };

	    // @pragma Modification

	    OrderedMap.prototype.clear = function() {
	      if (this.size === 0) {
	        return this;
	      }
	      if (this.__ownerID) {
	        this.size = 0;
	        this._map.clear();
	        this._list.clear();
	        return this;
	      }
	      return emptyOrderedMap();
	    };

	    OrderedMap.prototype.set = function(k, v) {
	      return updateOrderedMap(this, k, v);
	    };

	    OrderedMap.prototype.remove = function(k) {
	      return updateOrderedMap(this, k, NOT_SET);
	    };

	    OrderedMap.prototype.wasAltered = function() {
	      return this._map.wasAltered() || this._list.wasAltered();
	    };

	    OrderedMap.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      return this._list.__iterate(
	        function(entry ) {return entry && fn(entry[1], entry[0], this$0)},
	        reverse
	      );
	    };

	    OrderedMap.prototype.__iterator = function(type, reverse) {
	      return this._list.fromEntrySeq().__iterator(type, reverse);
	    };

	    OrderedMap.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      var newMap = this._map.__ensureOwner(ownerID);
	      var newList = this._list.__ensureOwner(ownerID);
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        this._map = newMap;
	        this._list = newList;
	        return this;
	      }
	      return makeOrderedMap(newMap, newList, ownerID, this.__hash);
	    };


	  function isOrderedMap(maybeOrderedMap) {
	    return isMap(maybeOrderedMap) && isOrdered(maybeOrderedMap);
	  }

	  OrderedMap.isOrderedMap = isOrderedMap;

	  OrderedMap.prototype[IS_ORDERED_SENTINEL] = true;
	  OrderedMap.prototype[DELETE] = OrderedMap.prototype.remove;



	  function makeOrderedMap(map, list, ownerID, hash) {
	    var omap = __webpack_provided_Object_dot_create(OrderedMap.prototype);
	    omap.size = map ? map.size : 0;
	    omap._map = map;
	    omap._list = list;
	    omap.__ownerID = ownerID;
	    omap.__hash = hash;
	    return omap;
	  }

	  var EMPTY_ORDERED_MAP;
	  function emptyOrderedMap() {
	    return EMPTY_ORDERED_MAP || (EMPTY_ORDERED_MAP = makeOrderedMap(emptyMap(), emptyList()));
	  }

	  function updateOrderedMap(omap, k, v) {
	    var map = omap._map;
	    var list = omap._list;
	    var i = map.get(k);
	    var has = i !== undefined;
	    var newMap;
	    var newList;
	    if (v === NOT_SET) { // removed
	      if (!has) {
	        return omap;
	      }
	      if (list.size >= SIZE && list.size >= map.size * 2) {
	        newList = list.filter(function(entry, idx)  {return entry !== undefined && i !== idx});
	        newMap = newList.toKeyedSeq().map(function(entry ) {return entry[0]}).flip().toMap();
	        if (omap.__ownerID) {
	          newMap.__ownerID = newList.__ownerID = omap.__ownerID;
	        }
	      } else {
	        newMap = map.remove(k);
	        newList = i === list.size - 1 ? list.pop() : list.set(i, undefined);
	      }
	    } else {
	      if (has) {
	        if (v === list.get(i)[1]) {
	          return omap;
	        }
	        newMap = map;
	        newList = list.set(i, [k, v]);
	      } else {
	        newMap = map.set(k, list.size);
	        newList = list.set(list.size, [k, v]);
	      }
	    }
	    if (omap.__ownerID) {
	      omap.size = newMap.size;
	      omap._map = newMap;
	      omap._list = newList;
	      omap.__hash = undefined;
	      return omap;
	    }
	    return makeOrderedMap(newMap, newList);
	  }

	  createClass(ToKeyedSequence, KeyedSeq);
	    function ToKeyedSequence(indexed, useKeys) {
	      this._iter = indexed;
	      this._useKeys = useKeys;
	      this.size = indexed.size;
	    }

	    ToKeyedSequence.prototype.get = function(key, notSetValue) {
	      return this._iter.get(key, notSetValue);
	    };

	    ToKeyedSequence.prototype.has = function(key) {
	      return this._iter.has(key);
	    };

	    ToKeyedSequence.prototype.valueSeq = function() {
	      return this._iter.valueSeq();
	    };

	    ToKeyedSequence.prototype.reverse = function() {var this$0 = this;
	      var reversedSequence = reverseFactory(this, true);
	      if (!this._useKeys) {
	        reversedSequence.valueSeq = function()  {return this$0._iter.toSeq().reverse()};
	      }
	      return reversedSequence;
	    };

	    ToKeyedSequence.prototype.map = function(mapper, context) {var this$0 = this;
	      var mappedSequence = mapFactory(this, mapper, context);
	      if (!this._useKeys) {
	        mappedSequence.valueSeq = function()  {return this$0._iter.toSeq().map(mapper, context)};
	      }
	      return mappedSequence;
	    };

	    ToKeyedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      var ii;
	      return this._iter.__iterate(
	        this._useKeys ?
	          function(v, k)  {return fn(v, k, this$0)} :
	          ((ii = reverse ? resolveSize(this) : 0),
	            function(v ) {return fn(v, reverse ? --ii : ii++, this$0)}),
	        reverse
	      );
	    };

	    ToKeyedSequence.prototype.__iterator = function(type, reverse) {
	      if (this._useKeys) {
	        return this._iter.__iterator(type, reverse);
	      }
	      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	      var ii = reverse ? resolveSize(this) : 0;
	      return new Iterator(function()  {
	        var step = iterator.next();
	        return step.done ? step :
	          iteratorValue(type, reverse ? --ii : ii++, step.value, step);
	      });
	    };

	  ToKeyedSequence.prototype[IS_ORDERED_SENTINEL] = true;


	  createClass(ToIndexedSequence, IndexedSeq);
	    function ToIndexedSequence(iter) {
	      this._iter = iter;
	      this.size = iter.size;
	    }

	    ToIndexedSequence.prototype.includes = function(value) {
	      return this._iter.includes(value);
	    };

	    ToIndexedSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      var iterations = 0;
	      return this._iter.__iterate(function(v ) {return fn(v, iterations++, this$0)}, reverse);
	    };

	    ToIndexedSequence.prototype.__iterator = function(type, reverse) {
	      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	      var iterations = 0;
	      return new Iterator(function()  {
	        var step = iterator.next();
	        return step.done ? step :
	          iteratorValue(type, iterations++, step.value, step)
	      });
	    };



	  createClass(ToSetSequence, SetSeq);
	    function ToSetSequence(iter) {
	      this._iter = iter;
	      this.size = iter.size;
	    }

	    ToSetSequence.prototype.has = function(key) {
	      return this._iter.includes(key);
	    };

	    ToSetSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      return this._iter.__iterate(function(v ) {return fn(v, v, this$0)}, reverse);
	    };

	    ToSetSequence.prototype.__iterator = function(type, reverse) {
	      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	      return new Iterator(function()  {
	        var step = iterator.next();
	        return step.done ? step :
	          iteratorValue(type, step.value, step.value, step);
	      });
	    };



	  createClass(FromEntriesSequence, KeyedSeq);
	    function FromEntriesSequence(entries) {
	      this._iter = entries;
	      this.size = entries.size;
	    }

	    FromEntriesSequence.prototype.entrySeq = function() {
	      return this._iter.toSeq();
	    };

	    FromEntriesSequence.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      return this._iter.__iterate(function(entry ) {
	        // Check if entry exists first so array access doesn't throw for holes
	        // in the parent iteration.
	        if (entry) {
	          validateEntry(entry);
	          var indexedIterable = isIterable(entry);
	          return fn(
	            indexedIterable ? entry.get(1) : entry[1],
	            indexedIterable ? entry.get(0) : entry[0],
	            this$0
	          );
	        }
	      }, reverse);
	    };

	    FromEntriesSequence.prototype.__iterator = function(type, reverse) {
	      var iterator = this._iter.__iterator(ITERATE_VALUES, reverse);
	      return new Iterator(function()  {
	        while (true) {
	          var step = iterator.next();
	          if (step.done) {
	            return step;
	          }
	          var entry = step.value;
	          // Check if entry exists first so array access doesn't throw for holes
	          // in the parent iteration.
	          if (entry) {
	            validateEntry(entry);
	            var indexedIterable = isIterable(entry);
	            return iteratorValue(
	              type,
	              indexedIterable ? entry.get(0) : entry[0],
	              indexedIterable ? entry.get(1) : entry[1],
	              step
	            );
	          }
	        }
	      });
	    };


	  ToIndexedSequence.prototype.cacheResult =
	  ToKeyedSequence.prototype.cacheResult =
	  ToSetSequence.prototype.cacheResult =
	  FromEntriesSequence.prototype.cacheResult =
	    cacheResultThrough;


	  function flipFactory(iterable) {
	    var flipSequence = makeSequence(iterable);
	    flipSequence._iter = iterable;
	    flipSequence.size = iterable.size;
	    flipSequence.flip = function()  {return iterable};
	    flipSequence.reverse = function () {
	      var reversedSequence = iterable.reverse.apply(this); // super.reverse()
	      reversedSequence.flip = function()  {return iterable.reverse()};
	      return reversedSequence;
	    };
	    flipSequence.has = function(key ) {return iterable.includes(key)};
	    flipSequence.includes = function(key ) {return iterable.has(key)};
	    flipSequence.cacheResult = cacheResultThrough;
	    flipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
	      return iterable.__iterate(function(v, k)  {return fn(k, v, this$0) !== false}, reverse);
	    }
	    flipSequence.__iteratorUncached = function(type, reverse) {
	      if (type === ITERATE_ENTRIES) {
	        var iterator = iterable.__iterator(type, reverse);
	        return new Iterator(function()  {
	          var step = iterator.next();
	          if (!step.done) {
	            var k = step.value[0];
	            step.value[0] = step.value[1];
	            step.value[1] = k;
	          }
	          return step;
	        });
	      }
	      return iterable.__iterator(
	        type === ITERATE_VALUES ? ITERATE_KEYS : ITERATE_VALUES,
	        reverse
	      );
	    }
	    return flipSequence;
	  }


	  function mapFactory(iterable, mapper, context) {
	    var mappedSequence = makeSequence(iterable);
	    mappedSequence.size = iterable.size;
	    mappedSequence.has = function(key ) {return iterable.has(key)};
	    mappedSequence.get = function(key, notSetValue)  {
	      var v = iterable.get(key, NOT_SET);
	      return v === NOT_SET ?
	        notSetValue :
	        mapper.call(context, v, key, iterable);
	    };
	    mappedSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
	      return iterable.__iterate(
	        function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, this$0) !== false},
	        reverse
	      );
	    }
	    mappedSequence.__iteratorUncached = function (type, reverse) {
	      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	      return new Iterator(function()  {
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        var key = entry[0];
	        return iteratorValue(
	          type,
	          key,
	          mapper.call(context, entry[1], key, iterable),
	          step
	        );
	      });
	    }
	    return mappedSequence;
	  }


	  function reverseFactory(iterable, useKeys) {
	    var reversedSequence = makeSequence(iterable);
	    reversedSequence._iter = iterable;
	    reversedSequence.size = iterable.size;
	    reversedSequence.reverse = function()  {return iterable};
	    if (iterable.flip) {
	      reversedSequence.flip = function () {
	        var flipSequence = flipFactory(iterable);
	        flipSequence.reverse = function()  {return iterable.flip()};
	        return flipSequence;
	      };
	    }
	    reversedSequence.get = function(key, notSetValue) 
	      {return iterable.get(useKeys ? key : -1 - key, notSetValue)};
	    reversedSequence.has = function(key )
	      {return iterable.has(useKeys ? key : -1 - key)};
	    reversedSequence.includes = function(value ) {return iterable.includes(value)};
	    reversedSequence.cacheResult = cacheResultThrough;
	    reversedSequence.__iterate = function (fn, reverse) {var this$0 = this;
	      return iterable.__iterate(function(v, k)  {return fn(v, k, this$0)}, !reverse);
	    };
	    reversedSequence.__iterator =
	      function(type, reverse)  {return iterable.__iterator(type, !reverse)};
	    return reversedSequence;
	  }


	  function filterFactory(iterable, predicate, context, useKeys) {
	    var filterSequence = makeSequence(iterable);
	    if (useKeys) {
	      filterSequence.has = function(key ) {
	        var v = iterable.get(key, NOT_SET);
	        return v !== NOT_SET && !!predicate.call(context, v, key, iterable);
	      };
	      filterSequence.get = function(key, notSetValue)  {
	        var v = iterable.get(key, NOT_SET);
	        return v !== NOT_SET && predicate.call(context, v, key, iterable) ?
	          v : notSetValue;
	      };
	    }
	    filterSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
	      var iterations = 0;
	      iterable.__iterate(function(v, k, c)  {
	        if (predicate.call(context, v, k, c)) {
	          iterations++;
	          return fn(v, useKeys ? k : iterations - 1, this$0);
	        }
	      }, reverse);
	      return iterations;
	    };
	    filterSequence.__iteratorUncached = function (type, reverse) {
	      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	      var iterations = 0;
	      return new Iterator(function()  {
	        while (true) {
	          var step = iterator.next();
	          if (step.done) {
	            return step;
	          }
	          var entry = step.value;
	          var key = entry[0];
	          var value = entry[1];
	          if (predicate.call(context, value, key, iterable)) {
	            return iteratorValue(type, useKeys ? key : iterations++, value, step);
	          }
	        }
	      });
	    }
	    return filterSequence;
	  }


	  function countByFactory(iterable, grouper, context) {
	    var groups = Map().asMutable();
	    iterable.__iterate(function(v, k)  {
	      groups.update(
	        grouper.call(context, v, k, iterable),
	        0,
	        function(a ) {return a + 1}
	      );
	    });
	    return groups.asImmutable();
	  }


	  function groupByFactory(iterable, grouper, context) {
	    var isKeyedIter = isKeyed(iterable);
	    var groups = (isOrdered(iterable) ? OrderedMap() : Map()).asMutable();
	    iterable.__iterate(function(v, k)  {
	      groups.update(
	        grouper.call(context, v, k, iterable),
	        function(a ) {return (a = a || [], a.push(isKeyedIter ? [k, v] : v), a)}
	      );
	    });
	    var coerce = iterableClass(iterable);
	    return groups.map(function(arr ) {return reify(iterable, coerce(arr))});
	  }


	  function sliceFactory(iterable, begin, end, useKeys) {
	    var originalSize = iterable.size;

	    // Sanitize begin & end using this shorthand for ToInt32(argument)
	    // http://www.ecma-international.org/ecma-262/6.0/#sec-toint32
	    if (begin !== undefined) {
	      begin = begin | 0;
	    }
	    if (end !== undefined) {
	      end = end | 0;
	    }

	    if (wholeSlice(begin, end, originalSize)) {
	      return iterable;
	    }

	    var resolvedBegin = resolveBegin(begin, originalSize);
	    var resolvedEnd = resolveEnd(end, originalSize);

	    // begin or end will be NaN if they were provided as negative numbers and
	    // this iterable's size is unknown. In that case, cache first so there is
	    // a known size and these do not resolve to NaN.
	    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
	      return sliceFactory(iterable.toSeq().cacheResult(), begin, end, useKeys);
	    }

	    // Note: resolvedEnd is undefined when the original sequence's length is
	    // unknown and this slice did not supply an end and should contain all
	    // elements after resolvedBegin.
	    // In that case, resolvedSize will be NaN and sliceSize will remain undefined.
	    var resolvedSize = resolvedEnd - resolvedBegin;
	    var sliceSize;
	    if (resolvedSize === resolvedSize) {
	      sliceSize = resolvedSize < 0 ? 0 : resolvedSize;
	    }

	    var sliceSeq = makeSequence(iterable);

	    // If iterable.size is undefined, the size of the realized sliceSeq is
	    // unknown at this point unless the number of items to slice is 0
	    sliceSeq.size = sliceSize === 0 ? sliceSize : iterable.size && sliceSize || undefined;

	    if (!useKeys && isSeq(iterable) && sliceSize >= 0) {
	      sliceSeq.get = function (index, notSetValue) {
	        index = wrapIndex(this, index);
	        return index >= 0 && index < sliceSize ?
	          iterable.get(index + resolvedBegin, notSetValue) :
	          notSetValue;
	      }
	    }

	    sliceSeq.__iterateUncached = function(fn, reverse) {var this$0 = this;
	      if (sliceSize === 0) {
	        return 0;
	      }
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse);
	      }
	      var skipped = 0;
	      var isSkipping = true;
	      var iterations = 0;
	      iterable.__iterate(function(v, k)  {
	        if (!(isSkipping && (isSkipping = skipped++ < resolvedBegin))) {
	          iterations++;
	          return fn(v, useKeys ? k : iterations - 1, this$0) !== false &&
	                 iterations !== sliceSize;
	        }
	      });
	      return iterations;
	    };

	    sliceSeq.__iteratorUncached = function(type, reverse) {
	      if (sliceSize !== 0 && reverse) {
	        return this.cacheResult().__iterator(type, reverse);
	      }
	      // Don't bother instantiating parent iterator if taking 0.
	      var iterator = sliceSize !== 0 && iterable.__iterator(type, reverse);
	      var skipped = 0;
	      var iterations = 0;
	      return new Iterator(function()  {
	        while (skipped++ < resolvedBegin) {
	          iterator.next();
	        }
	        if (++iterations > sliceSize) {
	          return iteratorDone();
	        }
	        var step = iterator.next();
	        if (useKeys || type === ITERATE_VALUES) {
	          return step;
	        } else if (type === ITERATE_KEYS) {
	          return iteratorValue(type, iterations - 1, undefined, step);
	        } else {
	          return iteratorValue(type, iterations - 1, step.value[1], step);
	        }
	      });
	    }

	    return sliceSeq;
	  }


	  function takeWhileFactory(iterable, predicate, context) {
	    var takeSequence = makeSequence(iterable);
	    takeSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse);
	      }
	      var iterations = 0;
	      iterable.__iterate(function(v, k, c) 
	        {return predicate.call(context, v, k, c) && ++iterations && fn(v, k, this$0)}
	      );
	      return iterations;
	    };
	    takeSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
	      if (reverse) {
	        return this.cacheResult().__iterator(type, reverse);
	      }
	      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	      var iterating = true;
	      return new Iterator(function()  {
	        if (!iterating) {
	          return iteratorDone();
	        }
	        var step = iterator.next();
	        if (step.done) {
	          return step;
	        }
	        var entry = step.value;
	        var k = entry[0];
	        var v = entry[1];
	        if (!predicate.call(context, v, k, this$0)) {
	          iterating = false;
	          return iteratorDone();
	        }
	        return type === ITERATE_ENTRIES ? step :
	          iteratorValue(type, k, v, step);
	      });
	    };
	    return takeSequence;
	  }


	  function skipWhileFactory(iterable, predicate, context, useKeys) {
	    var skipSequence = makeSequence(iterable);
	    skipSequence.__iterateUncached = function (fn, reverse) {var this$0 = this;
	      if (reverse) {
	        return this.cacheResult().__iterate(fn, reverse);
	      }
	      var isSkipping = true;
	      var iterations = 0;
	      iterable.__iterate(function(v, k, c)  {
	        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
	          iterations++;
	          return fn(v, useKeys ? k : iterations - 1, this$0);
	        }
	      });
	      return iterations;
	    };
	    skipSequence.__iteratorUncached = function(type, reverse) {var this$0 = this;
	      if (reverse) {
	        return this.cacheResult().__iterator(type, reverse);
	      }
	      var iterator = iterable.__iterator(ITERATE_ENTRIES, reverse);
	      var skipping = true;
	      var iterations = 0;
	      return new Iterator(function()  {
	        var step, k, v;
	        do {
	          step = iterator.next();
	          if (step.done) {
	            if (useKeys || type === ITERATE_VALUES) {
	              return step;
	            } else if (type === ITERATE_KEYS) {
	              return iteratorValue(type, iterations++, undefined, step);
	            } else {
	              return iteratorValue(type, iterations++, step.value[1], step);
	            }
	          }
	          var entry = step.value;
	          k = entry[0];
	          v = entry[1];
	          skipping && (skipping = predicate.call(context, v, k, this$0));
	        } while (skipping);
	        return type === ITERATE_ENTRIES ? step :
	          iteratorValue(type, k, v, step);
	      });
	    };
	    return skipSequence;
	  }


	  function concatFactory(iterable, values) {
	    var isKeyedIterable = isKeyed(iterable);
	    var iters = [iterable].concat(values).map(function(v ) {
	      if (!isIterable(v)) {
	        v = isKeyedIterable ?
	          keyedSeqFromValue(v) :
	          indexedSeqFromValue(Array.isArray(v) ? v : [v]);
	      } else if (isKeyedIterable) {
	        v = KeyedIterable(v);
	      }
	      return v;
	    }).filter(function(v ) {return v.size !== 0});

	    if (iters.length === 0) {
	      return iterable;
	    }

	    if (iters.length === 1) {
	      var singleton = iters[0];
	      if (singleton === iterable ||
	          isKeyedIterable && isKeyed(singleton) ||
	          isIndexed(iterable) && isIndexed(singleton)) {
	        return singleton;
	      }
	    }

	    var concatSeq = new ArraySeq(iters);
	    if (isKeyedIterable) {
	      concatSeq = concatSeq.toKeyedSeq();
	    } else if (!isIndexed(iterable)) {
	      concatSeq = concatSeq.toSetSeq();
	    }
	    concatSeq = concatSeq.flatten(true);
	    concatSeq.size = iters.reduce(
	      function(sum, seq)  {
	        if (sum !== undefined) {
	          var size = seq.size;
	          if (size !== undefined) {
	            return sum + size;
	          }
	        }
	      },
	      0
	    );
	    return concatSeq;
	  }


	  function flattenFactory(iterable, depth, useKeys) {
	    var flatSequence = makeSequence(iterable);
	    flatSequence.__iterateUncached = function(fn, reverse) {
	      var iterations = 0;
	      var stopped = false;
	      function flatDeep(iter, currentDepth) {var this$0 = this;
	        iter.__iterate(function(v, k)  {
	          if ((!depth || currentDepth < depth) && isIterable(v)) {
	            flatDeep(v, currentDepth + 1);
	          } else if (fn(v, useKeys ? k : iterations++, this$0) === false) {
	            stopped = true;
	          }
	          return !stopped;
	        }, reverse);
	      }
	      flatDeep(iterable, 0);
	      return iterations;
	    }
	    flatSequence.__iteratorUncached = function(type, reverse) {
	      var iterator = iterable.__iterator(type, reverse);
	      var stack = [];
	      var iterations = 0;
	      return new Iterator(function()  {
	        while (iterator) {
	          var step = iterator.next();
	          if (step.done !== false) {
	            iterator = stack.pop();
	            continue;
	          }
	          var v = step.value;
	          if (type === ITERATE_ENTRIES) {
	            v = v[1];
	          }
	          if ((!depth || stack.length < depth) && isIterable(v)) {
	            stack.push(iterator);
	            iterator = v.__iterator(type, reverse);
	          } else {
	            return useKeys ? step : iteratorValue(type, iterations++, v, step);
	          }
	        }
	        return iteratorDone();
	      });
	    }
	    return flatSequence;
	  }


	  function flatMapFactory(iterable, mapper, context) {
	    var coerce = iterableClass(iterable);
	    return iterable.toSeq().map(
	      function(v, k)  {return coerce(mapper.call(context, v, k, iterable))}
	    ).flatten(true);
	  }


	  function interposeFactory(iterable, separator) {
	    var interposedSequence = makeSequence(iterable);
	    interposedSequence.size = iterable.size && iterable.size * 2 -1;
	    interposedSequence.__iterateUncached = function(fn, reverse) {var this$0 = this;
	      var iterations = 0;
	      iterable.__iterate(function(v, k) 
	        {return (!iterations || fn(separator, iterations++, this$0) !== false) &&
	        fn(v, iterations++, this$0) !== false},
	        reverse
	      );
	      return iterations;
	    };
	    interposedSequence.__iteratorUncached = function(type, reverse) {
	      var iterator = iterable.__iterator(ITERATE_VALUES, reverse);
	      var iterations = 0;
	      var step;
	      return new Iterator(function()  {
	        if (!step || iterations % 2) {
	          step = iterator.next();
	          if (step.done) {
	            return step;
	          }
	        }
	        return iterations % 2 ?
	          iteratorValue(type, iterations++, separator) :
	          iteratorValue(type, iterations++, step.value, step);
	      });
	    };
	    return interposedSequence;
	  }


	  function sortFactory(iterable, comparator, mapper) {
	    if (!comparator) {
	      comparator = defaultComparator;
	    }
	    var isKeyedIterable = isKeyed(iterable);
	    var index = 0;
	    var entries = iterable.toSeq().map(
	      function(v, k)  {return [k, v, index++, mapper ? mapper(v, k, iterable) : v]}
	    ).toArray();
	    entries.sort(function(a, b)  {return comparator(a[3], b[3]) || a[2] - b[2]}).forEach(
	      isKeyedIterable ?
	      function(v, i)  { entries[i].length = 2; } :
	      function(v, i)  { entries[i] = v[1]; }
	    );
	    return isKeyedIterable ? KeyedSeq(entries) :
	      isIndexed(iterable) ? IndexedSeq(entries) :
	      SetSeq(entries);
	  }


	  function maxFactory(iterable, comparator, mapper) {
	    if (!comparator) {
	      comparator = defaultComparator;
	    }
	    if (mapper) {
	      var entry = iterable.toSeq()
	        .map(function(v, k)  {return [v, mapper(v, k, iterable)]})
	        .reduce(function(a, b)  {return maxCompare(comparator, a[1], b[1]) ? b : a});
	      return entry && entry[0];
	    } else {
	      return iterable.reduce(function(a, b)  {return maxCompare(comparator, a, b) ? b : a});
	    }
	  }

	  function maxCompare(comparator, a, b) {
	    var comp = comparator(b, a);
	    // b is considered the new max if the comparator declares them equal, but
	    // they are not equal and b is in fact a nullish value.
	    return (comp === 0 && b !== a && (b === undefined || b === null || b !== b)) || comp > 0;
	  }


	  function zipWithFactory(keyIter, zipper, iters) {
	    var zipSequence = makeSequence(keyIter);
	    zipSequence.size = new ArraySeq(iters).map(function(i ) {return i.size}).min();
	    // Note: this a generic base implementation of __iterate in terms of
	    // __iterator which may be more generically useful in the future.
	    zipSequence.__iterate = function(fn, reverse) {
	      /* generic:
	      var iterator = this.__iterator(ITERATE_ENTRIES, reverse);
	      var step;
	      var iterations = 0;
	      while (!(step = iterator.next()).done) {
	        iterations++;
	        if (fn(step.value[1], step.value[0], this) === false) {
	          break;
	        }
	      }
	      return iterations;
	      */
	      // indexed:
	      var iterator = this.__iterator(ITERATE_VALUES, reverse);
	      var step;
	      var iterations = 0;
	      while (!(step = iterator.next()).done) {
	        if (fn(step.value, iterations++, this) === false) {
	          break;
	        }
	      }
	      return iterations;
	    };
	    zipSequence.__iteratorUncached = function(type, reverse) {
	      var iterators = iters.map(function(i )
	        {return (i = Iterable(i), getIterator(reverse ? i.reverse() : i))}
	      );
	      var iterations = 0;
	      var isDone = false;
	      return new Iterator(function()  {
	        var steps;
	        if (!isDone) {
	          steps = iterators.map(function(i ) {return i.next()});
	          isDone = steps.some(function(s ) {return s.done});
	        }
	        if (isDone) {
	          return iteratorDone();
	        }
	        return iteratorValue(
	          type,
	          iterations++,
	          zipper.apply(null, steps.map(function(s ) {return s.value}))
	        );
	      });
	    };
	    return zipSequence
	  }


	  // #pragma Helper Functions

	  function reify(iter, seq) {
	    return isSeq(iter) ? seq : iter.constructor(seq);
	  }

	  function validateEntry(entry) {
	    if (entry !== Object(entry)) {
	      throw new TypeError('Expected [K, V] tuple: ' + entry);
	    }
	  }

	  function resolveSize(iter) {
	    assertNotInfinite(iter.size);
	    return ensureSize(iter);
	  }

	  function iterableClass(iterable) {
	    return isKeyed(iterable) ? KeyedIterable :
	      isIndexed(iterable) ? IndexedIterable :
	      SetIterable;
	  }

	  function makeSequence(iterable) {
	    return __webpack_provided_Object_dot_create(
	      (
	        isKeyed(iterable) ? KeyedSeq :
	        isIndexed(iterable) ? IndexedSeq :
	        SetSeq
	      ).prototype
	    );
	  }

	  function cacheResultThrough() {
	    if (this._iter.cacheResult) {
	      this._iter.cacheResult();
	      this.size = this._iter.size;
	      return this;
	    } else {
	      return Seq.prototype.cacheResult.call(this);
	    }
	  }

	  function defaultComparator(a, b) {
	    return a > b ? 1 : a < b ? -1 : 0;
	  }

	  function forceIterator(keyPath) {
	    var iter = getIterator(keyPath);
	    if (!iter) {
	      // Array might not be iterable in this environment, so we need a fallback
	      // to our wrapped type.
	      if (!isArrayLike(keyPath)) {
	        throw new TypeError('Expected iterable or array-like: ' + keyPath);
	      }
	      iter = getIterator(Iterable(keyPath));
	    }
	    return iter;
	  }

	  createClass(Record, KeyedCollection);

	    function Record(defaultValues, name) {
	      var hasInitialized;

	      var RecordType = function Record(values) {
	        if (values instanceof RecordType) {
	          return values;
	        }
	        if (!(this instanceof RecordType)) {
	          return new RecordType(values);
	        }
	        if (!hasInitialized) {
	          hasInitialized = true;
	          var keys = Object.keys(defaultValues);
	          setProps(RecordTypePrototype, keys);
	          RecordTypePrototype.size = keys.length;
	          RecordTypePrototype._name = name;
	          RecordTypePrototype._keys = keys;
	          RecordTypePrototype._defaultValues = defaultValues;
	        }
	        this._map = Map(values);
	      };

	      var RecordTypePrototype = RecordType.prototype = __webpack_provided_Object_dot_create(RecordPrototype);
	      RecordTypePrototype.constructor = RecordType;

	      return RecordType;
	    }

	    Record.prototype.toString = function() {
	      return this.__toString(recordName(this) + ' {', '}');
	    };

	    // @pragma Access

	    Record.prototype.has = function(k) {
	      return this._defaultValues.hasOwnProperty(k);
	    };

	    Record.prototype.get = function(k, notSetValue) {
	      if (!this.has(k)) {
	        return notSetValue;
	      }
	      var defaultVal = this._defaultValues[k];
	      return this._map ? this._map.get(k, defaultVal) : defaultVal;
	    };

	    // @pragma Modification

	    Record.prototype.clear = function() {
	      if (this.__ownerID) {
	        this._map && this._map.clear();
	        return this;
	      }
	      var RecordType = this.constructor;
	      return RecordType._empty || (RecordType._empty = makeRecord(this, emptyMap()));
	    };

	    Record.prototype.set = function(k, v) {
	      if (!this.has(k)) {
	        throw new Error('Cannot set unknown key "' + k + '" on ' + recordName(this));
	      }
	      var newMap = this._map && this._map.set(k, v);
	      if (this.__ownerID || newMap === this._map) {
	        return this;
	      }
	      return makeRecord(this, newMap);
	    };

	    Record.prototype.remove = function(k) {
	      if (!this.has(k)) {
	        return this;
	      }
	      var newMap = this._map && this._map.remove(k);
	      if (this.__ownerID || newMap === this._map) {
	        return this;
	      }
	      return makeRecord(this, newMap);
	    };

	    Record.prototype.wasAltered = function() {
	      return this._map.wasAltered();
	    };

	    Record.prototype.__iterator = function(type, reverse) {var this$0 = this;
	      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterator(type, reverse);
	    };

	    Record.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      return KeyedIterable(this._defaultValues).map(function(_, k)  {return this$0.get(k)}).__iterate(fn, reverse);
	    };

	    Record.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      var newMap = this._map && this._map.__ensureOwner(ownerID);
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        this._map = newMap;
	        return this;
	      }
	      return makeRecord(this, newMap, ownerID);
	    };


	  var RecordPrototype = Record.prototype;
	  RecordPrototype[DELETE] = RecordPrototype.remove;
	  RecordPrototype.deleteIn =
	  RecordPrototype.removeIn = MapPrototype.removeIn;
	  RecordPrototype.merge = MapPrototype.merge;
	  RecordPrototype.mergeWith = MapPrototype.mergeWith;
	  RecordPrototype.mergeIn = MapPrototype.mergeIn;
	  RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
	  RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
	  RecordPrototype.mergeDeepIn = MapPrototype.mergeDeepIn;
	  RecordPrototype.setIn = MapPrototype.setIn;
	  RecordPrototype.update = MapPrototype.update;
	  RecordPrototype.updateIn = MapPrototype.updateIn;
	  RecordPrototype.withMutations = MapPrototype.withMutations;
	  RecordPrototype.asMutable = MapPrototype.asMutable;
	  RecordPrototype.asImmutable = MapPrototype.asImmutable;


	  function makeRecord(likeRecord, map, ownerID) {
	    var record = __webpack_provided_Object_dot_create(Object.getPrototypeOf(likeRecord));
	    record._map = map;
	    record.__ownerID = ownerID;
	    return record;
	  }

	  function recordName(record) {
	    return record._name || record.constructor.name || 'Record';
	  }

	  function setProps(prototype, names) {
	    try {
	      names.forEach(setProp.bind(undefined, prototype));
	    } catch (error) {
	      // Object.defineProperty failed. Probably IE8.
	    }
	  }

	  function setProp(prototype, name) {
	    Object.defineProperty(prototype, name, {
	      get: function() {
	        return this.get(name);
	      },
	      set: function(value) {
	        invariant(this.__ownerID, 'Cannot set on an immutable record.');
	        this.set(name, value);
	      }
	    });
	  }

	  createClass(Set, SetCollection);

	    // @pragma Construction

	    function Set(value) {
	      return value === null || value === undefined ? emptySet() :
	        isSet(value) && !isOrdered(value) ? value :
	        emptySet().withMutations(function(set ) {
	          var iter = SetIterable(value);
	          assertNotInfinite(iter.size);
	          iter.forEach(function(v ) {return set.add(v)});
	        });
	    }

	    Set.of = function(/*...values*/) {
	      return this(arguments);
	    };

	    Set.fromKeys = function(value) {
	      return this(KeyedIterable(value).keySeq());
	    };

	    Set.prototype.toString = function() {
	      return this.__toString('Set {', '}');
	    };

	    // @pragma Access

	    Set.prototype.has = function(value) {
	      return this._map.has(value);
	    };

	    // @pragma Modification

	    Set.prototype.add = function(value) {
	      return updateSet(this, this._map.set(value, true));
	    };

	    Set.prototype.remove = function(value) {
	      return updateSet(this, this._map.remove(value));
	    };

	    Set.prototype.clear = function() {
	      return updateSet(this, this._map.clear());
	    };

	    // @pragma Composition

	    Set.prototype.union = function() {var iters = SLICE$0.call(arguments, 0);
	      iters = iters.filter(function(x ) {return x.size !== 0});
	      if (iters.length === 0) {
	        return this;
	      }
	      if (this.size === 0 && !this.__ownerID && iters.length === 1) {
	        return this.constructor(iters[0]);
	      }
	      return this.withMutations(function(set ) {
	        for (var ii = 0; ii < iters.length; ii++) {
	          SetIterable(iters[ii]).forEach(function(value ) {return set.add(value)});
	        }
	      });
	    };

	    Set.prototype.intersect = function() {var iters = SLICE$0.call(arguments, 0);
	      if (iters.length === 0) {
	        return this;
	      }
	      iters = iters.map(function(iter ) {return SetIterable(iter)});
	      var originalSet = this;
	      return this.withMutations(function(set ) {
	        originalSet.forEach(function(value ) {
	          if (!iters.every(function(iter ) {return iter.includes(value)})) {
	            set.remove(value);
	          }
	        });
	      });
	    };

	    Set.prototype.subtract = function() {var iters = SLICE$0.call(arguments, 0);
	      if (iters.length === 0) {
	        return this;
	      }
	      iters = iters.map(function(iter ) {return SetIterable(iter)});
	      var originalSet = this;
	      return this.withMutations(function(set ) {
	        originalSet.forEach(function(value ) {
	          if (iters.some(function(iter ) {return iter.includes(value)})) {
	            set.remove(value);
	          }
	        });
	      });
	    };

	    Set.prototype.merge = function() {
	      return this.union.apply(this, arguments);
	    };

	    Set.prototype.mergeWith = function(merger) {var iters = SLICE$0.call(arguments, 1);
	      return this.union.apply(this, iters);
	    };

	    Set.prototype.sort = function(comparator) {
	      // Late binding
	      return OrderedSet(sortFactory(this, comparator));
	    };

	    Set.prototype.sortBy = function(mapper, comparator) {
	      // Late binding
	      return OrderedSet(sortFactory(this, comparator, mapper));
	    };

	    Set.prototype.wasAltered = function() {
	      return this._map.wasAltered();
	    };

	    Set.prototype.__iterate = function(fn, reverse) {var this$0 = this;
	      return this._map.__iterate(function(_, k)  {return fn(k, k, this$0)}, reverse);
	    };

	    Set.prototype.__iterator = function(type, reverse) {
	      return this._map.map(function(_, k)  {return k}).__iterator(type, reverse);
	    };

	    Set.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      var newMap = this._map.__ensureOwner(ownerID);
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        this._map = newMap;
	        return this;
	      }
	      return this.__make(newMap, ownerID);
	    };


	  function isSet(maybeSet) {
	    return !!(maybeSet && maybeSet[IS_SET_SENTINEL]);
	  }

	  Set.isSet = isSet;

	  var IS_SET_SENTINEL = '@@__IMMUTABLE_SET__@@';

	  var SetPrototype = Set.prototype;
	  SetPrototype[IS_SET_SENTINEL] = true;
	  SetPrototype[DELETE] = SetPrototype.remove;
	  SetPrototype.mergeDeep = SetPrototype.merge;
	  SetPrototype.mergeDeepWith = SetPrototype.mergeWith;
	  SetPrototype.withMutations = MapPrototype.withMutations;
	  SetPrototype.asMutable = MapPrototype.asMutable;
	  SetPrototype.asImmutable = MapPrototype.asImmutable;

	  SetPrototype.__empty = emptySet;
	  SetPrototype.__make = makeSet;

	  function updateSet(set, newMap) {
	    if (set.__ownerID) {
	      set.size = newMap.size;
	      set._map = newMap;
	      return set;
	    }
	    return newMap === set._map ? set :
	      newMap.size === 0 ? set.__empty() :
	      set.__make(newMap);
	  }

	  function makeSet(map, ownerID) {
	    var set = __webpack_provided_Object_dot_create(SetPrototype);
	    set.size = map ? map.size : 0;
	    set._map = map;
	    set.__ownerID = ownerID;
	    return set;
	  }

	  var EMPTY_SET;
	  function emptySet() {
	    return EMPTY_SET || (EMPTY_SET = makeSet(emptyMap()));
	  }

	  createClass(OrderedSet, Set);

	    // @pragma Construction

	    function OrderedSet(value) {
	      return value === null || value === undefined ? emptyOrderedSet() :
	        isOrderedSet(value) ? value :
	        emptyOrderedSet().withMutations(function(set ) {
	          var iter = SetIterable(value);
	          assertNotInfinite(iter.size);
	          iter.forEach(function(v ) {return set.add(v)});
	        });
	    }

	    OrderedSet.of = function(/*...values*/) {
	      return this(arguments);
	    };

	    OrderedSet.fromKeys = function(value) {
	      return this(KeyedIterable(value).keySeq());
	    };

	    OrderedSet.prototype.toString = function() {
	      return this.__toString('OrderedSet {', '}');
	    };


	  function isOrderedSet(maybeOrderedSet) {
	    return isSet(maybeOrderedSet) && isOrdered(maybeOrderedSet);
	  }

	  OrderedSet.isOrderedSet = isOrderedSet;

	  var OrderedSetPrototype = OrderedSet.prototype;
	  OrderedSetPrototype[IS_ORDERED_SENTINEL] = true;

	  OrderedSetPrototype.__empty = emptyOrderedSet;
	  OrderedSetPrototype.__make = makeOrderedSet;

	  function makeOrderedSet(map, ownerID) {
	    var set = __webpack_provided_Object_dot_create(OrderedSetPrototype);
	    set.size = map ? map.size : 0;
	    set._map = map;
	    set.__ownerID = ownerID;
	    return set;
	  }

	  var EMPTY_ORDERED_SET;
	  function emptyOrderedSet() {
	    return EMPTY_ORDERED_SET || (EMPTY_ORDERED_SET = makeOrderedSet(emptyOrderedMap()));
	  }

	  createClass(Stack, IndexedCollection);

	    // @pragma Construction

	    function Stack(value) {
	      return value === null || value === undefined ? emptyStack() :
	        isStack(value) ? value :
	        emptyStack().unshiftAll(value);
	    }

	    Stack.of = function(/*...values*/) {
	      return this(arguments);
	    };

	    Stack.prototype.toString = function() {
	      return this.__toString('Stack [', ']');
	    };

	    // @pragma Access

	    Stack.prototype.get = function(index, notSetValue) {
	      var head = this._head;
	      index = wrapIndex(this, index);
	      while (head && index--) {
	        head = head.next;
	      }
	      return head ? head.value : notSetValue;
	    };

	    Stack.prototype.peek = function() {
	      return this._head && this._head.value;
	    };

	    // @pragma Modification

	    Stack.prototype.push = function(/*...values*/) {
	      if (arguments.length === 0) {
	        return this;
	      }
	      var newSize = this.size + arguments.length;
	      var head = this._head;
	      for (var ii = arguments.length - 1; ii >= 0; ii--) {
	        head = {
	          value: arguments[ii],
	          next: head
	        };
	      }
	      if (this.__ownerID) {
	        this.size = newSize;
	        this._head = head;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return makeStack(newSize, head);
	    };

	    Stack.prototype.pushAll = function(iter) {
	      iter = IndexedIterable(iter);
	      if (iter.size === 0) {
	        return this;
	      }
	      assertNotInfinite(iter.size);
	      var newSize = this.size;
	      var head = this._head;
	      iter.reverse().forEach(function(value ) {
	        newSize++;
	        head = {
	          value: value,
	          next: head
	        };
	      });
	      if (this.__ownerID) {
	        this.size = newSize;
	        this._head = head;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return makeStack(newSize, head);
	    };

	    Stack.prototype.pop = function() {
	      return this.slice(1);
	    };

	    Stack.prototype.unshift = function(/*...values*/) {
	      return this.push.apply(this, arguments);
	    };

	    Stack.prototype.unshiftAll = function(iter) {
	      return this.pushAll(iter);
	    };

	    Stack.prototype.shift = function() {
	      return this.pop.apply(this, arguments);
	    };

	    Stack.prototype.clear = function() {
	      if (this.size === 0) {
	        return this;
	      }
	      if (this.__ownerID) {
	        this.size = 0;
	        this._head = undefined;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return emptyStack();
	    };

	    Stack.prototype.slice = function(begin, end) {
	      if (wholeSlice(begin, end, this.size)) {
	        return this;
	      }
	      var resolvedBegin = resolveBegin(begin, this.size);
	      var resolvedEnd = resolveEnd(end, this.size);
	      if (resolvedEnd !== this.size) {
	        // super.slice(begin, end);
	        return IndexedCollection.prototype.slice.call(this, begin, end);
	      }
	      var newSize = this.size - resolvedBegin;
	      var head = this._head;
	      while (resolvedBegin--) {
	        head = head.next;
	      }
	      if (this.__ownerID) {
	        this.size = newSize;
	        this._head = head;
	        this.__hash = undefined;
	        this.__altered = true;
	        return this;
	      }
	      return makeStack(newSize, head);
	    };

	    // @pragma Mutability

	    Stack.prototype.__ensureOwner = function(ownerID) {
	      if (ownerID === this.__ownerID) {
	        return this;
	      }
	      if (!ownerID) {
	        this.__ownerID = ownerID;
	        this.__altered = false;
	        return this;
	      }
	      return makeStack(this.size, this._head, ownerID, this.__hash);
	    };

	    // @pragma Iteration

	    Stack.prototype.__iterate = function(fn, reverse) {
	      if (reverse) {
	        return this.reverse().__iterate(fn);
	      }
	      var iterations = 0;
	      var node = this._head;
	      while (node) {
	        if (fn(node.value, iterations++, this) === false) {
	          break;
	        }
	        node = node.next;
	      }
	      return iterations;
	    };

	    Stack.prototype.__iterator = function(type, reverse) {
	      if (reverse) {
	        return this.reverse().__iterator(type);
	      }
	      var iterations = 0;
	      var node = this._head;
	      return new Iterator(function()  {
	        if (node) {
	          var value = node.value;
	          node = node.next;
	          return iteratorValue(type, iterations++, value);
	        }
	        return iteratorDone();
	      });
	    };


	  function isStack(maybeStack) {
	    return !!(maybeStack && maybeStack[IS_STACK_SENTINEL]);
	  }

	  Stack.isStack = isStack;

	  var IS_STACK_SENTINEL = '@@__IMMUTABLE_STACK__@@';

	  var StackPrototype = Stack.prototype;
	  StackPrototype[IS_STACK_SENTINEL] = true;
	  StackPrototype.withMutations = MapPrototype.withMutations;
	  StackPrototype.asMutable = MapPrototype.asMutable;
	  StackPrototype.asImmutable = MapPrototype.asImmutable;
	  StackPrototype.wasAltered = MapPrototype.wasAltered;


	  function makeStack(size, head, ownerID, hash) {
	    var map = __webpack_provided_Object_dot_create(StackPrototype);
	    map.size = size;
	    map._head = head;
	    map.__ownerID = ownerID;
	    map.__hash = hash;
	    map.__altered = false;
	    return map;
	  }

	  var EMPTY_STACK;
	  function emptyStack() {
	    return EMPTY_STACK || (EMPTY_STACK = makeStack(0));
	  }

	  /**
	   * Contributes additional methods to a constructor
	   */
	  function mixin(ctor, methods) {
	    var keyCopier = function(key ) { ctor.prototype[key] = methods[key]; };
	    Object.keys(methods).forEach(keyCopier);
	    Object.getOwnPropertySymbols &&
	      Object.getOwnPropertySymbols(methods).forEach(keyCopier);
	    return ctor;
	  }

	  Iterable.Iterator = Iterator;

	  mixin(Iterable, {

	    // ### Conversion to other types

	    toArray: function() {
	      assertNotInfinite(this.size);
	      var array = new Array(this.size || 0);
	      this.valueSeq().__iterate(function(v, i)  { array[i] = v; });
	      return array;
	    },

	    toIndexedSeq: function() {
	      return new ToIndexedSequence(this);
	    },

	    toJS: function() {
	      return this.toSeq().map(
	        function(value ) {return value && typeof value.toJS === 'function' ? value.toJS() : value}
	      ).__toJS();
	    },

	    toJSON: function() {
	      return this.toSeq().map(
	        function(value ) {return value && typeof value.toJSON === 'function' ? value.toJSON() : value}
	      ).__toJS();
	    },

	    toKeyedSeq: function() {
	      return new ToKeyedSequence(this, true);
	    },

	    toMap: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return Map(this.toKeyedSeq());
	    },

	    toObject: function() {
	      assertNotInfinite(this.size);
	      var object = {};
	      this.__iterate(function(v, k)  { object[k] = v; });
	      return object;
	    },

	    toOrderedMap: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return OrderedMap(this.toKeyedSeq());
	    },

	    toOrderedSet: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return OrderedSet(isKeyed(this) ? this.valueSeq() : this);
	    },

	    toSet: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return Set(isKeyed(this) ? this.valueSeq() : this);
	    },

	    toSetSeq: function() {
	      return new ToSetSequence(this);
	    },

	    toSeq: function() {
	      return isIndexed(this) ? this.toIndexedSeq() :
	        isKeyed(this) ? this.toKeyedSeq() :
	        this.toSetSeq();
	    },

	    toStack: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return Stack(isKeyed(this) ? this.valueSeq() : this);
	    },

	    toList: function() {
	      // Use Late Binding here to solve the circular dependency.
	      return List(isKeyed(this) ? this.valueSeq() : this);
	    },


	    // ### Common JavaScript methods and properties

	    toString: function() {
	      return '[Iterable]';
	    },

	    __toString: function(head, tail) {
	      if (this.size === 0) {
	        return head + tail;
	      }
	      return head + ' ' + this.toSeq().map(this.__toStringMapper).join(', ') + ' ' + tail;
	    },


	    // ### ES6 Collection methods (ES6 Array and Map)

	    concat: function() {var values = SLICE$0.call(arguments, 0);
	      return reify(this, concatFactory(this, values));
	    },

	    includes: function(searchValue) {
	      return this.some(function(value ) {return is(value, searchValue)});
	    },

	    entries: function() {
	      return this.__iterator(ITERATE_ENTRIES);
	    },

	    every: function(predicate, context) {
	      assertNotInfinite(this.size);
	      var returnValue = true;
	      this.__iterate(function(v, k, c)  {
	        if (!predicate.call(context, v, k, c)) {
	          returnValue = false;
	          return false;
	        }
	      });
	      return returnValue;
	    },

	    filter: function(predicate, context) {
	      return reify(this, filterFactory(this, predicate, context, true));
	    },

	    find: function(predicate, context, notSetValue) {
	      var entry = this.findEntry(predicate, context);
	      return entry ? entry[1] : notSetValue;
	    },

	    findEntry: function(predicate, context) {
	      var found;
	      this.__iterate(function(v, k, c)  {
	        if (predicate.call(context, v, k, c)) {
	          found = [k, v];
	          return false;
	        }
	      });
	      return found;
	    },

	    findLastEntry: function(predicate, context) {
	      return this.toSeq().reverse().findEntry(predicate, context);
	    },

	    forEach: function(sideEffect, context) {
	      assertNotInfinite(this.size);
	      return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
	    },

	    join: function(separator) {
	      assertNotInfinite(this.size);
	      separator = separator !== undefined ? '' + separator : ',';
	      var joined = '';
	      var isFirst = true;
	      this.__iterate(function(v ) {
	        isFirst ? (isFirst = false) : (joined += separator);
	        joined += v !== null && v !== undefined ? v.toString() : '';
	      });
	      return joined;
	    },

	    keys: function() {
	      return this.__iterator(ITERATE_KEYS);
	    },

	    map: function(mapper, context) {
	      return reify(this, mapFactory(this, mapper, context));
	    },

	    reduce: function(reducer, initialReduction, context) {
	      assertNotInfinite(this.size);
	      var reduction;
	      var useFirst;
	      if (arguments.length < 2) {
	        useFirst = true;
	      } else {
	        reduction = initialReduction;
	      }
	      this.__iterate(function(v, k, c)  {
	        if (useFirst) {
	          useFirst = false;
	          reduction = v;
	        } else {
	          reduction = reducer.call(context, reduction, v, k, c);
	        }
	      });
	      return reduction;
	    },

	    reduceRight: function(reducer, initialReduction, context) {
	      var reversed = this.toKeyedSeq().reverse();
	      return reversed.reduce.apply(reversed, arguments);
	    },

	    reverse: function() {
	      return reify(this, reverseFactory(this, true));
	    },

	    slice: function(begin, end) {
	      return reify(this, sliceFactory(this, begin, end, true));
	    },

	    some: function(predicate, context) {
	      return !this.every(not(predicate), context);
	    },

	    sort: function(comparator) {
	      return reify(this, sortFactory(this, comparator));
	    },

	    values: function() {
	      return this.__iterator(ITERATE_VALUES);
	    },


	    // ### More sequential methods

	    butLast: function() {
	      return this.slice(0, -1);
	    },

	    isEmpty: function() {
	      return this.size !== undefined ? this.size === 0 : !this.some(function()  {return true});
	    },

	    count: function(predicate, context) {
	      return ensureSize(
	        predicate ? this.toSeq().filter(predicate, context) : this
	      );
	    },

	    countBy: function(grouper, context) {
	      return countByFactory(this, grouper, context);
	    },

	    equals: function(other) {
	      return deepEqual(this, other);
	    },

	    entrySeq: function() {
	      var iterable = this;
	      if (iterable._cache) {
	        // We cache as an entries array, so we can just return the cache!
	        return new ArraySeq(iterable._cache);
	      }
	      var entriesSequence = iterable.toSeq().map(entryMapper).toIndexedSeq();
	      entriesSequence.fromEntrySeq = function()  {return iterable.toSeq()};
	      return entriesSequence;
	    },

	    filterNot: function(predicate, context) {
	      return this.filter(not(predicate), context);
	    },

	    findLast: function(predicate, context, notSetValue) {
	      return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
	    },

	    first: function() {
	      return this.find(returnTrue);
	    },

	    flatMap: function(mapper, context) {
	      return reify(this, flatMapFactory(this, mapper, context));
	    },

	    flatten: function(depth) {
	      return reify(this, flattenFactory(this, depth, true));
	    },

	    fromEntrySeq: function() {
	      return new FromEntriesSequence(this);
	    },

	    get: function(searchKey, notSetValue) {
	      return this.find(function(_, key)  {return is(key, searchKey)}, undefined, notSetValue);
	    },

	    getIn: function(searchKeyPath, notSetValue) {
	      var nested = this;
	      // Note: in an ES6 environment, we would prefer:
	      // for (var key of searchKeyPath) {
	      var iter = forceIterator(searchKeyPath);
	      var step;
	      while (!(step = iter.next()).done) {
	        var key = step.value;
	        nested = nested && nested.get ? nested.get(key, NOT_SET) : NOT_SET;
	        if (nested === NOT_SET) {
	          return notSetValue;
	        }
	      }
	      return nested;
	    },

	    groupBy: function(grouper, context) {
	      return groupByFactory(this, grouper, context);
	    },

	    has: function(searchKey) {
	      return this.get(searchKey, NOT_SET) !== NOT_SET;
	    },

	    hasIn: function(searchKeyPath) {
	      return this.getIn(searchKeyPath, NOT_SET) !== NOT_SET;
	    },

	    isSubset: function(iter) {
	      iter = typeof iter.includes === 'function' ? iter : Iterable(iter);
	      return this.every(function(value ) {return iter.includes(value)});
	    },

	    isSuperset: function(iter) {
	      iter = typeof iter.isSubset === 'function' ? iter : Iterable(iter);
	      return iter.isSubset(this);
	    },

	    keySeq: function() {
	      return this.toSeq().map(keyMapper).toIndexedSeq();
	    },

	    last: function() {
	      return this.toSeq().reverse().first();
	    },

	    max: function(comparator) {
	      return maxFactory(this, comparator);
	    },

	    maxBy: function(mapper, comparator) {
	      return maxFactory(this, comparator, mapper);
	    },

	    min: function(comparator) {
	      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator);
	    },

	    minBy: function(mapper, comparator) {
	      return maxFactory(this, comparator ? neg(comparator) : defaultNegComparator, mapper);
	    },

	    rest: function() {
	      return this.slice(1);
	    },

	    skip: function(amount) {
	      return this.slice(Math.max(0, amount));
	    },

	    skipLast: function(amount) {
	      return reify(this, this.toSeq().reverse().skip(amount).reverse());
	    },

	    skipWhile: function(predicate, context) {
	      return reify(this, skipWhileFactory(this, predicate, context, true));
	    },

	    skipUntil: function(predicate, context) {
	      return this.skipWhile(not(predicate), context);
	    },

	    sortBy: function(mapper, comparator) {
	      return reify(this, sortFactory(this, comparator, mapper));
	    },

	    take: function(amount) {
	      return this.slice(0, Math.max(0, amount));
	    },

	    takeLast: function(amount) {
	      return reify(this, this.toSeq().reverse().take(amount).reverse());
	    },

	    takeWhile: function(predicate, context) {
	      return reify(this, takeWhileFactory(this, predicate, context));
	    },

	    takeUntil: function(predicate, context) {
	      return this.takeWhile(not(predicate), context);
	    },

	    valueSeq: function() {
	      return this.toIndexedSeq();
	    },


	    // ### Hashable Object

	    hashCode: function() {
	      return this.__hash || (this.__hash = hashIterable(this));
	    }


	    // ### Internal

	    // abstract __iterate(fn, reverse)

	    // abstract __iterator(type, reverse)
	  });

	  // var IS_ITERABLE_SENTINEL = '@@__IMMUTABLE_ITERABLE__@@';
	  // var IS_KEYED_SENTINEL = '@@__IMMUTABLE_KEYED__@@';
	  // var IS_INDEXED_SENTINEL = '@@__IMMUTABLE_INDEXED__@@';
	  // var IS_ORDERED_SENTINEL = '@@__IMMUTABLE_ORDERED__@@';

	  var IterablePrototype = Iterable.prototype;
	  IterablePrototype[IS_ITERABLE_SENTINEL] = true;
	  IterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.values;
	  IterablePrototype.__toJS = IterablePrototype.toArray;
	  IterablePrototype.__toStringMapper = quoteString;
	  IterablePrototype.inspect =
	  IterablePrototype.toSource = function() { return this.toString(); };
	  IterablePrototype.chain = IterablePrototype.flatMap;
	  IterablePrototype.contains = IterablePrototype.includes;

	  // Temporary warning about using length
	  (function () {
	    try {
	      Object.defineProperty(IterablePrototype, 'length', {
	        get: function () {
	          if (!Iterable.noLengthWarning) {
	            var stack;
	            try {
	              throw new Error();
	            } catch (error) {
	              stack = error.stack;
	            }
	            if (stack.indexOf('_wrapObject') === -1) {
	              console && console.warn && console.warn(
	                'iterable.length has been deprecated, '+
	                'use iterable.size or iterable.count(). '+
	                'This warning will become a silent error in a future version. ' +
	                stack
	              );
	              return this.size;
	            }
	          }
	        }
	      });
	    } catch (e) {}
	  })();



	  mixin(KeyedIterable, {

	    // ### More sequential methods

	    flip: function() {
	      return reify(this, flipFactory(this));
	    },

	    findKey: function(predicate, context) {
	      var entry = this.findEntry(predicate, context);
	      return entry && entry[0];
	    },

	    findLastKey: function(predicate, context) {
	      return this.toSeq().reverse().findKey(predicate, context);
	    },

	    keyOf: function(searchValue) {
	      return this.findKey(function(value ) {return is(value, searchValue)});
	    },

	    lastKeyOf: function(searchValue) {
	      return this.findLastKey(function(value ) {return is(value, searchValue)});
	    },

	    mapEntries: function(mapper, context) {var this$0 = this;
	      var iterations = 0;
	      return reify(this,
	        this.toSeq().map(
	          function(v, k)  {return mapper.call(context, [k, v], iterations++, this$0)}
	        ).fromEntrySeq()
	      );
	    },

	    mapKeys: function(mapper, context) {var this$0 = this;
	      return reify(this,
	        this.toSeq().flip().map(
	          function(k, v)  {return mapper.call(context, k, v, this$0)}
	        ).flip()
	      );
	    }

	  });

	  var KeyedIterablePrototype = KeyedIterable.prototype;
	  KeyedIterablePrototype[IS_KEYED_SENTINEL] = true;
	  KeyedIterablePrototype[ITERATOR_SYMBOL] = IterablePrototype.entries;
	  KeyedIterablePrototype.__toJS = IterablePrototype.toObject;
	  KeyedIterablePrototype.__toStringMapper = function(v, k)  {return JSON.stringify(k) + ': ' + quoteString(v)};



	  mixin(IndexedIterable, {

	    // ### Conversion to other types

	    toKeyedSeq: function() {
	      return new ToKeyedSequence(this, false);
	    },


	    // ### ES6 Collection methods (ES6 Array and Map)

	    filter: function(predicate, context) {
	      return reify(this, filterFactory(this, predicate, context, false));
	    },

	    findIndex: function(predicate, context) {
	      var entry = this.findEntry(predicate, context);
	      return entry ? entry[0] : -1;
	    },

	    indexOf: function(searchValue) {
	      var key = this.toKeyedSeq().keyOf(searchValue);
	      return key === undefined ? -1 : key;
	    },

	    lastIndexOf: function(searchValue) {
	      var key = this.toKeyedSeq().reverse().keyOf(searchValue);
	      return key === undefined ? -1 : key;

	      // var index =
	      // return this.toSeq().reverse().indexOf(searchValue);
	    },

	    reverse: function() {
	      return reify(this, reverseFactory(this, false));
	    },

	    slice: function(begin, end) {
	      return reify(this, sliceFactory(this, begin, end, false));
	    },

	    splice: function(index, removeNum /*, ...values*/) {
	      var numArgs = arguments.length;
	      removeNum = Math.max(removeNum | 0, 0);
	      if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
	        return this;
	      }
	      // If index is negative, it should resolve relative to the size of the
	      // collection. However size may be expensive to compute if not cached, so
	      // only call count() if the number is in fact negative.
	      index = resolveBegin(index, index < 0 ? this.count() : this.size);
	      var spliced = this.slice(0, index);
	      return reify(
	        this,
	        numArgs === 1 ?
	          spliced :
	          spliced.concat(arrCopy(arguments, 2), this.slice(index + removeNum))
	      );
	    },


	    // ### More collection methods

	    findLastIndex: function(predicate, context) {
	      var key = this.toKeyedSeq().findLastKey(predicate, context);
	      return key === undefined ? -1 : key;
	    },

	    first: function() {
	      return this.get(0);
	    },

	    flatten: function(depth) {
	      return reify(this, flattenFactory(this, depth, false));
	    },

	    get: function(index, notSetValue) {
	      index = wrapIndex(this, index);
	      return (index < 0 || (this.size === Infinity ||
	          (this.size !== undefined && index > this.size))) ?
	        notSetValue :
	        this.find(function(_, key)  {return key === index}, undefined, notSetValue);
	    },

	    has: function(index) {
	      index = wrapIndex(this, index);
	      return index >= 0 && (this.size !== undefined ?
	        this.size === Infinity || index < this.size :
	        this.indexOf(index) !== -1
	      );
	    },

	    interpose: function(separator) {
	      return reify(this, interposeFactory(this, separator));
	    },

	    interleave: function(/*...iterables*/) {
	      var iterables = [this].concat(arrCopy(arguments));
	      var zipped = zipWithFactory(this.toSeq(), IndexedSeq.of, iterables);
	      var interleaved = zipped.flatten(true);
	      if (zipped.size) {
	        interleaved.size = zipped.size * iterables.length;
	      }
	      return reify(this, interleaved);
	    },

	    last: function() {
	      return this.get(-1);
	    },

	    skipWhile: function(predicate, context) {
	      return reify(this, skipWhileFactory(this, predicate, context, false));
	    },

	    zip: function(/*, ...iterables */) {
	      var iterables = [this].concat(arrCopy(arguments));
	      return reify(this, zipWithFactory(this, defaultZipper, iterables));
	    },

	    zipWith: function(zipper/*, ...iterables */) {
	      var iterables = arrCopy(arguments);
	      iterables[0] = this;
	      return reify(this, zipWithFactory(this, zipper, iterables));
	    }

	  });

	  IndexedIterable.prototype[IS_INDEXED_SENTINEL] = true;
	  IndexedIterable.prototype[IS_ORDERED_SENTINEL] = true;



	  mixin(SetIterable, {

	    // ### ES6 Collection methods (ES6 Array and Map)

	    get: function(value, notSetValue) {
	      return this.has(value) ? value : notSetValue;
	    },

	    includes: function(value) {
	      return this.has(value);
	    },


	    // ### More sequential methods

	    keySeq: function() {
	      return this.valueSeq();
	    }

	  });

	  SetIterable.prototype.has = IterablePrototype.includes;


	  // Mixin subclasses

	  mixin(KeyedSeq, KeyedIterable.prototype);
	  mixin(IndexedSeq, IndexedIterable.prototype);
	  mixin(SetSeq, SetIterable.prototype);

	  mixin(KeyedCollection, KeyedIterable.prototype);
	  mixin(IndexedCollection, IndexedIterable.prototype);
	  mixin(SetCollection, SetIterable.prototype);


	  // #pragma Helper functions

	  function keyMapper(v, k) {
	    return k;
	  }

	  function entryMapper(v, k) {
	    return [k, v];
	  }

	  function not(predicate) {
	    return function() {
	      return !predicate.apply(this, arguments);
	    }
	  }

	  function neg(predicate) {
	    return function() {
	      return -predicate.apply(this, arguments);
	    }
	  }

	  function quoteString(value) {
	    return typeof value === 'string' ? JSON.stringify(value) : value;
	  }

	  function defaultZipper() {
	    return arrCopy(arguments);
	  }

	  function defaultNegComparator(a, b) {
	    return a < b ? 1 : a > b ? -1 : 0;
	  }

	  function hashIterable(iterable) {
	    if (iterable.size === Infinity) {
	      return 0;
	    }
	    var ordered = isOrdered(iterable);
	    var keyed = isKeyed(iterable);
	    var h = ordered ? 1 : 0;
	    var size = iterable.__iterate(
	      keyed ?
	        ordered ?
	          function(v, k)  { h = 31 * h + hashMerge(hash(v), hash(k)) | 0; } :
	          function(v, k)  { h = h + hashMerge(hash(v), hash(k)) | 0; } :
	        ordered ?
	          function(v ) { h = 31 * h + hash(v) | 0; } :
	          function(v ) { h = h + hash(v) | 0; }
	    );
	    return murmurHashOfSize(size, h);
	  }

	  function murmurHashOfSize(size, h) {
	    h = imul(h, 0xCC9E2D51);
	    h = imul(h << 15 | h >>> -15, 0x1B873593);
	    h = imul(h << 13 | h >>> -13, 5);
	    h = (h + 0xE6546B64 | 0) ^ size;
	    h = imul(h ^ h >>> 16, 0x85EBCA6B);
	    h = imul(h ^ h >>> 13, 0xC2B2AE35);
	    h = smi(h ^ h >>> 16);
	    return h;
	  }

	  function hashMerge(a, b) {
	    return a ^ b + 0x9E3779B9 + (a << 6) + (a >> 2) | 0; // int
	  }

	  var Immutable = {

	    Iterable: Iterable,

	    Seq: Seq,
	    Collection: Collection,
	    Map: Map,
	    OrderedMap: OrderedMap,
	    List: List,
	    Stack: Stack,
	    Set: Set,
	    OrderedSet: OrderedSet,

	    Record: Record,
	    Range: Range,
	    Repeat: Repeat,

	    is: is,
	    fromJS: fromJS

	  };

	  return Immutable;

	}));
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2), __webpack_require__(4), __webpack_require__(3), __webpack_require__(5)))

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var immutable = __webpack_require__(16);
	var requestAnimationFrame = __webpack_require__(13);

	// How long the measurement should be presented for.
	var DURATION = 250;

	var Record = immutable.Record,
	    Map = immutable.Map;


	var MetaData = Record({
	  expiration: 0,
	  hit: 0
	});

	var TraceUpdatesAbstractNodePresenter = function () {
	  // eslint shouldn't error on type positions. TODO: update eslint
	  // eslint-disable-next-line no-undef
	  function TraceUpdatesAbstractNodePresenter() {
	    _classCallCheck(this, TraceUpdatesAbstractNodePresenter);

	    this._pool = new Map();
	    this._drawing = false;
	    this._enabled = false;
	    this._clearTimer = null;

	    this._draw = this._draw.bind(this);
	    this._redraw = this._redraw.bind(this);
	  }

	  _createClass(TraceUpdatesAbstractNodePresenter, [{
	    key: 'present',
	    value: function present(measurement) {
	      if (!this._enabled) {
	        return;
	      }
	      var data;
	      if (this._pool.has(measurement)) {
	        data = this._pool.get(measurement);
	      } else {
	        // $FlowIssue
	        data = new MetaData();
	      }

	      data = data.merge({
	        expiration: Date.now() + DURATION,
	        hit: data.hit + 1
	      });

	      this._pool = this._pool.set(measurement, data);

	      if (this._drawing) {
	        return;
	      }

	      this._drawing = true;
	      requestAnimationFrame(this._draw);
	    }
	  }, {
	    key: 'setEnabled',
	    value: function setEnabled(enabled) {
	      // console.log('setEnabled', enabled);
	      if (this._enabled === enabled) {
	        return;
	      }

	      this._enabled = enabled;

	      if (enabled) {
	        return;
	      }

	      if (this._clearTimer) {
	        clearTimeout(this._clearTimer);
	        this._clearTimer = null;
	      }

	      this._pool = this._pool.clear();
	      this._drawing = false;
	      this.clearImpl();
	    }
	  }, {
	    key: 'drawImpl',
	    value: function drawImpl(measurements) {
	      // sub-class should implement this.
	    }
	  }, {
	    key: 'clearImpl',
	    value: function clearImpl() {
	      // sub-class should implement this.
	    }
	  }, {
	    key: '_redraw',
	    value: function _redraw() {
	      this._clearTimer = null;
	      if (!this._drawing && this._pool.size > 0) {
	        this._drawing = true;
	        this._draw();
	      }
	    }
	  }, {
	    key: '_draw',
	    value: function _draw() {
	      if (!this._enabled) {
	        this._drawing = false;
	        return;
	      }

	      var now = Date.now();
	      var minExpiration = Number.MAX_VALUE;

	      this._pool = this._pool.withMutations(function (_pool) {
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	          for (var _iterator = _pool.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var _step$value = _slicedToArray(_step.value, 2),
	                measurement = _step$value[0],
	                data = _step$value[1];

	            if (data.expiration < now) {
	              // already passed the expiration time.
	              _pool.delete(measurement);
	            } else {
	              minExpiration = Math.min(data.expiration, minExpiration);
	            }
	          }
	        } catch (err) {
	          _didIteratorError = true;
	          _iteratorError = err;
	        } finally {
	          try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	              _iterator.return();
	            }
	          } finally {
	            if (_didIteratorError) {
	              throw _iteratorError;
	            }
	          }
	        }
	      });

	      this.drawImpl(this._pool);

	      if (this._pool.size > 0) {
	        if (this._clearTimer != null) {
	          clearTimeout(this._clearTimer);
	        }
	        this._clearTimer = setTimeout(this._redraw, minExpiration - now);
	      }

	      this._drawing = false;
	    }
	  }]);

	  return TraceUpdatesAbstractNodePresenter;
	}();

	module.exports = TraceUpdatesAbstractNodePresenter;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = __webpack_provided_Object_dot_create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TraceUpdatesAbstractNodeMeasurer = __webpack_require__(12);

	var DUMMY = {
	  bottom: 0,
	  expiration: 0,
	  height: 0,
	  id: '',
	  left: 0,
	  right: 0,
	  scrollX: 0,
	  scrollY: 0,
	  top: 0,
	  width: 0
	};

	var TraceUpdatesWebNodeMeasurer = function (_TraceUpdatesAbstract) {
	  _inherits(TraceUpdatesWebNodeMeasurer, _TraceUpdatesAbstract);

	  function TraceUpdatesWebNodeMeasurer() {
	    _classCallCheck(this, TraceUpdatesWebNodeMeasurer);

	    return _possibleConstructorReturn(this, (TraceUpdatesWebNodeMeasurer.__proto__ || Object.getPrototypeOf(TraceUpdatesWebNodeMeasurer)).apply(this, arguments));
	  }

	  _createClass(TraceUpdatesWebNodeMeasurer, [{
	    key: 'measureImpl',
	    value: function measureImpl(node) {
	      if (!node || typeof node.getBoundingClientRect !== 'function') {
	        return DUMMY;
	      }

	      var rect = node.getBoundingClientRect();
	      var scrollX = Math.max(document.body ? document.body.scrollLeft : 0, document.documentElement ? document.documentElement.scrollLeft : 0, window.pageXOffset || 0, window.scrollX || 0);

	      var scrollY = Math.max(document.body ? document.body.scrollTop : 0, document.documentElement ? document.documentElement.scrollTop : 0, window.pageYOffset || 0, window.scrollY || 0);

	      return {
	        bottom: rect.bottom,
	        expiration: 0,
	        height: rect.height,
	        id: '',
	        left: rect.left,
	        right: rect.right,
	        scrollX: scrollX,
	        scrollY: scrollY,
	        top: rect.top,
	        width: rect.width
	      };
	    }
	  }]);

	  return TraceUpdatesWebNodeMeasurer;
	}(TraceUpdatesAbstractNodeMeasurer);

	module.exports = TraceUpdatesWebNodeMeasurer;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	'use strict';

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = __webpack_provided_Object_dot_create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	var TraceUpdatesAbstractNodePresenter = __webpack_require__(17);

	var OUTLINE_COLOR = '#f0f0f0';

	var COLORS = [
	// coolest
	'#55cef6', '#55f67b', '#a5f655', '#f4f655', '#f6a555', '#f66855',
	// hottest
	'#ff0000'];

	var HOTTEST_COLOR = COLORS[COLORS.length - 1];

	function drawBorder(ctx, measurement, borderWidth, borderColor) {
	  // outline
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = OUTLINE_COLOR;

	  ctx.strokeRect(measurement.left - 1, measurement.top - 1, measurement.width + 2, measurement.height + 2);

	  // inset
	  ctx.lineWidth = 1;
	  ctx.strokeStyle = OUTLINE_COLOR;
	  ctx.strokeRect(measurement.left + borderWidth, measurement.top + borderWidth, measurement.width - borderWidth, measurement.height - borderWidth);
	  ctx.strokeStyle = borderColor;

	  if (measurement.should_update) {
	    ctx.setLineDash([2]);
	  } else {
	    ctx.setLineDash([0]);
	  }

	  // border
	  ctx.lineWidth = '' + borderWidth;
	  ctx.strokeRect(measurement.left + Math.floor(borderWidth / 2), measurement.top + Math.floor(borderWidth / 2), measurement.width - borderWidth, measurement.height - borderWidth);

	  ctx.setLineDash([0]);
	}

	var CANVAS_NODE_ID = 'TraceUpdatesWebNodePresenter';

	var TraceUpdatesWebNodePresenter = function (_TraceUpdatesAbstract) {
	  _inherits(TraceUpdatesWebNodePresenter, _TraceUpdatesAbstract);

	  function TraceUpdatesWebNodePresenter() {
	    _classCallCheck(this, TraceUpdatesWebNodePresenter);

	    var _this = _possibleConstructorReturn(this, (TraceUpdatesWebNodePresenter.__proto__ || Object.getPrototypeOf(TraceUpdatesWebNodePresenter)).call(this));

	    _this._canvas = null;
	    return _this;
	  }

	  _createClass(TraceUpdatesWebNodePresenter, [{
	    key: 'drawImpl',
	    value: function drawImpl(pool) {
	      this._ensureCanvas();
	      var canvas = this._canvas;
	      var ctx = canvas.getContext('2d');
	      ctx.clearRect(0, 0, canvas.width, canvas.height);
	      var _iteratorNormalCompletion = true;
	      var _didIteratorError = false;
	      var _iteratorError = undefined;

	      try {
	        for (var _iterator = pool.entries()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	          var _step$value = _slicedToArray(_step.value, 2),
	              measurement = _step$value[0],
	              data = _step$value[1];

	          var color = COLORS[data.hit - 1] || HOTTEST_COLOR;
	          drawBorder(ctx, measurement, 1, color);
	        }
	      } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	      } finally {
	        try {
	          if (!_iteratorNormalCompletion && _iterator.return) {
	            _iterator.return();
	          }
	        } finally {
	          if (_didIteratorError) {
	            throw _iteratorError;
	          }
	        }
	      }
	    }
	  }, {
	    key: 'clearImpl',
	    value: function clearImpl() {
	      var canvas = this._canvas;
	      if (canvas === null) {
	        return;
	      }

	      if (!canvas.parentNode) {
	        return;
	      }

	      var ctx = canvas.getContext('2d');
	      ctx.clearRect(0, 0, canvas.width, canvas.height);

	      canvas.parentNode.removeChild(canvas);
	      this._canvas = null;
	    }
	  }, {
	    key: '_ensureCanvas',
	    value: function _ensureCanvas() {
	      var canvas = this._canvas;
	      if (canvas === null) {
	        canvas = window.document.getElementById(CANVAS_NODE_ID) || window.document.createElement('canvas');

	        canvas.id = CANVAS_NODE_ID;
	        canvas.width = window.screen.availWidth;
	        canvas.height = window.screen.availHeight;
	        canvas.style.cssText = '\n        xx-background-color: red;\n        xx-opacity: 0.5;\n        bottom: 0;\n        left: 0;\n        pointer-events: none;\n        position: fixed;\n        right: 0;\n        top: 0;\n        z-index: 1000000000;\n      ';
	      }

	      if (!canvas.parentNode) {
	        var root = window.document.documentElement;
	        root.insertBefore(canvas, root.firstChild);
	      }
	      this._canvas = canvas;
	    }
	  }]);

	  return TraceUpdatesWebNodePresenter;
	}(TraceUpdatesAbstractNodePresenter);

	module.exports = TraceUpdatesWebNodePresenter;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Map, __webpack_provided_Object_dot_create) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var consts = __webpack_require__(21);
	var hydrate = __webpack_require__(40);
	var dehydrate = __webpack_require__(41);
	var getIn = __webpack_require__(10);
	var performanceNow = __webpack_require__(42);

	// Use the polyfill if the function is not native implementation
	function getWindowFunction(name, polyfill) {
	  if (String(window[name]).indexOf('[native code]') === -1) {
	    return polyfill;
	  }
	  return window[name];
	}

	// Custom polyfill that runs the queue with a backoff.
	// If you change it, make sure it behaves reasonably well in Firefox.
	var lastRunTimeMS = 5;
	var cancelIdleCallback = getWindowFunction('cancelIdleCallback', clearTimeout);
	var requestIdleCallback = getWindowFunction('requestIdleCallback', function (cb, options) {
	  // Magic numbers determined by tweaking in Firefox.
	  // There is no special meaning to them.
	  var delayMS = 3000 * lastRunTimeMS;
	  if (delayMS > 500) {
	    delayMS = 500;
	  }

	  return setTimeout(function () {
	    var startTime = performanceNow();
	    cb({
	      didTimeout: false,
	      timeRemaining: function timeRemaining() {
	        return Infinity;
	      }
	    });
	    var endTime = performanceNow();
	    lastRunTimeMS = (endTime - startTime) / 1000;
	  }, delayMS);
	});

	/**
	 * The bridge is responsible for serializing requests between the Agent and
	 * the Frontend Store. It needs to be connected to a Wall object that can send
	 * JSONable data to the bridge on the other side.
	 *
	 * complex data
	 *     |
	 *     v
	 *  [Bridge]
	 *     |
	 * jsonable data
	 *     |
	 *     v
	 *   [wall]
	 *     |
	 *     v
	 * ~ some barrier ~
	 *     |
	 *     v
	 *   [wall]
	 *     |
	 *     v
	 *  [Bridge]
	 *     |
	 *     v
	 * "hydrated" data
	 *
	 * When an item is passed in that can't be serialized (anything other than a
	 * plain array, object, or literal value), the object is "cleaned", and
	 * rehydrated on the other side with `Symbol` attributes indicating that the
	 * object needs to be inspected for more detail.
	 *
	 * Example:
	 *
	 * bridge.send('evname', {id: 'someid', foo: MyCoolObjectInstance})
	 * ->
	 * shows up, hydrated as
	 * {
	 *   id: 'someid',
	 *   foo: {
	 *     [consts.name]: 'MyCoolObjectInstance',
	 *     [consts.type]: 'object',
	 *     [consts.meta]: {},
	 *     [consts.inspected]: false,
	 *   }
	 * }
	 *
	 * The `consts` variables are Symbols, and as such are non-ennumerable.
	 * The front-end therefore needs to check for `consts.inspected` on received
	 * objects, and can thereby display object proxies and inspect them.
	 *
	 * Complex objects that are passed are expected to have a top-level `id`
	 * attribute, which is used for later lookup + inspection. Once it has been
	 * determined that an object is no longer needed, call `.forget(id)` to clean
	 * up.
	 */
	var Bridge = function () {
	  function Bridge(wall) {
	    _classCallCheck(this, Bridge);

	    this._cbs = new Map();
	    this._inspectables = new Map();
	    this._cid = 0;
	    this._listeners = {};
	    this._buffer = [];
	    this._flushHandle = null;
	    this._callers = {};
	    this._paused = false;
	    this._wall = wall;

	    wall.listen(this._handleMessage.bind(this));
	  }

	  _createClass(Bridge, [{
	    key: 'inspect',
	    value: function inspect(id, path, cb) {
	      var _cid = this._cid++;
	      this._cbs.set(_cid, function (data, cleaned, proto, protoclean) {
	        if (cleaned.length) {
	          hydrate(data, cleaned);
	        }
	        if (proto && protoclean.length) {
	          hydrate(proto, protoclean);
	        }
	        if (proto) {
	          data[consts.proto] = proto;
	        }
	        cb(data);
	      });

	      this._wall.send({
	        type: 'inspect',
	        callback: _cid,
	        path: path,
	        id: id
	      });
	    }
	  }, {
	    key: 'call',
	    value: function call(name, args, cb) {
	      var _cid = this._cid++;
	      this._cbs.set(_cid, cb);

	      this._wall.send({
	        type: 'call',
	        callback: _cid,
	        args: args,
	        name: name
	      });
	    }
	  }, {
	    key: 'onCall',
	    value: function onCall(name, handler) {
	      if (this._callers[name]) {
	        throw new Error('only one call handler per call name allowed');
	      }
	      this._callers[name] = handler;
	    }
	  }, {
	    key: 'pause',
	    value: function pause() {
	      this._wall.send({
	        type: 'pause'
	      });
	    }
	  }, {
	    key: 'resume',
	    value: function resume() {
	      this._wall.send({
	        type: 'resume'
	      });
	    }
	  }, {
	    key: 'setInspectable',
	    value: function setInspectable(id, data) {
	      var prev = this._inspectables.get(id);
	      if (!prev) {
	        this._inspectables.set(id, data);
	        return;
	      }
	      this._inspectables.set(id, _extends({}, prev, data));
	    }
	  }, {
	    key: 'send',
	    value: function send(evt, data) {
	      this._buffer.push({ evt: evt, data: data });
	      this.scheduleFlush();
	    }
	  }, {
	    key: 'scheduleFlush',
	    value: function scheduleFlush() {
	      if (!this._flushHandle && this._buffer.length) {
	        var timeout = this._paused ? 5000 : 500;
	        this._flushHandle = requestIdleCallback(this.flushBufferWhileIdle.bind(this), { timeout: timeout });
	      }
	    }
	  }, {
	    key: 'cancelFlush',
	    value: function cancelFlush() {
	      if (this._flushHandle) {
	        cancelIdleCallback(this._flushHandle);
	        this._flushHandle = null;
	      }
	    }
	  }, {
	    key: 'flushBufferWhileIdle',
	    value: function flushBufferWhileIdle(deadline) {
	      this._flushHandle = null;

	      // Magic numbers were determined by tweaking in a heavy UI and seeing
	      // what performs reasonably well both when DevTools are hidden and visible.
	      // The goal is that we try to catch up but avoid blocking the UI.
	      // When paused, it's okay to lag more, but not forever because otherwise
	      // when user activates React tab, it will freeze syncing.
	      var chunkCount = this._paused ? 20 : 10;
	      var chunkSize = Math.round(this._buffer.length / chunkCount);
	      var minChunkSize = this._paused ? 50 : 100;

	      while (this._buffer.length && (deadline.timeRemaining() > 0 || deadline.didTimeout)) {
	        var take = Math.min(this._buffer.length, Math.max(minChunkSize, chunkSize));
	        var currentBuffer = this._buffer.splice(0, take);
	        this.flushBufferSlice(currentBuffer);
	      }

	      if (this._buffer.length) {
	        this.scheduleFlush();
	      }
	    }
	  }, {
	    key: 'flushBufferSlice',
	    value: function flushBufferSlice(bufferSlice) {
	      var _this = this;

	      var events = bufferSlice.map(function (_ref) {
	        var evt = _ref.evt,
	            data = _ref.data;

	        var cleaned = [];
	        var san = dehydrate(data, cleaned);
	        if (cleaned.length) {
	          _this.setInspectable(data.id, data);
	        }
	        return { type: 'event', evt: evt, data: san, cleaned: cleaned };
	      });
	      this._wall.send({ type: 'many-events', events: events });
	    }
	  }, {
	    key: 'forget',
	    value: function forget(id) {
	      this._inspectables.delete(id);
	    }
	  }, {
	    key: 'on',
	    value: function on(evt, fn) {
	      if (!this._listeners[evt]) {
	        this._listeners[evt] = [fn];
	      } else {
	        this._listeners[evt].push(fn);
	      }
	    }
	  }, {
	    key: 'off',
	    value: function off(evt, fn) {
	      if (!this._listeners[evt]) {
	        return;
	      }
	      var ix = this._listeners[evt].indexOf(fn);
	      if (ix !== -1) {
	        this._listeners[evt].splice(ix, 1);
	      }
	    }
	  }, {
	    key: 'once',
	    value: function once(evt, fn) {
	      var self = this;
	      var listener = function listener() {
	        fn.apply(this, arguments);
	        self.off(evt, listener);
	      };
	      this.on(evt, listener);
	    }
	  }, {
	    key: '_handleMessage',
	    value: function _handleMessage(payload) {
	      var _this2 = this;

	      if (payload.type === 'resume') {
	        this._paused = false;
	        this.scheduleFlush();
	        return;
	      }

	      if (payload.type === 'pause') {
	        this._paused = true;
	        this.cancelFlush();
	        return;
	      }

	      if (payload.type === 'callback') {
	        var callback = this._cbs.get(payload.id);
	        if (callback) {
	          callback.apply(undefined, _toConsumableArray(payload.args));
	          this._cbs.delete(payload.id);
	        }
	        return;
	      }

	      if (payload.type === 'call') {
	        this._handleCall(payload.name, payload.args, payload.callback);
	        return;
	      }

	      if (payload.type === 'inspect') {
	        this._inspectResponse(payload.id, payload.path, payload.callback);
	        return;
	      }

	      if (payload.type === 'event') {
	        // console.log('[bridge<-]', payload.evt);
	        if (payload.cleaned) {
	          hydrate(payload.data, payload.cleaned);
	        }
	        var fns = this._listeners[payload.evt];
	        var data = payload.data;
	        if (fns) {
	          fns.forEach(function (fn) {
	            return fn(data);
	          });
	        }
	      }

	      if (payload.type === 'many-events') {
	        payload.events.forEach(function (event) {
	          // console.log('[bridge<-]', payload.evt);
	          if (event.cleaned) {
	            hydrate(event.data, event.cleaned);
	          }
	          var handlers = _this2._listeners[event.evt];
	          if (handlers) {
	            handlers.forEach(function (fn) {
	              return fn(event.data);
	            });
	          }
	        });
	      }
	    }
	  }, {
	    key: '_handleCall',
	    value: function _handleCall(name, args, callback) {
	      if (!this._callers[name]) {
	        console.warn('unknown call: "' + name + '"');
	        return;
	      }
	      args = !Array.isArray(args) ? [args] : args;
	      var result;
	      try {
	        result = this._callers[name].apply(null, args);
	      } catch (e) {
	        console.error('Failed to call', e);
	        return;
	      }
	      this._wall.send({
	        type: 'callback',
	        id: callback,
	        args: [result]
	      });
	    }
	  }, {
	    key: '_inspectResponse',
	    value: function _inspectResponse(id, path, callback) {
	      var inspectable = this._inspectables.get(id);
	      var result = {};
	      var cleaned = [];
	      var proto = null;
	      var protoclean = [];

	      if (inspectable) {
	        var val = getIn(inspectable, path);
	        var protod = false;
	        var isFn = typeof val === 'function';

	        if (val && typeof val[Symbol.iterator] === 'function') {
	          var iterVal = __webpack_provided_Object_dot_create({}); // flow throws "object literal incompatible with object type"
	          var count = 0;
	          var _iteratorNormalCompletion = true;
	          var _didIteratorError = false;
	          var _iteratorError = undefined;

	          try {
	            for (var _iterator = val[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	              var entry = _step.value;

	              if (count > 100) {
	                // TODO: replace this if block with better logic to handle large iterables
	                break;
	              }
	              iterVal[count] = entry;
	              count++;
	            }
	          } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	          } finally {
	            try {
	              if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	              }
	            } finally {
	              if (_didIteratorError) {
	                throw _iteratorError;
	              }
	            }
	          }

	          val = iterVal;
	        }

	        Object.getOwnPropertyNames(val).forEach(function (name) {
	          if (name === '__proto__') {
	            protod = true;
	          }
	          if (isFn && (name === 'arguments' || name === 'callee' || name === 'caller')) {
	            return;
	          }
	          // $FlowIgnore This is intentional
	          result[name] = dehydrate(val[name], cleaned, [name]);
	        });

	        /* eslint-disable no-proto */
	        if (!protod && val.__proto__ && val.constructor.name !== 'Object') {
	          var newProto = {};
	          var pIsFn = typeof val.__proto__ === 'function';
	          Object.getOwnPropertyNames(val.__proto__).forEach(function (name) {
	            if (pIsFn && (name === 'arguments' || name === 'callee' || name === 'caller')) {
	              return;
	            }
	            newProto[name] = dehydrate(val.__proto__[name], protoclean, [name]);
	          });
	          proto = newProto;
	        }
	        /* eslint-enable no-proto */
	      }

	      this._wall.send({
	        type: 'callback',
	        id: callback,
	        args: [result, cleaned, proto, protoclean]
	      });
	    }
	  }]);

	  return Bridge;
	}();

	module.exports = Bridge;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3), __webpack_require__(2)))

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _Symbol = __webpack_require__(22);

	module.exports = {
	  name: _Symbol('name'),
	  type: _Symbol('type'),
	  inspected: _Symbol('inspected'),
	  meta: _Symbol('meta'),
	  proto: _Symbol('proto')
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(23)() ? Symbol : __webpack_require__(24);


/***/ },
/* 23 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var symbol;
		if (typeof Symbol !== 'function') return false;
		symbol = Symbol('test symbol');
		try { String(symbol); } catch (e) { return false; }
		if (typeof Symbol.iterator === 'symbol') return true;

		// Return 'true' for polyfills
		if (typeof Symbol.isConcatSpreadable !== 'object') return false;
		if (typeof Symbol.iterator !== 'object') return false;
		if (typeof Symbol.toPrimitive !== 'object') return false;
		if (typeof Symbol.toStringTag !== 'object') return false;
		if (typeof Symbol.unscopables !== 'object') return false;

		return true;
	};


/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create) {// ES2015 Symbol polyfill for environments that do not support it (or partially support it_

	'use strict';

	var d              = __webpack_require__(25)
	  , validateSymbol = __webpack_require__(38)

	  , create = __webpack_provided_Object_dot_create, defineProperties = Object.defineProperties
	  , defineProperty = Object.defineProperty, objPrototype = Object.prototype
	  , NativeSymbol, SymbolPolyfill, HiddenSymbol, globalSymbols = create(null);

	if (typeof Symbol === 'function') NativeSymbol = Symbol;

	var generateName = (function () {
		var created = create(null);
		return function (desc) {
			var postfix = 0, name, ie11BugWorkaround;
			while (created[desc + (postfix || '')]) ++postfix;
			desc += (postfix || '');
			created[desc] = true;
			name = '@@' + desc;
			defineProperty(objPrototype, name, d.gs(null, function (value) {
				// For IE11 issue see:
				// https://connect.microsoft.com/IE/feedbackdetail/view/1928508/
				//    ie11-broken-getters-on-dom-objects
				// https://github.com/medikoo/es6-symbol/issues/12
				if (ie11BugWorkaround) return;
				ie11BugWorkaround = true;
				defineProperty(this, name, d(value));
				ie11BugWorkaround = false;
			}));
			return name;
		};
	}());

	// Internal constructor (not one exposed) for creating Symbol instances.
	// This one is used to ensure that `someSymbol instanceof Symbol` always return false
	HiddenSymbol = function Symbol(description) {
		if (this instanceof HiddenSymbol) throw new TypeError('TypeError: Symbol is not a constructor');
		return SymbolPolyfill(description);
	};

	// Exposed `Symbol` constructor
	// (returns instances of HiddenSymbol)
	module.exports = SymbolPolyfill = function Symbol(description) {
		var symbol;
		if (this instanceof Symbol) throw new TypeError('TypeError: Symbol is not a constructor');
		symbol = create(HiddenSymbol.prototype);
		description = (description === undefined ? '' : String(description));
		return defineProperties(symbol, {
			__description__: d('', description),
			__name__: d('', generateName(description))
		});
	};
	defineProperties(SymbolPolyfill, {
		for: d(function (key) {
			if (globalSymbols[key]) return globalSymbols[key];
			return (globalSymbols[key] = SymbolPolyfill(String(key)));
		}),
		keyFor: d(function (s) {
			var key;
			validateSymbol(s);
			for (key in globalSymbols) if (globalSymbols[key] === s) return key;
		}),

		// If there's native implementation of given symbol, let's fallback to it
		// to ensure proper interoperability with other native functions e.g. Array.from
		hasInstance: d('', (NativeSymbol && NativeSymbol.hasInstance) || SymbolPolyfill('hasInstance')),
		isConcatSpreadable: d('', (NativeSymbol && NativeSymbol.isConcatSpreadable) ||
			SymbolPolyfill('isConcatSpreadable')),
		iterator: d('', (NativeSymbol && NativeSymbol.iterator) || SymbolPolyfill('iterator')),
		match: d('', (NativeSymbol && NativeSymbol.match) || SymbolPolyfill('match')),
		replace: d('', (NativeSymbol && NativeSymbol.replace) || SymbolPolyfill('replace')),
		search: d('', (NativeSymbol && NativeSymbol.search) || SymbolPolyfill('search')),
		species: d('', (NativeSymbol && NativeSymbol.species) || SymbolPolyfill('species')),
		split: d('', (NativeSymbol && NativeSymbol.split) || SymbolPolyfill('split')),
		toPrimitive: d('', (NativeSymbol && NativeSymbol.toPrimitive) || SymbolPolyfill('toPrimitive')),
		toStringTag: d('', (NativeSymbol && NativeSymbol.toStringTag) || SymbolPolyfill('toStringTag')),
		unscopables: d('', (NativeSymbol && NativeSymbol.unscopables) || SymbolPolyfill('unscopables'))
	});

	// Internal tweaks for real symbol producer
	defineProperties(HiddenSymbol.prototype, {
		constructor: d(SymbolPolyfill),
		toString: d('', function () { return this.__name__; })
	});

	// Proper implementation of methods exposed on Symbol.prototype
	// They won't be accessible on produced symbol instances as they derive from HiddenSymbol.prototype
	defineProperties(SymbolPolyfill.prototype, {
		toString: d(function () { return 'Symbol (' + validateSymbol(this).__description__ + ')'; }),
		valueOf: d(function () { return validateSymbol(this); })
	});
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toPrimitive, d('',
		function () { return validateSymbol(this); }));
	defineProperty(SymbolPolyfill.prototype, SymbolPolyfill.toStringTag, d('c', 'Symbol'));

	// Proper implementaton of toPrimitive and toStringTag for returned symbol instances
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toStringTag,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toStringTag]));

	// Note: It's important to define `toPrimitive` as last one, as some implementations
	// implement `toPrimitive` natively without implementing `toStringTag` (or other specified symbols)
	// And that may invoke error in definition flow:
	// See: https://github.com/medikoo/es6-symbol/issues/13#issuecomment-164146149
	defineProperty(HiddenSymbol.prototype, SymbolPolyfill.toPrimitive,
		d('c', SymbolPolyfill.prototype[SymbolPolyfill.toPrimitive]));

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var assign        = __webpack_require__(26)
	  , normalizeOpts = __webpack_require__(33)
	  , isCallable    = __webpack_require__(34)
	  , contains      = __webpack_require__(35)

	  , d;

	d = module.exports = function (dscr, value/*, options*/) {
		var c, e, w, options, desc;
		if ((arguments.length < 2) || (typeof dscr !== 'string')) {
			options = value;
			value = dscr;
			dscr = null;
		} else {
			options = arguments[2];
		}
		if (dscr == null) {
			c = w = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
			w = contains.call(dscr, 'w');
		}

		desc = { value: value, configurable: c, enumerable: e, writable: w };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};

	d.gs = function (dscr, get, set/*, options*/) {
		var c, e, options, desc;
		if (typeof dscr !== 'string') {
			options = set;
			set = get;
			get = dscr;
			dscr = null;
		} else {
			options = arguments[3];
		}
		if (get == null) {
			get = undefined;
		} else if (!isCallable(get)) {
			options = get;
			get = set = undefined;
		} else if (set == null) {
			set = undefined;
		} else if (!isCallable(set)) {
			options = set;
			set = undefined;
		}
		if (dscr == null) {
			c = true;
			e = false;
		} else {
			c = contains.call(dscr, 'c');
			e = contains.call(dscr, 'e');
		}

		desc = { get: get, set: set, configurable: c, enumerable: e };
		return !options ? desc : assign(normalizeOpts(options), desc);
	};


/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(27)()
		? Object.assign
		: __webpack_require__(28);


/***/ },
/* 27 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		var assign = Object.assign, obj;
		if (typeof assign !== 'function') return false;
		obj = { foo: 'raz' };
		assign(obj, { bar: 'dwa' }, { trzy: 'trzy' });
		return (obj.foo + obj.bar + obj.trzy) === 'razdwatrzy';
	};


/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var keys  = __webpack_require__(29)
	  , value = __webpack_require__(32)

	  , max = Math.max;

	module.exports = function (dest, src/*, …srcn*/) {
		var error, i, l = max(arguments.length, 2), assign;
		dest = Object(value(dest));
		assign = function (key) {
			try { dest[key] = src[key]; } catch (e) {
				if (!error) error = e;
			}
		};
		for (i = 1; i < l; ++i) {
			src = arguments[i];
			keys(src).forEach(assign);
		}
		if (error !== undefined) throw error;
		return dest;
	};


/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(30)()
		? Object.keys
		: __webpack_require__(31);


/***/ },
/* 30 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function () {
		try {
			Object.keys('primitive');
			return true;
		} catch (e) { return false; }
	};


/***/ },
/* 31 */
/***/ function(module, exports) {

	'use strict';

	var keys = Object.keys;

	module.exports = function (object) {
		return keys(object == null ? object : Object(object));
	};


/***/ },
/* 32 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (value) {
		if (value == null) throw new TypeError("Cannot use null or undefined");
		return value;
	};


/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(__webpack_provided_Object_dot_create) {'use strict';

	var forEach = Array.prototype.forEach, create = __webpack_provided_Object_dot_create;

	var process = function (src, obj) {
		var key;
		for (key in src) obj[key] = src[key];
	};

	module.exports = function (options/*, …options*/) {
		var result = create(null);
		forEach.call(arguments, function (options) {
			if (options == null) return;
			process(Object(options), result);
		});
		return result;
	};

	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 34 */
/***/ function(module, exports) {

	// Deprecated

	'use strict';

	module.exports = function (obj) { return typeof obj === 'function'; };


/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	module.exports = __webpack_require__(36)()
		? String.prototype.contains
		: __webpack_require__(37);


/***/ },
/* 36 */
/***/ function(module, exports) {

	'use strict';

	var str = 'razdwatrzy';

	module.exports = function () {
		if (typeof str.contains !== 'function') return false;
		return ((str.contains('dwa') === true) && (str.contains('foo') === false));
	};


/***/ },
/* 37 */
/***/ function(module, exports) {

	'use strict';

	var indexOf = String.prototype.indexOf;

	module.exports = function (searchString/*, position*/) {
		return indexOf.call(this, searchString, arguments[1]) > -1;
	};


/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var isSymbol = __webpack_require__(39);

	module.exports = function (value) {
		if (!isSymbol(value)) throw new TypeError(value + " is not a symbol");
		return value;
	};


/***/ },
/* 39 */
/***/ function(module, exports) {

	'use strict';

	module.exports = function (x) {
		return (x && ((typeof x === 'symbol') || (x['@@toStringTag'] === 'Symbol'))) || false;
	};


/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var consts = __webpack_require__(21);

	function hydrate(data, cleaned) {
	  cleaned.forEach(function (path) {
	    var last = path.pop();
	    var obj = path.reduce(function (obj_, attr) {
	      return obj_ ? obj_[attr] : null;
	    }, data);
	    if (!obj || !obj[last]) {
	      return;
	    }
	    var replace = {};
	    replace[consts.name] = obj[last].name;
	    replace[consts.type] = obj[last].type;
	    replace[consts.meta] = obj[last].meta;
	    replace[consts.inspected] = false;
	    obj[last] = replace;
	  });
	}

	module.exports = hydrate;

/***/ },
/* 41 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	/**
	 * Get a enhanced/artificial type string based on the object instance
	 */

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function getPropType(data) {
	  if (!data) {
	    return null;
	  }
	  var type = typeof data === 'undefined' ? 'undefined' : _typeof(data);

	  if (type === 'object') {
	    if (data._reactFragment) {
	      return 'react_fragment';
	    }
	    if (Array.isArray(data)) {
	      return 'array';
	    }
	    if (ArrayBuffer.isView(data)) {
	      if (data instanceof DataView) {
	        return 'data_view';
	      }
	      return 'typed_array';
	    }
	    if (data instanceof ArrayBuffer) {
	      return 'array_buffer';
	    }
	    if (typeof data[Symbol.iterator] === 'function') {
	      return 'iterator';
	    }
	    if (Object.prototype.toString.call(data) === '[object Date]') {
	      return 'date';
	    }
	  }

	  return type;
	}

	/**
	 * Generate the dehydrated metadata for complex object instances
	 */
	function createDehydrated(type, data, cleaned, path) {
	  var meta = {};

	  if (type === 'array' || type === 'typed_array') {
	    meta.length = data.length;
	  }
	  if (type === 'iterator' || type === 'typed_array') {
	    meta.readOnly = true;
	  }

	  cleaned.push(path);

	  return {
	    type: type,
	    meta: meta,
	    name: !data.constructor || data.constructor.name === 'Object' ? '' : data.constructor.name
	  };
	}

	/**
	 * Strip out complex data (instances, functions, and data nested > 2 levels
	 * deep). The paths of the stripped out objects are appended to the `cleaned`
	 * list. On the other side of the barrier, the cleaned list is used to
	 * "re-hydrate" the cleaned representation into an object with symbols as
	 * attributes, so that a sanitized object can be distinguished from a normal
	 * object.
	 *
	 * Input: {"some": {"attr": fn()}, "other": AnInstance}
	 * Output: {
	 *   "some": {
	 *     "attr": {"name": the fn.name, type: "function"}
	 *   },
	 *   "other": {
	 *     "name": "AnInstance",
	 *     "type": "object",
	 *   },
	 * }
	 * and cleaned = [["some", "attr"], ["other"]]
	 */
	function dehydrate(data, cleaned) {
	  var path = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
	  var level = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;


	  var type = getPropType(data);

	  switch (type) {

	    case 'function':
	      cleaned.push(path);
	      return {
	        name: data.name,
	        type: 'function'
	      };

	    case 'string':
	      return data.length <= 500 ? data : data.slice(0, 500) + '...';

	    // We have to do this assignment b/c Flow doesn't think "symbol" is
	    // something typeof would return. Error 'unexpected predicate "symbol"'
	    case 'symbol':
	      cleaned.push(path);
	      return {
	        type: 'symbol',
	        name: data.toString()
	      };

	    // React Fragments error if you try to inspect them.
	    case 'react_fragment':
	      return 'A React Fragment';

	    // ArrayBuffers error if you try to inspect them.
	    case 'array_buffer':
	    case 'data_view':
	      cleaned.push(path);
	      return {
	        type: type,
	        name: type === 'data_view' ? 'DataView' : 'ArrayBuffer',
	        meta: {
	          length: data.byteLength,
	          uninspectable: true
	        }
	      };

	    case 'array':
	      if (level > 2) {
	        return createDehydrated(type, data, cleaned, path);
	      }
	      return data.map(function (item, i) {
	        return dehydrate(item, cleaned, path.concat([i]), level + 1);
	      });

	    case 'typed_array':
	    case 'iterator':
	      return createDehydrated(type, data, cleaned, path);
	    case 'date':
	      cleaned.push(path);
	      return {
	        name: data.toString(),
	        type: 'date',
	        meta: {
	          uninspectable: true
	        }
	      };
	    case 'object':
	      if (level > 2 || data.constructor && typeof data.constructor === 'function' && data.constructor.name !== 'Object') {
	        return createDehydrated(type, data, cleaned, path);
	      } else {

	        var res = {};
	        for (var name in data) {
	          res[name] = dehydrate(data[name], cleaned, path.concat([name]), level + 1);
	        }
	        return res;
	      }

	    default:
	      return data;
	  }
	}

	module.exports = dehydrate;

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule performanceNow
	 * @typechecks
	 */

	'use strict';

	var performance = __webpack_require__(43);

	var performanceNow;

	/**
	 * Detect if we can use `window.performance.now()` and gracefully fallback to
	 * `Date.now()` if it doesn't exist. We need to support Firefox < 15 for now
	 * because of Facebook's testing infrastructure.
	 */
	if (performance.now) {
	  performanceNow = function () {
	    return performance.now();
	  };
	} else {
	  performanceNow = function () {
	    return Date.now();
	  };
	}

	module.exports = performanceNow;

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule performance
	 * @typechecks
	 */

	'use strict';

	var ExecutionEnvironment = __webpack_require__(44);

	var performance;

	if (ExecutionEnvironment.canUseDOM) {
	  performance = window.performance || window.msPerformance || window.webkitPerformance;
	}

	module.exports = performance || {};

/***/ },
/* 44 */
/***/ function(module, exports) {

	/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule ExecutionEnvironment
	 */

	'use strict';

	var canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

	/**
	 * Simple, lightweight module assisting with the detection and context of
	 * Worker. Helps avoid circular dependencies and allows code to reason about
	 * whether or not they are in a Worker, even if they never include the main
	 * `ReactWorker` dependency.
	 */
	var ExecutionEnvironment = {

	  canUseDOM: canUseDOM,

	  canUseWorkers: typeof Worker !== 'undefined',

	  canUseEventListeners: canUseDOM && !!(window.addEventListener || window.attachEvent),

	  canUseViewport: canUseDOM && !!window.screen,

	  isInWorker: !canUseDOM // For now, this is true - might change in the future.

	};

	module.exports = ExecutionEnvironment;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var setupBackend = __webpack_require__(46);

	module.exports = function (hook, agent) {
	  var subs = [hook.sub('renderer-attached', function (_ref) {
	    var id = _ref.id,
	        renderer = _ref.renderer,
	        helpers = _ref.helpers;

	    agent.setReactInternals(id, helpers);
	    helpers.walkTree(agent.onMounted.bind(agent, id), agent.addRoot.bind(agent, id));
	  }), hook.sub('root', function (_ref2) {
	    var renderer = _ref2.renderer,
	        internalInstance = _ref2.internalInstance;
	    return agent.addRoot(renderer, internalInstance);
	  }), hook.sub('mount', function (_ref3) {
	    var renderer = _ref3.renderer,
	        internalInstance = _ref3.internalInstance,
	        data = _ref3.data;
	    return agent.onMounted(renderer, internalInstance, data);
	  }), hook.sub('update', function (_ref4) {
	    var renderer = _ref4.renderer,
	        internalInstance = _ref4.internalInstance,
	        data = _ref4.data;
	    return agent.onUpdated(internalInstance, data);
	  }), hook.sub('unmount', function (_ref5) {
	    var renderer = _ref5.renderer,
	        internalInstance = _ref5.internalInstance;
	    return agent.onUnmounted(internalInstance);
	  })];

	  var success = setupBackend(hook);
	  if (!success) {
	    return;
	  }

	  hook.emit('react-devtools', agent);
	  hook.reactDevtoolsAgent = agent;
	  agent.on('shutdown', function () {
	    subs.forEach(function (fn) {
	      return fn();
	    });
	    hook.reactDevtoolsAgent = null;
	  });
	};

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 *
	 * This is the chrome devtools
	 *
	 * 1. Devtools sets the __REACT_DEVTOOLS_GLOBAL_HOOK__ global.
	 * 2. React (if present) calls .inject() with the internal renderer
	 * 3. Devtools sees the renderer, and then adds this backend, along with the Agent
	 *    and whatever else is needed.
	 * 4. The agent then calls `.emit('react-devtools', agent)`
	 *
	 * Now things are hooked up.
	 *
	 * When devtools closes, it calls `cleanup()` to remove the listeners
	 * and any overhead caused by the backend.
	 */
	'use strict';

	var attachRenderer = __webpack_require__(47);

	module.exports = function setupBackend(hook) {
	  var oldReact = window.React && window.React.__internals;
	  if (oldReact && Object.keys(hook._renderers).length === 0) {
	    hook.inject(oldReact);
	  }

	  for (var rid in hook._renderers) {
	    hook.helpers[rid] = attachRenderer(hook, rid, hook._renderers[rid]);
	    hook.emit('renderer-attached', { id: rid, renderer: hook._renderers[rid], helpers: hook.helpers[rid] });
	  }

	  hook.on('renderer', function (_ref) {
	    var id = _ref.id,
	        renderer = _ref.renderer;

	    hook.helpers[id] = attachRenderer(hook, id, renderer);
	    hook.emit('renderer-attached', { id: id, renderer: renderer, helpers: hook.helpers[id] });
	  });

	  var shutdown = function shutdown() {
	    for (var id in hook.helpers) {
	      hook.helpers[id].cleanup();
	    }
	    hook.off('shutdown', shutdown);
	  };
	  hook.on('shutdown', shutdown);

	  return true;
	};

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Map) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var getData = __webpack_require__(48);
	var getData012 = __webpack_require__(54);
	var attachRendererFiber = __webpack_require__(55);

	/**
	 * This takes care of patching the renderer to emit events on the global
	 * `Hook`. The returned object has a `.cleanup` method to un-patch everything.
	 */
	function attachRenderer(hook, rid, renderer) {
	  var rootNodeIDMap = new Map();
	  var extras = {};
	  // Before 0.13 there was no Reconciler, so we patch Component.Mixin
	  var isPre013 = !renderer.Reconciler;

	  // React Fiber
	  if (typeof renderer.findFiberByHostInstance === 'function') {
	    return attachRendererFiber(hook, rid, renderer);
	  }

	  // React Native
	  if (renderer.Mount.findNodeHandle && renderer.Mount.nativeTagToRootNodeID) {
	    extras.getNativeFromReactElement = function (component) {
	      return renderer.Mount.findNodeHandle(component);
	    };

	    extras.getReactElementFromNative = function (nativeTag) {
	      var id = renderer.Mount.nativeTagToRootNodeID(nativeTag);
	      return rootNodeIDMap.get(id);
	    };
	    // React DOM 15+
	  } else if (renderer.ComponentTree) {
	    extras.getNativeFromReactElement = function (component) {
	      return renderer.ComponentTree.getNodeFromInstance(component);
	    };

	    extras.getReactElementFromNative = function (node) {
	      return renderer.ComponentTree.getClosestInstanceFromNode(node);
	    };
	    // React DOM
	  } else if (renderer.Mount.getID && renderer.Mount.getNode) {
	    extras.getNativeFromReactElement = function (component) {
	      try {
	        return renderer.Mount.getNode(component._rootNodeID);
	      } catch (e) {
	        return undefined;
	      }
	    };

	    extras.getReactElementFromNative = function (node) {
	      // $FlowFixMe
	      var id = renderer.Mount.getID(node);
	      while (node && node.parentNode && !id) {
	        node = node.parentNode;
	        // $FlowFixMe
	        id = renderer.Mount.getID(node);
	      }
	      return rootNodeIDMap.get(id);
	    };
	  } else {
	    console.warn('Unknown react version (does not have getID), probably an unshimmed React Native');
	  }

	  var oldMethods;
	  var oldRenderComponent;
	  var oldRenderRoot;

	  // React DOM
	  if (renderer.Mount._renderNewRootComponent) {
	    oldRenderRoot = decorateResult(renderer.Mount, '_renderNewRootComponent', function (internalInstance) {
	      hook.emit('root', { renderer: rid, internalInstance: internalInstance });
	    });
	    // React Native
	  } else if (renderer.Mount.renderComponent) {
	    oldRenderComponent = decorateResult(renderer.Mount, 'renderComponent', function (internalInstance) {
	      hook.emit('root', { renderer: rid, internalInstance: internalInstance._reactInternalInstance });
	    });
	  }

	  if (renderer.Component) {
	    console.error('You are using a version of React with limited support in this version of the devtools.\nPlease upgrade to use at least 0.13, or you can downgrade to use the old version of the devtools:\ninstructions here https://github.com/facebook/react-devtools/tree/devtools-next#how-do-i-use-this-for-react--013');
	    // 0.11 - 0.12
	    // $FlowFixMe renderer.Component is not "possibly undefined"
	    oldMethods = decorateMany(renderer.Component.Mixin, {
	      mountComponent: function mountComponent() {
	        var _this = this;

	        rootNodeIDMap.set(this._rootNodeID, this);
	        // FIXME DOMComponent calls Component.Mixin, and sets up the
	        // `children` *after* that call, meaning we don't have access to the
	        // children at this point. Maybe we should find something else to shim
	        // (do we have access to DOMComponent here?) so that we don't have to
	        // setTimeout.
	        setTimeout(function () {
	          hook.emit('mount', { internalInstance: _this, data: getData012(_this), renderer: rid });
	        }, 0);
	      },
	      updateComponent: function updateComponent() {
	        var _this2 = this;

	        setTimeout(function () {
	          hook.emit('update', { internalInstance: _this2, data: getData012(_this2), renderer: rid });
	        }, 0);
	      },
	      unmountComponent: function unmountComponent() {
	        hook.emit('unmount', { internalInstance: this, renderer: rid });
	        rootNodeIDMap.delete(this._rootNodeID);
	      }
	    });
	  } else if (renderer.Reconciler) {
	    oldMethods = decorateMany(renderer.Reconciler, {
	      mountComponent: function mountComponent(internalInstance, rootID, transaction, context) {
	        var data = getData(internalInstance);
	        rootNodeIDMap.set(internalInstance._rootNodeID, internalInstance);
	        hook.emit('mount', { internalInstance: internalInstance, data: data, renderer: rid });
	      },
	      performUpdateIfNecessary: function performUpdateIfNecessary(internalInstance, nextChild, transaction, context) {
	        hook.emit('update', { internalInstance: internalInstance, data: getData(internalInstance), renderer: rid });
	      },
	      receiveComponent: function receiveComponent(internalInstance, nextChild, transaction, context) {
	        hook.emit('update', { internalInstance: internalInstance, data: getData(internalInstance), renderer: rid });
	      },
	      unmountComponent: function unmountComponent(internalInstance) {
	        hook.emit('unmount', { internalInstance: internalInstance, renderer: rid });
	        rootNodeIDMap.delete(internalInstance._rootNodeID);
	      }
	    });
	  }

	  extras.walkTree = function (visit, visitRoot) {
	    var onMount = function onMount(component, data) {
	      rootNodeIDMap.set(component._rootNodeID, component);
	      visit(component, data);
	    };
	    walkRoots(renderer.Mount._instancesByReactRootID || renderer.Mount._instancesByContainerID, onMount, visitRoot, isPre013);
	  };

	  extras.cleanup = function () {
	    if (oldMethods) {
	      if (renderer.Component) {
	        restoreMany(renderer.Component.Mixin, oldMethods);
	      } else {
	        restoreMany(renderer.Reconciler, oldMethods);
	      }
	    }
	    if (oldRenderRoot) {
	      renderer.Mount._renderNewRootComponent = oldRenderRoot;
	    }
	    if (oldRenderComponent) {
	      renderer.Mount.renderComponent = oldRenderComponent;
	    }
	    oldMethods = null;
	    oldRenderRoot = null;
	    oldRenderComponent = null;
	  };

	  return extras;
	}

	function walkRoots(roots, onMount, onRoot, isPre013) {
	  for (var name in roots) {
	    walkNode(roots[name], onMount, isPre013);
	    onRoot(roots[name]);
	  }
	}

	function walkNode(internalInstance, onMount, isPre013) {
	  var data = isPre013 ? getData012(internalInstance) : getData(internalInstance);
	  if (data.children && Array.isArray(data.children)) {
	    data.children.forEach(function (child) {
	      return walkNode(child, onMount, isPre013);
	    });
	  }
	  onMount(internalInstance, data);
	}

	function decorateResult(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function (instance) {
	    var res = old.apply(this, arguments);
	    fn(res);
	    return res;
	  };
	  return old;
	}

	function decorate(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function (instance) {
	    var res = old.apply(this, arguments);
	    fn.apply(this, arguments);
	    return res;
	  };
	  return old;
	}

	function decorateMany(source, fns) {
	  var olds = {};
	  for (var name in fns) {
	    olds[name] = decorate(source, name, fns[name]);
	  }
	  return olds;
	}

	function restoreMany(source, olds) {
	  for (var name in olds) {
	    source[name] = olds[name];
	  }
	}

	module.exports = attachRenderer;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(3)))

/***/ },
/* 48 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var copyWithSet = __webpack_require__(49);
	var getDisplayName = __webpack_require__(50);
	var traverseAllChildrenImpl = __webpack_require__(51);

	/**
	 * Convert a react internal instance to a sanitized data object.
	 */
	function getData(internalInstance) {
	  var children = null;
	  var props = null;
	  var state = null;
	  var context = null;
	  var updater = null;
	  var name = null;
	  var type = null;
	  var key = null;
	  var ref = null;
	  var source = null;
	  var text = null;
	  var publicInstance = null;
	  var nodeType = 'Native';
	  // If the parent is a native node without rendered children, but with
	  // multiple string children, then the `element` that gets passed in here is
	  // a plain value -- a string or number.
	  if ((typeof internalInstance === 'undefined' ? 'undefined' : _typeof(internalInstance)) !== 'object') {
	    nodeType = 'Text';
	    text = internalInstance + '';
	  } else if (internalInstance._currentElement === null || internalInstance._currentElement === false) {
	    nodeType = 'Empty';
	  } else if (internalInstance._renderedComponent) {
	    nodeType = 'NativeWrapper';
	    children = [internalInstance._renderedComponent];
	    props = internalInstance._instance.props;
	    state = internalInstance._instance.state;
	    context = internalInstance._instance.context;
	    if (context && Object.keys(context).length === 0) {
	      context = null;
	    }
	  } else if (internalInstance._renderedChildren) {
	    children = childrenList(internalInstance._renderedChildren);
	  } else if (internalInstance._currentElement && internalInstance._currentElement.props) {
	    // This is a native node without rendered children -- meaning the children
	    // prop is the unfiltered list of children.
	    // This may include 'null' or even other invalid values, so we need to
	    // filter it the same way that ReactDOM does.
	    // Instead of pulling in the whole React library, we just copied over the
	    // 'traverseAllChildrenImpl' method.
	    // https://github.com/facebook/react/blob/240b84ed8e1db715d759afaae85033718a0b24e1/src/isomorphic/children/ReactChildren.js#L112-L158
	    var unfilteredChildren = internalInstance._currentElement.props.children;
	    var filteredChildren = [];
	    traverseAllChildrenImpl(unfilteredChildren, '', // nameSoFar
	    function (_traverseContext, child) {
	      var childType = typeof child === 'undefined' ? 'undefined' : _typeof(child);
	      if (childType === 'string' || childType === 'number') {
	        filteredChildren.push(child);
	      }
	    });
	    if (filteredChildren.length <= 1) {
	      // children must be an array of nodes or a string or undefined
	      // can't be an empty array
	      children = filteredChildren.length ? String(filteredChildren[0]) : undefined;
	    } else {
	      children = filteredChildren;
	    }
	  }

	  if (!props && internalInstance._currentElement && internalInstance._currentElement.props) {
	    props = internalInstance._currentElement.props;
	  }

	  // != used deliberately here to catch undefined and null
	  if (internalInstance._currentElement != null) {
	    type = internalInstance._currentElement.type;
	    if (internalInstance._currentElement.key) {
	      key = String(internalInstance._currentElement.key);
	    }
	    source = internalInstance._currentElement._source;
	    ref = internalInstance._currentElement.ref;
	    if (typeof type === 'string') {
	      name = type;
	      if (internalInstance._nativeNode != null) {
	        publicInstance = internalInstance._nativeNode;
	      }
	      if (internalInstance._hostNode != null) {
	        publicInstance = internalInstance._hostNode;
	      }
	    } else if (typeof type === 'function') {
	      nodeType = 'Composite';
	      name = getDisplayName(type);
	      // 0.14 top-level wrapper
	      // TODO(jared): The backend should just act as if these don't exist.
	      if (internalInstance._renderedComponent && (internalInstance._currentElement.props === internalInstance._renderedComponent._currentElement || internalInstance._currentElement.type.isReactTopLevelWrapper)) {
	        nodeType = 'Wrapper';
	      }
	      if (name === null) {
	        name = 'No display name';
	      }
	    } else if (typeof internalInstance._stringText === 'string') {
	      nodeType = 'Text';
	      text = internalInstance._stringText;
	    } else {
	      name = getDisplayName(type);
	    }
	  }

	  if (internalInstance._instance) {
	    var inst = internalInstance._instance;

	    // A forceUpdate for stateless (functional) components.
	    var forceUpdate = inst.forceUpdate || inst.updater && inst.updater.enqueueForceUpdate && function (cb) {
	      inst.updater.enqueueForceUpdate(this, cb, 'forceUpdate');
	    };
	    updater = {
	      setState: inst.setState && inst.setState.bind(inst),
	      forceUpdate: forceUpdate && forceUpdate.bind(inst),
	      setInProps: forceUpdate && setInProps.bind(null, internalInstance, forceUpdate),
	      setInState: inst.forceUpdate && setInState.bind(null, inst),
	      setInContext: forceUpdate && setInContext.bind(null, inst, forceUpdate)
	    };
	    if (typeof type === 'function') {
	      publicInstance = inst;
	    }

	    // TODO: React ART currently falls in this bucket, but this doesn't
	    // actually make sense and we should clean this up after stabilizing our
	    // API for backends
	    if (inst._renderedChildren) {
	      children = childrenList(inst._renderedChildren);
	    }
	  }

	  if (typeof internalInstance.setNativeProps === 'function') {
	    // For editing styles in RN
	    updater = {
	      setNativeProps: function setNativeProps(nativeProps) {
	        internalInstance.setNativeProps(nativeProps);
	      }
	    };
	  }

	  // $FlowFixMe
	  return {
	    nodeType: nodeType,
	    type: type,
	    key: key,
	    ref: ref,
	    source: source,
	    name: name,
	    props: props,
	    state: state,
	    context: context,
	    children: children,
	    text: text,
	    updater: updater,
	    publicInstance: publicInstance
	  };
	}

	function setInProps(internalInst, forceUpdate, path, value) {
	  var element = internalInst._currentElement;
	  internalInst._currentElement = _extends({}, element, {
	    props: copyWithSet(element.props, path, value)
	  });
	  forceUpdate.call(internalInst._instance);
	}

	function setInState(inst, path, value) {
	  setIn(inst.state, path, value);
	  inst.forceUpdate();
	}

	function setInContext(inst, forceUpdate, path, value) {
	  setIn(inst.context, path, value);
	  forceUpdate.call(inst);
	}

	function setIn(obj, path, value) {
	  var last = path.pop();
	  var parent = path.reduce(function (obj_, attr) {
	    return obj_ ? obj_[attr] : null;
	  }, obj);
	  if (parent) {
	    parent[last] = value;
	  }
	}

	function childrenList(children) {
	  var res = [];
	  for (var name in children) {
	    res.push(children[name]);
	  }
	  return res;
	}

	module.exports = getData;

/***/ },
/* 49 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

	function copyWithSetImpl(obj, path, idx, value) {
	  if (idx >= path.length) {
	    return value;
	  }
	  var key = path[idx];
	  var updated = Array.isArray(obj) ? obj.slice() : _extends({}, obj);
	  // $FlowFixMe number or string is fine here
	  updated[key] = copyWithSetImpl(obj[key], path, idx + 1, value);
	  return updated;
	}

	function copyWithSet(obj, path, value) {
	  return copyWithSetImpl(obj, path, 0, value);
	}

	module.exports = copyWithSet;

/***/ },
/* 50 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(WeakMap) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var FB_MODULE_RE = /^(.*) \[from (.*)\]$/;
	var cachedDisplayNames = new WeakMap();

	function getDisplayName(type) {
	  var fallbackName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'Unknown';

	  var nameFromCache = cachedDisplayNames.get(type);
	  if (nameFromCache != null) {
	    return nameFromCache;
	  }

	  var displayName = void 0;

	  // The displayName property is not guaranteed to be a string.
	  // It's only safe to use for our purposes if it's a string.
	  // github.com/facebook/react-devtools/issues/803
	  if (typeof type.displayName === 'string') {
	    displayName = type.displayName;
	  }

	  if (!displayName) {
	    displayName = type.name || fallbackName;
	  }

	  // Facebook-specific hack to turn "Image [from Image.react]" into just "Image".
	  // We need displayName with module name for error reports but it clutters the DevTools.
	  var match = displayName.match(FB_MODULE_RE);
	  if (match) {
	    var componentName = match[1];
	    var moduleName = match[2];
	    if (componentName && moduleName) {
	      if (moduleName === componentName || moduleName.startsWith(componentName + '.')) {
	        displayName = componentName;
	      }
	    }
	  }

	  cachedDisplayNames.set(type, displayName);
	  return displayName;
	}

	module.exports = getDisplayName;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(4)))

/***/ },
/* 51 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var invariant = __webpack_require__(52);

	var SEPARATOR = '.';
	var SUBSEPARATOR = ':';

	var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.
	// The Symbol used to tag the ReactElement type. If there is no native Symbol
	// nor polyfill, then a plain number is used for performance.
	var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
	var REACT_ELEMENT_TYPE = typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element') || 0xeac7;

	/**
	 * Escape and wrap key so it is safe to use as a reactid
	 *
	 * @param {string} key to be escaped.
	 * @return {string} the escaped key.
	 */
	function escape(key) {
	  var escapeRegex = /[=:]/g;
	  var escaperLookup = {
	    '=': '=0',
	    ':': '=2'
	  };
	  var escapedString = ('' + key).replace(escapeRegex, function (match) {
	    return escaperLookup[match];
	  });

	  return '$' + escapedString;
	}

	/**
	 * Generate a key string that identifies a component within a set.
	 *
	 * @param {*} component A component that could contain a manual key.
	 * @param {number} index Index that is used if a manual key is not provided.
	 * @return {string}
	 */
	function getComponentKey(component, index) {
	  // Do some typechecking here since we call this blindly. We want to ensure
	  // that we don't block potential future ES APIs.
	  if ((typeof component === 'undefined' ? 'undefined' : _typeof(component)) === 'object' && component !== null && component.key != null) {
	    // Explicit key
	    return escape(component.key);
	  }
	  // Implicit key determined by the index in the set
	  return index.toString(36);
	}

	/**
	 * We do a copied the 'traverseAllChildrenImpl' method from
	 * `React.Children` so that we don't pull in the whole React library.
	 * @param {?*} children Children tree container.
	 * @param {!string} nameSoFar Name of the key path so far.
	 * @param {!function} callback Callback to invoke with each child found.
	 * @param {?*} traverseContext Used to pass information throughout the traversal
	 * process.
	 * @return {!number} The number of children in this subtree.
	 */
	function traverseAllChildrenImpl(children, nameSoFar, callback, traverseContext) {
	  var type = typeof children === 'undefined' ? 'undefined' : _typeof(children);

	  if (type === 'undefined' || type === 'boolean') {
	    // All of the above are perceived as null.
	    children = null;
	  }

	  if (children === null || type === 'string' || type === 'number' ||
	  // The following is inlined from ReactElement. This means we can optimize
	  // some checks. React Fiber also inlines this logic for similar purposes.
	  type === 'object' && children.$$typeof === REACT_ELEMENT_TYPE) {
	    callback(traverseContext, children,
	    // If it's the only child, treat the name as if it was wrapped in an array
	    // so that it's consistent if the number of children grows.
	    nameSoFar === '' ? SEPARATOR + getComponentKey(children, 0) : nameSoFar);
	    return 1;
	  }

	  var child;
	  var nextName;
	  var subtreeCount = 0; // Count of children found in the current subtree.
	  var nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

	  if (Array.isArray(children)) {
	    for (var i = 0; i < children.length; i++) {
	      child = children[i];
	      nextName = nextNamePrefix + getComponentKey(child, i);
	      subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
	    }
	  } else {
	    var iteratorFn = ITERATOR_SYMBOL && children[ITERATOR_SYMBOL] || children[FAUX_ITERATOR_SYMBOL];
	    if (typeof iteratorFn === 'function') {
	      var iterator = iteratorFn.call(children);
	      var step;
	      var ii = 0;
	      while (!(step = iterator.next()).done) {
	        child = step.value;
	        nextName = nextNamePrefix + getComponentKey(child, ii++);
	        subtreeCount += traverseAllChildrenImpl(child, nextName, callback, traverseContext);
	      }
	    } else if (type === 'object') {
	      var addendum = ' If you meant to render a collection of children, use an array ' + 'instead.';
	      var childrenString = '' + children;
	      invariant(false, 'The React Devtools cannot render an object as a child. (found: %s).%s', childrenString === '[object Object]' ? 'object with keys {' + Object.keys(children).join(', ') + '}' : childrenString, addendum);
	    }
	  }

	  return subtreeCount;
	}

	module.exports = traverseAllChildrenImpl;

/***/ },
/* 52 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * @providesModule invariant
	 */

	'use strict';

	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */

	function invariant(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }

	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }

	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	}

	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(53)))

/***/ },
/* 53 */
/***/ function(module, exports) {

	// shim for using process in browser
	var process = module.exports = {};

	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.

	var cachedSetTimeout;
	var cachedClearTimeout;

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	} ())
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };


/***/ },
/* 54 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var copyWithSet = __webpack_require__(49);

	function getData012(internalInstance) {
	  var children = null;
	  var props = internalInstance.props;
	  var state = internalInstance.state;
	  var context = internalInstance.context;
	  var updater = null;
	  var name = null;
	  var type = null;
	  var key = null;
	  var ref = null;
	  var text = null;
	  var publicInstance = null;
	  var nodeType = 'Native';
	  if (internalInstance._renderedComponent) {
	    nodeType = 'Wrapper';
	    children = [internalInstance._renderedComponent];
	    if (context && Object.keys(context).length === 0) {
	      context = null;
	    }
	  } else if (internalInstance._renderedChildren) {
	    name = internalInstance.constructor.displayName;
	    children = childrenList(internalInstance._renderedChildren);
	  } else if (typeof props.children === 'string') {
	    // string children
	    name = internalInstance.constructor.displayName;
	    children = props.children;
	    nodeType = 'Native';
	  }

	  if (!props && internalInstance._currentElement && internalInstance._currentElement.props) {
	    props = internalInstance._currentElement.props;
	  }

	  if (internalInstance._currentElement) {
	    type = internalInstance._currentElement.type;
	    if (internalInstance._currentElement.key) {
	      key = String(internalInstance._currentElement.key);
	    }
	    ref = internalInstance._currentElement.ref;
	    if (typeof type === 'string') {
	      name = type;
	    } else {
	      nodeType = 'Composite';
	      name = type.displayName;
	      if (!name) {
	        name = 'No display name';
	      }
	    }
	  }

	  if (!name) {
	    name = internalInstance.constructor.displayName || 'No display name';
	    nodeType = 'Composite';
	  }

	  if (typeof props === 'string') {
	    nodeType = 'Text';
	    text = props;
	    props = null;
	    name = null;
	  }

	  if (internalInstance.forceUpdate) {
	    updater = {
	      setState: internalInstance.setState.bind(internalInstance),
	      forceUpdate: internalInstance.forceUpdate.bind(internalInstance),
	      setInProps: internalInstance.forceUpdate && setInProps.bind(null, internalInstance),
	      setInState: internalInstance.forceUpdate && setInState.bind(null, internalInstance),
	      setInContext: internalInstance.forceUpdate && setInContext.bind(null, internalInstance)
	    };
	    publicInstance = internalInstance;
	  }

	  // $FlowFixMe
	  return {
	    nodeType: nodeType,
	    type: type,
	    key: key,
	    ref: ref,
	    source: null,
	    name: name,
	    props: props,
	    state: state,
	    context: context,
	    children: children,
	    text: text,
	    updater: updater,
	    publicInstance: publicInstance
	  };
	}

	function setInProps(inst, path, value) {
	  inst.props = copyWithSet(inst.props, path, value);
	  inst.forceUpdate();
	}

	function setInState(inst, path, value) {
	  setIn(inst.state, path, value);
	  inst.forceUpdate();
	}

	function setInContext(inst, path, value) {
	  setIn(inst.context, path, value);
	  inst.forceUpdate();
	}

	function setIn(obj, path, value) {
	  var last = path.pop();
	  var parent = path.reduce(function (obj_, attr) {
	    return obj_ ? obj_[attr] : null;
	  }, obj);
	  if (parent) {
	    parent[last] = value;
	  }
	}

	function childrenList(children) {
	  var res = [];
	  for (var name in children) {
	    res.push(children[name]);
	  }
	  return res;
	}

	module.exports = getData012;

/***/ },
/* 55 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(Set) {/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var getDataFiber = __webpack_require__(56);

	var _require = __webpack_require__(57),
	    ClassComponent = _require.ClassComponent,
	    FunctionalComponent = _require.FunctionalComponent,
	    ContextConsumer = _require.ContextConsumer,
	    HostRoot = _require.HostRoot;

	// Inlined from ReactTypeOfSideEffect


	var PerformedWork = 1;

	function attachRendererFiber(hook, rid, renderer) {
	  // This is a slightly annoying indirection.
	  // It is currently necessary because DevTools wants
	  // to use unique objects as keys for instances.
	  // However fibers have two versions.
	  // We use this set to remember first encountered fiber for
	  // each conceptual instance.
	  var opaqueNodes = new Set();
	  function getOpaqueNode(fiber) {
	    if (opaqueNodes.has(fiber)) {
	      return fiber;
	    }
	    var alternate = fiber.alternate;

	    if (alternate != null && opaqueNodes.has(alternate)) {
	      return alternate;
	    }
	    opaqueNodes.add(fiber);
	    return fiber;
	  }

	  function hasDataChanged(prevFiber, nextFiber) {
	    switch (nextFiber.tag) {
	      case ClassComponent:
	      case FunctionalComponent:
	      case ContextConsumer:
	        // For types that execute user code, we check PerformedWork effect.
	        // We don't reflect bailouts (either referential or sCU) in DevTools.
	        // eslint-disable-next-line no-bitwise
	        return (nextFiber.effectTag & PerformedWork) === PerformedWork;
	      // Note: ContextConsumer only gets PerformedWork effect in 16.3.3+
	      // so it won't get highlighted with React 16.3.0 to 16.3.2.
	      default:
	        // For host components and other types, we compare inputs
	        // to determine whether something is an update.
	        return prevFiber.memoizedProps !== nextFiber.memoizedProps || prevFiber.memoizedState !== nextFiber.memoizedState || prevFiber.ref !== nextFiber.ref;
	    }
	  }

	  var pendingEvents = [];

	  function flushPendingEvents() {
	    var events = pendingEvents;
	    pendingEvents = [];
	    for (var i = 0; i < events.length; i++) {
	      var event = events[i];
	      hook.emit(event.type, event);
	    }
	  }

	  function enqueueMount(fiber) {
	    pendingEvents.push({
	      internalInstance: getOpaqueNode(fiber),
	      data: getDataFiber(fiber, getOpaqueNode),
	      renderer: rid,
	      type: 'mount'
	    });

	    var isRoot = fiber.tag === HostRoot;
	    if (isRoot) {
	      pendingEvents.push({
	        internalInstance: getOpaqueNode(fiber),
	        renderer: rid,
	        type: 'root'
	      });
	    }
	  }

	  function enqueueUpdateIfNecessary(fiber, hasChildOrderChanged) {
	    if (!hasChildOrderChanged && !hasDataChanged(fiber.alternate, fiber)) {
	      return;
	    }
	    pendingEvents.push({
	      internalInstance: getOpaqueNode(fiber),
	      data: getDataFiber(fiber, getOpaqueNode),
	      renderer: rid,
	      type: 'update'
	    });
	  }

	  function enqueueUnmount(fiber) {
	    var isRoot = fiber.tag === HostRoot;
	    var opaqueNode = getOpaqueNode(fiber);
	    var event = {
	      internalInstance: opaqueNode,
	      renderer: rid,
	      type: 'unmount'
	    };
	    if (isRoot) {
	      pendingEvents.push(event);
	    } else {
	      // Non-root fibers are deleted during the commit phase.
	      // They are deleted in the child-first order. However
	      // DevTools currently expects deletions to be parent-first.
	      // This is why we unshift deletions rather than push them.
	      pendingEvents.unshift(event);
	    }
	    opaqueNodes.delete(opaqueNode);
	  }

	  function mountFiber(fiber) {
	    // Depth-first.
	    // Logs mounting of children first, parents later.
	    var node = fiber;
	    outer: while (true) {
	      if (node.child) {
	        node.child.return = node;
	        node = node.child;
	        continue;
	      }
	      enqueueMount(node);
	      if (node == fiber) {
	        return;
	      }
	      if (node.sibling) {
	        node.sibling.return = node.return;
	        node = node.sibling;
	        continue;
	      }
	      while (node.return) {
	        node = node.return;
	        enqueueMount(node);
	        if (node == fiber) {
	          return;
	        }
	        if (node.sibling) {
	          node.sibling.return = node.return;
	          node = node.sibling;
	          continue outer;
	        }
	      }
	      return;
	    }
	  }

	  function updateFiber(nextFiber, prevFiber) {
	    var hasChildOrderChanged = false;
	    if (nextFiber.child !== prevFiber.child) {
	      // If the first child is different, we need to traverse them.
	      // Each next child will be either a new child (mount) or an alternate (update).
	      var nextChild = nextFiber.child;
	      var prevChildAtSameIndex = prevFiber.child;
	      while (nextChild) {
	        // We already know children will be referentially different because
	        // they are either new mounts or alternates of previous children.
	        // Schedule updates and mounts depending on whether alternates exist.
	        // We don't track deletions here because they are reported separately.
	        if (nextChild.alternate) {
	          var prevChild = nextChild.alternate;
	          updateFiber(nextChild, prevChild);
	          // However we also keep track if the order of the children matches
	          // the previous order. They are always different referentially, but
	          // if the instances line up conceptually we'll want to know that.
	          if (!hasChildOrderChanged && prevChild !== prevChildAtSameIndex) {
	            hasChildOrderChanged = true;
	          }
	        } else {
	          mountFiber(nextChild);
	          if (!hasChildOrderChanged) {
	            hasChildOrderChanged = true;
	          }
	        }
	        // Try the next child.
	        nextChild = nextChild.sibling;
	        // Advance the pointer in the previous list so that we can
	        // keep comparing if they line up.
	        if (!hasChildOrderChanged && prevChildAtSameIndex != null) {
	          prevChildAtSameIndex = prevChildAtSameIndex.sibling;
	        }
	      }
	      // If we have no more children, but used to, they don't line up.
	      if (!hasChildOrderChanged && prevChildAtSameIndex != null) {
	        hasChildOrderChanged = true;
	      }
	    }
	    enqueueUpdateIfNecessary(nextFiber, hasChildOrderChanged);
	  }

	  function walkTree() {
	    hook.getFiberRoots(rid).forEach(function (root) {
	      // Hydrate all the roots for the first time.
	      mountFiber(root.current);
	    });
	    flushPendingEvents();
	  }

	  function cleanup() {
	    // We don't patch any methods so there is no cleanup.
	  }

	  function handleCommitFiberUnmount(fiber) {
	    // This is not recursive.
	    // We can't traverse fibers after unmounting so instead
	    // we rely on React telling us about each unmount.
	    // It will be flushed after the root is committed.
	    enqueueUnmount(fiber);
	  }

	  function handleCommitFiberRoot(root) {
	    var current = root.current;
	    var alternate = current.alternate;
	    if (alternate) {
	      // TODO: relying on this seems a bit fishy.
	      var wasMounted = alternate.memoizedState != null && alternate.memoizedState.element != null;
	      var isMounted = current.memoizedState != null && current.memoizedState.element != null;
	      if (!wasMounted && isMounted) {
	        // Mount a new root.
	        mountFiber(current);
	      } else if (wasMounted && isMounted) {
	        // Update an existing root.
	        updateFiber(current, alternate);
	      } else if (wasMounted && !isMounted) {
	        // Unmount an existing root.
	        enqueueUnmount(current);
	      }
	    } else {
	      // Mount a new root.
	      mountFiber(current);
	    }
	    // We're done here.
	    flushPendingEvents();
	  }

	  // The naming is confusing.
	  // They deal with opaque nodes (fibers), not elements.
	  function getNativeFromReactElement(fiber) {
	    try {
	      var opaqueNode = fiber;
	      var hostInstance = renderer.findHostInstanceByFiber(opaqueNode);
	      return hostInstance;
	    } catch (err) {
	      // The fiber might have unmounted by now.
	      return null;
	    }
	  }
	  function getReactElementFromNative(hostInstance) {
	    var fiber = renderer.findFiberByHostInstance(hostInstance);
	    if (fiber != null) {
	      // TODO: type fibers.
	      var opaqueNode = getOpaqueNode(fiber);
	      return opaqueNode;
	    }
	    return null;
	  }
	  return {
	    getNativeFromReactElement: getNativeFromReactElement,
	    getReactElementFromNative: getReactElementFromNative,
	    handleCommitFiberRoot: handleCommitFiberRoot,
	    handleCommitFiberUnmount: handleCommitFiberUnmount,
	    cleanup: cleanup,
	    walkTree: walkTree
	  };
	}

	module.exports = attachRendererFiber;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(5)))

/***/ },
/* 56 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	var copyWithSet = __webpack_require__(49);
	var getDisplayName = __webpack_require__(50);

	var _require = __webpack_require__(57),
	    FunctionalComponent = _require.FunctionalComponent,
	    ClassComponent = _require.ClassComponent,
	    HostRoot = _require.HostRoot,
	    HostPortal = _require.HostPortal,
	    HostComponent = _require.HostComponent,
	    HostText = _require.HostText,
	    Fragment = _require.Fragment;

	var _require2 = __webpack_require__(58),
	    ASYNC_MODE_NUMBER = _require2.ASYNC_MODE_NUMBER,
	    ASYNC_MODE_SYMBOL_STRING = _require2.ASYNC_MODE_SYMBOL_STRING,
	    CONTEXT_CONSUMER_NUMBER = _require2.CONTEXT_CONSUMER_NUMBER,
	    CONTEXT_CONSUMER_SYMBOL_STRING = _require2.CONTEXT_CONSUMER_SYMBOL_STRING,
	    CONTEXT_PROVIDER_NUMBER = _require2.CONTEXT_PROVIDER_NUMBER,
	    CONTEXT_PROVIDER_SYMBOL_STRING = _require2.CONTEXT_PROVIDER_SYMBOL_STRING,
	    FORWARD_REF_NUMBER = _require2.FORWARD_REF_NUMBER,
	    FORWARD_REF_SYMBOL_STRING = _require2.FORWARD_REF_SYMBOL_STRING,
	    PROFILER_NUMBER = _require2.PROFILER_NUMBER,
	    PROFILER_SYMBOL_STRING = _require2.PROFILER_SYMBOL_STRING,
	    STRICT_MODE_NUMBER = _require2.STRICT_MODE_NUMBER,
	    STRICT_MODE_SYMBOL_STRING = _require2.STRICT_MODE_SYMBOL_STRING,
	    TIMEOUT_NUMBER = _require2.TIMEOUT_NUMBER,
	    TIMEOUT_SYMBOL_STRING = _require2.TIMEOUT_SYMBOL_STRING;

	// TODO: we might want to change the data structure
	// once we no longer suppport Stack versions of `getData`.


	function getDataFiber(fiber, getOpaqueNode) {
	  var type = fiber.type;
	  var key = fiber.key;
	  var ref = fiber.ref;
	  var source = fiber._debugSource;
	  var publicInstance = null;
	  var props = null;
	  var state = null;
	  var children = null;
	  var context = null;
	  var updater = null;
	  var nodeType = null;
	  var name = null;
	  var text = null;

	  switch (fiber.tag) {
	    case FunctionalComponent:
	    case ClassComponent:
	      nodeType = 'Composite';
	      name = getDisplayName(fiber.type);
	      publicInstance = fiber.stateNode;
	      props = fiber.memoizedProps;
	      state = fiber.memoizedState;
	      if (publicInstance != null) {
	        context = publicInstance.context;
	        if (context && Object.keys(context).length === 0) {
	          context = null;
	        }
	      }
	      var inst = publicInstance;
	      if (inst) {
	        updater = {
	          setState: inst.setState && inst.setState.bind(inst),
	          forceUpdate: inst.forceUpdate && inst.forceUpdate.bind(inst),
	          setInProps: inst.forceUpdate && setInProps.bind(null, fiber),
	          setInState: inst.forceUpdate && setInState.bind(null, inst),
	          setInContext: inst.forceUpdate && setInContext.bind(null, inst)
	        };
	      }
	      children = [];
	      break;
	    case HostRoot:
	      nodeType = 'Wrapper';
	      children = [];
	      break;
	    case HostPortal:
	      nodeType = 'Portal';
	      name = 'ReactPortal';
	      props = {
	        target: fiber.stateNode.containerInfo
	      };
	      children = [];
	      break;
	    case HostComponent:
	      nodeType = 'Native';
	      name = fiber.type;

	      // TODO (bvaughn) we plan to remove this prefix anyway.
	      // We can cut this special case out when it's gone.
	      name = name.replace('topsecret-', '');

	      publicInstance = fiber.stateNode;
	      props = fiber.memoizedProps;
	      if (typeof props.children === 'string' || typeof props.children === 'number') {
	        children = props.children.toString();
	      } else {
	        children = [];
	      }
	      if (typeof fiber.stateNode.setNativeProps === 'function') {
	        // For editing styles in RN
	        updater = {
	          setNativeProps: function setNativeProps(nativeProps) {
	            fiber.stateNode.setNativeProps(nativeProps);
	          }
	        };
	      }
	      break;
	    case HostText:
	      nodeType = 'Text';
	      text = fiber.memoizedProps;
	      break;
	    case Fragment:
	      nodeType = 'Wrapper';
	      children = [];
	      break;
	    default:
	      // Coroutines and yields
	      var symbolOrNumber = (typeof type === 'undefined' ? 'undefined' : _typeof(type)) === 'object' && type !== null ? type.$$typeof : type;
	      // $FlowFixMe facebook/flow/issues/2362
	      var switchValue = (typeof symbolOrNumber === 'undefined' ? 'undefined' : _typeof(symbolOrNumber)) === 'symbol' ? symbolOrNumber.toString() : symbolOrNumber;

	      switch (switchValue) {
	        case ASYNC_MODE_NUMBER:
	        case ASYNC_MODE_SYMBOL_STRING:
	          nodeType = 'Special';
	          name = 'AsyncMode';
	          children = [];
	          break;
	        case CONTEXT_PROVIDER_NUMBER:
	        case CONTEXT_PROVIDER_SYMBOL_STRING:
	          nodeType = 'Special';
	          props = fiber.memoizedProps;
	          name = 'Context.Provider';
	          children = [];
	          break;
	        case CONTEXT_CONSUMER_NUMBER:
	        case CONTEXT_CONSUMER_SYMBOL_STRING:
	          nodeType = 'Special';
	          props = fiber.memoizedProps;
	          // TODO: TraceUpdatesBackendManager currently depends on this.
	          // If you change .name, figure out a more resilient way to detect it.
	          name = 'Context.Consumer';
	          children = [];
	          break;
	        case STRICT_MODE_NUMBER:
	        case STRICT_MODE_SYMBOL_STRING:
	          nodeType = 'Special';
	          name = 'StrictMode';
	          children = [];
	          break;
	        case FORWARD_REF_NUMBER:
	        case FORWARD_REF_SYMBOL_STRING:
	          var functionName = getDisplayName(fiber.type.render, '');
	          nodeType = 'Special';
	          name = functionName !== '' ? 'ForwardRef(' + functionName + ')' : 'ForwardRef';
	          children = [];
	          break;
	        case TIMEOUT_NUMBER:
	        case TIMEOUT_SYMBOL_STRING:
	          nodeType = 'Special';
	          name = 'Timeout';
	          props = fiber.memoizedProps;
	          children = [];
	          break;
	        case PROFILER_NUMBER:
	        case PROFILER_SYMBOL_STRING:
	          nodeType = 'Special';
	          props = fiber.memoizedProps;
	          name = 'Profiler';
	          children = [];
	          break;
	        default:
	          nodeType = 'Native';
	          props = fiber.memoizedProps;
	          name = 'TODO_NOT_IMPLEMENTED_YET';
	          children = [];
	          break;
	      }
	      break;
	  }

	  if (Array.isArray(children)) {
	    var child = fiber.child;
	    while (child) {
	      children.push(getOpaqueNode(child));
	      child = child.sibling;
	    }
	  }

	  // $FlowFixMe
	  return {
	    nodeType: nodeType,
	    type: type,
	    key: key,
	    ref: ref,
	    source: source,
	    name: name,
	    props: props,
	    state: state,
	    context: context,
	    children: children,
	    text: text,
	    updater: updater,
	    publicInstance: publicInstance
	  };
	}

	function setInProps(fiber, path, value) {
	  var inst = fiber.stateNode;
	  fiber.pendingProps = copyWithSet(inst.props, path, value);
	  if (fiber.alternate) {
	    // We don't know which fiber is the current one because DevTools may bail out of getDataFiber() call,
	    // and so the data object may refer to another version of the fiber. Therefore we update pendingProps
	    // on both. I hope that this is safe.
	    fiber.alternate.pendingProps = fiber.pendingProps;
	  }
	  fiber.stateNode.forceUpdate();
	}

	function setInState(inst, path, value) {
	  setIn(inst.state, path, value);
	  inst.forceUpdate();
	}

	function setInContext(inst, path, value) {
	  setIn(inst.context, path, value);
	  inst.forceUpdate();
	}

	function setIn(obj, path, value) {
	  var last = path.pop();
	  var parent = path.reduce(function (obj_, attr) {
	    return obj_ ? obj_[attr] : null;
	  }, obj);
	  if (parent) {
	    parent[last] = value;
	  }
	}

	module.exports = getDataFiber;

/***/ },
/* 57 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	// Copied from React repo.

	module.exports = {
	  IndeterminateComponent: 0, // Before we know whether it is functional or class
	  FunctionalComponent: 1,
	  ClassComponent: 2,
	  HostRoot: 3, // Root of a host tree. Could be nested inside another node.
	  HostPortal: 4, // A subtree. Could be an entry point to a different renderer.
	  HostComponent: 5,
	  HostText: 6,
	  CoroutineComponent: 7,
	  CoroutineHandlerPhase: 8,
	  YieldComponent: 9,
	  Fragment: 10,
	  Mode: 11,
	  ContextConsumer: 12,
	  ContextProvider: 13,
	  ForwardRef: 14
	};

/***/ },
/* 58 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	// Based on the React repo.

	module.exports = {
	  ASYNC_MODE_NUMBER: 0xeacf,
	  ASYNC_MODE_SYMBOL_STRING: 'Symbol(react.async_mode)',
	  CONTEXT_CONSUMER_NUMBER: 0xeace,
	  CONTEXT_CONSUMER_SYMBOL_STRING: 'Symbol(react.context)',
	  CONTEXT_PROVIDER_NUMBER: 0xeacd,
	  CONTEXT_PROVIDER_SYMBOL_STRING: 'Symbol(react.provider)',
	  FORWARD_REF_NUMBER: 0xead0,
	  FORWARD_REF_SYMBOL_STRING: 'Symbol(react.forward_ref)',
	  PROFILER_NUMBER: 0xead2,
	  PROFILER_SYMBOL_STRING: 'Symbol(react.profiler)',
	  STRICT_MODE_NUMBER: 0xeacc,
	  STRICT_MODE_SYMBOL_STRING: 'Symbol(react.strict_mode)',
	  TIMEOUT_NUMBER: 0xead1,
	  TIMEOUT_SYMBOL_STRING: 'Symbol(react.timeout)'
	};

/***/ },
/* 59 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

	function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

	var resolveBoxStyle = __webpack_require__(60);

	var styleOverridesByHostComponentId = {};

	module.exports = function setupRNStyle(bridge, agent, resolveRNStyle) {
	  bridge.onCall('rn-style:get', function (id) {
	    var node = agent.elementData.get(id);
	    if (!node || !node.props) {
	      return null;
	    }
	    return resolveRNStyle(node.props.style);
	  });

	  bridge.on('rn-style:measure', function (id) {
	    measureStyle(agent, bridge, resolveRNStyle, id);
	  });

	  bridge.on('rn-style:rename', function (_ref) {
	    var id = _ref.id,
	        oldName = _ref.oldName,
	        newName = _ref.newName,
	        val = _ref.val;

	    renameStyle(agent, id, oldName, newName, val);
	    setTimeout(function () {
	      return measureStyle(agent, bridge, resolveRNStyle, id);
	    });
	  });

	  bridge.on('rn-style:set', function (_ref2) {
	    var id = _ref2.id,
	        attr = _ref2.attr,
	        val = _ref2.val;

	    setStyle(agent, id, attr, val);
	    setTimeout(function () {
	      return measureStyle(agent, bridge, resolveRNStyle, id);
	    });
	  });
	};

	var blank = {
	  top: 0,
	  left: 0,
	  right: 0,
	  bottom: 0
	};

	function measureStyle(agent, bridge, resolveRNStyle, id) {
	  var node = agent.elementData.get(id);
	  if (!node || !node.props) {
	    bridge.send('rn-style:measure', {});
	    return;
	  }

	  var style = resolveRNStyle(node.props.style);
	  // If it's a host component we edited before, amend styles.
	  if (styleOverridesByHostComponentId[id]) {
	    style = Object.assign({}, style, styleOverridesByHostComponentId[id]);
	  }

	  var instance = node.publicInstance;
	  if (!instance || !instance.measure) {
	    bridge.send('rn-style:measure', { style: style });
	    return;
	  }

	  instance.measure(function (x, y, width, height, left, top) {
	    // RN Android sometimes returns undefined here. Don't send measurements in this case.
	    // https://github.com/jhen0409/react-native-debugger/issues/84#issuecomment-304611817
	    if (typeof x !== 'number') {
	      bridge.send('rn-style:measure', { style: style });
	      return;
	    }
	    var margin = style && resolveBoxStyle('margin', style) || blank;
	    var padding = style && resolveBoxStyle('padding', style) || blank;
	    bridge.send('rn-style:measure', {
	      style: style,
	      measuredLayout: {
	        x: x,
	        y: y,
	        width: width,
	        height: height,
	        left: left,
	        top: top,
	        margin: margin,
	        padding: padding
	      }
	    });
	  });
	}

	function shallowClone(obj) {
	  var nobj = {};
	  for (var n in obj) {
	    nobj[n] = obj[n];
	  }
	  return nobj;
	}

	function renameStyle(agent, id, oldName, newName, val) {
	  var _ref3;

	  var data = agent.elementData.get(id);
	  var newStyle = newName ? (_ref3 = {}, _defineProperty(_ref3, oldName, undefined), _defineProperty(_ref3, newName, val), _ref3) : _defineProperty({}, oldName, undefined);

	  if (data && data.updater && typeof data.updater.setInProps === 'function') {
	    // First attempt: use setInProps().
	    // We do this for composite components, and it works relatively well.
	    var style = data && data.props && data.props.style;
	    var customStyle;
	    if (Array.isArray(style)) {
	      var lastLength = style.length - 1;
	      if (_typeof(style[lastLength]) === 'object' && !Array.isArray(style[lastLength])) {
	        customStyle = shallowClone(style[lastLength]);
	        delete customStyle[oldName];
	        if (newName) {
	          customStyle[newName] = val;
	        } else {
	          customStyle[oldName] = undefined;
	        }
	        // $FlowFixMe we know that updater is not null here
	        data.updater.setInProps(['style', lastLength], customStyle);
	      } else {
	        style = style.concat([newStyle]);
	        // $FlowFixMe we know that updater is not null here
	        data.updater.setInProps(['style'], style);
	      }
	    } else {
	      if ((typeof style === 'undefined' ? 'undefined' : _typeof(style)) === 'object') {
	        customStyle = shallowClone(style);
	        delete customStyle[oldName];
	        if (newName) {
	          customStyle[newName] = val;
	        } else {
	          customStyle[oldName] = undefined;
	        }
	        // $FlowFixMe we know that updater is not null here
	        data.updater.setInProps(['style'], customStyle);
	      } else {
	        style = [style, newStyle];
	        data.updater.setInProps(['style'], style);
	      }
	    }
	  } else if (data && data.updater && typeof data.updater.setNativeProps === 'function') {
	    // Fallback: use setNativeProps(). We're dealing with a host component.
	    // Remember to "correct" resolved styles when we read them next time.
	    if (!styleOverridesByHostComponentId[id]) {
	      styleOverridesByHostComponentId[id] = newStyle;
	    } else {
	      Object.assign(styleOverridesByHostComponentId[id], newStyle);
	    }
	    data.updater.setNativeProps({ style: newStyle });
	  } else {
	    return;
	  }
	  agent.emit('hideHighlight');
	}

	function setStyle(agent, id, attr, val) {
	  var data = agent.elementData.get(id);
	  var newStyle = _defineProperty({}, attr, val);

	  if (data && data.updater && typeof data.updater.setInProps === 'function') {
	    // First attempt: use setInProps().
	    // We do this for composite components, and it works relatively well.
	    var style = data.props && data.props.style;
	    if (Array.isArray(style)) {
	      var lastLength = style.length - 1;
	      if (_typeof(style[lastLength]) === 'object' && !Array.isArray(style[lastLength])) {
	        // $FlowFixMe we know that updater is not null here
	        data.updater.setInProps(['style', lastLength, attr], val);
	      } else {
	        style = style.concat([newStyle]);
	        // $FlowFixMe we know that updater is not null here
	        data.updater.setInProps(['style'], style);
	      }
	    } else {
	      style = [style, newStyle];
	      data.updater.setInProps(['style'], style);
	    }
	  } else if (data && data.updater && typeof data.updater.setNativeProps === 'function') {
	    // Fallback: use setNativeProps(). We're dealing with a host component.
	    // Remember to "correct" resolved styles when we read them next time.
	    if (!styleOverridesByHostComponentId[id]) {
	      styleOverridesByHostComponentId[id] = newStyle;
	    } else {
	      Object.assign(styleOverridesByHostComponentId[id], newStyle);
	    }
	    data.updater.setNativeProps({ style: newStyle });
	  } else {
	    return;
	  }
	  agent.emit('hideHighlight');
	}

/***/ },
/* 60 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */

	/**
	 * This is mirror from
	 * https://github.com/facebook/react-native/blob/master/Libraries/Inspector/resolveBoxStyle.js
	 *
	 * Resolve a style property into it's component parts, e.g.
	 *
	 * resolveBoxStyle('margin', {margin: 5, marginBottom: 10})
	 * ->
	 * {top: 5, left: 5, right: 5, bottom: 10}
	 *
	 * If none are set, returns false.
	 */
	function resolveBoxStyle(prefix, style) {
	  var res = {};
	  var subs = ['top', 'left', 'bottom', 'right'];
	  var set = false;
	  subs.forEach(function (sub) {
	    res[sub] = style[prefix] || 0;
	  });
	  if (style[prefix]) {
	    set = true;
	  }
	  if (style[prefix + 'Vertical']) {
	    res.top = res.bottom = style[prefix + 'Vertical'];
	    set = true;
	  }
	  if (style[prefix + 'Horizontal']) {
	    res.left = res.right = style[prefix + 'Horizontal'];
	    set = true;
	  }
	  subs.forEach(function (sub) {
	    var val = style[prefix + capFirst(sub)];
	    if (val) {
	      res[sub] = val;
	      set = true;
	    }
	  });
	  if (!set) {
	    return null;
	  }
	  return res;
	}

	function capFirst(text) {
	  return text[0].toUpperCase() + text.slice(1);
	}

	module.exports = resolveBoxStyle;

/***/ },
/* 61 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var Highlighter = __webpack_require__(62);

	module.exports = function setup(agent) {
	  var hl = new Highlighter(window, function (node) {
	    agent.selectFromDOMNode(node);
	  });
	  agent.on('highlight', function (data) {
	    return hl.highlight(data.node, data.name);
	  });
	  agent.on('highlightMany', function (nodes) {
	    return hl.highlightMany(nodes);
	  });
	  agent.on('hideHighlight', function () {
	    return hl.hideHighlight();
	  });
	  agent.on('refreshMultiOverlay', function () {
	    return hl.refreshMultiOverlay();
	  });
	  agent.on('startInspecting', function () {
	    return hl.startInspecting();
	  });
	  agent.on('stopInspecting', function () {
	    return hl.stopInspecting();
	  });
	  agent.on('shutdown', function () {
	    hl.remove();
	  });
	};

/***/ },
/* 62 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Overlay = __webpack_require__(63);
	var MultiOverlay = __webpack_require__(65);

	/**
	 * Manages the highlighting of items on an html page, as well as
	 * hover-to-inspect.
	 */

	var Highlighter = function () {
	  function Highlighter(win, onSelect) {
	    _classCallCheck(this, Highlighter);

	    this._win = win;
	    this._onSelect = onSelect;
	    this._overlay = null;
	    this._multiOverlay = null;
	    this._subs = [];
	  }

	  _createClass(Highlighter, [{
	    key: 'startInspecting',
	    value: function startInspecting() {
	      this._inspecting = true;
	      this._subs = [captureSubscription(this._win, 'mouseover', this.onHover.bind(this)), captureSubscription(this._win, 'mousedown', this.onMouseDown.bind(this)), captureSubscription(this._win, 'click', this.onClick.bind(this))];
	    }
	  }, {
	    key: 'stopInspecting',
	    value: function stopInspecting() {
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      this.hideHighlight();
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      this.stopInspecting();
	      if (this._button && this._button.parentNode) {
	        this._button.parentNode.removeChild(this._button);
	      }
	    }
	  }, {
	    key: 'highlight',
	    value: function highlight(node, name) {
	      this.removeMultiOverlay();
	      if (node.nodeType !== Node.COMMENT_NODE) {
	        if (!this._overlay) {
	          this._overlay = new Overlay(this._win);
	        }
	        this._overlay.inspect(node, name);
	      }
	    }
	  }, {
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      this.removeOverlay();
	      if (!this._multiOverlay) {
	        this._multiOverlay = new MultiOverlay(this._win);
	      }
	      this._multiOverlay.highlightMany(nodes);
	    }
	  }, {
	    key: 'hideHighlight',
	    value: function hideHighlight() {
	      this._inspecting = false;
	      this.removeOverlay();
	      this.removeMultiOverlay();
	    }
	  }, {
	    key: 'refreshMultiOverlay',
	    value: function refreshMultiOverlay() {
	      if (!this._multiOverlay) {
	        return;
	      }
	      this._multiOverlay.refresh();
	    }
	  }, {
	    key: 'removeOverlay',
	    value: function removeOverlay() {
	      if (!this._overlay) {
	        return;
	      }
	      this._overlay.remove();
	      this._overlay = null;
	    }
	  }, {
	    key: 'removeMultiOverlay',
	    value: function removeMultiOverlay() {
	      if (!this._multiOverlay) {
	        return;
	      }
	      this._multiOverlay.remove();
	      this._multiOverlay = null;
	    }
	  }, {
	    key: 'onMouseDown',
	    value: function onMouseDown(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this._onSelect(evt.target);
	    }
	  }, {
	    key: 'onClick',
	    value: function onClick(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      this._subs.forEach(function (unsub) {
	        return unsub();
	      });
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.hideHighlight();
	    }
	  }, {
	    key: 'onHover',
	    value: function onHover(evt) {
	      if (!this._inspecting) {
	        return;
	      }
	      evt.preventDefault();
	      evt.stopPropagation();
	      evt.cancelBubble = true;
	      this.highlight(evt.target);
	    }
	  }, {
	    key: 'injectButton',
	    value: function injectButton() {
	      this._button = makeMagnifier();
	      this._button.onclick = this.startInspecting.bind(this);
	      this._win.document.body.appendChild(this._button);
	    }
	  }]);

	  return Highlighter;
	}();

	function captureSubscription(obj, evt, cb) {
	  obj.addEventListener(evt, cb, true);
	  return function () {
	    return obj.removeEventListener(evt, cb, true);
	  };
	}

	function makeMagnifier() {
	  var button = window.document.createElement('button');
	  button.innerHTML = '&#128269;';
	  button.style.backgroundColor = 'transparent';
	  button.style.border = 'none';
	  button.style.outline = 'none';
	  button.style.cursor = 'pointer';
	  button.style.position = 'fixed';
	  button.style.bottom = '10px';
	  button.style.right = '10px';
	  button.style.fontSize = '30px';
	  button.style.zIndex = 10000000;
	  return button;
	}

	module.exports = Highlighter;

/***/ },
/* 63 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(7);

	var _require = __webpack_require__(64),
	    monospace = _require.monospace;

	/**
	 * Note that this component is not affected by the active Theme,
	 * Because it highlights elements in the main Chrome window (outside of devtools).
	 * The colors below were chosen to roughly match those used by Chrome devtools.
	 */
	var Overlay = function () {
	  function Overlay(window) {
	    _classCallCheck(this, Overlay);

	    var doc = window.document;
	    this.win = window;
	    this.container = doc.createElement('div');
	    this.node = doc.createElement('div');
	    this.border = doc.createElement('div');
	    this.padding = doc.createElement('div');
	    this.content = doc.createElement('div');

	    this.border.style.borderColor = overlayStyles.border;
	    this.padding.style.borderColor = overlayStyles.padding;
	    this.content.style.backgroundColor = overlayStyles.background;

	    assign(this.node.style, {
	      borderColor: overlayStyles.margin,
	      pointerEvents: 'none',
	      position: 'fixed'
	    });

	    this.tip = doc.createElement('div');
	    assign(this.tip.style, {
	      backgroundColor: '#333740',
	      borderRadius: '2px',
	      fontFamily: monospace.family,
	      fontWeight: 'bold',
	      padding: '3px 5px',
	      position: 'fixed',
	      fontSize: monospace.sizes.normal
	    });

	    this.nameSpan = doc.createElement('span');
	    this.tip.appendChild(this.nameSpan);
	    assign(this.nameSpan.style, {
	      color: '#ee78e6',
	      borderRight: '1px solid #aaaaaa',
	      paddingRight: '0.5rem',
	      marginRight: '0.5rem'
	    });
	    this.dimSpan = doc.createElement('span');
	    this.tip.appendChild(this.dimSpan);
	    assign(this.dimSpan.style, {
	      color: '#d7d7d7'
	    });

	    this.container.style.zIndex = 10000000;
	    this.node.style.zIndex = 10000000;
	    this.tip.style.zIndex = 10000000;
	    this.container.appendChild(this.node);
	    this.container.appendChild(this.tip);
	    this.node.appendChild(this.border);
	    this.border.appendChild(this.padding);
	    this.padding.appendChild(this.content);
	    doc.body.appendChild(this.container);
	  }

	  _createClass(Overlay, [{
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	      }
	    }
	  }, {
	    key: 'inspect',
	    value: function inspect(node, name) {
	      // We can't get the size of text nodes or comment nodes. React as of v15
	      // heavily uses comment nodes to delimit text.
	      if (node.nodeType !== Node.ELEMENT_NODE) {
	        return;
	      }
	      var box = getNestedBoundingClientRect(node, this.win);
	      var dims = getElementDimensions(node);

	      boxWrap(dims, 'margin', this.node);
	      boxWrap(dims, 'border', this.border);
	      boxWrap(dims, 'padding', this.padding);

	      assign(this.content.style, {
	        height: box.height - dims.borderTop - dims.borderBottom - dims.paddingTop - dims.paddingBottom + 'px',
	        width: box.width - dims.borderLeft - dims.borderRight - dims.paddingLeft - dims.paddingRight + 'px'
	      });

	      assign(this.node.style, {
	        top: box.top - dims.marginTop + 'px',
	        left: box.left - dims.marginLeft + 'px'
	      });

	      this.nameSpan.textContent = name || node.nodeName.toLowerCase();
	      this.dimSpan.textContent = box.width + 'px × ' + box.height + 'px';

	      var tipPos = findTipPos({
	        top: box.top - dims.marginTop,
	        left: box.left - dims.marginLeft,
	        height: box.height + dims.marginTop + dims.marginBottom,
	        width: box.width + dims.marginLeft + dims.marginRight
	      }, this.win);
	      assign(this.tip.style, tipPos);
	    }
	  }]);

	  return Overlay;
	}();

	function findTipPos(dims, win) {
	  var tipHeight = 20;
	  var margin = 5;
	  var top;
	  if (dims.top + dims.height + tipHeight <= win.innerHeight) {
	    if (dims.top + dims.height < 0) {
	      top = margin;
	    } else {
	      top = dims.top + dims.height + margin;
	    }
	  } else if (dims.top - tipHeight <= win.innerHeight) {
	    if (dims.top - tipHeight - margin < margin) {
	      top = margin;
	    } else {
	      top = dims.top - tipHeight - margin;
	    }
	  } else {
	    top = win.innerHeight - tipHeight - margin;
	  }

	  top += 'px';

	  if (dims.left < 0) {
	    return { top: top, left: margin };
	  }
	  if (dims.left + 200 > win.innerWidth) {
	    return { top: top, right: margin };
	  }
	  return { top: top, left: dims.left + margin + 'px' };
	}

	function getElementDimensions(domElement) {
	  var calculatedStyle = window.getComputedStyle(domElement);

	  return {
	    borderLeft: +calculatedStyle.borderLeftWidth.match(/[0-9]*/)[0],
	    borderRight: +calculatedStyle.borderRightWidth.match(/[0-9]*/)[0],
	    borderTop: +calculatedStyle.borderTopWidth.match(/[0-9]*/)[0],
	    borderBottom: +calculatedStyle.borderBottomWidth.match(/[0-9]*/)[0],
	    marginLeft: +calculatedStyle.marginLeft.match(/[0-9]*/)[0],
	    marginRight: +calculatedStyle.marginRight.match(/[0-9]*/)[0],
	    marginTop: +calculatedStyle.marginTop.match(/[0-9]*/)[0],
	    marginBottom: +calculatedStyle.marginBottom.match(/[0-9]*/)[0],
	    paddingLeft: +calculatedStyle.paddingLeft.match(/[0-9]*/)[0],
	    paddingRight: +calculatedStyle.paddingRight.match(/[0-9]*/)[0],
	    paddingTop: +calculatedStyle.paddingTop.match(/[0-9]*/)[0],
	    paddingBottom: +calculatedStyle.paddingBottom.match(/[0-9]*/)[0]
	  };
	}

	// Get the window object for the document that a node belongs to,
	// or return null if it cannot be found (node not attached to DOM,
	// etc).
	function getOwnerWindow(node) {
	  if (!node.ownerDocument) {
	    return null;
	  }
	  return node.ownerDocument.defaultView;
	}

	// Get the iframe containing a node, or return null if it cannot
	// be found (node not within iframe, etc).
	function getOwnerIframe(node) {
	  var nodeWindow = getOwnerWindow(node);
	  if (nodeWindow) {
	    return nodeWindow.frameElement;
	  }
	  return null;
	}

	// Get a bounding client rect for a node, with an
	// offset added to compensate for its border.
	function getBoundingClientRectWithBorderOffset(node) {
	  var dimensions = getElementDimensions(node);

	  return mergeRectOffsets([node.getBoundingClientRect(), {
	    top: dimensions.borderTop,
	    left: dimensions.borderLeft,
	    bottom: dimensions.borderBottom,
	    right: dimensions.borderRight,
	    // This width and height won't get used by mergeRectOffsets (since this
	    // is not the first rect in the array), but we set them so that this
	    // object typechecks as a DOMRect.
	    width: 0,
	    height: 0
	  }]);
	}

	// Add together the top, left, bottom, and right properties of
	// each DOMRect, but keep the width and height of the first one.
	function mergeRectOffsets(rects) {
	  return rects.reduce(function (previousRect, rect) {
	    if (previousRect == null) {
	      return rect;
	    }

	    return {
	      top: previousRect.top + rect.top,
	      left: previousRect.left + rect.left,
	      width: previousRect.width,
	      height: previousRect.height,
	      bottom: previousRect.bottom + rect.bottom,
	      right: previousRect.right + rect.right
	    };
	  });
	}

	// Calculate a boundingClientRect for a node relative to boundaryWindow,
	// taking into account any offsets caused by intermediate iframes.
	function getNestedBoundingClientRect(node, boundaryWindow) {
	  var ownerIframe = getOwnerIframe(node);
	  if (ownerIframe && ownerIframe !== boundaryWindow) {
	    var rects = [node.getBoundingClientRect()];
	    var currentIframe = ownerIframe;
	    var onlyOneMore = false;
	    while (currentIframe) {
	      var rect = getBoundingClientRectWithBorderOffset(currentIframe);
	      rects.push(rect);
	      currentIframe = getOwnerIframe(currentIframe);

	      if (onlyOneMore) {
	        break;
	      }
	      // We don't want to calculate iframe offsets upwards beyond
	      // the iframe containing the boundaryWindow, but we
	      // need to calculate the offset relative to the boundaryWindow.
	      if (currentIframe && getOwnerWindow(currentIframe) === boundaryWindow) {
	        onlyOneMore = true;
	      }
	    }

	    return mergeRectOffsets(rects);
	  } else {
	    return node.getBoundingClientRect();
	  }
	}

	function boxWrap(dims, what, node) {
	  assign(node.style, {
	    borderTopWidth: dims[what + 'Top'] + 'px',
	    borderLeftWidth: dims[what + 'Left'] + 'px',
	    borderRightWidth: dims[what + 'Right'] + 'px',
	    borderBottomWidth: dims[what + 'Bottom'] + 'px',
	    borderStyle: 'solid'
	  });
	}

	var overlayStyles = {
	  background: 'rgba(120, 170, 210, 0.7)',
	  padding: 'rgba(77, 200, 0, 0.3)',
	  margin: 'rgba(255, 155, 0, 0.3)',
	  border: 'rgba(255, 200, 50, 0.3)'
	};

	module.exports = Overlay;

/***/ },
/* 64 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	module.exports = {
	  monospace: {
	    family: 'Menlo, Consolas, monospace',
	    sizes: {
	      normal: 11,
	      large: 14
	    }
	  },
	  sansSerif: {
	    family: '"Helvetica Neue", "Lucida Grande", -apple-system, BlinkMacSystemFont, "Segoe UI", Ubuntu, sans-serif',
	    sizes: {
	      small: 10,
	      normal: 12,
	      large: 14
	    }
	  }
	};

/***/ },
/* 65 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var assign = __webpack_require__(7);

	var MultiOverlay = function () {
	  function MultiOverlay(window) {
	    _classCallCheck(this, MultiOverlay);

	    this.win = window;
	    var doc = window.document;
	    this.container = doc.createElement('div');
	    doc.body.appendChild(this.container);
	    this._currentNodes = null;
	  }

	  _createClass(MultiOverlay, [{
	    key: 'highlightMany',
	    value: function highlightMany(nodes) {
	      var _this = this;

	      this._currentNodes = nodes;
	      this.container.innerHTML = '';

	      nodes.forEach(function (node) {
	        var div = _this.win.document.createElement('div');
	        if (typeof node.getBoundingClientRect !== 'function') {
	          return;
	        }
	        var box = node.getBoundingClientRect();
	        if (box.bottom < 0 || box.top > window.innerHeight) {
	          return;
	        }
	        assign(div.style, {
	          top: box.top + 'px',
	          left: box.left + 'px',
	          width: box.width + 'px',
	          height: box.height + 'px',
	          border: '2px dotted rgba(200, 100, 100, .8)',
	          boxSizing: 'border-box',
	          backgroundColor: 'rgba(200, 100, 100, .2)',
	          position: 'fixed',
	          zIndex: 10000000,
	          pointerEvents: 'none'
	        });
	        _this.container.appendChild(div);
	      });
	    }
	  }, {
	    key: 'refresh',
	    value: function refresh() {
	      if (this._currentNodes) {
	        this.highlightMany(this._currentNodes);
	      }
	    }
	  }, {
	    key: 'remove',
	    value: function remove() {
	      if (this.container.parentNode) {
	        this.container.parentNode.removeChild(this.container);
	        this._currentNodes = null;
	      }
	    }
	  }]);

	  return MultiOverlay;
	}();

	module.exports = MultiOverlay;

/***/ },
/* 66 */
/***/ function(module, exports) {

	/**
	 * Copyright (c) 2015-present, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 *
	 * 
	 */
	'use strict';

	function decorate(obj, attr, fn) {
	  var old = obj[attr];
	  obj[attr] = function () {
	    var res = old.apply(this, arguments);
	    fn.apply(this, arguments);
	    return res;
	  };
	  return function () {
	    obj[attr] = old;
	  };
	}

	var subscriptionEnabled = false;

	module.exports = function (bridge, agent, hook) {
	  var shouldEnable = !!hook._relayInternals;

	  bridge.onCall('relay:check', function () {
	    return shouldEnable;
	  });
	  if (!shouldEnable) {
	    return;
	  }
	  var _hook$_relayInternals = hook._relayInternals,
	      DefaultStoreData = _hook$_relayInternals.DefaultStoreData,
	      setRequestListener = _hook$_relayInternals.setRequestListener;


	  function sendStoreData() {
	    if (subscriptionEnabled) {
	      bridge.send('relay:store', {
	        id: 'relay:store',
	        nodes: DefaultStoreData.getNodeData()
	      });
	    }
	  }

	  bridge.onCall('relay:store:enable', function () {
	    subscriptionEnabled = true;
	    sendStoreData();
	  });

	  bridge.onCall('relay:store:disable', function () {
	    subscriptionEnabled = false;
	  });

	  sendStoreData();
	  decorate(DefaultStoreData, 'handleUpdatePayload', sendStoreData);
	  decorate(DefaultStoreData, 'handleQueryPayload', sendStoreData);

	  var removeListener = setRequestListener(function (event, data) {
	    bridge.send(event, data);
	  });
	  hook.on('shutdown', removeListener);
	};

/***/ }
/******/ ]);