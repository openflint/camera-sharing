/*! screen-sharing-sample build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var FlintReceiverManager, WebSocketReadyState,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  __indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

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
    this.wsServer = "ws://127.0.0.1:9431/receiver/" + this.appId;
  }

  FlintReceiverManager.prototype.start = function(additionalData) {
    var _ref, _ref1;
    if (((_ref = this.wsconn) != null ? _ref.readyState : void 0) === WebSocketReadyState.CONNECTING) {
      return;
    }
    if (((_ref1 = this.wsconn) != null ? _ref1.readyState : void 0) === WebSocketReadyState.OPEN) {
      return;
    }
    this.additionalData = additionalData;
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

  FlintReceiverManager.prototype.setAdditionalData = function(additionalData) {
    this.additionalData = additionalData;
    return this.send({
      type: "additionaldata",
      additionaldata: this.additionalData
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
    console.error("_onMessage", data);
    switch (data != null ? data.type : void 0) {
      case 'startheartbeat':
        return console.log('startheartbeat');
      case 'registerok':
        this.localIpAddress = data["service_info"]["ip"][0];
        this.uuid = data["service_info"]["uuid"];
        this.deviceName = data["service_info"]["device_name"];
        console.info("=========================================>flingd has onopened: ", (__indexOf.call(self, "onopend") >= 0));
        this.send({
          type: "additionaldata",
          additionaldata: this.additionalData
        });
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



},{}],2:[function(require,module,exports){
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



},{"./FlintReceiverManager":1}]},{},[2]);
