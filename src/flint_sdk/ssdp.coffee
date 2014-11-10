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

# Spec information:
# http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf
SSDP_PORT = 1900;
SSDP_ADDRESS = "239.255.255.250";
SSDP_DISCOVER_MX = 30; // 2;
SSDP_DISCOVER_PACKET =
    "M-SEARCH * HTTP/1.1\r\n" +
    "HOST: " + SSDP_ADDRESS + ":" + SSDP_PORT + "\r\n" +
    "MAN: \"ssdp:discover\"\r\n" +
    "MX: " + SSDP_DISCOVER_MX + "\r\n" +
    "ST: %SEARCH_TARGET%\r\n\r\n";
SSDP_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/;
SSDP_HEADER = /^([^:]+):\s*(.*)$/;

class SimpleServiceDiscovery

    constructor: ->
        @_targets = []
        @_commands = {}

        @_commands['RESPONSE'] = (headers) =>
            headers.st = headers.nt if not headers.st and headers.nt
            if headers.location and @_targets.indexOf(headers.st) >= 0
                @_found(headers)

        @_commands['NOTIFY'] = (headers) =>
            if headers.nts is 'ssdp:alive'
                @_commands['RESPONSE'].apply(this, [headers])
            else if headers.nts is 'ssdp:byebye'
                serviceHelper.remove(new SSDPServiceRecord({ id: headers.usn }));

        @_commands['M-SEARCH'] = (headers) =>

    search: (aInterval) ->
        aInterval = aInterval or 0
        if aInterval > 0
            @_searchRepeat = setInterval (=> @_search()), aInterval
        @_search()

    stopSearch: ->
        clearInterval(@_searchRepeat) if @_searchRepeat

    registerTarget: (target) ->
        if @_targets.indexOf(target) < 0
            @_targets.push(target)

    # internal function
    _usingLAN: ->
        # XXX need a way to check current network interface.
        true

    _search: ->
        # We only search if on local network
        return if not @_usingLAN()

        # create socket if not exist
        if not @_udpClient

            sockit = loadSockitPlugin()

            # Receive data
            @_udpServer = sockit.createUdpServer SSDP_PORT,
                multicast: true,
                multicastTTL: 16,
                multicastGroup: SSDP_ADDRESS,
                reuseAddress: true

            @_udpServer.addEventListener "data", (event) =>
                @_onmessage data: event.read()

            @_udpServer.listen();

            @_udpClient = sockit.createUdpClient SSDP_ADDRESS, SSDP_PORT,
                multicast: true
                multicastTTL: 16

        @_searchTimeout = setTimeout (=> @_searchShutdown()), SSDP_DISCOVER_MX * 1000

        data = SSDP_DISCOVER_PACKET;
        @_targets.forEach (target) =>
            msgData = data.replace "%SEARCH_TARGET%", target
            @_udpClient.send msgData

    _searchShutdown: ->
        if @_udpClient
            # This will call onStopListening.
            @_udpClient.close()
            delete @_udpClient

        if @_udpServer
            @_udpServer.close()
            delete @_udpServer

    _onmessage: (e) ->
        # Listen for responses from specific targets. There could be more than one
        # available.
        # var msg = String.fromCharCode.apply(null, new Uint8Array(e.data));
        msg = e.data;
        console.log(msg);
        firstLine = lines.shift();
        method = SSDP_RESPONSE_HEADER.test(firstLine) ? 'RESPONSE' : firstLine.split(' ')[0].toUpperCase();
        headers = {};
        lines.forEach (line) =>
            if line.length
                pairs = line.match(/^([^:]+):\s*(.*)$/)
                if pairs
                    headers[pairs[1].toLowerCase()] = pairs[2];

        @_commands[method].apply(this, [headers]) if @_commands[method]

    _found: (aService) ->
        # Use the REST api to request more information about this service
        xhr = new XMLHttpRequest mozSystem: true
        xhr.open "GET", aService.location, true
        xhr.overrideMimeType("text/xml")
        xhr.addEventListener "load", (=>
            if xhr.status == 200
                # walk through root device and all the embedded devices
                devices = xhr.responseXML.querySelectorAll('device');
                for i in [0 .. devices.length - 1]
                    @_parseDescriptor(devices[i], aService.location)
        ), false
        xhr.send(null)

    _parseDescriptor: (device, refUrl) ->
        udn = device.querySelector("UDN").innerHTML
        serviceList = device.querySelector('serviceList').querySelectorAll('service');
        for i in [0 .. serviceList.length - 1]
            service = serviceList[i]
            serviceId = service.querySelector('serviceId').innerHTML
            eventsUrl = @_getAbsoluteURL(service.querySelector('eventSubURL'), refUrl)
            options = {}
            options.id = udn + '::' + serviceId
            options.deviceId = udn
            options.name = serviceId
            options.type = 'upnp:' + service.querySelector('serviceType').innerHTML
            options.url = this._getAbsoluteURL(service.querySelector('controlURL').innerHTML, refUrl)
            options.config = device.outerHTML
            options.eventsUrl = eventsUrl.innerHTML if (eventsUrl)
            options.expiryTimestamp = '' # TODO
            serviceHelper.add new SSDPServiceRecord(options)

    _getAbsoluteURL: (url, refUrl) ->
        if /^https?:\/\//.test(url)
            return url
        else
            absURL = new URL(url, refUrl)
            return absURL.toString()

class SSDPServiceRecord
    constructor: (options) ->
        @id: ''
        @deviceId: ''
        @name: ''
        @type: ''
        @url: ''
        @eventsUrl: ''
        @config: ''
        @expiryTimestamp: ''

        @update(options)

    update: (options) ->
        ['id', 'deviceId', 'name', 'type', 'url', 'config', 'expiryTimestamp'].forEach (option) =>
            this[option] = options[option]
        @eventsUrl = options.eventsUrl if options.eventsUrl

