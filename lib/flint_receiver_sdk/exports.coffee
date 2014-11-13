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

window.FlintReceiverManager = require './FlintReceiverManager'

###

var manager = new FlintReceiverManager({
    appId: '~a3ad1b9e-6883-11e4-b116-123b93f75cba'
});

var peer = manager.createPeer();

peer.on('open', function (id) {

    console.log("Peer Id = " + id);

    peer.on('connection', function (conn) {

        // Receive messages
        conn.on('data', function (data) {
            console.log('Received', data);
            // Send messages
            conn.send('Reply : ' + data);
        });
    });

    peer.on('call', function (call) {
        console.log("Answer the call, providing our mediaStream");
        call.answer();
        call.on('stream', function (stream) {
            // `stream` is the MediaStream of the remote peer.
            // Here you'd add it to an HTML video/canvas element.
            var video = document.getElementById('video');
            video.src = window.URL.createObjectURL(stream);
        });
    });
});

###
