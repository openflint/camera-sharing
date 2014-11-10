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
#
#if not String::startsWith
#    Object.defineProperty String.prototype, 'startsWith',
#        enumerable: false
#        configurable: false
#        writable: false
#        value: (searchString, position) ->
#            position = position || 0
#            return @lastIndexOf(searchString, position) == position;
#
#if not Array::find
#    Array::find = (predicate) ->
#        if this is null
#            throw new TypeError('Array.prototype.find called on null or undefined')
#        if typeof predicate isnt 'function'
#            throw new TypeError('predicate must be a function')
#
#        list = Object(this);
#        length = list.length >>> 0;
#        thisArg = arguments[1];
#
#        for i in [0 .. length - 1]
#            value = list[i]
#            return value if predicate.call(thisArg, value, i, list)
#        return undefined;
#
#if not Array::findIndex
#    Array::findIndex = (predicate) ->
#        if this is null
#            throw new TypeError('Array.prototype.find called on null or undefined')
#        if typeof predicate isnt 'function'
#            throw new TypeError('predicate must be a function')
#
#        list = Object(this);
#        length = list.length >>> 0;
#        thisArg = arguments[1];
#        value;
#
#        for i in [0 .. length - 1]
#            value = list[i]
#            return i if predicate.call(thisArg, value, i, list)
#        return -1;
