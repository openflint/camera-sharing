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

class Bridge extends EventEmitter

    @instance = null

    @getInstance: ->
        if not Bridge.instance
            Bridge.instance = new Bridge()
        return Bridge.instance

    constructor: ->
        @callid = 1
        @temporaryAsyncStorage = {}

        window.addEventListener 'message', (event) =>
            if event.data?.to is 'page-script'
                @_receive event.data.payload

    call2: (method, params, callback) ->
        success = (content) =>
            callback?(true, content)
        error = (error) =>
            callback?(false, error)
        @call(method, params, success, error)

    #
    # Generic wrapper for native API calls.
    #
    # @param {string} method Name of the API method.
    # @param {*} params Key-values to pass to privileged code.
    # @param {function(...[*])} success Called if native method is successful.
    # @param {function({message: string}=} error
    #
    call: (method, params, success, error) ->
        callid = @_genCallId()
        onetime = true

        # API Methods which can be calledback multiple times
        # if method is "button.onClicked.addListener" || method === "message.toFocussed") {
        #    onetime = false;
        if success or error
            @temporaryAsyncStorage[callid] =
                success: success
                error: error
                onetime: onetime

        @_send
            callid: callid
            method: method
            params: params

    _send: (message) ->
        window.postMessage {
            to: 'content-script'
            payload: message
        }, '*'

    _genCallId: ->
        @callid++

    #
    # Called from native at the end of asynchronous tasks.
    #
    # @param {Object} result Object containing result details
    #
    # result: {
    #     callid: xxxxx,
    #     status: 'success' or 'error'
    #     content: xxxxx
    # }
    #
    _receive: (result) ->
        if result.callid

            # Handle a response
            if typeof @temporaryAsyncStorage[result.callid] == undefined
                console.log "Nothing stored for call ID: " + result.callid

            callbacks = @temporaryAsyncStorage[result.callid]

            if callbacks && callbacks[result.status]
                callbacks[result.status](result.content)

            if callbacks && callbacks.onetime
                # Remove used callbacks
                delete @temporaryAsyncStorage[result.callid]

module.exports = Bridge