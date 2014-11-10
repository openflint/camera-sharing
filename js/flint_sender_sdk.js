(function() {
  var EventEmitter, FlingApplication, FlingDevice, FlingDeviceManager, FlintExtension, alias, indexOfListener,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  indexOfListener = function(listeners, listener) {
    var i, _i, _ref;
    if (listeners.length > 0) {
      for (i = _i = 0, _ref = listeners.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
        if (listeners[i].listener === listener) {
          return i;
        }
      }
    }
    return -1;
  };

  alias = function(name) {
    return function() {
      return this[name].apply(this, arguments);
    };
  };

  EventEmitter = (function() {
    function EventEmitter() {}

    EventEmitter.prototype.getListeners = function(evt) {
      var events, key, response;
      events = this._getEvents();
      if (evt instanceof RegExp) {
        response = {};
        for (key in events) {
          if (events.hasOwnProperty(key) && evt.test(key)) {
            response[key] = events[key];
          }
        }
      } else {
        response = events[evt] || (events[evt] = []);
      }
      return response;
    };

    EventEmitter.prototype.flattenListeners = function(listeners) {
      var flatListeners, i;
      flatListeners = [];
      i = 0;
      while (i < listeners.length) {
        flatListeners.push(listeners[i].listener);
        i += 1;
      }
      return flatListeners;
    };

    EventEmitter.prototype.getListenersAsObject = function(evt) {
      var listeners, response;
      listeners = this.getListeners(evt);
      response = void 0;
      if (listeners instanceof Array) {
        response = {};
        response[evt] = listeners;
      }
      return response || listeners;
    };

    EventEmitter.prototype.addListener = function(evt, listener) {
      var key, listenerIsWrapped, listeners;
      listeners = this.getListenersAsObject(evt);
      listenerIsWrapped = typeof listener === "object";
      for (key in listeners) {
        if (listeners.hasOwnProperty(key) && indexOfListener(listeners[key], listener) === -1) {
          listeners[key].push((listenerIsWrapped ? listener : {
            listener: listener,
            once: false
          }));
        }
      }
      return this;
    };

    EventEmitter.prototype.on = alias("addListener");

    EventEmitter.prototype.addOnceListener = function(evt, listener) {
      return this.addListener(evt, {
        listener: listener,
        once: true
      });
    };

    EventEmitter.prototype.once = alias("addOnceListener");

    EventEmitter.prototype.defineEvent = function(evt) {
      this.getListeners(evt);
      return this;
    };

    EventEmitter.prototype.defineEvents = function(evts) {
      var i;
      i = 0;
      while (i < evts.length) {
        this.defineEvent(evts[i]);
        i += 1;
      }
      return this;
    };

    EventEmitter.prototype.removeListener = function(evt, listener) {
      var index, key, listeners;
      listeners = this.getListenersAsObject(evt);
      for (key in listeners) {
        if (listeners.hasOwnProperty(key)) {
          index = indexOfListener(listeners[key], listener);
          if (index !== -1) {
            listeners[key].splice(index, 1);
          }
        }
      }
      return this;
    };

    EventEmitter.prototype.off = alias("removeListener");

    EventEmitter.prototype.addListeners = function(evt, listeners) {
      return this.manipulateListeners(false, evt, listeners);
    };

    EventEmitter.prototype.removeListeners = function(evt, listeners) {
      return this.manipulateListeners(true, evt, listeners);
    };

    EventEmitter.prototype.manipulateListeners = function(remove, evt, listeners) {
      var i, multiple, single, value;
      value = void 0;
      single = (remove ? this.removeListener : this.addListener);
      multiple = (remove ? this.removeListeners : this.addListeners);
      if (typeof evt === "object" && (!(evt instanceof RegExp))) {
        for (i in evt) {
          if (evt.hasOwnProperty(i) && (value = evt[i])) {
            if (typeof value === "function") {
              single.call(this, i, value);
            } else {
              multiple.call(this, i, value);
            }
          }
        }
      } else {
        i = listeners.length;
        while (i--) {
          single.call(this, evt, listeners[i]);
        }
      }
      return this;
    };

    EventEmitter.prototype.removeEvent = function(evt) {
      var events, key, type;
      type = typeof evt;
      events = this._getEvents();
      if (type === "string") {
        delete events[evt];
      } else if (evt instanceof RegExp) {
        for (key in events) {
          if (events.hasOwnProperty(key) && evt.test(key)) {
            delete events[key];
          }
        }
      } else {
        delete this._events;
      }
      return this;
    };

    EventEmitter.prototype.removeAllListeners = alias("removeEvent");

    EventEmitter.prototype.emitEvent = function(evt, args) {
      var i, key, listener, listeners, response;
      listeners = this.getListenersAsObject(evt);
      for (key in listeners) {
        if (listeners.hasOwnProperty(key)) {
          i = listeners[key].length;
          while (i--) {
            listener = listeners[key][i];
            if (listener.once === true) {
              this.removeListener(evt, listener.listener);
            }
            response = listener.listener.apply(this, args || []);
            if (response === this._getOnceReturnValue()) {
              this.removeListener(evt, listener.listener);
            }
          }
        }
      }
      return this;
    };

    EventEmitter.prototype.trigger = alias("emitEvent");

    EventEmitter.prototype.emit = function(evt) {
      var args;
      args = Array.prototype.slice.call(arguments, 1);
      return this.emitEvent(evt, args);
    };

    EventEmitter.prototype.setOnceReturnValue = function(value) {
      this._onceReturnValue = value;
      return this;
    };

    EventEmitter.prototype._getOnceReturnValue = function() {
      if (this.hasOwnProperty("_onceReturnValue")) {
        return this._onceReturnValue;
      } else {
        return true;
      }
    };

    EventEmitter.prototype._getEvents = function() {
      return this._events || (this._events = {});
    };

    return EventEmitter;

  })();

  FlintExtension = (function() {
    FlintExtension.instance = null;

    FlintExtension.getInstance = function() {
      if (!FlintExtension.instance) {
        FlintExtension.instance = new FlintExtension();
      }
      return FlintExtension.instance;
    };

    function FlintExtension() {
      this.requestId = 1;
      this.requestReplies = {};
      window.addEventListener('message', (function(_this) {
        return function(event) {
          var callback, message, requestId;
          message = event.data;
          if ((message != null ? message.protocol : void 0) !== 'flint-message') {
            return;
          }
          if (message != null ? message.reply : void 0) {
            requestId = message.requestId;
            console.log("REPLY: requestId = " + requestId);
            callback = _this.requestReplies[requestId];
            if (callback) {
              delete _this.requestReplies[requestId];
              return callback(message.payload);
            }
          }
        };
      })(this));
    }

    FlintExtension.prototype.invoke = function(payload, reply) {
      var requestId;
      requestId = this._genRequestId();
      console.log("INVOKE: requestId = " + requestId, reply);
      this.requestReplies[requestId] = reply;
      return window.postMessage({
        protocol: 'flint-message',
        requestId: requestId,
        payload: payload
      }, '*');
    };

    FlintExtension.prototype._genRequestId = function() {
      return this.requestId++;
    };

    return FlintExtension;

  })();

  FlingApplication = (function(_super) {
    __extends(FlingApplication, _super);

    function FlingApplication(device, opts) {
      this.device = device;
      this.id = opts.appId;
      this.url = opts.appUrl;
      this.connected = false;
      this.useIpc = opts.useIpc || false;
      this.maxInactive = opts.maxInactive || -1;
      this.additionalDatas = {};
      this.token = null;
      this.heartbeatInterval = 0;
      this.device.on("disconnect", (function(_this) {
        return function() {};
      })(this));
    }

    FlingApplication.prototype.launch = function(relaunchIfRunning) {
      return this._getStatus((function(_this) {
        return function(content) {
          console.log('status: ', content);
          console.log('@appState: ', _this.appState);
          console.log('@appName: ', _this.appName);
          if (_this.appState === 'running' && _this.appName === _this.id) {
            if (relaunchIfRunning) {
              return _this._launch(true);
            }
          } else {
            return _this._launch(false);
          }
        };
      })(this));
    };

    FlingApplication.prototype._launch = function(relaunch) {
      var launchType;
      launchType = 'launch';
      if (relaunch) {
        launchType = 'relaunch';
      }
      return FlintExtension.getInstance().invoke({
        type: 'http-post',
        url: 'http://' + this.device.address + ':9431/apps/' + this.id,
        headers: {
          'Content-Type': 'application/json'
        },
        postData: {
          type: launchType,
          app_info: {
            url: this.url,
            useIpc: this.useIpc,
            maxInactive: this.maxInactive
          }
        }
      }, (function(_this) {
        return function(reply) {
          var content;
          content = JSON.parse(reply.content);
          _this.connected = true;
          _this.token = content != null ? content.token : void 0;
          _this.heartbeatInterval = content != null ? content.interval : void 0;
          console.log("@token: ", _this.token);
          console.log("@heartbeatInterval: ", _this.heartbeatInterval);
          return _this._heartbeat();
        };
      })(this));
    };

    FlingApplication.prototype._heartbeat = function() {
      console.log("_heartbeat");
      if (this.connected && this.useIpc) {
        return setTimeout(((function(_this) {
          return function() {
            return _this._getStatus(function(content) {
              console.log('status: ', content);
              return _this._heartbeat();
            });
          };
        })(this)), this.heartbeatInterval - 100);
      }
    };

    FlingApplication.prototype._parseStatus = function(status) {
      var additionalData, doc, i, items, lines, link, parser, responseText, _i, _ref;
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
          for (i = _i = 0, _ref = items.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            if (items[i].tagName) {
              this.additionalDatas[items[i].tagName] = items[i].innerHTML;
            }
          }
        }
        return this.emit("additionaldatachanged", this.additionalDatas);
      }
    };

    FlingApplication.prototype._getStatus = function(callback) {
      var headers;
      console.log('_getStatus');
      headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/xml; charset=utf8'
      };
      if (this.token) {
        headers['Authorization'] = this.token;
      }
      return FlintExtension.getInstance().invoke({
        type: 'http-get',
        url: 'http://' + this.device.address + ':9431/apps/' + this.id,
        headers: headers
      }, (function(_this) {
        return function(reply) {
          console.log('_getStatus reply', reply);
          _this._parseStatus(reply.content);
          return typeof callback === "function" ? callback(reply.content) : void 0;
        };
      })(this));
    };

    return FlingApplication;

  })(EventEmitter);

  FlingDevice = (function(_super) {
    __extends(FlingDevice, _super);

    function FlingDevice(opts) {
      this.friendlyName = opts.friendlyName;
      this.address = opts.address;
    }

    FlingDevice.prototype.app = function(opts) {
      var app;
      return app = new FlingApplication(this, opts);
    };

    return FlingDevice;

  })(EventEmitter);

  FlingDeviceManager = (function(_super) {
    __extends(FlingDeviceManager, _super);

    function FlingDeviceManager() {
      var parseServiceInfo, type;
      console.log('FlingDeviceManager constructor');
      this.devices = {};
      this.extension = FlintExtension.getInstance();
      parseServiceInfo = (function(_this) {
        return function(services) {
          var address, config, doc, friendlyName, i, parser, _i, _ref, _results;
          _results = [];
          for (i = _i = 0, _ref = services.length - 1; 0 <= _ref ? _i <= _ref : _i >= _ref; i = 0 <= _ref ? ++_i : --_i) {
            parser = new DOMParser();
            config = services[i].config;
            doc = parser.parseFromString(config, "application/xml");
            friendlyName = doc.querySelector('friendlyName').innerHTML;
            address = services[i].url.replace(':9431/ssdp/notfound', '').replace(':8008/ssdp/notfound', '').replace('http://', '');
            console.log("friendlyName: ", friendlyName);
            console.log("address: ", address);
            console.log("config: ", config);
            services[i].address = address;
            services[i].friendlyName = friendlyName;
            if (!_this.devices[address]) {
              _results.push(_this.devices[address] = new FlingDevice({
                friendlyName: friendlyName,
                address: address,
                service: services[i]
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        };
      })(this);
      type = 'upnp:urn:dial-multiscreen-org:service:dial:1';
      navigator.getNetworkServices(type).then((function(_this) {
        return function(services) {
          services.addEventListener("servicefound", function(event) {
            console.log("servicefound: ", event);
            parseServiceInfo(services);
            return _this.emit('devicefound');
          });
          return services.addEventListener("servicelost", function(event) {
            return console.log("servicelost: ", event);
          });
        };
      })(this));
      this.extension.invoke({
        type: 'are-you-there'
      }, (function(_this) {
        return function(payload) {
          return console.log(payload);
        };
      })(this));
    }

    FlingDeviceManager.prototype.getDeviceList = function() {
      return this.devices;
    };

    FlingDeviceManager.prototype._devicesOnline = function(device) {};

    return FlingDeviceManager;

  })(EventEmitter);

  this.FlintExtension = FlintExtension;

  this.FlingApplication = FlingApplication;

  this.FlingDevice = FlingDevice;

  this.FlingDeviceManager = FlingDeviceManager;

}).call(this);
