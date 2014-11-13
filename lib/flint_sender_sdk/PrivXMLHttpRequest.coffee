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
# Privilege XMLHttpRequest is a proxy for extensions
#
class PrivXMLHttpRequest

    constructor: (@objParameters) ->
        @bridge = Bridge.getInstance()
        @readyState = 0
        @status = 0
        @pendingOps = []

        success = (content) =>
            @id = content.id
            # console.log 'XHR ID : ', content.id
            @_pollEvent()

            while @pendingOps.length > 0
                @pendingOps.shift()()

        error = (error) =>
            console.log 'xhr error ' + content.error

        @bridge.call 'xhr:create', {}, success, error

    open: (method, url) ->
        if not @id
            @pendingOps.push =>
                @open(method, url)
        else
            params =
                id: @id
                method: method
                url: url
            @bridge.call2 'xhr:open', params, (success, content) =>
                if success
                    # console.log 'xhr:open success'
                else
                    console.log 'xhr error ' + content.error

    send: (data) ->
        if not @id
            @pendingOps.push =>
                @send(data)
        else
            params =
                id: @id
                data: data
            @bridge.call2 'xhr:send', params, (success, content) =>
                if success
                    # console.log 'xhr:send success'
                else
                    console.log 'xhr error ' + content.error

    _pollEvent: ->
        @bridge.call2 'xhr:poll-event', { id: @id }, (success, content) =>
            if success
                # console.log content
                @_updateStatus content
                @_onEvent content.type
                @_pollEvent()
            else
                console.log 'xhr error ' + content.status

    _updateStatus: (content) ->
        if content.readyState
            @readyState = content.readyState

        if content.responseHeaders
            @responseHeaders = content.responseHeaders

        if content.responseText
            @responseText = content.responseText

        if content.responseHeaders
            @responseHeaders = content.responseHeaders

        if content.status
            @status = content.status

        if content.statusText
            @statusText = content.statusText

    _onEvent: (eventType) ->
        if eventType == 'onreadystatechange'
            if @onreadystatechange then @onreadystatechange()
        else
            console.log 'Unknow event type : ' + eventType

module.exports = PrivXMLHttpRequest