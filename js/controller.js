var flingApp = angular.module('flingApp', []);

flingApp.controller('DeviceListCtrl', function ($scope, $window) {

    $scope.deviceManger = new $window.FlingDeviceManager();

    $scope.deviceManger.on('devicefound', function (device) {
        $scope.devices = $scope.deviceManger.getDeviceList();
        console.log('devicefound !!! ' + $scope.devices.length);
        $scope.$apply();
    });

    $scope.deviceManger.on('devicelost', function (device) {
        $scope.devices = $scope.deviceManger.getDeviceList();
        $scope.$apply();
    });

    $scope.shareScreen = function (device) {
        console.log('shareScreen', device.address, " : ", device.friendlyName);

        var screen_constraints = {
            video: true
        };

        var app = device.app({
            appId: '~a3ad1b9e-6883-11e4-b116-123b93f75cba',
            appUrl: 'https://openflint.github.io/screen-sharing-sample/screen_viewer.html',
            useIpc: true
        });
        app.setOnceReturnValue(true);

        app.on('additionaldatachanged', function(additionalData) {

            console.log('additionaldatachanged !!!');
            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            navigator.getUserMedia(screen_constraints, function (stream) {
                document.querySelector('video').src = URL.createObjectURL(stream);

                console.log("Receiver PeerId = " + additionalData.peerId);

                var peer = new Peer({ host: device.address, port: 9433 });
                peer.on('open', function (id) {

                    console.log("Sender PeerId = " + id);

                    // Call a peer, providing our mediaStream
                    peer.call(additionalData.peerId, stream);
                });

            }, function (error) {
                console.error(error);
            });

            if (additionalData.peerId) {
                return true
            }
        });

        app.launch(true);

//      getScreenId(function (error, sourceId, screen_constraints) {
//        navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
//        navigator.getUserMedia(screen_constraints, function (stream) {
//            document.querySelector('video').src = URL.createObjectURL(stream);
//        }, function (error) {
//            console.error(error);
//        });
//      });
    }
});