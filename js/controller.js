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

        getScreenId(function (error, sourceId, screen_constraints) {
            navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
            navigator.getUserMedia(screen_constraints, function (stream) {
                document.querySelector('video').src = URL.createObjectURL(stream);
            }, function (error) {
                console.error(error);
            });
        });
    }
});