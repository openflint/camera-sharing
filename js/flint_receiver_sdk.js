/*! screen-sharing-sample build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var EventEmitter, FlintReceiverManager, WebSocketReadyState,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

WebSocketReadyState = (function() {
  function WebSocketReadyState() {}

  WebSocketReadyState.CONNECTING = 0;

  WebSocketReadyState.OPEN = 1;

  WebSocketReadyState.CLOSING = 2;

  WebSocketReadyState.CLOSED = 3;

  return WebSocketReadyState;

})();

FlintReceiverManager = (function(_super) {
  __extends(FlintReceiverManager, _super);

  function FlintReceiverManager(opts) {
    this.appId = opts.appId;
    this.wsconn = null;
    this.additionalData = {};
    this.wsServer = "ws://127.0.0.1:9431/receiver/" + this.appId;
  }

  FlintReceiverManager.prototype.start = function() {
    var _ref, _ref1;
    if (((_ref = this.wsconn) != null ? _ref.readyState : void 0) === WebSocketReadyState.CONNECTING) {
      return;
    }
    if (((_ref1 = this.wsconn) != null ? _ref1.readyState : void 0) === WebSocketReadyState.OPEN) {
      return;
    }
    this.wsconn = new WebSocket(this.wsServer);
    this.wsconn.onopen = (function(_this) {
      return function(evt) {
        return _this._onOpen(evt);
      };
    })(this);
    this.wsconn.onclose = (function(_this) {
      return function(evt) {
        return console.info("----------------------------------------------->flingd onclose....");
      };
    })(this);
    this.wsconn.onmessage = (function(_this) {
      return function(evt) {
        console.info("----------------------------------------------->flingd onmessage....", evt.data);
        if (evt.data) {
          return _this._onMessage(JSON.parse(evt.data));
        }
      };
    })(this);
    return this.wsconn.onerror = (function(_this) {
      return function(evt) {
        console.info("----------------------------------------------->flingd onerror....", evt);
        return _this._onError({
          message: "Underlying websocket is not open",
          socketReadyState: evt.target.readyState
        });
      };
    })(this);
  };

  FlintReceiverManager.prototype.setAdditionalData = function(key, value) {
    this.additionalData[key] = value;
    return this.send({
      type: "additionaldata",
      additionaldata: JSON.stringify(this.additionalData)
    });
  };

  FlintReceiverManager.prototype.send = function(data) {
    var _ref, _ref1;
    data["appid"] = this.appId;
    data = JSON.stringify(data);
    console.info("----------------------------------------------->flingd send....", data);
    if (((_ref = this.wsconn) != null ? _ref.readyState : void 0) === WebSocketReadyState.OPEN) {
      return this.wsconn.send(data);
    } else if (((_ref1 = this.ws) != null ? _ref1.readyState : void 0) === WebSocketReadyState.CONNECTING) {
      return setTimeout(((function(_this) {
        return function() {
          return _this.send(data);
        };
      })(this)), 50);
    } else {
      return this._onError({
        message: "Underlying websocket is not open",
        socketReadyState: WebSocketReadyState.CLOSED
      });
    }
  };

  FlintReceiverManager.prototype._onError = function(event) {
    return this.emit("error", event);
  };

  FlintReceiverManager.prototype._onOpen = function() {
    return this.send({
      type: "register"
    });
  };

  FlintReceiverManager.prototype._onSenderConnected = function(data) {};

  FlintReceiverManager.prototype._onSenderDisconnected = function(data) {};

  FlintReceiverManager.prototype._onMessage = function(data) {
    console.log("_onMessage", data);
    switch (data != null ? data.type : void 0) {
      case 'startheartbeat':
        return console.log('startheartbeat');
      case 'registerok':
        this.localIpAddress = data["service_info"]["ip"][0];
        this.uuid = data["service_info"]["uuid"];
        this.deviceName = data["service_info"]["device_name"];
        return this.emit('ready');
      case 'heartbeat':
        if (data.heartbeat === 'ping') {
          return this.send({
            type: 'heartbeat',
            heartbeat: 'pong'
          });
        } else {
          return this.send({
            type: 'heartbeat',
            heartbeat: 'ping'
          });
        }
        break;
      case "senderconnected":
        return this._onSenderConnected(data);
      case "senderdisconnected":
        return this._onSenderDisconnected(data);
      default:
        return this.emit('message', data);
    }
  };

  return FlintReceiverManager;

})(EventEmitter);

module.exports = FlintReceiverManager;



},{"eventemitter3":3}],2:[function(require,module,exports){
window.FlintReceiverManager = require('./FlintReceiverManager');


/*

var manager = new FlintReceiverManager({
    appId: '~a3ad1b9e-6883-11e4-b116-123b93f75cba'
});

var peer = manager.createPeer();

peer.on('open', function (id) {

    console.log("Peer Id = " + id);

    peer.on('connection', function (conn) {

        // Receive messages
        conn.on('data', function (data) {
            console.log('Received', data);
            // Send messages
            conn.send('Reply : ' + data);
        });
    });

    peer.on('call', function (call) {
        console.log("Answer the call, providing our mediaStream");
        call.answer();
        call.on('stream', function (stream) {
            // `stream` is the MediaStream of the remote peer.
            // Here you'd add it to an HTML video/canvas element.
            var video = document.getElementById('video');
            video.src = window.URL.createObjectURL(stream);
        });
    });
});
 */



},{"./FlintReceiverManager":1}],3:[function(require,module,exports){
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
  if (this._events[event].fn) return [this._events[event].fn];

  for (var i = 0, l = this._events[event].length, ee = new Array(l); i < l; i++) {
    ee[i] = this._events[event][i].fn;
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
    , len = arguments.length
    , args
    , i;

  if ('function' === typeof listeners.fn) {
    if (listeners.once) this.removeListener(event, listeners.fn, true);

    switch (len) {
      case 1: return listeners.fn.call(listeners.context), true;
      case 2: return listeners.fn.call(listeners.context, a1), true;
      case 3: return listeners.fn.call(listeners.context, a1, a2), true;
      case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
      case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
      case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
    }

    for (i = 1, args = new Array(len -1); i < len; i++) {
      args[i - 1] = arguments[i];
    }

    listeners.fn.apply(listeners.context, args);
  } else {
    var length = listeners.length
      , j;

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
  var listener = new EE(fn, context || this);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

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
  var listener = new EE(fn, context || this, true);

  if (!this._events) this._events = {};
  if (!this._events[event]) this._events[event] = listener;
  else {
    if (!this._events[event].fn) this._events[event].push(listener);
    else this._events[event] = [
      this._events[event], listener
    ];
  }

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

  if (fn) {
    if (listeners.fn && (listeners.fn !== fn || (once && !listeners.once))) {
      events.push(listeners);
    }
    if (!listeners.fn) for (var i = 0, length = listeners.length; i < length; i++) {
      if (listeners[i].fn !== fn || (once && !listeners[i].once)) {
        events.push(listeners[i]);
      }
    }
  }

  //
  // Reset the array, or remove it completely if we have no more listeners.
  //
  if (events.length) {
    this._events[event] = events.length === 1 ? events[0] : events;
  } else {
    delete this._events[event];
  }

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

  if (event) delete this._events[event];
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

//
// Expose the module.
//
module.exports = EventEmitter;

},{}]},{},[2]);
