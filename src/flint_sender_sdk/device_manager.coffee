#
# Copyright (C) 2013-2014, The OpenFlint Open Source Project
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS-IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

class FlintExtension

    @instance = null

    @getInstance: ->
        if not FlintExtension.instance
            FlintExtension.instance = new FlintExtension()
        return FlintExtension.instance

    constructor: ->
        @requestId = 1
        @requestReplies = {}

        window.addEventListener 'message', (event) =>
            message = event.data

            # it is 3rd party message
            return if message?.protocol isnt 'flint-message'

            # if browser is asking whether extension is available
            if message?.reply
                requestId = message.requestId
                console.log "REPLY: requestId = " + requestId
                callback = @requestReplies[requestId]
                if callback
                    delete @requestReplies[requestId]
                    callback(message.payload)

    invoke: (payload, reply) ->
        requestId = @_genRequestId()
        console.log "INVOKE: requestId = " + requestId, reply
        @requestReplies[requestId] = reply
        window.postMessage {
            protocol: 'flint-message'
            requestId: requestId
            payload: payload
        }, '*'

    _genRequestId: ->
        @requestId++


class FlingApplication extends EventEmitter

    constructor: (@device, opts) ->
        @id = opts.appId
        @url = opts.appUrl
        @connected = false
        @useIpc = opts.useIpc or false
        @maxInactive = opts.maxInactive or -1
        @additionalDatas = {}
        @token = null
        @heartbeatInterval = 0
        @device.on "disconnect", =>

    launch: (relaunchIfRunning) ->

        # get status first !
        @_getStatus (content) =>
            console.log 'status: ', content
            console.log '@appState: ', @appState
            console.log '@appName: ', @appName

            if @appState == 'running' and @appName == @id
                @_launch(true) if relaunchIfRunning
            else
                @_launch(false)

    _launch: (relaunch) ->

        launchType = 'launch'
        launchType = 'relaunch' if relaunch

        FlintExtension.getInstance().invoke (
            type: 'http-post'
            url: 'http://' + @device.address + ':9431/apps/' + @id
            headers:
                'Content-Type': 'application/json'
            postData:
                type: launchType
                app_info:
                    url: @url
                    useIpc: @useIpc
                    maxInactive: @maxInactive
        ), (reply) =>
            #  {type: "http-post", content: "{"token":"549a2c00-68a5-11e4-bbf3-4b1fad08645a","interval":3000}"}
            content = JSON.parse(reply.content)
            @connected = true
            @token = content?.token
            @heartbeatInterval = content?.interval
            console.log "@token: ", @token
            console.log "@heartbeatInterval: ", @heartbeatInterval
            @_heartbeat()

    _heartbeat: ->
        console.log "_heartbeat"
        if @connected and @useIpc
            setTimeout (=>
                @_getStatus (content) =>
                    console.log 'status: ', content
                    @_heartbeat()
            ), @heartbeatInterval - 100

    _parseStatus: (status) ->
        lines = status.split('\n');
        lines.splice(0,1);
        responseText = lines.join('');
        parser = new DOMParser();
        doc = parser.parseFromString(responseText, "text/xml");

        @appName = doc.getElementsByTagName("name")[0].innerHTML;
        @appState = doc.getElementsByTagName("state")[0].innerHTML;

        link = doc.getElementsByTagName("link");
        if link and link[0]
            @appHref = link[0].getAttribute("href");

        additionalData = doc.getElementsByTagName("additionalData");
        if additionalData?.length > 0
            items = additionalData[0].childNodes;
            if items
                for i in [0 .. items.length - 1]
                    if items[i].tagName
                        @additionalDatas[items[i].tagName] = items[i].innerHTML
            @emit "additionaldatachanged", @additionalDatas

    _getStatus: (callback) ->
        console.log '_getStatus'

        headers =
            'Content-Type': 'application/json'
            'Accept': 'application/xml; charset=utf8'

        headers['Authorization'] = @token if @token

        FlintExtension.getInstance().invoke (
            type: 'http-get'
            url: 'http://' + @device.address + ':9431/apps/' + @id
            headers: headers
        ), (reply) =>
            console.log '_getStatus reply', reply
            @_parseStatus(reply.content)
            callback?(reply.content)

class FlingDevice extends EventEmitter

    constructor: (opts) ->
        @friendlyName = opts.friendlyName
        @address = opts.address

    app: (opts) ->
        app = new FlingApplication(this, opts)

class FlingDeviceManager extends EventEmitter

    constructor: ->
        console.log 'FlingDeviceManager constructor'

        @devices = {}
        @extension = FlintExtension.getInstance()

        parseServiceInfo = (services) =>
            for i in [0 .. services.length - 1]
                parser = new DOMParser();
                config = services[i].config
                doc = parser.parseFromString config, "application/xml"
                friendlyName = doc.querySelector('friendlyName').innerHTML;
                address = services[i].url
                    .replace(':9431/ssdp/notfound', '')
                    .replace(':8008/ssdp/notfound', '')
                    .replace('http://', '')

                console.log "friendlyName: ", friendlyName
                console.log "address: ", address
                console.log "config: ", config

                services[i].address = address
                services[i].friendlyName = friendlyName

                if not @devices[address]
                    @devices[address] = new FlingDevice
                        friendlyName: friendlyName
                        address: address
                        service: services[i]

        # Search devices
        type = 'upnp:urn:dial-multiscreen-org:service:dial:1'
        navigator.getNetworkServices(type).then (services) =>
            services.addEventListener "servicefound", (event) =>
                console.log "servicefound: ", event
                parseServiceInfo(services)
                @emit('devicefound')
            services.addEventListener "servicelost", (event) =>
                console.log "servicelost: ", event

        @extension.invoke type: 'are-you-there', (payload) =>
            console.log payload

    getDeviceList: ->
        @devices

    _devicesOnline: (device) ->

this.FlintExtension = FlintExtension
this.FlingApplication = FlingApplication
this.FlingDevice = FlingDevice
this.FlingDeviceManager = FlingDeviceManager