var flingApp = angular.module('flingApp', []);

flingApp.controller('DeviceListCtrl', function($scope) {

	function parseServiceInfo(services) {
		for (var i = 0; i < services.length; i++) {
			var parser = new DOMParser();
			var doc = parser.parseFromString(services[i].config, "application/xml");

			var friendlyName = doc.querySelector('friendlyName').innerHTML;

			var address = services[i].url
				.replace(':9431/ssdp/notfound', '')
				.replace('http://', '')

			console.log("friendlyName: ", friendlyName);
			console.log("address: ", address);
			console.log("config: ", config);

			services[i].address = address;
			services[i].friendlyName = friendlyName;
		}
	}

	navigator.getNetworkServices('upnp:urn:dial-multiscreen-org:service:dial:1').then(function(services) {
		$scope.services = services;
		services.addEventListener("servicefound", function(event) {
			console.log("servicefound: ", event);
			parseServiceInfo(services);
			$scope.$apply();
		});
		services.addEventListener("servicelost", function(event) {
			console.log("servicelost: ", event);
			$scope.$apply();
		});
	});

	// $scope.devices = [{
	// 	'name': 'Nexus S',
	// 	'snippet': 'Fast just got faster with Nexus S.'
	// }, {
	// 	'name': 'Motorola XOOM™ with Wi-Fi',
	// 	'snippet': 'The Next, Next Generation tablet.'
	// }, {
	// 	'name': 'MOTOROLA XOOM™',
	// 	'snippet': 'The Next, Next Generation tablet.'
	// }];
});