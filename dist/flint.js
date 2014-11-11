/*! screen-sharing-sample build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Bridge, EventEmitter,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

Bridge = (function(_super) {
  __extends(Bridge, _super);

  Bridge.instance = null;

  Bridge.getInstance = function() {
    if (!Bridge.instance) {
      Bridge.instance = new Bridge();
    }
    return Bridge.instance;
  };

  function Bridge() {
    this.callid = 1;
    this.temporaryAsyncStorage = {};
    window.addEventListener('message', (function(_this) {
      return function(event) {
        var _ref;
        if (((_ref = event.data) != null ? _ref.to : void 0) === 'page-script') {
          return _this._receive(event.data.payload);
        }
      };
    })(this));
  }

  Bridge.prototype.call = function(method, params, success, error) {
    var callid, onetime;
    callid = this._genCallId();
    onetime = true;
    if (success || error) {
      this.temporaryAsyncStorage[callid] = {
        success: success,
        error: error,
        onetime: onetime
      };
    }
    return this._send({
      callid: callid,
      method: method,
      params: params
    });
  };

  Bridge.prototype._send = function(message) {
    return window.postMessage({
      to: 'content-script',
      payload: message
    }, '*');
  };

  Bridge.prototype._genCallId = function() {
    return this.callid++;
  };

  Bridge.prototype._receive = function(result) {
    var callbacks;
    if (result.callid) {
      if (typeof this.temporaryAsyncStorage[result.callid] === void 0) {
        console.log("Nothing stored for call ID: " + result.callid);
      }
      callbacks = this.temporaryAsyncStorage[result.callid];
      if (callbacks && callbacks[result.status]) {
        callbacks[result.status](result.content);
      }
      if (callbacks && callbacks.onetime) {
        return delete this.temporaryAsyncStorage[result.callid];
      }
    }
  };

  return Bridge;

})(EventEmitter);

module.exports = Bridge;



},{"eventemitter3":5}],2:[function(require,module,exports){
var Bridge, PrivilegeWebSocket;

Bridge = require('./Bridge');

PrivilegeWebSocket = (function() {
  function PrivilegeWebSocket(url) {
    this.url = url;
    this.bridge = Bridge.getInstance();
    this._create();
  }

  PrivilegeWebSocket.prototype.send = function(data) {
    var error, success;
    success = (function(_this) {
      return function(data) {};
    })(this);
    error = (function(_this) {
      return function(error) {};
    })(this);
    return this.bridge.call('websocket:send-message', {
      id: this.id,
      data: data
    }, success, error);
  };

  PrivilegeWebSocket.prototype.close = function() {
    var error, success;
    success = (function(_this) {
      return function(content) {};
    })(this);
    error = (function(_this) {
      return function(error) {};
    })(this);
    return this.bridge.call('websocket:close', {
      id: this.id
    }, success, error);
  };

  PrivilegeWebSocket.prototype._create = function() {
    var error, success;
    success = (function(_this) {
      return function(content) {
        _this.id = content.id;
        console.log('Websocket ID : ', content.id);
        return _this._pollMessage();
      };
    })(this);
    error = (function(_this) {
      return function(error) {};
    })(this);
    return this.bridge.call('websocket:create', {
      url: this.url
    }, success, error);
  };

  PrivilegeWebSocket.prototype._pollMessage = function() {
    var error, success;
    success = (function(_this) {
      return function(content) {
        _this._onMessage(content.data);
        return _this._pollMessage();
      };
    })(this);
    error = (function(_this) {
      return function(content) {
        if (content.status === 'closed') {
          return _this._onClose();
        } else {
          return _this._onError(content);
        }
      };
    })(this);
    return this.bridge.call('websocket:get-message', {
      id: this.id
    }, success, error);
  };

  PrivilegeWebSocket.prototype._onOpen = function() {
    if (this.onopen) {
      return this.onopen();
    } else {
      return this.emit('open');
    }
  };

  PrivilegeWebSocket.prototype._onMessage = function(data) {
    if (this.onmessage) {
      return this.onmessage({
        data: data
      });
    } else {
      return this.emit('message', data);
    }
  };

  PrivilegeWebSocket.prototype._onClose = function() {
    if (this.onclose) {
      return this.onclose();
    } else {
      return this.emit('close');
    }
  };

  PrivilegeWebSocket.prototype._onError = function(error) {
    if (this.onerror) {
      return this.onerror(error.status);
    } else {
      return this.emit('error', error.status);
    }
  };

  return PrivilegeWebSocket;

})();

module.exports = PrivilegeWebSocket;



},{"./Bridge":1}],3:[function(require,module,exports){
var EventEmitter, Socket,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

Socket = (function(_super) {
  __extends(Socket, _super);

  function Socket() {
    Socket.__super__.constructor.apply(this, arguments);
  }

  return Socket;

})(EventEmitter);

module.exports = Socket;



},{"eventemitter3":5}],4:[function(require,module,exports){
window.Socket = require('./Socket');

window.PrivilegeWebSocket = require('./PrivilegeWebSocket');



},{"./PrivilegeWebSocket":2,"./Socket":3}],5:[function(require,module,exports){
'use strict';

/**
 * Representation of a single EventEmitter function.
 *
 * @param {Function} fn Event handler to be called.
 * @param {Mixed} context Context for function execution.
 * @param {Boolean} once Only emit once
 * @api private
 */
function EE(fn, context, once) {
  this.fn = fn;
  this.context = context;
  this.once = once || false;
}

/**
 * Minimal EventEmitter interface that is molded against the Node.js
 * EventEmitter interface.
 *
 * @constructor
 * @api public
 */
function EventEmitter() { /* Nothing to set */ }

/**
 * Holds the assigned EventEmitters by name.
 *
 * @type {Object}
 * @private
 */
EventEmitter.prototype._events = undefined;

/**
 * Return a list of assigned event listeners.
 *
 * @param {String} event The events that should be listed.
 * @returns {Array}
 * @api public
 */
EventEmitter.prototype.listeners = function listeners(event) {
  if (!this._events || !this._events[event]) return [];

  for (var i = 0, l = this._events[event].length, ee = []; i < l; i++) {
    ee.push(this._events[event][i].fn);
  }

  return ee;
};

/**
 * Emit an event to all registered event listeners.
 *
 * @param {String} event The name of the event.
 * @returns {Boolean} Indication if we've emitted an event.
 * @api public
 */
EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
  if (!this._events || !this._events[event]) return false;

  var listeners = this._events[event]
    , length = listeners.length
    , len = arguments.length
    , ee = listeners[0]
    , args
    , i, j;

  if (1 === length) {
    if (ee.once) this.removeListener(event, ee.fn, true);

    switch (len) {
      case 1: return ee.fn.call(ee.context), true;
      case 2: return ee.fn.call(ee.context, a1), true;
      case 3: return ee.fn.call(ee.context, a1, a2), true;
      case 4: return ee.fn.call(ee.context, a1, a2, a3), true;
      case 5: return ee.fn.call(ee.context, a1, a2, a3, a4), true;
      case 6: return ee.fn.call(ee.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    ee.fn.apply(ee.context, args);
  } else {
    for (i = 0; i < length; i++) {
      if (listeners[i].once) this.removeListener(event, listeners[i].fn, true);

      switch (len) {
        case 1: listeners[i].fn.call(listeners[i].context); break;
        case 2: listeners[i].fn.call(listeners[i].context, a1); break;
        case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
        default:
          if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
            args[j - 1] = arguments[j];
          }

          listeners[i].fn.apply(listeners[i].context, args);
      }
    }
  }

  return true;
};

/**
 * Register a new EventListener for the given event.
 *
 * @param {String} event Name of the event.
 * @param {Functon} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.on = function on(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE( fn, context || this ));

  return this;
};

/**
 * Add an EventListener that's only called once.
 *
 * @param {String} event Name of the event.
 * @param {Function} fn Callback function.
 * @param {Mixed} context The context of the function.
 * @api public
 */
EventEmitter.prototype.once = function once(event, fn, context) {
  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = [];
  this._events[event].push(new EE(fn, context || this, true ));

  return this;
};

/**
 * Remove event listeners.
 *
 * @param {String} event The event we want to remove.
 * @param {Function} fn The listener that we need to find.
 * @param {Boolean} once Only remove once listeners.
 * @api public
 */
EventEmitter.prototype.removeListener = function removeListener(event, fn, once) {
  if (!this._events || !this._events[event]) return this;

  var listeners = this._events[event]
    , events = [];

  if (fn) for (var i = 0, length = listeners.length; i < length; i++) {
    if (listeners[i].fn !== fn && listeners[i].once !== once) {
      events.push(listeners[i]);
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) this._events[event] = events;
  else this._events[event] = null;

  return this;
};

/**
 * Remove all listeners or only the listeners for the specified event.
 *
 * @param {String} event The event want to remove all listeners for.
 * @api public
 */
EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
  if (!this._events) return this;

  if (event) this._events[event] = null;
  else this._events = {};

  return this;
};

//
// Alias methods names because people roll like that.
//
EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
EventEmitter.prototype.addListener = EventEmitter.prototype.on;

//
// This function doesn't apply anymore.
//
EventEmitter.prototype.setMaxListeners = function setMaxListeners() {
  return this;
};

//
// Expose the module.
//
EventEmitter.EventEmitter = EventEmitter;
EventEmitter.EventEmitter2 = EventEmitter;
EventEmitter.EventEmitter3 = EventEmitter;

if ('object' === typeof module && module.exports) {
  module.exports = EventEmitter;
}

},{}]},{},[4]);
