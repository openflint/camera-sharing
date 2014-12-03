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
FlintDevice = require './FlintDevice'

class FlintDeviceManager extends EventEmitter

    constructor: (@device) ->
        @bridge = Bridge.getInstance()
        @launched = false
        @useIpc = true
        @maxInactive = -1
        @additionalDatas = {}
        @token = null
        @heartbeatInterval = 0

    launch: (opts) ->
        if @launched then throw 'Application already launched '

        @appId = opts.appId
        @appUrl = opts.appUrl

        if typeof opts.useIpc isnt 'undefined'
            @useIpc = opts.useIpc

        if typeof opts.maxInactive isnt 'undefined'
            @maxInactive = opts.maxInactive

        # get status first !
        @_getStatus (content) =>
            console.log 'status: ', content
            console.log '@appState: ', @appState
            console.log '@appName: ', @appName

            if @appState == 'running' and @appName == @appId
                @_launch(true) if opts?.relaunchIfRunning
            else
                @_launch(false)

    getAdditionalData: (key) ->
        @additionalDatas[key]

    _launch: (relaunch) ->
        launchType = 'launch'
        launchType = 'relaunch' if relaunch

        params =
            url: 'http://' + @device.host + ':9431/apps/' + @appId
            headers:
                'Content-Type': 'application/json'
            data:
                type: launchType
                app_info:
                    url: @appUrl
                    useIpc: @useIpc
                    maxInactive: @maxInactive

        @bridge.call2 'http:post', params, (success, content) =>
            if success
                console.log '_launch reply ', content
                @_startHeartbeat()
            else
                console.log '_launch error ', content

    _startHeartbeat: ->
        # Hearbeat 3s
        setInterval (=>
            @_getStatus()), 3000

    _getStatus: (callback) ->
        headers =
            'Content-Type': 'application/json'
            'Accept': 'application/xml; charset=utf8'

        headers['Authorization'] = @token if @token

        url = 'http://' + @device.host + ':9431/apps/' + @appId

        success = (content) =>
            console.log '_getStatus reply ', content
            @_parseStatus(content.data)
            callback?(content.data)

        error = (error) =>
            console.log '_getStatus error ', error

        @bridge.call 'http:get', { url: url }, success, error

    _parseStatus: (status) ->
        lines = status.split('\n');
        lines.splice(0, 1);
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
                        @_parseAdditionalDataPair(items[i].tagName, items[i].innerHTML)
        return

    _parseAdditionalDataPair: (key, value) ->
        @additionalDatas[key] = value
        @emit 'additionaldatachanged', key, value

module.exports = FlintDeviceManager
