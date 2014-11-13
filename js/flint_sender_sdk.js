/*! screen-sharing-sample build:0.1.0, development. Copyright(C) 2013-2014 www.OpenFlint.org */(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    enumerable: false,
    configurable: false,
    writable: false,
    value: function(searchString, position) {
      position = position || 0;
      return this.lastIndexOf(searchString, position) === position;
    }
  });
}

if (!Array.prototype.find) {
  Array.prototype.find = function(predicate) {
    var i, length, list, thisArg, value, _i, _ref;
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    list = Object(this);
    length = list.length >>> 0;
    thisArg = arguments[1];
    for (i = _i = 0, _ref = length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return value;
      }
    }
    return void 0;
  };
}

if (!Array.prototype.findIndex) {
  Array.prototype.findIndex = function(predicate) {
    var i, length, list, thisArg, value, _i, _ref;
    if (this === null) {
      throw new TypeError('Array.prototype.find called on null or undefined');
    }
    if (typeof predicate !== 'function') {
      throw new TypeError('predicate must be a function');
    }
    list = Object(this);
    length = list.length >>> 0;
    thisArg = arguments[1];
    value;
    for (i = _i = 0, _ref = length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
      value = list[i];
      if (predicate.call(thisArg, value, i, list)) {
        return i;
      }
    }
    return -1;
  };
}



},{}],2:[function(require,module,exports){
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

  Bridge.prototype.call2 = function(method, params, callback) {
    var error, success;
    success = (function(_this) {
      return function(content) {
        return typeof callback === "function" ? callback(true, content) : void 0;
      };
    })(this);
    error = (function(_this) {
      return function(error) {
        return typeof callback === "function" ? callback(false, error) : void 0;
      };
    })(this);
    return this.call(method, params, success, error);
  };

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



},{"eventemitter3":11}],3:[function(require,module,exports){
var EventEmitter, FlintDevice, NativeMethods,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

NativeMethods = require('./NativeMethods');

FlintDevice = (function(_super) {
  __extends(FlintDevice, _super);

  function FlintDevice(deviceDesc) {
    this.host = deviceDesc.host;
    this.friendlyName = deviceDesc.friendlyName;
  }

  return FlintDevice;

})(EventEmitter);

module.exports = FlintDevice;



},{"./NativeMethods":6,"eventemitter3":11}],4:[function(require,module,exports){
var Bridge, EventEmitter, FlintDevice, FlintDeviceManager,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

Bridge = require('./Bridge');

FlintDevice = require('./FlintDevice');

FlintDeviceManager = (function(_super) {
  __extends(FlintDeviceManager, _super);

  function FlintDeviceManager(device) {
    this.device = device;
    this.bridge = Bridge.getInstance();
    this.launched = false;
    this.useIpc = false;
    this.maxInactive = -1;
    this.additionalDatas = {};
    this.token = null;
    this.heartbeatInterval = 0;
  }

  FlintDeviceManager.prototype.launch = function(opts) {
    if (this.launched) {
      throw 'Application already launched ';
    }
    this.appId = opts.appId;
    this.appUrl = opts.appUrl;
    if (typeof opts.useIpc !== 'undefined') {
      this.useIpc = opts.useIpc;
    }
    if (typeof opts.maxInactive !== 'undefined') {
      this.maxInactive = opts.maxInactive;
    }
    return this._getStatus((function(_this) {
      return function(content) {
        console.log('status: ', content);
        console.log('@appState: ', _this.appState);
        console.log('@appName: ', _this.appName);
        if (_this.appState === 'running' && _this.appName === _this.appId) {
          if (opts != null ? opts.relaunchIfRunning : void 0) {
            return _this._launch(true);
          }
        } else {
          return _this._launch(false);
        }
      };
    })(this));
  };

  FlintDeviceManager.prototype._launch = function(relaunch) {
    var launchType, params;
    launchType = 'launch';
    if (relaunch) {
      launchType = 'relaunch';
    }
    params = {
      url: 'http://' + this.device.host + ':9431/apps/' + this.appId,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        type: launchType,
        app_info: {
          url: this.appUrl,
          useIpc: this.useIpc,
          maxInactive: this.maxInactive
        }
      }
    };
    return this.bridge.call2('http:post', params, (function(_this) {
      return function(success, content) {
        if (success) {
          return console.log('_launch reply ', content);
        } else {
          return console.log('_launch error ', content);
        }
      };
    })(this));
  };

  FlintDeviceManager.prototype._getStatus = function(callback) {
    var error, headers, success, url;
    headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/xml; charset=utf8'
    };
    if (this.token) {
      headers['Authorization'] = this.token;
    }
    url = 'http://' + this.device.host + ':9431/apps/' + this.appId;
    success = (function(_this) {
      return function(content) {
        console.log('_getStatus reply ', content);
        _this._parseStatus(content.data);
        return typeof callback === "function" ? callback(content.data) : void 0;
      };
    })(this);
    error = (function(_this) {
      return function(error) {
        return console.log('_getStatus error ', error);
      };
    })(this);
    return this.bridge.call('http:get', {
      url: url
    }, success, error);
  };

  FlintDeviceManager.prototype._parseStatus = function(status) {
    var additionalData, doc, i, items, lines, link, parser, responseText, _i, _ref, _results;
    lines = status.split('\n');
    lines.splice(0, 1);
    responseText = lines.join('');
    parser = new DOMParser();
    doc = parser.parseFromString(responseText, "text/xml");
    this.appName = doc.getElementsByTagName("name")[0].innerHTML;
    this.appState = doc.getElementsByTagName("state")[0].innerHTML;
    link = doc.getElementsByTagName("link");
    if (link && link[0]) {
      this.appHref = link[0].getAttribute("href");
    }
    additionalData = doc.getElementsByTagName("additionalData");
    if ((additionalData != null ? additionalData.length : void 0) > 0) {
      items = additionalData[0].childNodes;
      if (items) {
        _results = [];
        for (i = _i = 0, _ref = items.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
          if (items[i].tagName) {
            _results.push(this.additionalDatas[items[i].tagName] = items[i].innerHTML);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      }
    }
  };

  return FlintDeviceManager;

})(EventEmitter);

module.exports = FlintDeviceManager;



},{"./Bridge":2,"./FlintDevice":3,"eventemitter3":11}],5:[function(require,module,exports){
var Bridge, EventEmitter, FlintDevice, FlintDeviceScanner, SimpleServiceDiscovery,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

EventEmitter = require('eventemitter3');

FlintDevice = require('./FlintDevice');

SimpleServiceDiscovery = require('./SimpleServiceDiscovery');

Bridge = require('./Bridge');

FlintDeviceScanner = (function(_super) {
  __extends(FlintDeviceScanner, _super);

  function FlintDeviceScanner() {
    this.devices = {};
    this.bridge = Bridge.getInstance();
    this.ssdp = new SimpleServiceDiscovery();
    this.ssdp.registerTarget('urn:dial-multiscreen-org:service:dial:1');
    this.ssdp.on('notify', (function(_this) {
      return function(headers, rinfo) {
        return _this._fetchDeviceDesc(headers, rinfo.host);
      };
    })(this));
    this.ssdp.on('response', (function(_this) {
      return function(headers, rinfo) {
        return _this._fetchDeviceDesc(headers, rinfo.host);
      };
    })(this));
    this.ssdp.search(30 * 1000);
  }

  FlintDeviceScanner.prototype.getDeviceList = function() {
    return this.devices;
  };

  FlintDeviceScanner.prototype._found = function(deviceDesc) {
    var newDevice;
    if (!this.devices[deviceDesc.host]) {
      newDevice = new FlintDevice(deviceDesc);
      newDevice.on('offline', (function(_this) {
        return function() {
          return delete _this.devices[deviceDesc.host];
        };
      })(this));
      this.devices[deviceDesc.host] = newDevice;
      return this.emit('devicefound', newDevice);
    }
  };

  FlintDeviceScanner.prototype._fetchDeviceDesc = function(headers, host) {
    var url;
    url = headers.location + '/ssdp/device-desc.xml';
    return this.bridge.call('http:get', {
      url: url
    }, (function(_this) {
      return function(content) {
        return _this._parseDeviceDesc(content.data, host, headers.location);
      };
    })(this), (function(_this) {
      return function(error) {};
    })(this));
  };

  FlintDeviceScanner.prototype._parseDeviceDesc = function(data, host, refUrl) {
    var devices, e, parser, xml;
    try {
      xml = null;
      if (window.DOMParser) {
        parser = new DOMParser();
        xml = parser.parseFromString(data, "text/xml");
      } else {
        xml = new ActiveXObject("Microsoft.XMLDOM");
        xml.async = "false";
        xml.loadXML(data);
      }
      devices = xml.querySelectorAll('device');
      if (devices.length > 0) {
        return this._parseSingleDeviceDesc(devices[0], host, refUrl);
      }
    } catch (_error) {
      e = _error;
      return console.error(e);
    }
  };

  FlintDeviceScanner.prototype._parseSingleDeviceDesc = function(deviceNode, host, refUrl) {
    var deviceType, friendlyName, manufacturer, modelName, udn;
    deviceType = deviceNode.querySelector('deviceType').innerHTML;
    udn = deviceNode.querySelector("UDN").innerHTML;
    friendlyName = deviceNode.querySelector('friendlyName').innerHTML;
    manufacturer = deviceNode.querySelector('manufacturer').innerHTML;
    modelName = deviceNode.querySelector('modelName').innerHTML;
    return this._found({
      host: host,
      urlBase: refUrl,
      deviceType: deviceType,
      udn: udn,
      friendlyName: friendlyName,
      manufacturer: manufacturer,
      modelName: modelName
    });
  };

  FlintDeviceScanner.prototype._getAbsoluteURL = function(url, refUrl) {
    var absURL;
    if (/^https?:\/\//.test(url)) {
      return url;
    } else {
      absURL = new URL(url, refUrl);
      return absURL.toString();
    }
  };

  return FlintDeviceScanner;

})(EventEmitter);

module.exports = FlintDeviceScanner;



},{"./Bridge":2,"./FlintDevice":3,"./SimpleServiceDiscovery":9,"eventemitter3":11}],6:[function(require,module,exports){
var NativeMethods;

NativeMethods = (function() {
  function NativeMethods() {}

  NativeMethods.checkPluginAvailable = function() {
    NativeMethods.loadPlugin();
    if (NativeMethods.plugin) {
      return true;
    }
  };

  NativeMethods.loadPlugin = function() {
    return NativeMethods.plugin = loadSockitPlugin();
  };

  NativeMethods.isAvailable = function() {
    return typeof NativeMethods.plugin !== 'undefined';
  };

  NativeMethods.createWebSocket = function(url) {
    if (NativeMethods.checkPluginAvailable()) {
      NativeMethods.plugin.createWebSocket(url);
    }
    return null;
  };

  NativeMethods.httpGet = function(url, callback) {
    var req;
    if (NativeMethods.checkPluginAvailable()) {
      req = NativeMethods.plugin.createHttpRequest();
      req.setRequestHeader('Content-Type', '');
      return req.send();
    }
  };

  return NativeMethods;

})();

module.exports = NativeMethods;



},{}],7:[function(require,module,exports){
var Bridge, PrivWebSocket;

Bridge = require('./Bridge');

PrivWebSocket = (function() {
  function PrivWebSocket(url) {
    var error, success;
    this.url = url;
    this.bridge = Bridge.getInstance();
    this.pendingOps = [];
    this.readyState = 0;
    success = (function(_this) {
      return function(content) {
        var _results;
        _this.id = content.id;
        console.log('Websocket ID : ', content.id);
        _this._pollEvent();
        _results = [];
        while (_this.pendingOps.length > 0) {
          _results.push(_this.pendingOps.shift()());
        }
        return _results;
      };
    })(this);
    error = (function(_this) {
      return function(error) {};
    })(this);
    this.bridge.call('ws:create', {
      url: this.url
    }, success, error);
  }

  PrivWebSocket.prototype.send = function(data) {
    var error, success;
    if (!this.id) {
      return this.pendingOps.push((function(_this) {
        return function() {
          return _this.send(data);
        };
      })(this));
    } else {
      success = (function(_this) {
        return function(data) {};
      })(this);
      error = (function(_this) {
        return function(error) {};
      })(this);
      return this.bridge.call('ws:send', {
        id: this.id,
        data: data
      }, success, error);
    }
  };

  PrivWebSocket.prototype.close = function() {
    var success;
    if (!this.id) {
      return this.pendingOps.push((function(_this) {
        return function() {
          return _this.close();
        };
      })(this));
    } else {
      return success = (function(_this) {
        return function(content) {
          var error;
          error = function(error) {};
          return _this.bridge.call('ws:close', {
            id: _this.id
          }, success, error);
        };
      })(this);
    }
  };

  PrivWebSocket.prototype._pollEvent = function() {
    return this.bridge.call2('ws:poll-event', {
      id: this.id
    }, (function(_this) {
      return function(success, content) {
        if (success) {
          _this._updateStatus(content);
          _this._onEvent(content);
          return _this._pollEvent();
        } else {
          return console.log('websocket error ' + content.status);
        }
      };
    })(this));
  };

  PrivWebSocket.prototype._updateStatus = function(content) {
    if (content.readyState) {
      return this.readyState = content.readyState;
    }
  };

  PrivWebSocket.prototype._onEvent = function(content) {
    switch (content.type) {
      case 'onopen':
        if (this.onopen) {
          return this.onopen();
        } else {
          return this.emit('open');
        }
        break;
      case 'onclose':
        if (this.onclose) {
          return this.onclose();
        } else {
          return this.emit('close');
        }
        break;
      case 'onerror':
        if (this.onerror) {
          return this.onerror();
        } else {
          return this.emit('error');
        }
        break;
      case 'onmessage':
        if (this.onmessage) {
          return this.onmessage({
            data: content.data
          });
        } else {
          return this.emit('close');
        }
        break;
      default:
        return console.log('Unknow event type : ' + content.type);
    }
  };

  return PrivWebSocket;

})();

module.exports = PrivWebSocket;



},{"./Bridge":2}],8:[function(require,module,exports){
var Bridge, PrivXMLHttpRequest;

Bridge = require('./Bridge');

PrivXMLHttpRequest = (function() {
  function PrivXMLHttpRequest(objParameters) {
    var error, success;
    this.objParameters = objParameters;
    this.bridge = Bridge.getInstance();
    this.readyState = 0;
    this.status = 0;
    this.pendingOps = [];
    success = (function(_this) {
      return function(content) {
        var _results;
        _this.id = content.id;
        _this._pollEvent();
        _results = [];
        while (_this.pendingOps.length > 0) {
          _results.push(_this.pendingOps.shift()());
        }
        return _results;
      };
    })(this);
    error = (function(_this) {
      return function(error) {
        return console.log('xhr error ' + content.error);
      };
    })(this);
    this.bridge.call('xhr:create', {}, success, error);
  }

  PrivXMLHttpRequest.prototype.open = function(method, url) {
    var params;
    if (!this.id) {
      return this.pendingOps.push((function(_this) {
        return function() {
          return _this.open(method, url);
        };
      })(this));
    } else {
      params = {
        id: this.id,
        method: method,
        url: url
      };
      return this.bridge.call2('xhr:open', params, (function(_this) {
        return function(success, content) {
          if (success) {

          } else {
            return console.log('xhr error ' + content.error);
          }
        };
      })(this));
    }
  };

  PrivXMLHttpRequest.prototype.send = function(data) {
    var params;
    if (!this.id) {
      return this.pendingOps.push((function(_this) {
        return function() {
          return _this.send(data);
        };
      })(this));
    } else {
      params = {
        id: this.id,
        data: data
      };
      return this.bridge.call2('xhr:send', params, (function(_this) {
        return function(success, content) {
          if (success) {

          } else {
            return console.log('xhr error ' + content.error);
          }
        };
      })(this));
    }
  };

  PrivXMLHttpRequest.prototype._pollEvent = function() {
    return this.bridge.call2('xhr:poll-event', {
      id: this.id
    }, (function(_this) {
      return function(success, content) {
        if (success) {
          _this._updateStatus(content);
          _this._onEvent(content.type);
          return _this._pollEvent();
        } else {
          return console.log('xhr error ' + content.status);
        }
      };
    })(this));
  };

  PrivXMLHttpRequest.prototype._updateStatus = function(content) {
    if (content.readyState) {
      this.readyState = content.readyState;
    }
    if (content.responseHeaders) {
      this.responseHeaders = content.responseHeaders;
    }
    if (content.responseText) {
      this.responseText = content.responseText;
    }
    if (content.responseHeaders) {
      this.responseHeaders = content.responseHeaders;
    }
    if (content.status) {
      this.status = content.status;
    }
    if (content.statusText) {
      return this.statusText = content.statusText;
    }
  };

  PrivXMLHttpRequest.prototype._onEvent = function(eventType) {
    if (eventType === 'onreadystatechange') {
      if (this.onreadystatechange) {
        return this.onreadystatechange();
      }
    } else {
      return console.log('Unknow event type : ' + eventType);
    }
  };

  return PrivXMLHttpRequest;

})();

module.exports = PrivXMLHttpRequest;



},{"./Bridge":2}],9:[function(require,module,exports){
var EventEmitter, SSDP_ADDRESS, SSDP_DISCOVER_MX, SSDP_DISCOVER_PACKET, SSDP_HEADER, SSDP_PORT, SSDP_RESPONSE_HEADER, SimpleServiceDiscovery,
  __hasProp = {}.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

require('../common/Polyfill');

EventEmitter = require('eventemitter3');

SSDP_PORT = 1900;

SSDP_ADDRESS = "239.255.255.250";

SSDP_DISCOVER_MX = 10;

SSDP_DISCOVER_PACKET = "M-SEARCH * HTTP/1.1\r\n" + "HOST: " + SSDP_ADDRESS + ":" + SSDP_PORT + "\r\n" + "MAN: \"ssdp:discover\"\r\n" + "MX: " + SSDP_DISCOVER_MX + "\r\n" + "ST: %SEARCH_TARGET%\r\n\r\n";

SSDP_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/;

SSDP_HEADER = /^([^:]+):\s*(.*)$/;

SimpleServiceDiscovery = (function(_super) {
  __extends(SimpleServiceDiscovery, _super);

  function SimpleServiceDiscovery(options) {
    this._targets = [];
  }

  SimpleServiceDiscovery.prototype.search = function(aInterval) {
    aInterval = aInterval || 0;
    if (aInterval > 0) {
      this._searchRepeat = setInterval(((function(_this) {
        return function() {
          return _this._search();
        };
      })(this)), aInterval);
    }
    return this._search();
  };

  SimpleServiceDiscovery.prototype.stopSearch = function() {
    if (this._searchRepeat) {
      return clearInterval(this._searchRepeat);
    }
  };

  SimpleServiceDiscovery.prototype.registerTarget = function(target) {
    if (this._targets.indexOf(target) < 0) {
      return this._targets.push(target);
    }
  };

  SimpleServiceDiscovery.prototype._usingLAN = function() {
    return true;
  };

  SimpleServiceDiscovery.prototype._search = function() {
    var data, sockit;
    if (!this._usingLAN()) {
      return;
    }
    if (!this._udpClient) {
      sockit = loadSockitPlugin();
      console.log(sockit);
      this._udpServer = sockit.createUdpServer(SSDP_PORT, {
        multicast: true,
        multicastTTL: 16,
        multicastGroup: SSDP_ADDRESS,
        reuseAddress: true
      });
      this._udpServer.addEventListener("data", (function(_this) {
        return function(event) {
          return _this._onmessage({
            host: event.getHost(),
            data: event.read()
          });
        };
      })(this));
      this._udpServer.listen();
      this._udpClient = sockit.createUdpClient(SSDP_ADDRESS, SSDP_PORT, {
        multicast: true,
        multicastTTL: 16
      });
    }
    data = SSDP_DISCOVER_PACKET;
    return this._targets.forEach((function(_this) {
      return function(target) {
        var msgData;
        msgData = data.replace("%SEARCH_TARGET%", target);
        console.log(msgData);
        return _this._udpClient.send(msgData);
      };
    })(this));
  };

  SimpleServiceDiscovery.prototype.shutdown = function() {
    if (this._udpServer) {
      this._udpServer.close();
      delete this._udpServer;
    }
    if (this._udpClient) {
      this._udpClient.close();
      return delete this._udpClient;
    }
  };

  SimpleServiceDiscovery.prototype._onmessage = function(event) {
    var firstLine, headers, lines, method, msg, rinfo;
    msg = event.data;
    lines = msg.toString().split("\r\n");
    firstLine = lines.shift();
    method = SSDP_RESPONSE_HEADER.test(firstLine) ? 'RESPONSE' : firstLine.split(' ')[0].toUpperCase();
    headers = {};
    lines.forEach((function(_this) {
      return function(line) {
        var pairs;
        if (line.length) {
          pairs = line.match(/^([^:]+):\s*(.*)$/);
          if (pairs) {
            return headers[pairs[1].toLowerCase()] = pairs[2];
          }
        }
      };
    })(this));
    rinfo = {
      host: event.host
    };
    if (method === 'M-SEARCH') {
      return this._msearch(headers, rinfo);
    } else if (method === 'RESPONSE') {
      return this._response(headers, rinfo);
    } else if (method === 'NOTIFY') {
      return this._notify(headers, rinfo);
    }
  };

  SimpleServiceDiscovery.prototype._response = function(headers, rinfo) {
    if (!headers.st && headers.nt) {
      headers.st = headers.nt;
    }
    if (headers.location && this._targets.indexOf(headers.st) >= 0) {
      return this.emit('response', headers, rinfo);
    }
  };

  SimpleServiceDiscovery.prototype._notify = function(headers, rinfo) {
    if (headers.nts === 'ssdp:alive') {
      return this.emit('notify', headers, rinfo);
    } else if (headers.nts === 'ssdp:byebye') {
      return this.emit('advertise-bye', headers);
    }
  };

  SimpleServiceDiscovery.prototype._msearch = function(headers, rinfo) {};

  return SimpleServiceDiscovery;

})(EventEmitter);

module.exports = SimpleServiceDiscovery;



},{"../common/Polyfill":1,"eventemitter3":11}],10:[function(require,module,exports){
window.PrivWebSocket = require('./PrivWebSocket');

window.PrivXMLHttpRequest = require('./PrivXMLHttpRequest');

window.FlintDevice = require('./FlintDevice');

window.FlintDeviceScanner = require('./FlintDeviceScanner');

window.FlintDeviceManager = require('./FlintDeviceManager');



},{"./FlintDevice":3,"./FlintDeviceManager":4,"./FlintDeviceScanner":5,"./PrivWebSocket":7,"./PrivXMLHttpRequest":8}],11:[function(require,module,exports){
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

},{}]},{},[10]);
