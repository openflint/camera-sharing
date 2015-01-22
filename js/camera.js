window.onload = function(){    
    window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription

    function log(message) {
        $('.logList').prepend('<li>' + message + '</li>')
    }

    function randomToken() {
        return Math.random().toString(36).substr(2);
    }

    // Screen stream
    var localStream = null;

    var screenWidth = 1280; //window.screen.width;
    var screenHeight = 720; //window.screen.height;

    var screen_constraints = {
        "audio": false,
        "video": true
    };

    var appInfo = {
        appUrl: "http://openflint.github.com/camera-sharing/screen_viewer.html",
        useIpc: true,
        maxInactive: -1
    };

    var senderManager = new FlintSenderManager('~a3ad1b9e-6883-11e4-b116-123b93f75cba', '', true);
    var sharing = false;
    var stopButton = $('<button>' + 'STOP' + '</button>');
    stopButton.on('click', function () {
        sharing = false;
        senderManager.stop(appInfo);
        if (localStream != null) {
            localStream.stop();
        }
    });
    $('<li></li>').append(stopButton).appendTo($('.deviceList'));

    function shareScreen(device) {
        senderManager.setServiceUrl(device.getUrlBase());
        senderManager.launch(appInfo, function (result, token) {
            if (result) {
                log('Application is launched ! OK!!! -> ' + token);
                navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                navigator.getUserMedia(screen_constraints, function (stream) {
                    log("Received screen stream.");

                    localStream = stream;
                    var peer = senderManager.callReceiverMediaPeer(stream);

                    stream.onended = function () {
                        log("screen stream ended.");
                        peer.destroy();
                    };
                }, function (error) {
                    log("error:" + error);
                    console.error(error);
                });
                senderManager.on('appstate', function (_, state, additionaldata) {
                    if (state == 'stopped') {
                        log('Receiver application is stopped!!!');
                        log('This page will be reloaded in 2 seconds...');
                        setTimeout(function () {
                            window.location.reload();
                        }, 2000);
                    }
                });
            }
            else {
                log('Application is launched ! failed!!!');
            }
        });
    }

    var deviceScanner = new FlintDeviceScanner();
    deviceScanner.on('devicefound', function (device) {

        log('MIRROR Found ' + device.friendlyName);

        var button = $('<button>' + device.friendlyName + '</button>');
        button.on('click', function () {
            if (sharing == false) {
                sharing = true;
                shareScreen(device);
            }
        });

        $('<li></li>').append(button).appendTo($('.deviceList'));
    });

    deviceScanner.start();
};
