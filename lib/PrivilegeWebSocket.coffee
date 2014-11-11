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

Bridge = require './Bridge'

#
# PrivilegeWebSocket is a proxy for extensions
#
class PrivilegeWebSocket

    constructor: (@url) ->
        @bridge = Bridge.getInstance()
        @_create()

    #
    # Transmits data to the server over the WebSocket connection.
    #
    send: (data) ->
        success = (data) =>
        error = (error) =>
        @bridge.call 'websocket:send-message', { id: @id, data: data }, success, error

    #
    # Closes the WebSocket connection or connection attempt, if any.
    # If the connection is already CLOSED, this method does nothing.
    #
    close: ->
        success = (content) =>
        error = (error) =>
        @bridge.call 'websocket:close', { id: @id }, success, error

    _create: ->
        success = (content) =>
            @id = content.id
            console.log 'Websocket ID : ', content.id
            @_pollMessage()
        error = (error) =>
        @bridge.call 'websocket:create', { url: @url }, success, error

    _pollMessage: ->
        success = (content) =>
            @_onMessage content.data
            @_pollMessage()
        error = (content) =>
            if content.status == 'closed'
                @_onClose()
            else
                @_onError content
        @bridge.call 'websocket:get-message', { id: @id }, success, error

    _onOpen: ->
        if @onopen
            @onopen()
        else
            @emit 'open'

    _onMessage: (data) ->
        if @onmessage
            @onmessage { data: data }
        else
            @emit 'message', data

    _onClose: ->
        if @onclose
            @onclose()
        else
            @emit 'close'

    _onError: (error) ->
        if @onerror
            @onerror(error.status)
        else
            @emit 'error', error.status

module.exports = PrivilegeWebSocket