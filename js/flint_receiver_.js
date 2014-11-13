(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

/*

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
 */




},{}]},{},[1]);
