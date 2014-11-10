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
                callback = @requestReplies[requestId]
                delete @requestReplies[requestId]
                callback(message.payload)

    invoke: (payload, reply) ->
        requestId = @_genRequestId()
        @requestReplies[requestId] = reply
        window.postMessage {
            protocol: 'flint-message'
            requestId: requestId
            payload: payload
        }, '*'

    _genRequestId: ->
        @requestId++

class FlingDevice extends EventEmitter

    constructor: (opts) ->
        @friendlyName = opts.friendlyName
        @address = opts.address
        @service = opts.service

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

        @extension.invoke (
            type: 'http-get'
            url: 'http://192.168.1.146:8008/ssdp/device-desc.xml'
        ), (payload) =>
            console.log payload.content

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
this.FlingDevice = FlingDevice
this.FlingDeviceManager = FlingDeviceManager