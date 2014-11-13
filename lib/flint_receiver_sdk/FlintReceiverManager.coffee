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

class WebSocketReadyState
    @CONNECTING = 0 # The connection is not yet open.
    @OPEN = 1 # The connection is open and ready to communicate.
    @CLOSING = 2 # The connection is in the process of closing.
    @CLOSED = 3 # The connection is closed or couldn't be opened.

class FlintReceiverManager extends EventEmitter

    constructor: (opts) ->
        @appId = opts.appId
        @wsconn = null
        @wsServer = "ws://127.0.0.1:9431/receiver/" + @appId

    start: (additionalData) ->
        return if (@wsconn?.readyState is WebSocketReadyState.CONNECTING)
        return if (@wsconn?.readyState is WebSocketReadyState.OPEN)

        @additionalData = additionalData

        @wsconn = new WebSocket(@wsServer)

        @wsconn.onopen = (evt) =>
            @_onOpen(evt)

        @wsconn.onclose = (evt) =>
            console.info("----------------------------------------------->flingd onclose....");

        @wsconn.onmessage = (evt) =>
            console.info("----------------------------------------------->flingd onmessage....", evt.data);
            @_onMessage(JSON.parse(evt.data)) if evt.data

        @wsconn.onerror = (evt) =>
            console.info("----------------------------------------------->flingd onerror....", evt);
            @_onError
                message: "Underlying websocket is not open"
                socketReadyState: evt.target.readyState

    setAdditionalData: (additionalData) ->
        @additionalData = additionalData
        @send
            type: "additionaldata"
            additionaldata: @additionalData

    # Send message to Fling Daemon
    # @param {JSON objects}
    send: (data) ->
        data["appid"] = @appId
        data = JSON.stringify data
        console.info("----------------------------------------------->flingd send....", data);
        if @wsconn?.readyState is WebSocketReadyState.OPEN
            @wsconn.send data
        else if @ws?.readyState is WebSocketReadyState.CONNECTING
            setTimeout (=>
                @send data), 50
        else
            @_onError
                message: "Underlying websocket is not open"
                socketReadyState: WebSocketReadyState.CLOSED

    _onError: (event) ->
        @emit "error", event

    _onOpen: ->
        @send
            type: "register"

    _onSenderConnected: (data) ->

    _onSenderDisconnected: (data) ->

    _onMessage: (data) ->
        console.error "_onMessage", data

        switch data?.type

            when 'startheartbeat'
                console.log 'startheartbeat'

            when 'registerok'
                @localIpAddress = data["service_info"]["ip"][0]
                @uuid = data["service_info"]["uuid"]
                @deviceName = data["service_info"]["device_name"]
                console.info("=========================================>flingd has onopened: ", ("onopend" in self));
                @send
                    type: "additionaldata"
                    additionaldata: @additionalData
                @emit 'ready'

            when 'heartbeat'
                if data.heartbeat is 'ping'
                    @send
                        type: 'heartbeat'
                        heartbeat: 'pong'
                else
                    @send
                        type: 'heartbeat'
                        heartbeat: 'ping'

            when "senderconnected"
                @_onSenderConnected data

            when "senderdisconnected"
                @_onSenderDisconnected data

            else
                @emit 'message', data

module.exports = FlintReceiverManager
