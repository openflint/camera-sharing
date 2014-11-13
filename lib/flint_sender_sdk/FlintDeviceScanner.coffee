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

EventEmitter = require 'eventemitter3'
FlintDevice = require './FlintDevice'
SimpleServiceDiscovery = require './SimpleServiceDiscovery'
Bridge = require './Bridge'

class FlintDeviceScanner extends EventEmitter

    constructor: ->
        @devices = {}
        @bridge = Bridge.getInstance()

        # Search devices
        @ssdp = new SimpleServiceDiscovery()
        @ssdp.registerTarget 'urn:dial-multiscreen-org:service:dial:1'

        @ssdp.on 'notify', (headers, rinfo) =>
            # console.log 'Got a notification. ' + rinfo.host + ' ' + headers.location
            @_fetchDeviceDesc headers, rinfo.host

        @ssdp.on 'response', (headers, rinfo) =>
            # console.log 'Got a response to an m-search. ' + rinfo.host + ' ' + headers.location
            @_fetchDeviceDesc headers, rinfo.host

        @ssdp.search(30 * 1000);

    getDeviceList: ->
        @devices

    _found: (deviceDesc) ->
        if not @devices[deviceDesc.host]
            newDevice = new FlintDevice deviceDesc
            newDevice.on 'offline', =>
                delete @devices[deviceDesc.host]
            @devices[deviceDesc.host] = newDevice
            @emit 'devicefound', newDevice

    _fetchDeviceDesc: (headers, host) ->
        url = headers.location + '/ssdp/device-desc.xml'

        @bridge.call 'http:get', { url: url },
            (content) =>
                @_parseDeviceDesc content.data, host, headers.location
            (error) =>
                # console.error 'httpGet "' + url + '" failed ! ' + error

    _parseDeviceDesc: (data, host, refUrl) ->
        try
            xml = null

            if window.DOMParser # Standard
                parser = new DOMParser()
                xml = parser.parseFromString data, "text/xml"
            else # IE
                xml = new ActiveXObject "Microsoft.XMLDOM"
                xml.async = "false"
                xml.loadXML data

            devices = xml.querySelectorAll 'device'
            if devices.length > 0
                @_parseSingleDeviceDesc devices[0], host, refUrl

        catch e
            console.error e

    _parseSingleDeviceDesc: (deviceNode, host, refUrl) ->
        deviceType = deviceNode.querySelector('deviceType').innerHTML
        udn = deviceNode.querySelector("UDN").innerHTML;
        friendlyName = deviceNode.querySelector('friendlyName').innerHTML
        manufacturer = deviceNode.querySelector('manufacturer').innerHTML
        modelName = deviceNode.querySelector('modelName').innerHTML

        @_found
            host: host
            urlBase: refUrl
            deviceType: deviceType
            udn: udn
            friendlyName: friendlyName
            manufacturer: manufacturer
            modelName: modelName

    _getAbsoluteURL: (url, refUrl) ->
        if /^https?:\/\//.test(url)
            return url
        else
            absURL = new URL(url, refUrl)
            return absURL.toString()

module.exports = FlintDeviceScanner
