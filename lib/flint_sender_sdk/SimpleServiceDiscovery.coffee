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

require '../common/Polyfill'

EventEmitter = require 'eventemitter3'

# Spec information:
# http://upnp.org/specs/arch/UPnP-arch-DeviceArchitecture-v1.1.pdf
SSDP_PORT = 1900
SSDP_ADDRESS = "239.255.255.250"
SSDP_DISCOVER_MX = 10
SSDP_DISCOVER_PACKET =
        "M-SEARCH * HTTP/1.1\r\n" +
        "HOST: " + SSDP_ADDRESS + ":" + SSDP_PORT + "\r\n" +
        "MAN: \"ssdp:discover\"\r\n" +
        "MX: " + SSDP_DISCOVER_MX + "\r\n" +
        "ST: %SEARCH_TARGET%\r\n\r\n"
SSDP_RESPONSE_HEADER = /HTTP\/\d{1}\.\d{1} \d+ .*/
SSDP_HEADER = /^([^:]+):\s*(.*)$/

class SimpleServiceDiscovery extends EventEmitter

    constructor: (options) ->
        @_targets = []

    search: (aInterval) ->
        aInterval = aInterval or 0
        if aInterval > 0
            @_searchRepeat = setInterval (=>
                @_search()), aInterval
        @_search()

    stopSearch: ->
        if @_searchRepeat
            clearInterval @_searchRepeat

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
            console.log sockit

            # Receive data
            @_udpServer = sockit.createUdpServer SSDP_PORT,
                multicast: true
                multicastTTL: 16
                multicastGroup: SSDP_ADDRESS
                reuseAddress: true
            @_udpServer.addEventListener "data", (event) =>
                @_onmessage
                    host: event.getHost()
                    data: event.read()
            @_udpServer.listen();

            @_udpClient = sockit.createUdpClient SSDP_ADDRESS, SSDP_PORT,
                multicast: true,
                multicastTTL: 16

        # Perform a UDP broadcast to search for SSDP devices
        # @_searchTimeout = setTimeout (=>
        #     @_searchShutdown()), SSDP_DISCOVER_MX * 1000

        data = SSDP_DISCOVER_PACKET;
        @_targets.forEach (target) =>
            msgData = data.replace "%SEARCH_TARGET%", target
            console.log msgData
            @_udpClient.send msgData

    shutdown: ->
        if @_udpServer
            @_udpServer.close()
            delete @_udpServer

        if @_udpClient
            @_udpClient.close()
            delete @_udpClient

    _onmessage: (event) ->
        # Listen for responses from specific targets. There could be more than one
        # available.
        msg = event.data;
        # console.log(msg);
        lines = msg.toString().split("\r\n")
        firstLine = lines.shift()
        method =
            if SSDP_RESPONSE_HEADER.test(firstLine)
                'RESPONSE'
            else
                firstLine.split(' ')[0].toUpperCase()
        headers = {}

        lines.forEach (line) =>
            if line.length
                pairs = line.match(/^([^:]+):\s*(.*)$/)
                if pairs
                    headers[pairs[1].toLowerCase()] = pairs[2]

        rinfo =
            host: event.host

        if method == 'M-SEARCH'
            @_msearch headers, rinfo
        else if method == 'RESPONSE'
            @_response headers, rinfo
        else if method == 'NOTIFY'
            @_notify headers, rinfo

    _response: (headers, rinfo) ->
        if not headers.st and headers.nt
            headers.st = headers.nt

        if headers.location and @_targets.indexOf(headers.st) >= 0
            @emit 'response', headers, rinfo

    _notify: (headers, rinfo) ->
        if headers.nts == 'ssdp:alive'
            # @_response headers
            @emit 'notify', headers, rinfo

        else if headers.nts == 'ssdp:byebye'
            @emit 'advertise-bye', headers

    _msearch: (headers, rinfo) ->


module.exports = SimpleServiceDiscovery
