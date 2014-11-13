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

Bridge = require './Bridge'

#
# PrivilegeWebSocket is a proxy for extensions
#
class PrivWebSocket extends EventEmitter

    constructor: (@url) ->
        @bridge = Bridge.getInstance()
        @pendingOps = []
        @readyState = 0

        # create
        success = (content) =>
            @id = content.id
            console.log 'Websocket ID : ', content.id
            @_pollEvent()
            while @pendingOps.length > 0
                @pendingOps.shift()()
        error = (error) =>
        @bridge.call 'ws:create', { url: @url }, success, error

    #
    # Transmits data to the server over the WebSocket connection.
    #
    send: (data) ->
        if not @id
            @pendingOps.push =>
                @send(data)
        else
            success = (data) =>
            error = (error) =>
            @bridge.call 'ws:send', { id: @id, data: data }, success, error

    #
    # Closes the WebSocket connection or connection attempt, if any.
    # If the connection is already CLOSED, this method does nothing.
    #
    close: ->
        if not @id
            @pendingOps.push =>
                @close()
        else
            success = (content) =>
                error = (error) =>
                @bridge.call 'ws:close', { id: @id }, success, error

    _pollEvent: ->
        @bridge.call2 'ws:poll-event', { id: @id }, (success, content) =>
            if success
                # console.log content
                @_updateStatus content
                @_onEvent content
                @_pollEvent()
            else
                console.log 'websocket error ' + content.status

    _updateStatus: (content) ->
        if content.readyState
            @readyState = content.readyState

    _onEvent: (content) ->
        switch content.type

            when 'onopen'
                if @onopen
                    @onopen()
                else
                    @emit 'open'

            when 'onclose'
                if @onclose
                    @onclose()
                else
                    @emit 'close'

            when 'onerror'
                if @onerror
                    @onerror()
                else
                    @emit 'error'

            when 'onmessage'
                if @onmessage
                    @onmessage {data: content.data}
                else
                    @emit 'message', content.data

            else
                console.log 'Unknow event type : ' + content.type

module.exports = PrivWebSocket