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


indexOfListener = (listeners, listener) ->
    if listeners.length > 0
        for i in [0 .. listeners.length - 1]
            if listeners[i].listener is listener
                return i
    return -1

alias = (name) ->
    -> this[name].apply this, arguments

class EventEmitter

    getListeners: (evt) ->
        events = @_getEvents()
        if evt instanceof RegExp
            response = {}
            for key of events
                response[key] = events[key]  if events.hasOwnProperty(key) and evt.test(key)
        else
            response = events[evt] or (events[evt] = [])
        response

    flattenListeners: (listeners) ->
        flatListeners = []
        i = 0
        while i < listeners.length
            flatListeners.push listeners[i].listener
            i += 1
        flatListeners

    getListenersAsObject: (evt) ->
        listeners = @getListeners(evt)
        response = undefined
        if listeners instanceof Array
            response = {}
            response[evt] = listeners
        response or listeners

    addListener: (evt, listener) ->
        listeners = @getListenersAsObject(evt)
        listenerIsWrapped = typeof listener is "object"
        for key of listeners
            if listeners.hasOwnProperty(key) and indexOfListener(listeners[key], listener) is -1
                listeners[key].push (if listenerIsWrapped then listener else
                    listener: listener
                    once: false
                )
        this

    on: alias("addListener")

    addOnceListener: (evt, listener) ->
        @addListener evt,
            listener: listener
            once: true

    once: alias("addOnceListener")

    defineEvent: (evt) ->
        @getListeners evt
        this

    defineEvents: (evts) ->
        i = 0

        while i < evts.length
            @defineEvent evts[i]
            i += 1
        this

    removeListener: (evt, listener) ->
        listeners = @getListenersAsObject(evt)
        for key of listeners
            if listeners.hasOwnProperty(key)
                index = indexOfListener(listeners[key], listener)
                listeners[key].splice index, 1  if index isnt -1
        this

    off: alias("removeListener")

    addListeners: (evt, listeners) ->
        @manipulateListeners false, evt, listeners

    removeListeners: (evt, listeners) ->
        @manipulateListeners true, evt, listeners

    manipulateListeners: (remove, evt, listeners) ->
        value = undefined
        single = (if remove then @removeListener else @addListener)
        multiple = (if remove then @removeListeners else @addListeners)
        if typeof evt is "object" and (evt not instanceof RegExp)
            for i of evt
                if evt.hasOwnProperty(i) and (value = evt[i])
                    if typeof value is "function"
                        single.call this, i, value
                    else
                        multiple.call this, i, value
        else
            i = listeners.length
            single.call this, evt, listeners[i]  while i--
        this

    removeEvent: (evt) ->
        type = typeof evt
        events = @_getEvents()
        if type is "string"
            delete events[evt]
        else if evt instanceof RegExp
            for key of events
                delete events[key]  if events.hasOwnProperty(key) and evt.test(key)
        else
            delete @_events
        this

    removeAllListeners: alias("removeEvent")

    emitEvent: (evt, args) ->
        listeners = @getListenersAsObject(evt)
        for key of listeners
            if listeners.hasOwnProperty(key)
                i = listeners[key].length
                while i--
                    listener = listeners[key][i]
                    @removeListener evt, listener.listener  if listener.once is true
                    response = listener.listener.apply(this, args or [])
                    @removeListener evt, listener.listener  if response is @_getOnceReturnValue()
        this

    trigger: alias("emitEvent")

    emit: (evt) ->
        args = Array::slice.call(arguments, 1)
        @emitEvent evt, args

    setOnceReturnValue: (value) ->
        @_onceReturnValue = value
        this

    _getOnceReturnValue: ->
        if @hasOwnProperty("_onceReturnValue")
            @_onceReturnValue
        else
            true

    _getEvents: ->
        @_events or (@_events = {})
