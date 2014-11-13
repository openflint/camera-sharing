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

class NativeMethods

    @checkPluginAvailable: ->
        NativeMethods.loadPlugin()
        return true if NativeMethods.plugin

    @loadPlugin: ->
        NativeMethods.plugin = loadSockitPlugin()
#        mimeType = "application/x-sockit"
#        pluginAvailable = false
#        for i in [0 .. navigator.mimeTypes.length - 1]
#            if navigator.mimeTypes[i].type == mimeType
#                pluginAvailable = true
#
#        if not pluginAvailable
#            redirect = confirm("OpenFlint SockIt plugin is not currently installed, would you like to be redirected to the SockIt plugin download page?");
#            if redirect
#                window.location = "http://sockit.github.com/downloads.html"
#
#        NativeMethods.plugin = document.createElement 'object'
#        NativeMethods.plugin.setAttribute 'type', mimeType
#        NativeMethods.plugin.setAttribute 'style', 'width: 0; height: 0;'
#        document.documentElement.appendChild NativeMethods.plugin

    @isAvailable: ->
        typeof NativeMethods.plugin isnt 'undefined'

    @createWebSocket: (url) ->
        if NativeMethods.checkPluginAvailable()
            NativeMethods.plugin.createWebSocket url
        null

    @httpGet: (url, callback) ->
        if NativeMethods.checkPluginAvailable()
            req = NativeMethods.plugin.createHttpRequest();
            req.setRequestHeader 'Content-Type', ''
            req.send();
            # NativeMethods.plugin.httpGet url, { a: 'aa', b: 'bb' }, callback

module.exports = NativeMethods